import { useEffect, useState } from 'react';
import { 
  FaCheck,
  FaExclamation,
  FaInfo,
  FaTimes
} from 'react-icons/fa';

const Toast = ({ type = 'info', message, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50);
    
    // Start progress timer
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      const percentage = (remaining / duration) * 100;
      
      if (percentage <= 0) {
        clearInterval(timer);
        setIsVisible(false);
      } else {
        setProgress(percentage);
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, [duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center"><FaCheck className="text-xs text-[#34C759]" /></div>;
      case 'error':
        return <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center"><FaExclamation className="text-xs text-[#FF3B30]" /></div>;
      case 'warning':
        return <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center"><FaExclamation className="text-xs text-[#FF9500]" /></div>;
      case 'info':
      default:
        return <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center"><FaInfo className="text-xs text-[#007AFF]" /></div>;
    }
  };
  
  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
      }`}
    >
      <div className="bg-[rgba(0,0,0,0.8)] backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center px-4 py-3 min-w-[280px] max-w-[400px]">
          <div className="flex-shrink-0 mr-3">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm text-white font-medium tracking-tight">{message}</p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 text-white/60 hover:text-white transition-colors"
            aria-label="Close"
          >
            <FaTimes size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;