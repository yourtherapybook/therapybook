import type { OurFileRouter } from "./uploadthing";

// Simple hook that mimics the UploadThing API for development
export const useUploadThing = (endpoint: keyof OurFileRouter, options?: {
  onClientUploadComplete?: (res: any) => void;
  onUploadError?: (error: Error) => void;
  onUploadProgress?: (progress: number) => void;
}) => {
  return {
    startUpload: async (files: File[]) => {
      // Simulate upload progress
      if (options?.onUploadProgress) {
        for (let i = 0; i <= 100; i += 10) {
          setTimeout(() => options.onUploadProgress!(i), i * 20);
        }
      }

      // Simulate upload completion after 2 seconds
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const mockResponse = [{ url: 'https://utfs.io/f/mock-uploaded-image.jpg' }];
          if (options?.onClientUploadComplete) {
            options.onClientUploadComplete(mockResponse);
          }
          resolve(mockResponse);
        }, 2000);
      });
    }
  };
};