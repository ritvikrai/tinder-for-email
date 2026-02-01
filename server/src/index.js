import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// OAuth2 client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Store tokens in memory (in production, use a database)
let userTokens = null;

// Generate auth URL
app.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.json({ url });
});

// OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    userTokens = tokens;
    oauth2Client.setCredentials(tokens);
    
    // Redirect to frontend with success
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?auth=success`);
  } catch (error) {
    console.error('Auth error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?auth=error`);
  }
});

// Check auth status
app.get('/auth/status', (req, res) => {
  res.json({ authenticated: !!userTokens });
});

// Logout
app.post('/auth/logout', (req, res) => {
  userTokens = null;
  res.json({ success: true });
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!userTokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  oauth2Client.setCredentials(userTokens);
  next();
};

// Get label ID for "Review" label
async function getReviewLabelId(gmail) {
  const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
  const labels = labelsResponse.data.labels || [];
  const reviewLabel = labels.find(l => l.name.toLowerCase() === 'review');
  return reviewLabel?.id;
}

// Get drafts with "Review" label
app.get('/api/drafts', requireAuth, async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Get the Review label ID
    const reviewLabelId = await getReviewLabelId(gmail);
    
    if (!reviewLabelId) {
      return res.json({ 
        drafts: [],
        message: 'No "Review" label found. Please create a label named "Review" in Gmail.'
      });
    }

    // Get all drafts
    const draftsResponse = await gmail.users.drafts.list({ userId: 'me' });
    const drafts = draftsResponse.data.drafts || [];
    
    // Fetch full draft details and filter by Review label
    const draftDetails = await Promise.all(
      drafts.map(async (draft) => {
        const fullDraft = await gmail.users.drafts.get({
          userId: 'me',
          id: draft.id,
          format: 'full'
        });
        return fullDraft.data;
      })
    );

    // Filter drafts that have the Review label
    const reviewDrafts = draftDetails.filter(draft => {
      const labels = draft.message?.labelIds || [];
      return labels.includes(reviewLabelId);
    });

    // Parse drafts into a friendly format
    const parsedDrafts = reviewDrafts.map(draft => {
      const headers = draft.message?.payload?.headers || [];
      const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
      
      // Get email body
      let body = '';
      const payload = draft.message?.payload;
      
      if (payload?.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      } else if (payload?.parts) {
        const textPart = payload.parts.find(p => p.mimeType === 'text/plain') || 
                         payload.parts.find(p => p.mimeType === 'text/html');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      }

      return {
        id: draft.id,
        messageId: draft.message?.id,
        to: getHeader('To'),
        from: getHeader('From'),
        subject: getHeader('Subject'),
        body: body,
        snippet: draft.message?.snippet || '',
        date: getHeader('Date')
      };
    });

    res.json({ drafts: parsedDrafts });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// Send a draft (Approve & Send)
app.post('/api/drafts/:id/send', requireAuth, async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    await gmail.users.drafts.send({
      userId: 'me',
      requestBody: {
        id: req.params.id
      }
    });

    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending draft:', error);
    res.status(500).json({ error: 'Failed to send draft' });
  }
});

// Flag a draft for review (add a "Flagged" label or star it)
app.post('/api/drafts/:id/flag', requireAuth, async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const { messageId } = req.body;
    
    // Try to find or create a "Flagged" label
    let flaggedLabelId;
    const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
    const labels = labelsResponse.data.labels || [];
    const flaggedLabel = labels.find(l => l.name.toLowerCase() === 'flagged');
    
    if (flaggedLabel) {
      flaggedLabelId = flaggedLabel.id;
    } else {
      // Create the Flagged label
      const newLabel = await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: 'Flagged',
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show'
        }
      });
      flaggedLabelId = newLabel.data.id;
    }

    // Remove the Review label and add Flagged label
    const reviewLabelId = await getReviewLabelId(gmail);
    
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: [flaggedLabelId, 'STARRED'],
        removeLabelIds: reviewLabelId ? [reviewLabelId] : []
      }
    });

    res.json({ success: true, message: 'Draft flagged for your review!' });
  } catch (error) {
    console.error('Error flagging draft:', error);
    res.status(500).json({ error: 'Failed to flag draft' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Tinder for Email - Backend ready!`);
});
