import { put, list, del } from '@vercel/blob';
import type { ProductImage } from '@/lib/types';

/**
 * Upload multiple product images to Vercel Blob storage
 */
export async function uploadProductImages(files: File[]): Promise<ProductImage[]> {
  console.log(`📸 Uploading ${files.length} product images...`);
  
  const uploadPromises = files.map(async (file, index) => {
    try {
      // Create unique filename with timestamp and index
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `products/${timestamp}-${index}-${sanitizedName}`;
      
      console.log(`📸 Uploading image ${index + 1}: ${filename}`);
      
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: false,
      });

      const productImage: ProductImage = {
        id: crypto.randomUUID(),
        url: blob.url,
        alt: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
        type: index === 0 ? 'main' : 'gallery', // First image is main, rest are gallery
        order: index
      };

      console.log(`✅ Image uploaded: ${blob.url}`);
      return productImage;
    } catch (error) {
      console.error(`❌ Failed to upload image ${file.name}:`, error);
      throw error;
    }
  });

  const results = await Promise.all(uploadPromises);
  console.log(`✅ Successfully uploaded ${results.length} images`);
  return results;
}

/**
 * Delete a product image from Vercel Blob storage
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting image: ${imageUrl}`);
    
    // Extract pathname from URL
    const url = new URL(imageUrl);
    const pathname = url.pathname.substring(1); // Remove leading slash
    
    await del(pathname);
    console.log(`✅ Successfully deleted image: ${pathname}`);
  } catch (error) {
    console.error('❌ Failed to delete image:', error);
    throw error;
  }
}

/**
 * Delete multiple product images
 */
export async function deleteProductImages(imageUrls: string[]): Promise<void> {
  console.log(`🗑️ Deleting ${imageUrls.length} images...`);
  
  const deletePromises = imageUrls.map(url => deleteProductImage(url));
  await Promise.all(deletePromises);
  
  console.log(`✅ Successfully deleted ${imageUrls.length} images`);
}

/**
 * Get optimized image URL (for future CDN integration)
 */
export function getOptimizedImageUrl(imageUrl: string, width?: number, height?: number): string {
  // For now, return original URL
  // In future, could add Vercel image optimization parameters
  return imageUrl;
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
    };
  }
  
  return { valid: true };
}

/**
 * Bulk validate image files
 */
export function validateImageFiles(files: File[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (files.length === 0) {
    return { valid: true, errors: [] };
  }
  
  if (files.length > 10) {
    errors.push('Maximum 10 images allowed per product');
  }
  
  files.forEach((file, index) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      errors.push(`File ${index + 1} (${file.name}): ${validation.error}`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}
