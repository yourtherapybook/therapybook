"use client"

import * as React from "react"
import { Upload, X, Image, AlertCircle, CheckCircle, Crop } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { useUploadThing } from "../../lib/uploadthing-client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog"
import { ImageCropper } from "./image-cropper"
import { validateImageFile, formatFileSize } from "../../lib/image-utils"

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  disabled?: boolean
  className?: string
}

interface FileValidationError {
  type: 'size' | 'type' | 'dimensions' | 'upload' | 'corrupt'
  message: string
}

export function FileUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [validationError, setValidationError] = React.useState<FileValidationError | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [showCropDialog, setShowCropDialog] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const { startUpload } = useUploadThing("profileImage", {
    onClientUploadComplete: (res: any) => {
      console.log("Upload Completed", res);
      if (res && res[0]) {
        onChange(res[0].url);
        setPreviewUrl(null);
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    onUploadError: (error: Error) => {
      console.error("Upload Error:", error);
      setValidationError({
        type: 'upload',
        message: 'Upload failed. Please try again.'
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadProgress: (progress: number) => {
      setUploadProgress(progress);
    },
  });

  const handleFileSelect = async (file: File) => {
    setValidationError(null);
    
    // Validate the file using our utility function
    const validation = await validateImageFile(file);
    
    if (!validation.isValid && validation.error) {
      setValidationError({
        type: validation.error.type,
        message: validation.error.message
      });
      return;
    }

    // If validation passes, show crop dialog
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setShowCropDialog(true);
  };

  const handleCropAndUpload = async (croppedFile: File) => {
    setShowCropDialog(false);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      await startUpload([croppedFile]);
    } catch (error) {
      console.error('Upload failed:', error);
      setValidationError({
        type: 'upload',
        message: 'Upload failed. Please try again.'
      });
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropDialog(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemove = () => {
    onRemove();
    setValidationError(null);
  };

  // Clear validation error after 5 seconds
  React.useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => {
        setValidationError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [validationError]);

  if (value) {
    return (
      <div className={cn("relative", className)}>
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-neutral-200">
          <img
            src={value}
            alt="Profile photo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="opacity-0 hover:opacity-100 transition-opacity"
              onClick={handleRemove}
              disabled={disabled}
              aria-label="Remove profile photo"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center mt-2">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          <p className="text-sm text-neutral-600">
            Photo uploaded successfully
          </p>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Click the X to remove or drag a new image to replace
        </p>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver
            ? "border-primary-400 bg-primary-50"
            : "border-neutral-300 hover:border-neutral-400",
          disabled && "opacity-50 cursor-not-allowed",
          validationError && "border-red-300 bg-red-50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={isUploading ? `Uploading profile photo, ${uploadProgress}% complete` : "Upload profile photo"}
        aria-describedby="file-upload-description file-upload-requirements"
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isUploading) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
          aria-describedby="file-upload-description"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            ) : validationError ? (
              <AlertCircle className="h-6 w-6 text-red-500" />
            ) : (
              <Image className="h-6 w-6 text-neutral-400" />
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-neutral-900">
              {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload profile photo'}
            </p>
            <p className="text-xs text-neutral-500 mt-1" id="file-upload-description">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-neutral-400 mt-1" id="file-upload-requirements">
              PNG, JPG, WebP up to 4MB • Min 200x200px
            </p>
          </div>
          
          {isUploading && (
            <div className="w-full max-w-xs bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </Button>
        </div>
      </div>

      {/* Live region for screen readers */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {isUploading && `Uploading profile photo, ${uploadProgress}% complete`}
        {validationError && `Upload error: ${validationError.message}`}
        {value && "Profile photo uploaded successfully"}
      </div>

      {/* Validation Error Display */}
      {validationError && (
        <div 
          className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
          role="alert"
          aria-describedby="error-message"
        >
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Upload Error</p>
            <p className="text-sm text-red-700" id="error-message">{validationError.message}</p>
          </div>
        </div>
      )}

      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop Profile Photo</DialogTitle>
          </DialogHeader>
          
          {previewUrl && (
            <ImageCropper
              src={previewUrl}
              onCrop={handleCropAndUpload}
              onCancel={handleCropCancel}
              aspectRatio={1}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}