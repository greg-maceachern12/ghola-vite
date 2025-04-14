import { useState, useEffect } from 'react';
import { FaCrown } from 'react-icons/fa';

const PremiumPromo = ({ onGetStarted }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Get today's date and set it to 9pm EST
    const today = new Date();
    today.setHours(21, 0, 0, 0); // 9pm
    
    // Adjust for EST (UTC-4)
    const startTime = today.getTime() - (4 * 60 * 60 * 1000);
    const endTime = startTime + (24 * 60 * 60 * 1000); // 24 hours from start
    
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, endTime - now);

      if (diff === 0) {
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Don't show the promo if it's after end time
  useEffect(() => {
    const today = new Date();
    today.setHours(21, 0, 0, 0);
    const startTime = today.getTime() - (4 * 60 * 60 * 1000);
    const endTime = startTime + (24 * 60 * 60 * 1000);
    const now = Date.now();
    
    if (now > endTime) {
      onGetStarted(); // Hide the promo
    }
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-auto z-50 px-4">
      <div 
        className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/20"
        style={{
          background: 'linear-gradient(45deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Background Image */}
        <img 
          src="/assets/hd-icon.png" 
          alt="HD Background" 
          className="absolute top-0 right-0 h-full w-auto object-cover opacity-20 transform rotate-12 translate-x-1/4"
        />
        
        <div className="relative p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FaCrown className="text-yellow-400 text-xl animate-pulse" />
              <span className="text-yellow-400 font-semibold tracking-wide text-sm">LIMITED TIME OFFER</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              24-Hour Premium Access Unlocked!
            </h3>
            <p className="text-white/80 text-sm">
              Experience unlimited HD generations, all art styles, and premium features.
            </p>
          </div>

          {/* Right side with timer and CTA */}
          <div className="flex flex-col items-center gap-3">
            {/* Timer */}
            <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="text-xs text-white/60">hours</span>
              </div>
              <span className="text-xl font-bold text-white/60">:</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="text-xs text-white/60">min</span>
              </div>
              <span className="text-xl font-bold text-white/60">:</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className="text-xs text-white/60">sec</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPromo; 