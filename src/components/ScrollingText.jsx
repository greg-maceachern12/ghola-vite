import { useRef, useEffect, useState } from 'react';

const ScrollingText = ({ animated = true }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  
  const characters = [
    "Harry Potter",
    "Sherlock Holmes",
    "Katniss Everdeen",
    "Frodo Baggins",
    "Elizabeth Bennet",
    "Hermione Granger", 
    "Atticus Finch",
    "Lisbeth Salander",
    "Jay Gatsby",
    "Scout Finch",
    "Bilbo Baggins",
    "Daenerys Targaryen",
    "Hannibal Lecter",
    "Count Dracula",
    "Jane Eyre",
    "Captain Ahab",
    "Gandalf",
    "Wednesday Addams",
    "Frankenstein's Monster",
    "Matilda Wormwood"
  ];
  
  useEffect(() => {
    // Set visible after a small delay to trigger animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`w-full md:w-4/5 mx-auto overflow-hidden mt-6 ${animated ? 'animate-fade-in-up-delay-most' : ''} transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="relative flex items-center py-1">
        {/* Fade effect on left side */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#00011d] to-transparent z-10"></div>
        
        {/* Scrolling content */}
        <div className="flex gap-4 animate-scroll whitespace-nowrap">
          {characters.concat(characters).map((character, index) => (
            <span 
              key={index} 
              className="italic text-[#c7c8cc] text-base px-1"
            >
              {character} •
            </span>
          ))}
        </div>
        
        {/* Fade effect on right side */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#00011d] to-transparent z-10"></div>
      </div>
    </div>
  );
};

export default ScrollingText;