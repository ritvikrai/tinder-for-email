import { useState, useEffect } from 'react';
import EmailCard from './components/EmailCard';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import EmptyState from './components/EmptyState';
import ActionButtons from './components/ActionButtons';
import Toast from './components/Toast';
import './App.css';

const API_BASE = '';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    // Check for auth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      setIsAuthenticated(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDrafts();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/status`);
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/drafts`);
      const data = await res.json();
      setDrafts(data.drafts || []);
      setCurrentIndex(0);
      
      if (data.message) {
        showToast(data.message, 'info');
      }
    } catch (error) {
      console.error('Failed to fetch drafts:', error);
      showToast('Failed to fetch drafts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/google`);
      const data = await res.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Login failed:', error);
      showToast('Failed to start login', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
      setIsAuthenticated(false);
      setDrafts([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSwipe = async (direction) => {
    if (actionInProgress || currentIndex >= drafts.length) return;
    
    const draft = drafts[currentIndex];
    setActionInProgress(true);

    try {
      if (direction === 'right') {
        // Approve & Send
        const res = await fetch(`${API_BASE}/api/drafts/${draft.id}/send`, {
          method: 'POST'
        });
        const data = await res.json();
        
        if (data.success) {
          showToast('✉️ Email sent!', 'success');
        } else {
          throw new Error(data.error);
        }
      } else {
        // Flag for review
        const res = await fetch(`${API_BASE}/api/drafts/${draft.id}/flag`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId: draft.messageId })
        });
        const data = await res.json();
        
        if (data.success) {
          showToast('🚩 Flagged for review', 'warning');
        } else {
          throw new Error(data.error);
        }
      }

      // Move to next card
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setActionInProgress(false);
      }, 300);
    } catch (error) {
      console.error('Action failed:', error);
      showToast('Action failed. Please try again.', 'error');
      setActionInProgress(false);
    }
  };

  if (loading && !isAuthenticated) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const currentDraft = drafts[currentIndex];
  const remainingCount = drafts.length - currentIndex;

  return (
    <div className="app">
      <Header 
        onLogout={handleLogout} 
        onRefresh={fetchDrafts}
        remainingCount={remainingCount}
      />
      
      <main className="main-content">
        {loading ? (
          <div className="loading-screen">
            <div className="loader"></div>
            <p>Fetching drafts...</p>
          </div>
        ) : currentDraft ? (
          <>
            <div className="card-container">
              <EmailCard 
                key={currentDraft.id}
                draft={currentDraft} 
                onSwipe={handleSwipe}
                disabled={actionInProgress}
              />
            </div>
            <ActionButtons 
              onApprove={() => handleSwipe('right')}
              onFlag={() => handleSwipe('left')}
              disabled={actionInProgress}
            />
          </>
        ) : (
          <EmptyState onRefresh={fetchDrafts} />
        )}
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default App;
