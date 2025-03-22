import { useState, useEffect, useRef } from "react";
import CharacterForm from "./CharacterForm";
import GeneratedImage from "./GeneratedImage";
import Toast from "./Toast";
import LemonSqueezyPayment from "./LemonSqueezyPayment";
import PremiumUpsell from "./PremiumUpsell";
import RequestCounter from "./RequestCounter";

const Hero = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [characterName, setCharacterName] = useState("");
  const [requestsUsed, setRequestsUsed] = useState(0);
  const [maxRequests, setMaxRequests] = useState(5);
  const [throttled, setThrottled] = useState(false);
  const [resetTime, setResetTime] = useState(0);
  const [toast, setToast] = useState(null);
  const [premium, setPremium] = useState(false); // Tracks if premium license has been validated
  const [showUpsell, setShowUpsell] = useState(false); // State to control the upsell dialog visibility
  const [upsellShownThisSession, setUpsellShownThisSession] = useState(false); // Track if upsell has been shown this session
  const [isFirstImageGeneration, setIsFirstImageGeneration] = useState(true); // Track if this is the first image generation
  // const [aspectRatio, setAspectRatio] = useState("landscape"); // Default aspect ratio
  // const [imageStyle, setImageStyle] = useState("default"); // Default style

  const resultRef = useRef(null);

  // Throttling configuration (only used for non-premium users)
  const THROTTLE_WINDOW = 60 * 60 * 1000; // 24 hours (1 day) in ms
  const MAX_REQUESTS = 5;
  const THROTTLE_STORAGE_KEY = "ghola_request_timestamps";

  useEffect(() => {
    if (!premium) {
      const recentRequests = getRecentRequests();
      saveRequestTimestamps(recentRequests);
      updateRequestsCounter();
      
      // Only start intervals if we're throttled or close to being throttled
      const throttleCheck = checkThrottle();
      const isThrottled = throttleCheck.throttled;
      const isNearThrottle = throttleCheck.remaining <= 1;
      
      let longInterval = null;
      let shortInterval = null;
      
      // Update counter every 30 seconds for general usage
      if (isNearThrottle || isThrottled) {
        longInterval = setInterval(() => {
          updateRequestsCounter();
        }, 30 * 1000);
      }
      
      // Add a more frequent update when throttled to keep timer accurate
      if (isThrottled) {
        shortInterval = setInterval(() => {
          const throttleCheck = checkThrottle();
          setResetTime(throttleCheck.resetTime);
        }, 1000);
      }
      
      return () => {
        if (longInterval) clearInterval(longInterval);
        if (shortInterval) clearInterval(shortInterval);
      };
    }
  }, [premium, throttled]);

  const getRequestTimestamps = () => {
    try {
      const storedData = localStorage.getItem(THROTTLE_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      localStorage.removeItem(THROTTLE_STORAGE_KEY);
      return [];
    }
  };

  const saveRequestTimestamps = (timestamps) => {
    try {
      localStorage.setItem(THROTTLE_STORAGE_KEY, JSON.stringify(timestamps));
      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  };

  const getRecentRequests = () => {
    const now = Date.now();
    const cutoffTime = now - THROTTLE_WINDOW;
    const allTimestamps = getRequestTimestamps();
    return allTimestamps.filter((timestamp) => timestamp > cutoffTime);
  };

  const recordRequest = () => {
    const now = Date.now();
    const recentRequests = getRecentRequests();
    recentRequests.push(now);
    saveRequestTimestamps(recentRequests);
    updateRequestsCounter();
  };

  const checkThrottle = () => {
    const recentRequests = getRecentRequests();
    if (recentRequests.length < MAX_REQUESTS) {
      return {
        throttled: false,
        remaining: MAX_REQUESTS - recentRequests.length,
      };
    }
    const now = Date.now();
    recentRequests.sort((a, b) => a - b);
    const oldestRequest = recentRequests[0];
    const resetTimeVal = Math.ceil(
      (oldestRequest + THROTTLE_WINDOW - now) / 1000
    );
    return {
      throttled: true,
      resetTime: resetTimeVal > 0 ? resetTimeVal : 1,
    };
  };

  const handleFeedbackSubmit = async () => {
    try {
      const emailValue = document.getElementById('feedbackEmail').value;
      const messageValue = document.getElementById('feedbackMessage').value;
      
      if (!emailValue || !messageValue) {
        setToast({ type: "error", message: "Please fill in all fields" });
        setTimeout(() => setToast(null), 3000);
        return;
      }
      
      setToast({ type: "info", message: "Sending feedback..." });
      
      const formData = new FormData();
      formData.append('access_key', import.meta.env.VITE_WEB3FORMS_KEY);
      formData.append('email', emailValue);
      formData.append('message', messageValue);
      formData.append('subject', 'Ghola User Feedback');
      formData.append('from_name', 'Ghola Feedback Form');
      
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setToast({ type: "success", message: "Feedback sent successfully!" });
        document.getElementById('feedbackEmail').value = '';
        document.getElementById('feedbackMessage').value = '';
      } else {
        throw new Error(data.message || "Failed to send feedback");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      setToast({ 
        type: "error", 
        message: error.message || "Failed to send feedback. Please try again."
      });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const updateRequestsCounter = () => {
    const throttleCheck = checkThrottle();
    const usedRequests = throttleCheck.throttled
      ? MAX_REQUESTS
      : MAX_REQUESTS - throttleCheck.remaining;
    setRequestsUsed(usedRequests);
    setMaxRequests(MAX_REQUESTS);
    setThrottled(throttleCheck.throttled);
    if (throttleCheck.throttled) {
      setResetTime(throttleCheck.resetTime);
    }
  };

  const handleCharacterFormSubmit = async (prompt, selectedAspectRatio = "landscape", selectedStyle = "realistic") => {
    if (!prompt) {
      setToast({ type: "error", message: "Please enter a character name" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Update the aspect ratio and style
    // setAspectRatio(selectedAspectRatio);
    // setImageStyle(selectedStyle);

    if (!premium) {
      const throttleCheck = checkThrottle();
      if (throttleCheck.throttled) {
        setToast({
          type: "error",
          message: `Rate limit reached. Try again in a few minutes.`,
        });
        setResetTime(throttleCheck.resetTime);
        setTimeout(() => setToast(null), 5000);
        return;
      }
      recordRequest();
    }

    setLoading(true);
    setError(null);
    setCharacterName(prompt);
    try {
      setToast({
        type: "info",
        message: "Generating character description...",
      });
      const promptResponse = await fetch("/.netlify/functions/charPrompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!promptResponse.ok) {
        const errorData = await promptResponse.json();
        throw new Error(errorData.error || "Error enhancing character prompt");
      }
      const promptData = await promptResponse.json();
      if (!promptData.response) {
        throw new Error("No enhanced prompt in the response");
      }

      setToast({ type: "info", message: "Creating character image..." });
      // Include the premium flag, aspect ratio, and style in the request payload
      const imageResponse = await fetch("/.netlify/functions/characterSD", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: promptData.response, 
          premium, 
          aspect_ratio: selectedAspectRatio,
          style: selectedStyle,
          character: prompt
        }),
      });

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        throw new Error(errorData.error || "Error generating character image");
      }
      const imageData = await imageResponse.json();
      if (!imageData.result) {
        throw new Error("No image data in the response");
      }
      setGeneratedImage(imageData.result);
      setToast({
        type: "success",
        message: "Character generated successfully!",
      });

      // Show upsell after 3 seconds if this is the first image generation
      if (!premium && isFirstImageGeneration && !upsellShownThisSession) {
        setTimeout(() => {
          setShowUpsell(true);
          setUpsellShownThisSession(true);
        }, 3000);
      }
      
      // Set first image generation to false after first successful generation
      if (isFirstImageGeneration) {
        setIsFirstImageGeneration(false);
      }

      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error.message ||
          "An error occurred while processing your request. Please try again."
      );
      setToast({
        type: "error",
        message: error.message || "Generation failed. Please try again.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const getRemainingRequestsIndicator = () => {
    if (premium) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <svg
            className="w-3.5 h-3.5 mr-1"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 12L11 14L15 10M12 3L4 10V20H20V10L12 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Premium Active</span>
        </div>
      );
    }
    
    const remaining = maxRequests - requestsUsed;
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          {[...Array(maxRequests)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < remaining ? "bg-white/80" : "bg-white/30"
              }`}
            ></div>
          ))}
        </div>
        <span className="text-white/80">
          {remaining}/{maxRequests} images
        </span>
      </div>
    );
  };

  const handleTryExampleClick = (characterName) => {
    if (characterName) {
      setTimeout(() => {
        handleCharacterFormSubmit(characterName);
      }, 100);
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Background with improved layering */}
      <div className="fixed inset-0 w-full h-full z-[-1]">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="/assets/holo.jpeg"
          alt="Background"
        />
        <div className="absolute inset-0 bg-[#00011d]/70 backdrop-filter backdrop-blur-[2px]"></div>
      </div>

      {/* Toast notification */}
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Request Counter for non-premium users */}
      {!premium && (
        <RequestCounter
          used={requestsUsed}
          max={maxRequests}
          throttled={throttled}
          resetTime={resetTime}
        />
      )}

      {/* Header with status indicators */}
      <header className="fixed top-0 left-0 right-0 py-4 px-6 backdrop-blur-md bg-black/40 border-b border-white/10 z-20 flex justify-between items-center">
        <div className="flex items-center gap-3 text-xl font-medium">
          <img src="/assets/logo3_trans.png" alt="Ghola" className="w-7 h-7" />
          <span>Ghola</span>
        </div>

        {premium ? (
          <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
            <span className="flex items-center">
              <svg
                className="w-3.5 h-3.5 mr-1.5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12L11 14L15 10M12 3L4 10V20H20V10L12 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Premium Active
            </span>
          </div>
        ) : throttled ? (
          <div className="flex flex-col sm:flex-row items-center gap-2 text-sm">
            <span className="text-amber-300">Rate limit reached</span>
            <span className="bg-white/10 px-2 py-1 rounded-full text-xs">
              Try again in {Math.floor(resetTime / 60)}:
              {(resetTime % 60).toString().padStart(2, "0")}
            </span>
          </div>
        ) : (
          getRemainingRequestsIndicator()
        )}
      </header>

      {/* Main content with vertical flow */}
      <main className="container mx-auto max-w-screen-xl px-4 pt-28 pb-16 flex flex-col items-center">
        {/* Premium Upgrade Banner - only shown for non-premium users */}
        {!premium && (
          <div className="w-full max-w-3xl mb-6 bg-gradient-to-r from-blue-900/50 to-indigo-900/70 backdrop-blur-sm rounded-lg p-2 border border-blue-700/30 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-500/20 p-1.5 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-blue-100 text-xs">
                  <span className="font-medium">Upgrade to Premium</span>
                  <span className="hidden sm:inline"> - Unlimited HD NSFW generations</span>
                </p>
              </div>
              <button 
                onClick={() => setShowUpsell(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-1 px-3 rounded transition-colors flex items-center"
              >
                Upgrade
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Large Hero Header */}
        <div className="text-center mb-12 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-white mb-6">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Bring characters
            </span>
            <br />
            <span className="font-light">to life</span>
          </h1>
          <h2 className="text-xl md:text-2xl text-white/80 font-light">
            Enter any character, real or fictional, and generate an AI portrait
          </h2>
        </div>

        {/* Character Generation Section */}
        <section className="w-full max-w-2xl mx-auto mb-16">
          <CharacterForm
            onSubmit={handleCharacterFormSubmit}
            loading={loading}
            animated={false}
            premium={premium}
          />

          {error && (
            <div className="p-4 mt-4 rounded-xl backdrop-blur-md bg-red-500/20 border border-red-500/30 text-red-50">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center space-x-2 text-white/70 mt-4 justify-center">
              <div className="animate-pulse w-2 h-2 bg-white/70 rounded-full"></div>
              <div className="animate-pulse delay-150 w-2 h-2 bg-white/70 rounded-full"></div>
              <div className="animate-pulse delay-300 w-2 h-2 bg-white/70 rounded-full"></div>
              <p className="text-sm italic ml-1">
                This may take up to 20 seconds...
              </p>
            </div>
          )}
        </section>

        {/* Generated Image Result */}
        <section ref={resultRef} className="w-full max-w-2xl mx-auto mb-16">
          {(generatedImage || loading) ? (
            <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl transition-all">
              <GeneratedImage
                src={generatedImage}
                alt={`Generated image of ${characterName}`}
                character={characterName}
                premium={premium}
                loading={loading}
              />
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-white/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white/80">
                  Your character will appear here
                </h3>
                <p className="mt-2 text-white/60">
                  Enter a character name to get started
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Premium upgrade section */}
        <section id="premium-upgrade" className="w-full max-w-3xl mx-auto">
          <LemonSqueezyPayment
            onValidationSuccess={(details) => {
              setPremium(true);
            }}
          />
        </section>
        {/* Feedback Form */}
        <section className="w-full max-w-2xl mx-auto mt-12">
          <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
            <h3 className="text-xl font-medium mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div>
                <input 
                  type="email" 
                  id="feedbackEmail"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your email address" 
                />
              </div>
              
              <div>
                <textarea 
                  id="feedbackMessage"
                  rows="2" 
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Questions or feedback? Send a message here"
                ></textarea>
              </div>
              
              <div>
              <button 
                  onClick={handleFeedbackSubmit}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-grey-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                  type="button"
                >
                  Send Message
                </button>
              </div>
              
              <div className="text-xs text-white/50 text-center">
                Protected by Web3Forms - Your data will never be shared
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Premium upsell dialog */}
      {showUpsell && (
        <PremiumUpsell 
          onClose={() => setShowUpsell(false)}
          firstImageUrl={generatedImage}
          remainingRequests={maxRequests - requestsUsed}
          maxRequests={maxRequests}
        />
      )}
    </div>
  );
};

export default Hero;
