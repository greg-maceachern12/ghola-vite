import { useState, useEffect, useRef } from 'react';
import { FaClock, FaBolt } from 'react-icons/fa';

const RequestCounter = ({ used, max, throttled, resetTime }) => {
  const [timeLeft, setTimeLeft] = useState(resetTime);
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef(null);
  
  // Initialize the timer when the component mounts or resetTime changes
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Set initial time
    setTimeLeft(resetTime);
    
    // Start a new timer if throttled
    if (throttled && resetTime > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [resetTime, throttled]);
  
  // Handle visibility animation separately
  useEffect(() => {
    setIsVisible(false);
    const timeout = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timeout);
  }, [used, max, throttled]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getColor = () => {
    if (throttled) return 'bg-red-600/90';
    if (used >= 4) return 'bg-amber-500/80';
    if (used >= 2) return 'bg-blue-500/80';
    return 'bg-gray-800/70';
  };
  
  const getMessage = () => {
    if (throttled) return 'Rate limit reached';
    if (used >= 4) return '1 request remaining';
    if (used === 0) return 'Ready to generate';
    return `${max - used} requests remaining`;
  };
  
  return (
    <div 
      className={`fixed top-4 right-4 py-2 px-3 rounded-lg text-sm font-bold z-10 backdrop-blur-sm shadow-lg transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      } ${getColor()} flex items-center gap-2 border border-white/10`}
    >
      <div className="flex items-center gap-1">
        <span className="font-mono text-xs bg-white/20 rounded-md px-1.5 py-0.5">
          {used}/{max}
        </span>
      </div>
      
      <div className="h-3 w-px bg-white/30"></div>
      
      <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
        {throttled ? <FaClock className="animate-pulse text-amber-300" /> : <FaBolt className="text-cyan-300" />}
        <span>{getMessage()}</span>
      </div>
      
      {throttled && timeLeft > 0 && (
        <div className="ml-1 flex items-center gap-1 bg-black/20 rounded px-1.5 py-0.5 text-xs">
          <span className="font-mono animate-pulse">{formatTime(timeLeft)}</span>
        </div>
      )}
    </div>
  );
};

export default RequestCounter;