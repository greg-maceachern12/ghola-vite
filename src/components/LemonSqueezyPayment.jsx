import React, { useState } from 'react';
import { CheckCircle, XCircle, Lock, Mail, Zap, ArrowRight } from 'lucide-react';

const LemonSqueezyPayment = ({ onValidationSuccess }) => {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('email'); // 'email' or 'license'
  const [processing, setProcessing] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null); // null, 'validating', 'success', 'error'
  const [isPremium, setIsPremium] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      setStatusMessage(activeTab === 'email' ? 'Please enter your email' : 'Please enter a license key');
      setValidationStatus('error');
      return;
    }

    setProcessing(true);
    setValidationStatus('validating');
    setStatusMessage('');

    if (activeTab === 'email') {
      // Handle email signup
      try {
        const formData = new FormData();
        formData.append('access_key', import.meta.env.VITE_WEB3FORMS_KEY);
        formData.append('email', inputValue);
        formData.append('subject', 'New Premium Access Request');
        formData.append('from_name', 'Ghola Premium Request');

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          setValidationStatus('success');
          setStatusMessage('Request received! We\'ll contact you soon.');
          window.open("https://maltby.lemonsqueezy.com/buy/dd2174f8-9668-4c2b-98dd-fef1069baaba");
        } else {
          setValidationStatus('error');
          setStatusMessage('Something went wrong. Please try again.');
        }
      } catch (error) {
        setValidationStatus('error');
        setStatusMessage('Failed to submit. Please try again later.');
      }
    } else {
      // Handle license key validation
      try {
        const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            license_key: inputValue.trim()
          })
        });

        const data = await response.json();

        if (data.activated || data.valid) {
          setValidationStatus('success');
          setIsPremium(true);
          setStatusMessage('License validated successfully! You\'ve unlocked Unlimited HD generations');
          if (onValidationSuccess) {
            onValidationSuccess({
              orderTime: new Date().toISOString(),
              product: 'Full Book Conversion',
              licenseKey: inputValue,
            });
          }
        } else {
          setValidationStatus('error');
          setStatusMessage(data.error || 'Invalid license key');
        }
      } catch (error) {
        setValidationStatus('error');
        setStatusMessage('Failed to validate license key. Please try again.');
      }
    }

    setProcessing(false);
  };

  const resetForm = () => {
    setInputValue('');
    setValidationStatus(null);
    setStatusMessage('');
  };

  // If premium is already active, show a simple success message
  if (isPremium) {
    return (
      <div className="bg-black/50 backdrop-blur-lg border border-white/20 rounded-xl p-5">
        <div className="flex items-center gap-3 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">
            Premium activated! Enjoy HD images and unlimited generations
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/50 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
      {/* Tab switcher */}
      <div className="flex border-b border-white/10">
        <button
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'email' 
              ? 'text-white border-b-2 border-blue-400' 
              : 'text-white/60 hover:text-white/80'
          }`}
          onClick={() => {
            setActiveTab('email');
            resetForm();
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Request Access</span>
          </div>
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'license' 
              ? 'text-white border-b-2 border-blue-400' 
              : 'text-white/60 hover:text-white/80'
          }`}
          onClick={() => {
            setActiveTab('license');
            resetForm();
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Activate License</span>
          </div>
        </button>
      </div>

      <div className="p-5">
        {/* Premium features */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-medium text-white">Premium Features</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-white/70 ml-6">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-blue-400"></div>
              <span>Unlimited Generations</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-blue-400"></div>
              <span>HD Quality (2x Resolution)</span>
            </div>
          </div>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type={activeTab === 'email' ? 'email' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={activeTab === 'email' ? 'your@email.com' : 'Enter license key'}
              className="w-full py-3 px-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
              disabled={processing}
            />
            <button
              type="submit"
              disabled={processing}
              className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded-md text-white transition-colors"
            >
              {processing ? (
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Status message */}
          {validationStatus && validationStatus !== 'validating' && (
            <div className={`mt-3 p-2 text-sm rounded-md ${
              validationStatus === 'success'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              <div className="flex items-center gap-2">
                {validationStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage}</span>
              </div>
            </div>
          )}

          {/* Additional message based on active tab */}
          <div className="mt-3 text-center text-xs text-white/50">
            {activeTab === 'email' ? (
              <p>We'll send you details for access within 24 hours</p>
            ) : (
              <p>Enter your license key to unlock premium immediately. <strong>Your license should be in your email.</strong></p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LemonSqueezyPayment;