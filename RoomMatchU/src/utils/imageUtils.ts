import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';

/**
 * Converts a HEIC/HEIF file to JPEG format using heic2any
 * @param file The HEIC/HEIF file to convert
 * @returns A Promise that resolves to a File object in JPEG format
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    console.log('Converting HEIC file:', file.name);
    
    // Convert HEIC to JPEG blob using heic2any
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.85
    });
    
    // heic2any might return an array of blobs for multi-page HEIC files
    // We'll just use the first one
    const jpegBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    
    // Create a new File from the blob
    const jpegFile = new File(
      [jpegBlob], 
      file.name.replace(/\.(heic|heif)$/i, '.jpg'), 
      { type: 'image/jpeg' }
    );
    
    console.log('HEIC conversion successful:', jpegFile.name);
    return jpegFile;
  } catch (error) {
    console.error('HEIC conversion error:', error);
    throw new Error(`Failed to convert HEIC file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Compresses an image file to reduce its size
 * @param file The image file to compress
 * @returns A Promise that resolves to a compressed File object
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,             // Increase to 1MB for better quality
    maxWidthOrHeight: 1920,   // Allow slightly larger images
    useWebWorker: true,
    initialQuality: 0.9,      // Start with higher quality
    alwaysKeepResolution: false
  };

  try {
    console.log('Compressing image:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    const compressedFile = await imageCompression(file, options);
    console.log('Compressed to:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    return file;  // fallback to original if compression fails
  }
}

/**
 * Processes an image file: converts HEIC to JPEG if needed, then compresses
 * @param file The image file to process
 * @returns A Promise that resolves to a processed File object
 */
export async function processImageFile(file: File): Promise<File> {
  try {
    // Check if file is HEIC/HEIF format
    const isHeic = 
      file.type === 'image/heic' || 
      file.type === 'image/heif' || 
      file.name.toLowerCase().endsWith('.heic') || 
      file.name.toLowerCase().endsWith('.heif');
    
    console.log('Processing image:', file.name, 'Is HEIC:', isHeic);
    
    // Convert HEIC to JPEG if needed
    let processedFile = file;
    if (isHeic) {
      try {
        processedFile = await convertHeicToJpeg(file);
      } catch (error) {
        console.error('HEIC conversion failed, using original:', error);
        // If HEIC conversion fails, we'll try to continue with the original
        // Some browsers might handle HEIC natively
      }
    }
    
    // Compress the image
    const finalFile = await compressImage(processedFile);
    console.log('Image processing complete:', finalFile.name);
    return finalFile;
  } catch (error) {
    console.error('Error processing image:', error);
    // Return original file if processing fails
    return file;
  }
} 