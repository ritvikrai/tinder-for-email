import { motion } from 'framer-motion';
import './ActionButtons.css';

function ActionButtons({ onApprove, onFlag, disabled }) {
  return (
    <div className="action-buttons">
      <motion.button
        className="action-btn flag-btn"
        onClick={onFlag}
        disabled={disabled}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="btn-icon">🚩</span>
        <span className="btn-label">Flag</span>
      </motion.button>

      <motion.button
        className="action-btn approve-btn"
        onClick={onApprove}
        disabled={disabled}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="btn-icon">✉️</span>
        <span className="btn-label">Send</span>
      </motion.button>
    </div>
  );
}

export default ActionButtons;
