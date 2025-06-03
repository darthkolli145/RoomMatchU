// postlisting.tsx
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { postListing, ListingFormData } from '../firebase/firebaseHelpers';
import { QuestionnaireCategory } from '../types/index';
import { uploadImageToCloudinary } from '../utils/cloudinaryUpload';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import imageCompression from 'browser-image-compression';
import AddressAutocomplete from '../components/AddressAutocomplete';
import toast from 'react-hot-toast';


export default function PostListing() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    bio: '',
    address: '',
    beds: '',
    baths: '',
    availableDate: new Date(),
    price: '',
    onCampus: false,
    pets: false,
    // Default values for compatibility tags
    sleepSchedule: '',
    wakeupSchedule: '',
    cleanliness: '',
    noiseLevel: '',
    visitors: '',
    lifestyle: [],
    studyHabits: '',
    prefGender:'',
    images: [],
    thumbnailIndex: 0,
  });
  
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is logged in
  useEffect(() => {
    if (!currentUser) {
      setErrorMessage('You must be logged in to post a listing');
    } else {
      setErrorMessage(null);
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'availableDate') {
      // Convert string date to Date object
      setFormData(prev => ({ ...prev, [name]: new Date(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLifestyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      if (checked) {
        return { ...prev, lifestyle: [...(prev.lifestyle || []), value] };
      } else {
        return { ...prev, lifestyle: (prev.lifestyle || []).filter(item => item !== value) };
      }
    });
  };
  
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      setIsSubmitting(true); // Disable submit while processing images
      setErrorMessage('Processing images, please wait...');
      
      try {
        const newImages: File[] = [];
        const newPreviewUrls: string[] = [];
        
        // Process each file - only accept standard image formats
        for (const file of Array.from(files)) {
          try {
            // Check if file is a standard image format
            if (!file.type.startsWith('image/') || 
                !file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) {
              console.warn(`Skipping non-supported file: ${file.name}`);
              continue;
            }
            
            // Compress the image if needed
            const compressedFile = await compressImage(file);
            
            // Generate preview URL
            const url = URL.createObjectURL(compressedFile);
            
            newImages.push(compressedFile);
            newPreviewUrls.push(url);
          } catch (error) {
            console.error(`Error processing image ${file.name}:`, error);
          }
        }
        
        if (newImages.length > 0) {
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), ...newImages]
          }));
          
          setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
          setErrorMessage(null);
        } else {
          setErrorMessage('No valid images were selected. Supported formats: JPG, PNG, GIF, WebP');
        }
      } catch (error) {
        console.error('Error processing images:', error);
        setErrorMessage('Error processing images. Please try different files.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      
      // Update thumbnail index if needed
      let newThumbnailIndex = prev.thumbnailIndex;
      
      if (typeof newThumbnailIndex === 'number') {
        if (newThumbnailIndex === index) {
          // If removing the current thumbnail, default to first image
          newThumbnailIndex = newImages.length > 0 ? 0 : undefined;
        } else if (newThumbnailIndex > index) {
          // If removing an image before the thumbnail, adjust the index
          newThumbnailIndex -= 1;
        }
      }
      
      return {
        ...prev,
        images: newImages,
        thumbnailIndex: newThumbnailIndex
      };
    });
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    const newPreviewUrls = [...imagePreviewUrls];
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);
  };
  
  const handleSetThumbnail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      thumbnailIndex: index
    }));
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.3,           // this gives ~300-400KB per image
      maxWidthOrHeight: 1200,   // resize if bigger
      useWebWorker: true
    };
  
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Image compression failed:", error);
      return file;  // fallback to original if compression fails
    }
  };

  const handleAddressChange = (address: string, lat?: number, lng?: number) => {
    setFormData(prev => ({ 
      ...prev, 
      address,
      ...(lat !== undefined && lng !== undefined ? { lat, lng } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setErrorMessage('You must be logged in to post a listing');
      return;
    }
    
    // Reset error message
    setErrorMessage(null);
    
    try {
      setIsSubmitting(true);

      const {
        sleepSchedule, wakeupSchedule, cleanliness, noiseLevel,
        visitors, studyHabits, lifestyle, prefGender, ...baseData
      } = formData;

      
      // Validate the date
      if (!(baseData.availableDate instanceof Date) || isNaN(baseData.availableDate.getTime())) {
        throw new Error('Please provide a valid available date');
      }

      // Upload images to Cloudinary
      let uploadedImageURLs: string[] = [];
      if (formData.images && formData.images.length > 0) {
        try {
          setErrorMessage('Uploading images, please wait...');
          
          // Upload images one by one and handle errors individually
          for (const file of formData.images) {
            try {
              // Images are already processed at this point
              const imageUrl = await uploadImageToCloudinary(file);
              uploadedImageURLs.push(imageUrl);
            } catch (error) {
              console.error('Error uploading image:', error);
              // Continue with other images if one fails
            }
          }
          
          if (uploadedImageURLs.length === 0) {
            // If all uploads failed, use a placeholder
            const placeholderImage = `https://placehold.co/800x600?text=${encodeURIComponent(formData.title || 'Listing')}`;
            uploadedImageURLs = [placeholderImage];
          }
        } catch (error) {
          console.error('Error uploading images:', error);
          // Fall back to placeholder if all uploads fail
          const placeholderImage = `https://placehold.co/800x600?text=${encodeURIComponent(formData.title || 'Listing')}`;
          uploadedImageURLs = [placeholderImage];
        }
      } else {
        // Use correct placeholder URL if no images uploaded
        const placeholderImage = `https://placehold.co/800x600?text=${encodeURIComponent(formData.title || 'Listing')}`;
        uploadedImageURLs = [placeholderImage];
      }

      // Determine thumbnail URL
      let thumbnailURL: string | undefined = uploadedImageURLs[formData.thumbnailIndex ?? 0] || uploadedImageURLs[0];
      
      // Prepare the tags from individual fields
      const listingWithTags: ListingFormData = {
        ...baseData,
        tags: {
          sleepSchedule,
          wakeupSchedule,
          cleanliness,
          noiseLevel,
          visitors,
          studyHabits,
          lifestyle,
          prefGender, // ⬅️ Add this here
        },
        imageURLs: uploadedImageURLs,
        thumbnailURL: thumbnailURL
      };
      
      const listingId = await postListing(listingWithTags);
      toast.success('🎉 Listing posted successfully!');
      setTimeout(() => navigate(`/listing/${listingId}`), 2000); // redirect after 2 seconds

      
      // Clean up all object URLs to prevent memory leaks
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      
    } catch (error) {
      console.error('Failed to submit listing:', error);
      if (error instanceof Error) {
        const message = error.message || 'Failed to submit listing. Please try again.';
        setErrorMessage(message);
        toast.error(`🚨 ${message}`);
      } else {
        setErrorMessage('Failed to submit listing. Please try again.');
        toast.error('🚨 Failed to submit listing. Please try again.');
      }
    }
  };

  return (
    <div className="post-listing-page">
      <h1>Post Your Own Listing!</h1>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="post-listing-form">
        <h2 className="text-xl font-semibold text-indigo-600 border-b pb-1 mt-8 mb-4">
          Basic Information
        </h2>
        
        <label>
          Title:
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </label>

        <label>
          Address (For Distance-Based Filter):
          <AddressAutocomplete
            value={formData.address}
            onChange={handleAddressChange}
            placeholder="1156 High St, Santa Cruz, CA"
            required
          />
        </label>

        <label>
          Short Bio / Description:
          <textarea name="bio" value={formData.bio} onChange={handleChange} required />
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            name="onCampus"
            checked={formData.onCampus}
            onChange={handleChange}
            className="mr-2"
          />
          On Campus Housing
        </label>

        <label>
          Number of Beds:
          <input type="number" name="beds" value={formData.beds} onChange={handleChange} required min="1" />
        </label>

        <label>
          Number of Bathrooms:
          <input type="number" name="baths" value={formData.baths} onChange={handleChange} required min="1" step="0.5" />
        </label>

        <label>
          Available Date:
          <input 
            type="date" 
            name="availableDate" 
            value={formData.availableDate instanceof Date ? formData.availableDate.toISOString().split('T')[0] : ''} 
            onChange={handleChange} 
            required 
          />
        </label>

        <label>
          Price per Month ($):
          <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" />
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            name="pets"
            checked={formData.pets}
            onChange={handleChange}
            className="mr-2"
          />
          Pet Friendly
        </label>
        
        <h2 className="text-xl font-semibold text-indigo-600 border-b pb-1 mt-8 mb-4">
          Images
        </h2>
        
        <div className="image-upload-section">
          <div className="image-upload-container">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="upload-btn"
            >
              Upload Images
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Upload images of your listing. The first image will be the default thumbnail.
            </p>
          </div>
          
          {imagePreviewUrls.length > 0 && (
            <div className="image-preview-container">
              <h3 className="mb-2 font-medium">Preview</h3>
              <div className="image-grid">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className={`image-item ${formData.thumbnailIndex === index ? 'thumbnail' : ''}`}>
                    <img src={url} alt={`Preview ${index + 1}`} />
                    <div className="image-actions">
                      <button
                        type="button"
                        onClick={() => handleSetThumbnail(index)}
                        disabled={formData.thumbnailIndex === index}
                        className={formData.thumbnailIndex === index ? 'active' : ''}
                      >
                        {formData.thumbnailIndex === index ? 'Thumbnail' : 'Set as Thumbnail'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-indigo-600 border-b pb-1 mt-8 mb-4">
          Compatibility Information
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          The following information helps match your listing with roommates based on compatibility.
        </p>
        
        {/* Sleep Schedule */}
        <label>
          What sleep schedule is best for this housing?
          <select name="sleepSchedule" value={formData.sleepSchedule} onChange={handleChange}>
            <option value="">Select an option</option>
            <option value="Before 10pm">Early sleepers (before 10pm)</option>
            <option value="10pm - 12am">Average sleepers (10pm - 12am)</option>
            <option value="After 12am">Night owls (after 12am)</option>
            <option value="No preference">No preference</option>
          </select>
        </label>
        
        {/* Wake up Schedule */}
        <label>
          What wake-up schedule is best for this housing?
          <select name="wakeupSchedule" value={formData.wakeupSchedule} onChange={handleChange}>
            <option value="">Select an option</option>
            <option value="Before 7am">Early risers (before 7am)</option>
            <option value="7am - 9am">Average wake-up (7am - 9am)</option>
            <option value="After 9am">Late risers (after 9am)</option>
            <option value="No preference">No preference</option>
          </select>
        </label>
        
        {/* Cleanliness */}
        <label>
          What level of cleanliness is expected?
          <select name="cleanliness" value={formData.cleanliness} onChange={handleChange}>
            <option value="">Select an option</option>
            <option value="Very tidy">Very tidy</option>
            <option value="Moderately tidy">Moderately tidy</option>
            <option value="Messy">Relaxed cleanliness</option>
            <option value="No preference">No preference</option>
          </select>
        </label>
        
        {/* Noise Level */}
        <label>
          What noise level is acceptable?
          <select name="noiseLevel" value={formData.noiseLevel} onChange={handleChange}>
            <option value="">Select an option</option>
            <option value="Silent">Silent</option>
            <option value="Background noise/music">Background noise/music</option>
            <option value="No preference">No preference</option>
          </select>
        </label>
        
        {/* Visitors */}
        <label>
          What is the policy on having guests over?
          <select name="visitors" value={formData.visitors} onChange={handleChange}>
            <option value="">Select an option</option>
            <option value="Frequently">Frequently allowed</option>
            <option value="Occasionally">Occasionally allowed</option>
            <option value="Rarely">Rarely allowed</option>
            <option value="Never">Not allowed</option>
          </select>
        </label>
        
        {/* Study Habits */}
        <label>
          What study environment is best for this housing?
          <select name="studyHabits" value={formData.studyHabits} onChange={handleChange}>
            <option value="">Select an option</option>
            <option value="Home">Study at home environment</option>
            <option value="Library">Better for those who study elsewhere</option>
            <option value="Other">Other arrangements</option>
          </select>
        </label>
        
        <div>
          <label>
            Preferred Gender for Roommates:
            <select name="prefGender" value={formData.prefGender} onChange={handleChange}>
              <option value="">Select an option</option>
              <option value="No preference">No preference</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </div>

        {/* Lifestyle */}
        <div>
          <label className="block font-medium mb-1">Lifestyle factors (select all that apply):</label>
          <div className="flex flex-wrap gap-4">
            {['Smokes', 'Drinks', 'Cooks often', 'Vegetarian', 'Stays up late', 'Wakes up early'].map((item) => (
              <label key={item} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="lifestyle"
                  value={item}
                  checked={(formData.lifestyle || []).includes(item)}
                  onChange={handleLifestyleChange}
                  className="accent-purple-600"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="mt-6" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Listing'}
        </button>
      </form>
    </div>
  );
}
