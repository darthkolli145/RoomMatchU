import { useState, useRef, ChangeEvent } from 'react';
import { postListing, ListingFormData } from '../firebase/firebaseHelpers';
import { QuestionnaireCategory } from '../types/index';

export default function PostListing() {
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    bio: '',
    neighborhood: '',
    beds: '',
    baths: '',
    availableDate: '',
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
    images: [],
    thumbnailIndex: 0,
  });
  
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
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
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (files && files.length > 0) {
      const newImages = Array.from(files);
      const newPreviewUrls: string[] = [];
      
      // Generate preview URLs for the uploaded images
      newImages.forEach(image => {
        const url = URL.createObjectURL(image);
        newPreviewUrls.push(url);
      });
      
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
      
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      const {
        sleepSchedule, wakeupSchedule, cleanliness, noiseLevel,
        visitors, studyHabits, lifestyle, ...baseData
      } = formData;

      // Replace actual image upload with placeholder
      const placeholderImage = `https://placehold.co/800x600?text=${encodeURIComponent(formData.title || 'Listing')}`;
      const placeholderImages = [placeholderImage];   
      
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
          lifestyle
        // ...formData,
        // tags: {
        //   sleepSchedule: formData.sleepSchedule,
        //   wakeupSchedule: formData.wakeupSchedule,
        //   cleanliness: formData.cleanliness,
        //   noiseLevel: formData.noiseLevel,
        //   visitors: formData.visitors,
        //   studyHabits: formData.studyHabits,
        //   lifestyle: formData.lifestyle,
        },
        imageURLs: placeholderImages,
        thumbnailURL: placeholderImage
      };
      
      const listingId = await postListing(listingWithTags);
      alert(`Listing submitted! ID: ${listingId}`);
      console.log('Successfully posted:', listingId);
      
      // Clean up all object URLs to prevent memory leaks
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      
      // Reset form
      setFormData({
        title: '',
        bio: '',
        neighborhood: '',
        beds: '',
        baths: '',
        availableDate: '',
        price: '',
        onCampus: false,
        pets: false,
        sleepSchedule: '',
        wakeupSchedule: '',
        cleanliness: '',
        noiseLevel: '',
        visitors: '',
        lifestyle: [],
        studyHabits: '',
        images: [],
        thumbnailIndex: 0,
      });
      setImagePreviewUrls([]);
    } catch (error) {
      console.error('Failed to submit listing:', error);
      alert('Failed to submit listing. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-listing-page">
      <h1>Post A Listing</h1>
      
      <form onSubmit={handleSubmit} className="post-listing-form">
        <h2 className="text-xl font-semibold text-indigo-600 border-b pb-1 mt-8 mb-4">
          Basic Information
        </h2>
        
        <label>
          Title:
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </label>

        <label>
          Short Bio / Description:
          <textarea name="bio" value={formData.bio} onChange={handleChange} required />
        </label>

        <label>
          Neighborhood:
          <select name="neighborhood" value={formData.neighborhood} onChange={handleChange} required>
            <option value="">Select neighborhood</option>
            <option value="campus">On Campus</option>
            <option value="downtown">Downtown</option>
            <option value="westside">Westside</option>
            <option value="eastside">Eastside</option>
            <option value="seabright">Seabright</option>
            <option value="capitola">Capitola</option>
          </select>
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
          <input type="date" name="availableDate" value={formData.availableDate} onChange={handleChange} required />
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
