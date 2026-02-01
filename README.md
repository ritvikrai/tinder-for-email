# Tinder for Email 💌

A Tinder-style email review app that lets your assistant swipe through draft emails to approve & send or flag for your review.

## Features

- 👉 **Swipe Right** - Approve and send the email via Gmail API
- 👈 **Swipe Left** - Flag the draft for your review
- 🏷️ Works with drafts labeled "Review" in Gmail
- 🔐 Secure OAuth2 authentication with Google

## Prerequisites

1. **Node.js** (v18 or higher)
2. **A Google Cloud Project** with Gmail API enabled

## Setup Instructions

### 1. Create Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Gmail API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
   - Save your **Client ID** and **Client Secret**

### 2. Configure the App

1. Copy the example environment file:
   ```bash
   cp server/.env.example server/.env
   ```

2. Edit `server/.env` and add your credentials:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

### 3. Install Dependencies

```bash
npm run install-all
```

### 4. Run the App

```bash
npm run dev
```

This starts both the backend (port 3001) and frontend (port 5173).

Open **http://localhost:5173** in your browser.

## Usage

### For the Email Author (You)

1. In Gmail, create a label called **"Review"**
2. When composing draft emails, add the "Review" label to drafts you want your assistant to review
3. Save as draft (don't send)

### For the Assistant

1. Open the app and sign in with Google
2. Drafts with the "Review" label will appear as cards
3. **Swipe right** (or tap ✉️ Send) to approve and send the email
4. **Swipe left** (or tap 🚩 Flag) to flag it for the author's review
5. Flagged emails get a "Flagged" label and are starred

## Project Structure

```
tinder-for-email/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   └── index.js        # Express server with Gmail API
│   ├── .env.example        # Environment template
│   └── package.json
└── package.json            # Root package with scripts
```

## Tech Stack

- **Frontend**: React, Vite, Framer Motion (for swipe gestures)
- **Backend**: Node.js, Express
- **API**: Google Gmail API
- **Auth**: OAuth 2.0

## 📋 Quick Start Checklist

After cloning this repo, complete these steps:

- [ ] **Create Google Cloud Project** — Go to [console.cloud.google.com](https://console.cloud.google.com/)
- [ ] **Enable Gmail API** — APIs & Services → Library → Search "Gmail API" → Enable
- [ ] **Create OAuth Credentials** — APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web app)
- [ ] **Add Redirect URI** — Set to `http://localhost:3001/auth/google/callback`
- [ ] **Configure `.env`** — Copy `server/.env.example` to `server/.env` and add your Client ID & Secret
- [ ] **Create "Review" Label** — In Gmail, create a label named "Review"
- [ ] **Install & Run** — `npm run install-all && npm run dev`
- [ ] **Open App** — Visit [http://localhost:5173](http://localhost:5173)

## Notes

- The app stores auth tokens in memory (they'll be lost on server restart)
- For production use, implement proper token storage in a database
- The app requires the assistant to have access to the email account

## License

MIT
