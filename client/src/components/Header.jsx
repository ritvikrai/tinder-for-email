import './Header.css';

function Header({ onLogout, onRefresh, remainingCount }) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo">💌</span>
        <span className="header-title">Tinder for Email</span>
      </div>
      
      <div className="header-center">
        {remainingCount > 0 && (
          <span className="counter">
            {remainingCount} draft{remainingCount !== 1 ? 's' : ''} remaining
          </span>
        )}
      </div>

      <div className="header-right">
        <button className="icon-btn" onClick={onRefresh} title="Refresh drafts">
          🔄
        </button>
        <button className="icon-btn" onClick={onLogout} title="Logout">
          👋
        </button>
      </div>
    </header>
  );
}

export default Header;
