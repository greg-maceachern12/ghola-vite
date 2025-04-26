import { useState, useEffect } from "react";
import { FaDownload, FaShare, FaInfoCircle, FaCrown } from "react-icons/fa";

const GeneratedImage = ({ src, alt, character, premium, loading }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    // Reset loading state when src changes
    if (src) {
      setIsLoaded(false);
      // Handle array of URLs (from API response)
      const imageUrl = Array.isArray(src) ? src[0] : src;
      
      // Check if it's a base64 image (premium)
      if (typeof imageUrl === 'string' && imageUrl.startsWith('data:image')) {
        // Convert base64 to blob URL
        fetch(imageUrl)
          .then(res => res.blob())
          .then(blob => {
            const url = URL.createObjectURL(blob);
            setBlobUrl(url);
          });
      } else {
        setBlobUrl(imageUrl);
      }
    }
    // Cleanup function to revoke blob URL
    return () => {
      if (blobUrl && typeof blobUrl === 'string' && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [src]);

  const handleDownload = () => {
    if (!src) return;
    
    const imageUrl = Array.isArray(src) ? src[0] : src;
    
    // For base64 images (premium)
    if (typeof imageUrl === 'string' && imageUrl.startsWith('data:image')) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = character
        ? `ghola-${character.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`
        : "ghola-character.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // For regular URLs (non-premium)
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = character
          ? `ghola-${character.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`
          : "ghola-character.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
  };

  const handleShare = async () => {
    if (!navigator.share || !src) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
      return;
    }

    try {
      const imageUrl = Array.isArray(src) ? src[0] : src;
      // For both base64 and URL images, fetch and convert to blob
      const response = await fetch(
        typeof imageUrl === 'string' && imageUrl.startsWith('data:image') 
          ? imageUrl 
          : blobUrl
      );
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
      <div className="relative rounded-xl overflow-hidden transition-all duration-300 transform min-h-[400px]">
        {/* Always render either the loading state or the image container with consistent height */}
        {loading ? (
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 to-indigo-700/30 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white/80 rounded-full animate-spin mb-6"></div>
            <div className="text-white/80 text-center px-4">
              <p className="text-lg font-medium">Creating your character...</p>
              <p className="text-white/60 text-sm mt-2">This may take up to 20 seconds</p>
            </div>
          </div>
        ) : (
          <>
            {/* Image loading indicator (only when image is loading after generation) */}
            {blobUrl && !isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
              </div>
            )}

            {/* The image */}
            {blobUrl && (
              <img
                src={blobUrl}
                alt={alt}
                className={`w-full h-auto rounded-xl object-cover max-h-[600px] transition-all duration-500 ${
                  isLoaded ? "opacity-100" : "opacity-30"
                }`}
                style={{ minHeight: "400px" }}
                onLoad={() => setIsLoaded(true)}
              />
            )}

            {/* Placeholder when no image */}
            {!blobUrl && (
              <div className="w-full h-[400px] bg-white/5 flex items-center justify-center">
                <div className="text-white/40 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto mb-4"
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
                  <p className="text-lg">Ready to create</p>
                </div>
              </div>
            )}

            {/* Character name overlay - only show when image is loaded */}
            {character && isLoaded && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                <div className="flex items-center">
                  {premium && <FaCrown className="text-yellow-500 mr-2 text-xs" />}
                  <h3 className="text-white text-xl font-medium">{character}</h3>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action buttons - only show when image is loaded and not loading */}
      {blobUrl && isLoaded && !loading && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-white/50 flex items-center gap-1">
            <FaInfoCircle />
            <span>
              Generated with{" "}
              {premium ? (
                <span className="text-blue-600 font-bold">Flux Pro</span>
              ) : (
                <>
                  Free Version{" "}
                  <a
                    href="https://buy.polar.sh/polar_cl_ukvMp9Z1bIr9IrqDv9Y0Zs80WtqXf9gFLLkUH1Gd0B3"
                    target="_blank"
                    className="text-blue-500 font-bold underline"
                  >
                    click here for unlimited HD generations
                  </a>
                </>
              )}
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
