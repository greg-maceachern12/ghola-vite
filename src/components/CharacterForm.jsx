import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaRandom } from 'react-icons/fa';

const SUGGESTIONS = [
  "Gandalf from Lord of the Rings",
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
  
  const handleSubmit = (e) => {
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

  // Character examples to display as chips
  const exampleCharacters = ["Harry Potter", "Sherlock Holmes", "Elizabeth Bennet"];
  
  return (
    <div className="w-full">
      {/* Example chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm text-white/60">Try:</span>
        {exampleCharacters.map((example, index) => (
          <button
            key={index}
            onClick={() => {
              setPrompt(example);
              setTimeout(() => onSubmit(example), 100);
            }}
            className="text-sm px-3 py-1 rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
          >
            {example}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="group transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 opacity-20 rounded-xl blur-sm group-hover:opacity-30 transition-opacity"></div>
          
          <div className="relative flex overflow-hidden rounded-xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Enter a character name (e.g. Voldemort from Harry Potter)"
              className="w-full py-4 px-5 bg-transparent text-white outline-none placeholder:text-white/50 disabled:opacity-50"
              disabled={loading}
              aria-label="Character name and source"
            />
            
            <button 
              type="button"
              onClick={getRandomCharacter}
              className="px-3 text-white/60 hover:text-white/90 transition-colors"
              aria-label="Get random character suggestion"
              title="Random character"
              disabled={loading}
            >
              <FaRandom />
            </button>
            
            <button 
              type="submit" 
              className="px-6 bg-white/20 text-white hover:bg-white/30 active:bg-white/40 disabled:opacity-50 transition-colors"
              disabled={loading}
              aria-label="Generate character image"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white/90 rounded-full animate-spin"></div>
              ) : (
                <FaSearch />
              )}
            </button>
          </div>
        </div>
        
        {/* Suggestions dropdown */}
        {isFocused && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-black/50 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden z-10 shadow-xl">
            <ul>
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors"
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