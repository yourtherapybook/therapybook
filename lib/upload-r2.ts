export async function uploadToR2(file: File, fileType: "PROFILE_PHOTO" | "CERTIFICATION" | "IDENTIFICATION" | "CLINICAL_NOTE") {
    // 1. Get deterministic presigned URL from API
    const res = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType, mimeType: file.type, size: file.size })
    });

    const data = await res.json();
    if (!data.success) {
        throw new Error(data.error.message);
    }

    const { uploadUrl, publicUrl, r2Key } = data.data;

    // 2. Perform raw HTTP PUT to Cloudflare R2 Edge
    const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
    });

    if (!uploadRes.ok) {
        throw new Error('Upload to Cloudflare R2 failed');
    }

    const finalizeRes = await fetch('/api/upload/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            r2Key,
            fileType,
            title: file.name,
            size: file.size,
            mimeType: file.type,
        })
    });

    const finalizeData = await finalizeRes.json();
    if (!finalizeData.success) {
        throw new Error(finalizeData.error.message || 'Failed to finalize uploaded document');
    }

    return { publicUrl, r2Key, document: finalizeData.data.document };
}
