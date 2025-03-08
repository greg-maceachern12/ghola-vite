import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  CreditCard,
  Zap,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { Polar } from "@polar-sh/sdk";

// Renamed to reflect that we're using Polar now
const PremiumAccessManager = ({ onValidationSuccess }) => {
  // State management
  const [view, setView] = useState("checking"); // checking, success, email
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Constants
  const PRODUCT_ID = "39ee22db-65e8-4b6b-90d5-0bd28b5b70d9"; // Your Ghola Courses product ID

  // Initialize Polar client
  const polar = new Polar({
    accessToken: import.meta.env.VITE_POLAR_ACCESS_TOKEN || "",
  });

  // Check for existing subscription on component mount
  useEffect(() => {
    checkSavedSubscription();
  }, []);

  // Function to check if user already has a saved subscription email
  const checkSavedSubscription = async () => {
    try {
      const savedEmail = localStorage.getItem("ghola_subscriber_email");
      
      if (savedEmail) {
        const { hasActiveSubscription, subscription } = await checkEmailSubscription(savedEmail);
        
        if (hasActiveSubscription) {
          activatePremium({
            type: "subscription",
            email: savedEmail,
            date: subscription?.createdAt || new Date().toISOString()
          });
          return;
        }
      }
      
      // No valid saved subscription found
      setView("email");
    } catch (error) {
      console.error("Error checking saved subscription:", error);
      setView("email");
    }
  };

  // Function to activate premium and notify parent component
  const activatePremium = (data) => {
    setView("success");
    
    if (onValidationSuccess) {
      onValidationSuccess({
        orderTime: data.date || new Date().toISOString(),
        product: "Premium Access",
        email: data.email || null
      });
    }
  };

  // Function to check if an email has an active subscription
  const checkEmailSubscription = async (email) => {
    try {
      const response = await polar.subscriptions.list({
        product_id: PRODUCT_ID
      });
      // console.log(response)
      // Process the response which comes in the format you showed
      const subscriptions = response?.result?.items || [];
      // console.log(subscriptions);
      // Find active subscriptions for our product ID
      const activeSubscription = subscriptions.find(sub => 
        (sub.status === "active" || sub.status === "trialing") && 
        (sub.productId === PRODUCT_ID && sub.customer.email === email)
      );
      console.log(activeSubscription);
  
      return {
        hasActiveSubscription: !!activeSubscription,
        subscription: activeSubscription || null
      };
    } catch (error) {
      console.error("Error checking subscription:", error);
      return {
        hasActiveSubscription: false,
        error: error.message || "Failed to verify subscription"
      };
    }
  };

  // Function to save subscriber email to localStorage
  const saveSubscriberEmail = (email) => {
    try {
      localStorage.setItem("ghola_subscriber_email", email);
    } catch (error) {
      console.error("Failed to save subscriber email:", error);
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
      const { hasActiveSubscription, subscription } = await checkEmailSubscription(email);
      
      if (hasActiveSubscription) {
        // User has active subscription, activate premium mode
        saveSubscriberEmail(email);
        
        activatePremium({
          type: "subscription",
          email: email,
          date: subscription?.createdAt
        });
      } else {
        // No active subscription, redirect to checkout
        setMessage("No active subscription found. Redirecting to checkout...");
        
        // Create checkout URL with the product ID and email
        const checkoutUrl = `https://buy.polar.sh/polar_cl_ukvMp9Z1bIr9IrqDv9Y0Zs80WtqXf9gFLLkUH1Gd0B3`;
        
        setTimeout(() => {
          window.open(checkoutUrl, "_blank");
        }, 1500);
      }
    } catch (error) {
      setError("Failed to check subscription status. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // When checking credentials
  if (view === "checking") {
    return (
      <div className="bg-black/50 backdrop-blur-lg border border-white/20 rounded-xl p-5">
        <div className="flex flex-col items-center justify-center py-4 gap-3">
          <div className="animate-spin h-6 w-6 border-2 border-white/30 border-t-white rounded-full" />
          <p className="text-sm text-white/70">Checking premium access...</p>
        </div>
      </div>
    );
  }

  // When premium access is active
  if (view === "success") {
    return (
      <div className="bg-black/50 backdrop-blur-lg border border-white/20 rounded-xl p-5">
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="font-medium text-green-400">Premium Access Activated</h3>
          <p className="text-sm text-white/70 text-center">
            Enjoy unlimited HD generations and all premium features!
          </p>
        </div>
      </div>
    );
  }

  // Main component UI for subscription checking
  return (
    <div className="bg-black/50 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 py-3">
        <div className="flex items-center justify-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-medium text-white">Premium Subscription</h2>
        </div>
      </div>

      <div className="p-5">
        {/* Premium features */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-white">Premium Features</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-xs text-white/70 ml-6">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-blue-400"></div>
              <span>Unlimited Generations</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-blue-400"></div>
              <span>HD Quality (2x Resolution)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-blue-400"></div>
              <span>Faster Processing</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-blue-400"></div>
              <span>Priority Support</span>
            </div>
          </div>
        </div>

        {/* Email subscription form */}
        <form onSubmit={handleEmailSubmit}>
          <div className="mb-4">
            <label className="block text-white/70 text-xs mb-1 ml-1">
              Enter your email to check subscription status
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
              No subscription yet? Enter your email and we'll take you to checkout.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PremiumAccessManager;
