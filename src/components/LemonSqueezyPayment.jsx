import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Zap,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { Polar } from "@polar-sh/sdk";

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
        setIsPremium(false);
        setIsVisible(false);
        onStatusCheck?.({ email: emailToCheck, isPremium: false });
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setIsPremium(false);
      setIsVisible(true);
      onStatusCheck?.({ email: emailToCheck, isPremium: false });
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
