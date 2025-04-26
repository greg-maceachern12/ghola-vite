import { useState, useEffect, useRef } from "react";
import { FaSearch, FaRandom, FaPalette, FaCrown, FaLock } from "react-icons/fa";
import { BiRectangle } from "react-icons/bi";
import { BsSquareFill } from "react-icons/bs";
import { CgDisplayFullwidth } from "react-icons/cg";
import { BsAspectRatio } from "react-icons/bs";

// Import the example images from ExampleImages component
export const EXAMPLE_IMAGES = [
  {
    src: "/assets/examples/mark.png",
    alt: "Mark Grayson",
    character: "Mark Grayson",
    style: "nintendo",
  },
  {
    src: "/assets/examples/gandalf.png",
    alt: "Gandalf",
    character: "Gandalf",
    style: "ghibli",
  },
  {
    src: "/assets/examples/mario.jpg",
    alt: "Mario",
    character: "Mario",
    style: "lego",
  },
  {
    src: "/assets/examples/paul.png",
    alt: "Paul Atreidies",
    character: "Paul Atreidies",
    style: "lego",
  },
  {
    src: "/assets/examples/lyra.jpeg",
    alt: "Lyra Belacqua",
    character: "Lyra Belacqua",
    style: "realistic",
  },
  {
    src: "/assets/examples/eragon.jpeg",
    alt: "Eragon",
    character: "Eragon",
    style: "realistic",
  },
  {
    src: "/assets/examples/tris.jpeg",
    alt: "Tris Prior",
    character: "Tris Prior",
    style: "realistic",
  },
  {
    src: "/assets/examples/percy.jpeg",
    alt: "Percy Jackson",
    character: "Percy Jackson",
    style: "realistic",
  },
];

const SUGGESTIONS = [
  "Gojo Satoru from JJK",
  "Holden Caulfield from The Catcher in the Rye",
  "Scout Finch from To Kill a Mockingbird",
  "Gatsby from The Great Gatsby",
  "Matilda from Matilda",
  "Jonas from The Giver",
  "Percy Jackson from Percy Jackson & The Olympians",
  "Hazel Grace Lancaster from The Fault in Our Stars",
  "Auggie Pullman from Wonder",
  "Charlie from The Perks of Being a Wallflower",
];

