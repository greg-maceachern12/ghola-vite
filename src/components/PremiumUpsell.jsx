import { useState, useEffect } from "react";
import { XCircle, Check, ArrowRight } from "lucide-react";

const PremiumUpsell = ({
  onClose,
  firstImageUrl,
  remainingRequests,
  maxRequests,
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white/60 hover:text-white p-1 z-10"
          aria-label="Close dialog"
        >
          <XCircle />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left side - Image comparison */}
          <div className="w-full md:w-1/2 p-6 bg-slate-800/80 backdrop-blur-sm flex flex-col">
            <h2 className="text-white text-xl font-medium mb-4">
              The Pro Difference
            </h2>

            <div className="grid grid-cols-2 gap-4 flex-grow">
              <div className="flex flex-col">
                <p className="text-white/70 text-sm mb-2">Free Tier</p>
                <div className="relative aspect-square">
                  <img
                    src="/assets/examples/gatsby-free.jpg"
                    alt="Free tier example"
                    className="w-full h-full object-cover rounded-lg opacity-90"
                  />
                </div>
                <p className="text-white/90 text-sm mt-2 text-center">Realistic Jay Gatsby</p>
              </div>

              <div className="flex flex-col">
                <p className="text-white/70 text-sm mb-2">Premium Tier</p>
                <div className="relative aspect-square">
                  <img
                    src="/assets/examples/gatsby-pro.jpg"
                    alt="Premium tier example"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute top-0 right-0 m-2">
                    <span className="bg-gradient-to-r from-blue-700 to-blue-500 text-white text-xs font-bold rounded-md px-3 py-1 shadow-lg">
                      PRO
                    </span>
                  </div>
                </div>
                <p className="text-white/90 text-sm mt-2 text-center">Realistic Jay Gatsby</p>
              </div>
            </div>
          </div>

          {/* Right side - Pricing & Benefits */}
          <div className="w-full md:w-1/2 p-8 bg-slate-900/70 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-2">
              Unlock Premium
            </h2>
            <p className="text-white/70 mb-6">
              Enhance your creative experience with premium features
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-start">
                <Check className="text-blue-400 w-5 h-5 mt-0.5 mr-2" />
                <p className="text-white">Unlimited image generations</p>
              </div>
              <div className="flex items-start">
                <Check className="text-blue-400 w-5 h-5 mt-0.5 mr-2" />
                <p className="text-white">Higher resolution images</p>
              </div>
              <div className="flex items-start">
                <Check className="text-blue-400 w-5 h-5 mt-0.5 mr-2" />
                <p className="text-white">Priority processing</p>
              </div>
              <div className="flex items-start">
                <Check className="text-blue-400 w-5 h-5 mt-0.5 mr-2" />
                <p className="text-white">Advanced customization options</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-white text-3xl font-bold">$4.99</span>
              <span className="text-white/70">/month</span>
            </div>

            <a
              href="https://maltby.lemonsqueezy.com/buy/dd2174f8-9668-4c2b-98dd-fef1069baaba"
              target="_blank"
              className="flex items-center justify-center w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-lg transition duration-150 shadow-lg"
            >
              Upgrade to Premium <ArrowRight className="ml-2 w-4 h-4" />
            </a>

            <p className="text-center text-white/60 text-xs mt-4">
              7-day money-back guarantee. No questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpsell;