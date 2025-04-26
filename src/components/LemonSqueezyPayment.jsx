import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Zap,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { Polar } from "@polar-sh/sdk";

// Function to send email to Loops.so
const sendToLoops = async (email, premium) => {
  if (!email || email === "not-entered") return false;

  const LOOPS_API_KEY = import.meta.env.VITE_LOOPS_API_KEY;
  if (!LOOPS_API_KEY) {
    console.error("Loops API key (VITE_LOOPS_API_KEY) not configured in .env");
    return false;
  }

  try {
    // First try to find if contact exists
    const findResponse = await fetch(`https://app.loops.so/api/v1/contacts/find?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${LOOPS_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const contactData = {
      email,
      userGroup: "Ghola Users",
      source: "Ghola Web App Signup",
      subscribed: "yes",
      premium: premium ? "Yes" : "No" // Send premium status as Yes/No string
    };

    let syncSuccess = false;
    if (findResponse.ok) { // Check status code 200 for existence
      // Contact exists, update it
      const updateResponse = await fetch("https://app.loops.so/api/v1/contacts/update", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${LOOPS_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(contactData)
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.message || "Failed to update contact in Loops.so");
      }
      syncSuccess = true;
    } else if (findResponse.status === 404) {
      // Contact doesn't exist, create it
      const createResponse = await fetch("https://app.loops.so/api/v1/contacts/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOOPS_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(contactData)
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.message || "Failed to create contact in Loops.so");
      }
      syncSuccess = true;
    } else {
      // Handle other potential errors from the find request
      const error = await findResponse.json();
      throw new Error(error.message || `Failed to find contact in Loops.so: Status ${findResponse.status}`);
    }

    if (syncSuccess) {
      console.log("Successfully synced contact with Loops.so");
    }
    return syncSuccess;
  } catch (error) {
    console.error("Error sending to Loops.so:", error);
    return false;
  }
};

const PremiumAccessManager = ({ onValidationSuccess, onStatusCheck }) => {
  // State management
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Constants
  const PRODUCT_ID = "39ee22db-65e8-4b6b-90d5-0bd28b5b70d9";

  // Initialize Polar client
  const polar = new Polar({
    accessToken: import.meta.env.VITE_POLAR_ACCESS_TOKEN || "",
  });

  // Check for saved email and subscription on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("ghola_subscriber_email");
    if (!savedEmail) {
      setIsVisible(true);
      onStatusCheck?.({ email: null, isPremium: false });
    } else {
      setEmail(savedEmail);
      checkSubscription(savedEmail);
    }
  }, []);

  // Function to check subscription status
  const checkSubscription = async (emailToCheck) => {
    let isSubscribed = false; // Local variable to track status within this check
    try {
      const response = await polar.subscriptions.list({
        product_id: PRODUCT_ID
      });

      const subscriptions = response?.result?.items || [];
      const activeSubscription = subscriptions.find(sub =>
        (sub.status === "active" || sub.status === "trialing") &&
        (sub.productId === PRODUCT_ID && sub.customer.email === emailToCheck)
      );

      if (activeSubscription) {
        isSubscribed = true;
        setIsPremium(true);
        setIsVisible(false);
        onStatusCheck?.({ email: emailToCheck, isPremium: true });
        if (onValidationSuccess) {
          onValidationSuccess({
            orderTime: activeSubscription.createdAt || new Date().toISOString(),
            product: "Premium Access",
            email: emailToCheck
          });
        }
      } else {
        isSubscribed = false;
        setIsPremium(false);
        // Keep modal visible if they entered email but are not premium
        // setIsVisible(false);
        setIsVisible(false); // Keep visible or maybe show a message? Let's keep it visible for now.
        onStatusCheck?.({ email: emailToCheck, isPremium: false });
        // Add a message to prompt upgrade?
        // setMessage("Looks like you don't have premium access yet. Upgrade below!"); // Example message
        setError(null); // Clear previous errors
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      isSubscribed = false;
      setIsPremium(false);
      setIsVisible(true);
      onStatusCheck?.({ email: emailToCheck, isPremium: false });
      setError("Could not verify subscription. Please try again or contact support."); // More specific error
      setMessage(null); // Clear previous messages
    } finally {
      // Send to Loops regardless of check success/failure, but *after* status is determined
      await sendToLoops(emailToCheck, isSubscribed);
    }
  };

  // Handle email form submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setMessage(null);
    
    try {
      // Save email locally
      localStorage.setItem("ghola_subscriber_email", email);
      
      // Check subscription status
      await checkSubscription(email);
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Main component UI for subscription checking
  return (
    <>
      {isVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/50 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden max-w-lg w-full relative">
            {/* Header */}
            <div className="border-b border-white/10 py-3">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-medium text-white">Start Creating Characters</h2>
              </div>
            </div>

            <div className="p-5">
              {/* Character Showcase */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white mb-3 text-center">Create Amazing Characters Like These</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <img 
                      src="/assets/examples/gandalf.png" 
                      alt="Gandalf Character Example" 
                      className="w-full h-auto rounded-lg border border-white/10 transition-transform group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-xs text-white/90">Gandalf the Grey</span>
                    </div>
                  </div>
                  <div className="relative group">
                    <img 
                      src="/assets/examples/paul.png" 
                      alt="Paul Atreides Character Example" 
                      className="w-full h-auto rounded-lg border border-white/10 transition-transform group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-xs text-white/90">Paul Atreides</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-medium text-white">What You Can Create</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-xs text-white/70 ml-6">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                    <span>Fantasy Characters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                    <span>Sci-Fi Heroes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                    <span>Movie Icons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                    <span>Original Characters</span>
                  </div>
                </div>
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailSubmit}>
                <div className="mb-4">
                  <label className="block text-white/70 text-xs mb-1 ml-1">
                    Enter your email to start creating
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full py-3 px-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
                      disabled={isProcessing}
                    />
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-blue-700 hover:bg-blue-600 rounded-md text-white transition-colors"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Status messages */}
                {error && (
                  <div className="mt-3 p-2 text-sm rounded-md bg-red-500/20 text-red-400">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {message && (
                  <div className="mt-3 p-2 text-sm rounded-md bg-blue-500/20 text-blue-400">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 shrink-0" />
                      <span>{message}</span>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-center text-xs text-white/50">
                  <p>
                    Join thousands of creators bringing their characters to life
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PremiumAccessManager;
