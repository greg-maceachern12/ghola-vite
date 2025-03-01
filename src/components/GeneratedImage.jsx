import { useState, useEffect } from "react";
import { FaDownload, FaShare, FaInfoCircle } from "react-icons/fa";

const GeneratedImage = ({ src, alt, character, premium }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Reset loading state when src changes
    setIsLoaded(false);
  }, [src]);

  const handleDownload = () => {
    // Create a temporary link
    const link = document.createElement("a");
    link.href = src;

    // Clean up character name for filename
    const filename = character
      ? `ghola-${character.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`
      : "ghola-character.jpg";

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!navigator.share) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
      return;
    }

    try {
      // Fetch the image and convert to blob
      const response = await fetch(src);
      const blob = await response.blob();
      const file = new File([blob], "character.jpg", { type: "image/jpeg" });

      await navigator.share({
        title: `${character || "Character"} created with Ghola`,
        text: `Check out this AI-generated image of ${
          character || "a character"
        } created with Ghola!`,
        files: [file],
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="relative rounded-xl overflow-hidden transition-all duration-300 transform">
        {/* Loading state placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 to-indigo-700/30 animate-pulse flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
          </div>
        )}

        {/* The image */}
        <img
          src={src}
          alt={alt}
          className={`w-full h-auto rounded-xl object-cover max-h-[600px] transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
        />

        {/* Character name overlay */}
        {character && isLoaded && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
            <h3 className="text-white text-xl font-medium">{character}</h3>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {isLoaded && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-white/50 flex items-center gap-1">
            <FaInfoCircle />
            <span>
              Generated with{" "}
              {premium ? (
                <span className="text-blue-600 font-bold">Flux Pro</span>
              ) : (
                "Flux Schnell"
              )}{" "}
              model
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Download image"
              title="Download image"
            >
              <FaDownload size={18} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors relative"
              aria-label="Share image"
              title="Share image"
            >
              <FaShare size={18} />

              {/* Tooltip for unsupported browsers */}
              {showTooltip && (
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-black/80 backdrop-blur-sm text-white text-xs whitespace-nowrap rounded-lg shadow-lg">
                  Sharing not supported in this browser
                </div>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedImage;
