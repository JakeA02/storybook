export const getStyleDescription = (style) => {
  switch (style) {
    case "disney":
      return "Soft rounded characters, big expressive eyes, warm pastel colors, subtle shading. Like classic Bambi or Cinderella illustrations. Wholesome, magical, and heartwarming.";
    case "seuss":
      return "Wobbly ink lines, exaggerated features, tall skinny or short round characters, unusual architecture, bright primary colors, and playful surreal landscapes. Whimsical and quirky.";
    case "anime":
      return "Big sparkling eyes, soft blush cheeks, simple linework, bright pastel tones, and expressive facial reactions. Cute proportions like chibi or early Pokémon style";
    case "modern":
      return "Simple vector shapes, bold outlines, bright solid colors, minimal shadows. Inspired by shows like Peppa Pig or Cocomelon. Fun, clear, and toddler-friendly.";
    case "ghibli":
      return "Hand-painted look with soft lighting, expressive faces, detailed nature backgrounds, and gentle colors. Magical realism with a warm, peaceful feeling.";
    default:
      return "General cartoon style, friendly and appealing.";
  }
};
export const getTextExampleImage = (style) => {
    return `images/${style}-text-example.png`;
};
/**
 * Converts a base64 encoded string to a Blob object.
 * @param {string} base64 - The base64 encoded string (without the data URI prefix).
 * @param {string} mimeType - The MIME type of the data (e.g., 'image/png').
 * @returns {Blob} - The Blob object representing the decoded data.
 * @throws {Error} If the base64 string is invalid.
 */
export const base64ToBlob = (base64, mimeType) => {
  // If base64 is null, undefined, or empty, return a minimal valid blob
  console.log("base64", base64.slice(0, 100));
  if (!base64) {
    // Return a small empty blob as fallback
    return new Blob([], { type: mimeType });
  }
  
  try {
    // Decode Base64 string
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    // Create and return Blob
    return new Blob([byteArray], { type: mimeType });
  } catch (e) {
    console.error("Error decoding base64 string:", e);
    // Return a small empty blob as fallback instead of throwing
    return new Blob([], { type: mimeType });
  }
};

/**
 * IndexedDB utilities for storing large images
 */

const DB_NAME = 'storybook_images';
const DB_VERSION = 1;
const STORE_NAME = 'images';

// Initialize the database
export const initImageDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject('Error opening IndexedDB');
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Create an object store for images if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
};

// Store an image in IndexedDB
export const storeImage = async (id, imageData) => {
  try {
    const db = await initImageDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put({ id, data: imageData });
      
      request.onerror = (event) => {
        console.error('Error storing image:', event.target.error);
        reject('Failed to store image');
      };
      
      request.onsuccess = (event) => {
        resolve({ id });
      };
    });
  } catch (error) {
    console.error('Error in storeImage:', error);
    throw error;
  }
};

// Get an image from IndexedDB
export const getImage = async (id) => {
  try {
    const db = await initImageDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.get(id);
      
      request.onerror = (event) => {
        console.error('Error retrieving image:', event.target.error);
        reject('Failed to retrieve image');
      };
      
      request.onsuccess = (event) => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
    });
  } catch (error) {
    console.error('Error in getImage:', error);
    throw error;
  }
};

// Delete an image from IndexedDB
export const deleteImage = async (id) => {
  try {
    const db = await initImageDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.delete(id);
      
      request.onerror = (event) => {
        console.error('Error deleting image:', event.target.error);
        reject('Failed to delete image');
      };
      
      request.onsuccess = (event) => {
        resolve(true);
      };
    });
  } catch (error) {
    console.error('Error in deleteImage:', error);
    throw error;
  }
};

// Clear all images from IndexedDB
export const clearImageStore = async () => {
  try {
    const db = await initImageDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.clear();
      
      request.onerror = (event) => {
        console.error('Error clearing image store:', event.target.error);
        reject('Failed to clear images');
      };
      
      request.onsuccess = (event) => {
        resolve(true);
      };
    });
  } catch (error) {
    console.error('Error in clearImageStore:', error);
    throw error;
  }
};
