import React, { useState } from 'react';
import { CheckCircle, XCircle, Lock, X } from 'lucide-react';

const LemonSqueezyPayment = ({ onValidationSuccess }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [validationStatus, setValidationStatus] = useState(null); // null, 'validating', 'success', 'error'
  const [isPremium, setIsPremium] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateLicenseKey = async () => {
    if (!licenseKey.trim()) {
      setErrorMessage('Please enter a license key');
      setValidationStatus('error');
      return;
    }

    setValidationStatus('validating');
    setErrorMessage('');

    try {
      const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          license_key: licenseKey.trim()
        })
      });

      const data = await response.json();
      console.log(data);

      if (data.activated || data.valid) {
        setValidationStatus('success');
        setIsPremium(true);
        if (onValidationSuccess) {
          onValidationSuccess({
            orderTime: new Date().toISOString(),
            product: 'Full Book Conversion',
            licenseKey: licenseKey,
          });
        }
      } else {
        setValidationStatus('error');
        setErrorMessage(data.error || 'Invalid license key');
      }
    } catch (error) {
      setValidationStatus('error');
      setErrorMessage('Failed to validate license key. Please try again.');
    }
  };

  return (
    <div className="relative bg-black/50 backdrop-blur-lg border border-white/20 rounded-xl p-6">
      {/* Premium status banner */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"></div>
        {isPremium ? (
          <span className="text-sm text-white">
            Premium activated! HD images and unlimited generations
          </span>
        ) : (
          <span className="text-sm text-white">
            Enter your license key to unlock premium
          </span>
        )}
      </div>
      {/* License input and validate button */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="Enter license key"
          className="flex-1 py-2 px-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
          disabled={validationStatus === 'validating' || validationStatus === 'success'}
        />
        <button
          onClick={validateLicenseKey}
          disabled={validationStatus === 'validating' || validationStatus === 'success'}
          className="py-2 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-70"
        >
          {validationStatus === 'validating' ? (
            <div className="animate-spin h-4 w-4 border border-white/50 border-t-transparent rounded-full" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
        </button>
      </div>
      {/* Validation Status Messages */}
      {validationStatus && validationStatus !== 'validating' && (
        <div className={`mt-4 rounded-lg border p-3 relative ${
          validationStatus === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            {validationStatus === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">
                  License validated successfully! Your entire book will be converted.
                </p>
                <button
                  onClick={() => setValidationStatus(null)}
                  className="absolute top-2 right-2 text-emerald-500 hover:text-emerald-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                <p className="text-sm font-medium">{errorMessage}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LemonSqueezyPayment;
