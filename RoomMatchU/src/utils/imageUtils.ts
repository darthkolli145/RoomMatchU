import imageCompression from 'browser-image-compression';

/**
 * Converts a HEIC/HEIF file to JPEG format
 * @param file The HEIC/HEIF file to convert
 * @returns A Promise that resolves to a File object in JPEG format
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  // Dynamically import heic-convert (it's an ESM module)
  const heicConvert = await import('heic-convert');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        if (!event.target || !event.target.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const buffer = event.target.result as ArrayBuffer;
        
        // Convert HEIC to JPEG
        const jpegBuffer = await heicConvert.default({
          buffer: Buffer.from(buffer),
          format: 'JPEG',
          quality: 0.85
        });
        
        // Create a new File from the JPEG buffer
        const jpegFile = new File(
          [jpegBuffer], 
          file.name.replace(/\.heic$/i, '.jpg'), 
          { type: 'image/jpeg' }
        );
        
        resolve(jpegFile);
      } catch (error) {
        console.error('HEIC conversion error:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Compresses an image file to reduce its size
 * @param file The image file to compress
 * @returns A Promise that resolves to a compressed File object
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5,           // Reduce to 500KB max
    maxWidthOrHeight: 1600,   // Resize if bigger
    useWebWorker: true,
    initialQuality: 0.85
  };

  try {
    const compressedFile = await imageCompression(file, options);
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
    
    // Convert HEIC to JPEG if needed
    const processedFile = isHeic ? await convertHeicToJpeg(file) : file;
    
    // Compress the image
    return await compressImage(processedFile);
  } catch (error) {
    console.error('Error processing image:', error);
    // Return original file if processing fails
    return file;
  }
} 