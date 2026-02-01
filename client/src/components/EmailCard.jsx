import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import './EmailCard.css';

function EmailCard({ draft, onSwipe, disabled }) {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Swipe indicators
  const approveOpacity = useTransform(x, [0, 100], [0, 1]);
  const flagOpacity = useTransform(x, [-100, 0], [1, 0]);
  
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swipe right - Approve
      animate(x, 500, { duration: 0.3 });
      setTimeout(() => onSwipe('right'), 200);
    } else if (info.offset.x < -threshold) {
      // Swipe left - Flag
      animate(x, -500, { duration: 0.3 });
      setTimeout(() => onSwipe('left'), 200);
    } else {
      // Return to center
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
    }
  };

  const formatBody = (body) => {
    // Strip HTML tags for display
    const stripped = body.replace(/<[^>]*>/g, '');
    // Limit length
    if (stripped.length > 500) {
      return stripped.substring(0, 500) + '...';
    }
    return stripped;
  };

  return (
    <motion.div
      ref={cardRef}
      className="email-card"
      style={{ x, rotate, opacity }}
      drag={!disabled ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Swipe Indicators */}
      <motion.div className="swipe-indicator approve" style={{ opacity: approveOpacity }}>
        <span>✓ SEND</span>
      </motion.div>
      <motion.div className="swipe-indicator flag" style={{ opacity: flagOpacity }}>
        <span>🚩 FLAG</span>
      </motion.div>

      <div className="card-content">
        <div className="card-header">
          <div className="recipient">
            <span className="label">To:</span>
            <span className="value">{draft.to || 'No recipient'}</span>
          </div>
          <div className="subject">
            {draft.subject || '(No subject)'}
          </div>
        </div>

        <div className="card-body">
          <p>{formatBody(draft.body || draft.snippet || 'No content')}</p>
        </div>

        <div className="card-footer">
          <span className="hint">👈 Flag for review</span>
          <span className="hint">Send it! 👉</span>
        </div>
      </div>
    </motion.div>
  );
}

export default EmailCard;
