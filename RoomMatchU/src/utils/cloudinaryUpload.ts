import axios from 'axios';

export async function uploadImageToCloudinary(file: File): Promise<string> {
  try {
    // Use environment variables if available, otherwise fallback to defaults
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'de3amm0hz';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload_preset';
    
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await axios.post(url, formData);
    
    if (response.data && response.data.secure_url) {
      return response.data.secure_url;
    } else {
      throw new Error('Invalid response from Cloudinary');
    }
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    // Return a placeholder image on error
    return `https://placehold.co/800x600?text=Image+Upload+Failed`;
  }
}
