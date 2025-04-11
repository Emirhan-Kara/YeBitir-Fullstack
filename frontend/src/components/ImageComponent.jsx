import { useState } from "react";

const ImageComponent = ({ headerImage }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Default placeholder if image is missing or fails to load
  // Using base64 encoded image data to avoid network requests
  const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=";
  
  const displayImage = imageError || !headerImage ? placeholderImage : headerImage;

  return (
    <div>
      {/* Conditional Rendering: Full-Screen Image */}
      {isFullScreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          onClick={() => setIsFullScreen(false)} // Close when clicked
        >
          <img 
            src={displayImage} 
            alt="Full View" 
            className="max-w-full max-h-full object-contain"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Header Image Container with Letterboxing */}
      <div className="w-full bg-black">
        {/* Container with fixed height */}
        <div className="relative w-full max-w-4xl mx-auto" style={{ height: "300px" }}>
          {/* Image centered and contained within the container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={displayImage} 
              alt="Recipe" 
              className="max-h-full max-w-full object-contain"
              onError={() => setImageError(true)}
            />
          </div>
          
          {/* Open Full Image Button */}
          <button 
            className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg hover:bg-gray-800 cursor-pointer z-10"
            onClick={() => setIsFullScreen(true)}
          >
            View Full Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageComponent;
