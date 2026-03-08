'use client';

/**
 * Client-side image compression utility.
 * Resizes images to max 1200px width and compresses to JPEG ~75% quality.
 * Reduces typical phone photos from 5-8MB to ~100-200KB.
 */

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.75;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export interface CompressedImage {
  file: File;
  preview: string; // data URL for preview
}

/**
 * Validates an image file before compression.
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
    return 'Csak képfájlok engedélyezettek (JPEG, PNG, WebP)';
  }
  if (file.size > MAX_FILE_SIZE) {
    return `A fájl túl nagy (max. ${MAX_FILE_SIZE / 1024 / 1024}MB)`;
  }
  return null;
}

/**
 * Compresses an image file using canvas.
 * Returns compressed File + preview data URL.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, '.jpg'),
              { type: 'image/jpeg' }
            );

            const preview = canvas.toDataURL('image/jpeg', 0.5); // Lower quality for preview

            resolve({ file: compressedFile, preview });
          },
          'image/jpeg',
          QUALITY
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a compressed image to the job-photos API.
 * Returns the public URL of the uploaded image.
 */
export async function uploadJobPhoto(file: File, jobId: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('jobId', jobId);

  const res = await fetch('/api/jobs/upload-photo', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Képfeltöltés sikertelen');
  }

  const data = await res.json();
  return data.url;
}
