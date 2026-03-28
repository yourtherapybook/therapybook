"use client";
import React, { useState } from 'react';
import { Input } from './input';
import { uploadToR2 } from '@/lib/upload-r2';
import { Loader2 } from 'lucide-react';

interface R2UploaderProps {
    value?: string;
    onChange: (url: string) => void;
    fileType: "PROFILE_PHOTO" | "CERTIFICATION" | "IDENTIFICATION" | "CLINICAL_NOTE";
    accept?: string;
    onUploadComplete?: (upload: { publicUrl: string; r2Key: string; document: { id: string; title: string; status: string } }) => void;
}

export function R2Uploader({ value, onChange, fileType, accept = "image/*,application/pdf", onUploadComplete }: R2UploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setError('');
            const upload = await uploadToR2(file, fileType);
            const { publicUrl } = upload;
            onChange(publicUrl);
            onUploadComplete?.(upload);
        } catch (err: any) {
            setError(err.message || 'Upload failed. Please check network and presign origins.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={isUploading}
                className="cursor-pointer file:text-primary-600 file:bg-primary-50 file:border-0 file:rounded-md file:mr-4 hover:file:bg-primary-100 transition-colors"
            />
            {isUploading && (
                <div className="flex items-center text-sm text-neutral-500">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary-600" /> Securely uploading to R2...
                </div>
            )}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            {value && !isUploading && (
                <div className="space-y-1 text-sm">
                    <p className="font-medium text-green-600">Upload finalized and attached to your application.</p>
                    <a href={value} target="_blank" rel="noreferrer" className="text-primary-600 underline underline-offset-2">
                        Preview uploaded file
                    </a>
                </div>
            )}
        </div>
    );
}
