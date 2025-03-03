import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaRandom } from 'react-icons/fa';

const SUGGESTIONS = [
  "Gojo from JJK",
  "Arya Stark from Game of Thrones",
  "Sherlock Holmes from Sherlock Holmes",
  "Elizabeth Bennet from Pride and Prejudice",
  "Count Dracula from Dracula",
  "Wednesday Addams from The Addams Family",
  "Captain Ahab from Moby Dick",
  "Tyrion Lannister from Game of Thrones", 
  "Alice from Alice in Wonderland",
  "Matilda from Matilda"
];

const CharacterForm = ({ onSubmit, loading }) => {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const inputRef = useRef(null);
  
  useEffect(() => {
    // Filter suggestions based on input
    if (prompt && prompt.length > 2) {
      const filtered = SUGGESTIONS.filter(s => 
        s.toLowerCase().includes(prompt.toLowerCase())
      ).slice(0, 3);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [prompt]);
  
  const handleSubmit = (e) => {ç
    e.preventDefault();
    onSubmit(prompt.trim());
  };
  
  const getRandomCharacter = () => {
    const randomIndex = Math.floor(Math.random() * SUGGESTIONS.length);
    const randomCharacter = SUGGESTIONS[randomIndex];
    setPrompt(randomCharacter);
  };
  
  const handleSuggestionClick = (suggestion) => {
    setPrompt(suggestion);
    setSuggestions([]);
    setTimeout(() => {
      onSubmit(suggestion);
    }, 100);
  };

  return (
    <div className="w-full">
      {/* Minimal infinite scrolling text */}
      <div 
        className="relative w-full mb-6 overflow-hidden border-b border-white/10 py-1"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div 
          className="flex whitespace-nowrap animate-scrollSlow"
          style={{
            animationDuration: '20s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationPlayState: isHovering ? 'paused' : 'running'
          }}
        >
          {/* Double the suggestions for a seamless infinite scroll */}
          {[...SUGGESTIONS, ...SUGGESTIONS].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="mx-5 text-sm text-white/60 hover:text-white transition-colors inline-block whitespace-nowrap"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center border border-white/20 focus-within:border-white/50 bg-white/5 rounded-md px-3 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Enter a character name..."
            className="w-full py-4 bg-transparent text-white outline-none placeholder:text-white/50 disabled:opacity-50"
            disabled={loading}
            aria-label="Character name and source"
          />
          
          <button 
            type="button"
            onClick={getRandomCharacter}
            className="p-2 text-white/50 hover:text-white/90 transition-colors"
            aria-label="Get random character suggestion"
            title="Random character"
            disabled={loading}
          >
            <FaRandom />
          </button>
          
          <button 
            type="submit" 
            className="ml-1 p-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-md disabled:opacity-50 transition-colors"
            disabled={loading}
            aria-label="Generate character image"
          >
            {loading ? (
              <div className="w-5 h-5 border-t-2 border-white/90 rounded-full animate-spin"></div>
            ) : (
              <FaSearch />
            )}
          </button>
        </div>
        
        {/* Suggestions dropdown */}
        {isFocused && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-black/50 backdrop-blur-md rounded-md border border-white/10 overflow-hidden z-10 shadow-lg">
            <ul>
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 text-white/80 hover:bg-white/10 transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
};


export default CharacterForm;