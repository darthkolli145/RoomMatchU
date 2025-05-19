import { useState } from 'react';

type ImageGalleryProps = {
  images: string[];
};

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  
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
  
  return (
    <div className="image-gallery">
      <div className="main-image">
        <img src={images[activeIndex]} alt={`Property view ${activeIndex + 1}`} />
      </div>
      
      {images.length > 1 && (
        <div className="thumbnail-strip">
          {images.map((image, index) => (
            <div 
              key={index} 
              className={`thumbnail ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              <img src={image} alt={`Thumbnail ${index + 1}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 