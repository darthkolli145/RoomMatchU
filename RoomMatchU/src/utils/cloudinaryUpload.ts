import axios from 'axios';

export async function uploadImageToCloudinary(file: File): Promise<string> {
  try {
    // Use environment variables if available, otherwise fallback to defaults
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'de3amm0hz';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload_preset';
    
    console.log('Uploading to Cloudinary:', {
      fileName: file.name,
      fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      fileType: file.type,
      cloudName,
      uploadPreset
    });
    
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await axios.post(url, formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }
    });
    
    if (response.data && response.data.secure_url) {
      console.log('Upload successful:', response.data.secure_url);
      return response.data.secure_url;
    } else {
      console.error('Invalid response from Cloudinary:', response.data);
      throw new Error('Invalid response from Cloudinary');
    }
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
    // Return a placeholder image on error
    return `https://placehold.co/800x600?text=Image+Upload+Failed`;
  }
}
