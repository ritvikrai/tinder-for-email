import './EmptyState.css';

function EmptyState({ onRefresh }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <h2>All caught up!</h2>
      <p>No drafts with the "Review" label found.</p>
      <div className="instructions">
        <p>To use this app:</p>
        <ol>
          <li>Create a label named <strong>"Review"</strong> in Gmail</li>
          <li>Add this label to drafts you want your assistant to review</li>
          <li>Click refresh to load them here</li>
        </ol>
      </div>
      <button className="refresh-btn" onClick={onRefresh}>
        🔄 Refresh Drafts
      </button>
    </div>
  );
}

export default EmptyState;
