import { useState } from 'react';

type ImageGalleryProps = {
  images: string[];
};

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});
  
  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="image-gallery">
        <div className="main-image placeholder-image">
          No images available
        </div>
      </div>
    );
  }
  
  const handleImageError = (index: number) => {
    setImageError(prev => ({ ...prev, [index]: true }));
  };
  
  return (
    <div className="image-gallery">
      <div className="main-image">
        {imageError[activeIndex] ? (
          <div className="error-placeholder">
            <p>Image unavailable</p>
            <small>Please check back later or contact the poster</small>
          </div>
        ) : (
          <img 
            src={images[activeIndex]} 
            alt={`Property view ${activeIndex + 1}`}
            onError={() => handleImageError(activeIndex)}
          />
        )}
      </div>
      
      {images.length > 1 && (
        <div className="thumbnail-strip">
          {images.map((image, index) => (
            <div 
              key={index} 
              className={`thumbnail ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              {imageError[index] ? (
                <div className="thumbnail-error">❌</div>
              ) : (
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`}
                  onError={() => handleImageError(index)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 