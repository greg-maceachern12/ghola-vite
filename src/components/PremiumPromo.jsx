import { useState, useEffect } from 'react';
import { FaCrown } from 'react-icons/fa';

const PremiumPromo = ({ onGetStarted }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Calculate midnight tonight in EST
    const calculateMidnightEST = () => {
      const now = new Date();
      
      // Create a new date object for today in local time
      const today = new Date(now);
      
      // Convert to EST (UTC-4)
      // We don't change the date object, just use the offset for calculations
      const estOffset = -4 * 60 * 60 * 1000; // EST offset in milliseconds
      
      // Calculate midnight tonight in EST
      // First get the current date in EST
      const estNow = new Date(now.getTime() + estOffset - now.getTimezoneOffset() * 60 * 1000);
      
      // Then set the time to midnight of the next day
      const midnightEST = new Date(estNow);
      midnightEST.setDate(estNow.getDate() + 1);
      midnightEST.setHours(0, 0, 0, 0);
      
      // Convert back to local time for comparison with local Date.now()
      return new Date(midnightEST.getTime() - estOffset + now.getTimezoneOffset() * 60 * 1000);
    };

    const midnightEST = calculateMidnightEST();
    
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, midnightEST.getTime() - now);

      if (diff === 0) {
        clearInterval(timer);
        onGetStarted(); // Hide the promo when timer reaches zero
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [onGetStarted]);

  // Check if we're already past midnight EST
  useEffect(() => {
    const now = new Date();
    
    // Create midnight EST
    const today = new Date(now);
    const estOffset = -4 * 60 * 60 * 1000; // EST offset in milliseconds
    
    // Calculate current time in EST
    const estNow = new Date(now.getTime() + estOffset - now.getTimezoneOffset() * 60 * 1000);
    
    // Calculate midnight tonight in EST
    const midnightEST = new Date(estNow);
    midnightEST.setDate(estNow.getDate() + 1);
    midnightEST.setHours(0, 0, 0, 0);
    
    // Convert back to local time for comparison
    const midnightESTLocal = new Date(midnightEST.getTime() - estOffset + now.getTimezoneOffset() * 60 * 1000);
    
    if (now >= midnightESTLocal) {
      onGetStarted(); // Hide the promo if it's already past midnight EST
    }
  }, [onGetStarted]);

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
              Premium Access Until Midnight!
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
