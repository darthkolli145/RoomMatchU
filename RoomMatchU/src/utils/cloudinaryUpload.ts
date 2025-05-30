import axios from 'axios';

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/de3amm0hz/image/upload`;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_upload_preset');

  const response = await axios.post(url, formData);
  return response.data.secure_url;
}