const CharacterForm = ({ onSubmit, loading, premium }) => {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("portrait");
  const [style, setStyle] = useState("realistic");
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showPremiumTooltip, setShowPremiumTooltip] = useState(false);
  const inputRef = useRef(null);
  const styleMenuRef = useRef(null);

  useEffect(() => {
    // Filter suggestions based on input
    if (prompt && prompt.length > 2) {
      const filtered = SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(prompt.toLowerCase())
      ).slice(0, 3);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [prompt]);

  // Close style menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        styleMenuRef.current &&
        !styleMenuRef.current.contains(event.target)
      ) {
        setShowStyleMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!premium) {
      window.open('https://buy.polar.sh/polar_cl_ukvMp9Z1bIr9IrqDv9Y0Zs80WtqXf9gFLLkUH1Gd0B3', '_blank');
      return;
    }
    onSubmit(prompt.trim(), aspectRatio, style.toLowerCase());
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
      onSubmit(suggestion, aspectRatio, style);
    }, 100);
  };

  const handleStyleSelect = (newStyle) => {
    if (premium) {
      setStyle(newStyle.toLowerCase());
      setShowStyleMenu(false);
    } else {
      window.open('https://polar.sh/checkout/polar_c_bQX38ppA7Yuygjci5VWt0s3hUEtqHBt4s0QNb3O4uSt', '_blank');
    }
  };

  const handleExampleClick = (example) => {
    // Only allow clicking if the user has premium or if the style is realistic
    if (!premium && example.style !== "realistic") {
      window.open('https://polar.sh/checkout/polar_c_bQX38ppA7Yuygjci5VWt0s3hUEtqHBt4s0QNb3O4uSt', '_blank');
      return;
    }

    setPrompt(example.character);
    setAspectRatio(example.aspectRatio);
    if (premium && example.style) {
      setStyle(example.style.toLowerCase());
    }
    setTimeout(() => {
      onSubmit(
        example.character,
        example.aspectRatio,
        premium ? example.style.toLowerCase() : "realistic"
      );
    }, 100);
  };

  return (
    <div className="w-full">
      {/* Auto scrolling example images */}
      <div
        className="relative w-full mb-8 overflow-hidden border-b border-white/10 py-6"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div
          className="flex whitespace-nowrap animate-scrollSlow hide-scrollbar"
          style={{
            animationDuration: "60s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationPlayState: isHovering ? "paused" : "running",
          }}
        >
          {/* Double the examples for a seamless infinite scroll */}
          {[...EXAMPLE_IMAGES, ...EXAMPLE_IMAGES].map((example, index) => (
            <div
              key={index}
              onClick={() => handleExampleClick(example)}
              className={`flex flex-col items-center mx-6 cursor-pointer group flex-shrink-0 ${
                !premium && example.style !== "realistic" ? "opacity-70" : ""
              }`}
            >
              <div className="relative w-28 h-28 mb-3 overflow-hidden rounded-full border-2 border-white/20 group-hover:border-white/60 transition-all">
                <img
                  src={example.src}
                  alt={example.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {example.style !== "realistic" &&
                  !premium && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <FaLock className="text-white/80 text-lg" />
                    </div>
                  )}
              </div>
              <p className="text-sm text-white/70 group-hover:text-white transition-colors max-w-28 truncate text-center">
                {example.character}
              </p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span
                  className={`text-xs ${
                    premium ? "text-blue-400/80" : "text-white/40"
                  } flex items-center gap-1`}
                >
                  {!premium &&
                    example.style !== "realistic" &&
                    example.style !== "realistic" && (
                      <FaLock className="text-[10px]" />
                    )}
                  {example.style === "realistic" ? "realistic" : example.style}
                </span>
                {premium &&
                  example.style !== "realistic" && (
                    <FaCrown className="text-yellow-500 ml-1 text-xs" />
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center border ${premium ? 'border-green-400/20 focus-within:border-green-400/40' : 'border-white/20 focus-within:border-white/50'} bg-white/5 rounded-md px-3 transition-all ${premium ? 'shadow-[0_0_10px_rgba(74,222,128,0.05)]' : ''}`}>
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

        {/* Aspect ratio and style selection */}
        <div className="flex justify-between mt-3">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setAspectRatio("portrait")}
              className={`flex items-center gap-2 text-sm ${
                aspectRatio === "portrait"
                  ? "text-blue-400 font-medium"
                  : "text-white/50 hover:text-white/80"
              } transition-colors`}
              title="Portrait (2:3)"
            >
              <BiRectangle className="text-lg" />
              <span>Portrait</span>
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio("landscape")}
              className={`flex items-center gap-2 text-sm ${
                aspectRatio === "landscape"
                  ? "text-blue-400 font-medium"
                  : "text-white/50 hover:text-white/80"
              } transition-colors`}
              title="Landscape (3:2)"
            >
              <CgDisplayFullwidth className="text-lg" />
              <span>Landscape</span>
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio("square")}
              className={`flex items-center gap-2 text-sm ${
                aspectRatio === "square"
                  ? "text-blue-400 font-medium"
                  : "text-white/50 hover:text-white/80"
              } transition-colors`}
              title="Square (1:1)"
            >
              <BsSquareFill className="text-base" />
              <span>Square</span>
            </button>
          </div>

          {/* Style selection - show for all but make it locked for free users */}
          <div className="relative" ref={styleMenuRef}>
            <button
              type="button"
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className={`flex items-center gap-2 text-sm ${
                premium ? "text-white/80 hover:text-white" : "text-white/40"
              } transition-colors`}
              title={premium ? "Select image style" : "Premium feature"}
            >
              <FaPalette />
              <span>
                {style === "realistic"
                  ? "Realistic"
                  : style.charAt(0).toUpperCase() + style.slice(1)}
              </span>
              {!premium && <FaLock className="ml-1 text-xs" />}
              {premium && <FaCrown className="ml-1 text-xs text-yellow-500" />}
            </button>

            {showPremiumTooltip && !premium && (
              <div className="absolute right-0 mt-2 p-2 bg-black/90 backdrop-blur-sm border border-yellow-500/30 rounded shadow-xl z-30 w-48 text-xs text-white/80 animate-fade-in">
                Style options are only available with{' '}
                <a 
                  href="https://buy.polar.sh/polar_cl_ukvMp9Z1bIr9IrqDv9Y0Zs80WtqXf9gFLLkUH1Gd0B3" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-500 hover:text-yellow-400 underline"
                >
                  premium access
                </a>
                <div className="absolute -top-2 right-5 w-3 h-3 bg-black/90 border-t border-l border-yellow-500/30 transform rotate-45"></div>
              </div>
            )}

            {showStyleMenu && (
              <div className="absolute right-0 mt-2 bg-black/90 backdrop-blur-sm border border-white/10 rounded shadow-xl z-20 w-48">
                <ul className="py-1">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleStyleSelect("realistic")}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        style === "realistic"
                          ? "bg-blue-500/20 text-blue-400"
                          : "hover:bg-white/5"
                      } ${!premium && "opacity-70"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Realistic</span>
                        {!premium && (
                          <FaLock className="text-white/60 text-xs" />
                        )}
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleStyleSelect("ghibli")}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        style === "ghibli"
                          ? "bg-blue-500/20 text-blue-400"
                          : "hover:bg-white/5"
                      } ${!premium && "opacity-70"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Studio Ghibli</span>
                        {!premium && (
                          <FaLock className="text-white/60 text-xs" />
                        )}
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleStyleSelect("nintendo")}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        style === "nintendo"
                          ? "bg-blue-500/20 text-blue-400"
                          : "hover:bg-white/5"
                      } ${!premium && "opacity-70"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Nintendo</span>
                        {!premium && (
                          <FaLock className="text-white/60 text-xs" />
                        )}
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleStyleSelect("lego")}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        style === "lego"
                          ? "bg-blue-500/20 text-blue-400"
                          : "hover:bg-white/5"
                      } ${!premium && "opacity-70"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Lego</span>
                        {!premium && (
                          <FaLock className="text-white/60 text-xs" />
                        )}
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleStyleSelect("southpark")}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        style === "southpark"
                          ? "bg-blue-500/20 text-blue-400"
                          : "hover:bg-white/5"
                      } ${!premium && "opacity-70"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>South Park</span>
                        {!premium && (
                          <FaLock className="text-white/60 text-xs" />
                        )}
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleStyleSelect("pixar")}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        style === "pixar"
                          ? "bg-blue-500/20 text-blue-400"
                          : "hover:bg-white/5"
                      } ${!premium && "opacity-70"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Pixar</span>
                        {!premium && (
                          <FaLock className="text-white/60 text-xs" />
                        )}
                      </div>
                    </button>
                  </li>
                </ul>
                {!premium && (
                  <div className="p-2 border-t border-white/10 text-xs text-yellow-500/80 flex items-center">
                    <FaCrown className="mr-1" />
                    <span>Available with premium</span>
                  </div>
                )}
              </div>
            )}
          </div>
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
