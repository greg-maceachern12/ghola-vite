import { useState, useEffect, useRef } from "react";
import CharacterForm from "./CharacterForm";
import GeneratedImage from "./GeneratedImage";
import Toast from "./Toast";
import LemonSqueezyPayment from "./LemonSqueezyPayment";
import { FaCoffee } from "react-icons/fa";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [premium, setPremium] = useState(false); // Tracks if premium license has been validated

  const resultRef = useRef(null);

  // Throttling configuration (only used for non-premium users)
  const THROTTLE_WINDOW = 5 * 60 * 1000; // 5 minutes in ms
  const MAX_REQUESTS = 5;
  const THROTTLE_STORAGE_KEY = "ghola_request_timestamps";

  useEffect(() => {
    if (!premium) {
      const recentRequests = getRecentRequests();
      saveRequestTimestamps(recentRequests);
      updateRequestsCounter();
      const interval = setInterval(() => {
        updateRequestsCounter();
      }, 30 * 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [premium]);

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

  const handleCharacterFormSubmit = async (prompt) => {
    if (!prompt) {
      setToast({ type: "error", message: "Please enter a character name" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

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
      // Include the premium flag in the request payload
      const imageResponse = await fetch("/.netlify/functions/characterSD", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptData.response, premium }),
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
          <span>Premium Active – Unlimited Generations</span>
        </div>
      );
    }
    const remaining = maxRequests - requestsUsed;
    return (
      <div className="flex items-center gap-2 text-sm text-white/80">
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
        <span>
          {remaining}/{maxRequests} images remaining
        </span>
      </div>
    );
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

      {/* Header with status indicators */}
      <header className="fixed top-0 left-0 right-0 py-3 px-6 backdrop-blur-md bg-black/30 border-b border-white/10 z-20 flex justify-between items-center">
        <div className="flex items-center gap-2 text-lg font-medium">
          <img src="/assets/icon.png" alt="Ghola" className="w-6 h-6" />
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
              Premium Active – Unlimited HD Generations
            </span>
          </div>
        ) : throttled ? (
          <div className="flex items-center gap-2 text-sm">
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

      {/* Main content */}
      <main className="container mx-auto max-w-screen-xl px-4 pt-24 pb-16">
        {/* Character generation section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[70vh]">
          {/* Left Column: Character Form */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-light leading-tight tracking-tight text-white">
                <span className="font-normal">Bring characters</span> to life
              </h1>
              <h2 className="text-xl text-white/80 font-light">
                From pages to pixels: Your favorite book characters, visualized
              </h2>
            </div>

            <CharacterForm
              onSubmit={handleCharacterFormSubmit}
              loading={loading}
              animated={false}
            />

            {error && (
              <div className="p-4 rounded-xl backdrop-blur-md bg-red-500/20 border border-red-500/30 text-red-50">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex items-center space-x-2 text-white/70">
                <div className="animate-pulse w-2 h-2 bg-white/70 rounded-full"></div>
                <div className="animate-pulse delay-150 w-2 h-2 bg-white/70 rounded-full"></div>
                <div className="animate-pulse delay-300 w-2 h-2 bg-white/70 rounded-full"></div>
                <p className="text-sm italic ml-1">
                  This may take up to 20 seconds...
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Generated Image Result */}
          <div
            ref={resultRef}
            className="flex items-center justify-center h-full min-h-[400px]"
          >
            <div className="w-full max-w-md">
              {generatedImage && !loading ? (
                <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl transition-all">
                  <GeneratedImage
                    src={generatedImage}
                    alt={`Generated image of ${characterName}`}
                    character={characterName}
                    premium={premium}
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
            </div>
          </div>
        </section>

        {/* Premium upgrade section */}
        <section className="mt-20 space-y-6">
          {/* Premium email capture form with glowing border */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 opacity-20 blur-lg rounded-xl"></div>

            <div className="relative bg-black/50 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
              <div className="px-6 py-5">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">
                        <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                          Premium Access
                        </span>
                      </h3>
                      <div className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full text-xs font-bold text-white">
                        UPGRADE
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {/* Feature bullets with gradient indicators */}
                      <div className="flex items-center gap-2">
                        <div className="rounded-full p-0.5 bg-gradient-to-r from-blue-500 to-violet-500">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        </div>
                        <span className="text-white text-sm">
                          Unlimited Generations
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="rounded-full p-0.5 bg-gradient-to-r from-blue-500 to-violet-500">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        </div>
                        <span className="text-white text-sm">
                          HD Quality (2x Resolution)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full">
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target;
                        const formData = new FormData(form);

                        try {
                          setIsSubmitting(true);
                          const response = await fetch(
                            "https://api.web3forms.com/submit",
                            {
                              method: "POST",
                              body: formData,
                            }
                          );

                          const data = await response.json();

                          if (data.success) {
                            setSubmitSuccess(true);
                            setSubmitError("");
                            form.reset();
                            setTimeout(() => setSubmitSuccess(false), 5000);
                          } else {
                            setSubmitError(
                              "Something went wrong. Please try again."
                            );
                            setSubmitSuccess(false);
                          }
                        } catch (error) {
                          setSubmitError(
                            "Failed to submit. Please try again later."
                          );
                          setSubmitSuccess(false);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      className="flex items-center gap-2 w-full"
                    >
                      <input
                        type="hidden"
                        name="access_key"
                        value={import.meta.env.VITE_WEB3FORMS_KEY}
                      />
                      <input
                        type="hidden"
                        name="subject"
                        value="New Premium Access Request"
                      />
                      <input
                        type="hidden"
                        name="from_name"
                        value="Ghola Premium Request"
                      />

                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="your@email.com"
                        className="flex-1 py-2 px-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
                        disabled={isSubmitting || submitSuccess}
                      />

                      <button
                        type="submit"
                        className="py-2 px-4 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 rounded-lg text-white font-medium transition-all disabled:opacity-70"
                        disabled={isSubmitting || submitSuccess}
                      >
                        {isSubmitting
                          ? "Sending..."
                          : submitSuccess
                          ? "Sent"
                          : "Get Access"}
                      </button>
                    </form>

                    {submitSuccess && (
                      <div className="mt-2 text-green-400 text-xs">
                        Request received! We'll contact you soon.
                      </div>
                    )}
                    {submitError && (
                      <div className="mt-2 text-red-400 text-xs">
                        {submitError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* License key validation component */}

          {!premium ? (
            <LemonSqueezyPayment
              onValidationSuccess={(details) => {
                console.log("License validated:", details);
                setPremium(true);
              }}
            />
          ) : (
            <div>Premium Access Granted</div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Hero;
