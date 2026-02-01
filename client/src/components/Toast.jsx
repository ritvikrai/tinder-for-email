import { motion } from 'framer-motion';
import './Toast.css';

function Toast({ message, type }) {
  const bgColors = {
    success: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
    error: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
    warning: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
    info: 'linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)'
  };

  return (
    <motion.div
      className="toast"
      style={{ background: bgColors[type] || bgColors.info }}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.8 }}
    >
      {message}
    </motion.div>
  );
}

export default Toast;
