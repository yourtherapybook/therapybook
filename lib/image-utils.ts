export interface ImageValidationResult {
  isValid: boolean;
  error?: {
    type: 'size' | 'type' | 'dimensions' | 'corrupt';
    message: string;
  };
  metadata?: {
    width: number;
    height: number;
    size: number;
    type: string;
  };
}

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

export const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
export const MIN_DIMENSIONS = { width: 200, height: 200 };
export const MAX_DIMENSIONS = { width: 2000, height: 2000 };

export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  // Check file type
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: {
        type: 'type',
        message: 'Please select a valid image file (PNG, JPG, JPEG, WebP)'
      }
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: {
        type: 'size',
        message: `File size must be less than ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`
      }
    };
  }

  // Check image dimensions
  try {
    const dimensions = await getImageDimensions(file);
    
    if (dimensions.width < MIN_DIMENSIONS.width || dimensions.height < MIN_DIMENSIONS.height) {
      return {
        isValid: false,
        error: {
          type: 'dimensions',
          message: `Image must be at least ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} pixels`
        }
      };
    }

    if (dimensions.width > MAX_DIMENSIONS.width || dimensions.height > MAX_DIMENSIONS.height) {
      return {
        isValid: false,
        error: {
          type: 'dimensions',
          message: `Image must be smaller than ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height} pixels`
        }
      };
    }

    return {
      isValid: true,
      metadata: {
        width: dimensions.width,
        height: dimensions.height,
        size: file.size,
        type: file.type
      }
    };
  } catch (error) {
    return {
      isValid: false,
      error: {
        type: 'corrupt',
        message: 'Invalid or corrupted image file'
      }
    };
  }
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export function resizeImage(
  file: File, 
  maxWidth: number, 
  maxHeight: number, 
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });

          resolve(resizedFile);
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export function cropImageToSquare(file: File, size: number = 400): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width, height } = img;
      const minDimension = Math.min(width, height);
      
      // Calculate crop position (center crop)
      const cropX = (width - minDimension) / 2;
      const cropY = (height - minDimension) / 2;

      // Set canvas size
      canvas.width = size;
      canvas.height = size;

      // Draw cropped and resized image
      ctx.drawImage(
        img,
        cropX, cropY, minDimension, minDimension, // Source rectangle
        0, 0, size, size // Destination rectangle
      );

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          const croppedFile = new File([blob], file.name, {
            type: 'image/png', // Always output as PNG for best quality
            lastModified: Date.now()
          });

          resolve(croppedFile);
        },
        'image/png',
        0.9
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}