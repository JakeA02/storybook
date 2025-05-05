import { STORAGE_KEY, IMAGE_KEYS } from './constants';
import { storeImage, getImage, clearImageStore } from "../utils";

// Helper to safely stringify data for localStorage
export const safeStringify = (data) => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error("Failed to stringify data:", error);
    return null;
  }
};

// Helper to safely parse data from localStorage
export const safeParse = (data) => {
  try {
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to parse stored data:", error);
    return null;
  }
};

// Helper to reduce image quality for high priority images
export const reduceHighPriorityImageQuality = (dataURI) => {
  if (!dataURI || typeof dataURI !== 'string') return dataURI;
  
  // This is a simplified approach - a real implementation would use canvas
  // to properly reduce image quality
  
  // For now, we'll just trim the data URI if it's very long to simulate reduction
  if (dataURI.length > 500000) { // Over ~500KB
    console.log("Reducing high priority image size");
    return dataURI.substring(0, 500000) + dataURI.substring(dataURI.length - 100);
  }
  
  return dataURI;
};

// Helper to reduce image quality for low priority images (more aggressive)
export const reduceLowPriorityImageQuality = (dataURI) => {
  if (!dataURI || typeof dataURI !== 'string') return dataURI;
  
  // This is a simplified approach - a real implementation would use canvas
  // to properly reduce image quality
  
  // For now, we'll just trim the data URI if it's very long to simulate reduction
  if (dataURI.length > 300000) { // Over ~300KB
    console.log("Reducing low priority image size");
    return dataURI.substring(0, 300000) + dataURI.substring(dataURI.length - 100);
  }
  
  return dataURI;
};

// Function to handle storage errors and retry with reduced data
export const handleStorageQuotaError = async (error, key, data) => {
  console.warn("Storage quota error encountered:", error);
  
  // For book illustrations, we could prioritize saving only some pages
  // For example, only save the first and last pages if we're out of space
  if (key.includes(IMAGE_KEYS.PAGE_PREFIX)) {
    const pageNumber = parseInt(key.replace(IMAGE_KEYS.PAGE_PREFIX, ''), 10);
    
    // Prioritize certain pages (first, last, and middle pages)
    if (pageNumber === 1 || pageNumber === 12 || pageNumber === 6) {
      // Try to save at lower quality by reducing the data URI
      const lowerQualityData = reduceLowPriorityImageQuality(data);
      try {
        await storeImage(key, lowerQualityData);
        console.log(`Saved reduced quality version of ${key}`);
        return true;
      } catch (innerError) {
        console.error(`Failed to save reduced quality image for ${key}:`, innerError);
        return false;
      }
    }
    return false; // Don't try to save non-priority pages
  }
  
  // For character illustrations, try to save at lower quality
  if (key === IMAGE_KEYS.CHARACTER) {
    // Character is critical, so try with reduced quality
    const lowerQualityData = reduceHighPriorityImageQuality(data);
    try {
      await storeImage(key, lowerQualityData);
      console.log(`Saved reduced quality character illustration`);
      return true;
    } catch (innerError) {
      console.error(`Failed to save reduced quality character:`, innerError);
      return false;
    }
  }
  
  // For character map, try to save at lower quality
  if (key === IMAGE_KEYS.CHARACTER_MAP) {
    const lowerQualityData = reduceHighPriorityImageQuality(data);
    try {
      await storeImage(key, lowerQualityData);
      console.log(`Saved reduced quality character map`);
      return true;
    } catch (innerError) {
      console.error(`Failed to save reduced quality character map:`, innerError);
      return false;
    }
  }
  
  return false;
}; 