import { STORAGE_KEY, STEPS, IMAGE_KEYS } from './constants';
import { safeParse } from './storageHelpers';
import { getImage } from '../utils';

// Initialize state from localStorage
export const loadInitialState = () => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  const parsedData = safeParse(savedData);
  
  if (parsedData) {
    return {
      childData: parsedData.childData || null,
      storyDetails: parsedData.storyDetails || null,
      storyScript: parsedData.storyScript || null,
      step: parsedData.step || STEPS.START,
      history: parsedData.history || [STEPS.START],
      // We'll load images separately from IndexedDB
      characterIllustration: null,
      characterMap: null,
      bookIllustrations: [],
      compiledBook: parsedData.compiledBook || null,
      storageError: parsedData.storageError || false
    };
  }
  
  return {
    childData: null,
    storyDetails: null,
    storyScript: null,
    characterIllustration: null,
    bookIllustrations: [],
    compiledBook: null,
    step: STEPS.START,
    history: [STEPS.START],
    characterMap: null,
    storageError: false
  };
};

// Load images from IndexedDB
export const loadImagesFromIndexedDB = async (setters) => {
  try {
    // Load character illustration
    const characterImg = await getImage(IMAGE_KEYS.CHARACTER);
    if (characterImg) {
      setters.setCharacterIllustration(characterImg);
    }
    
    // Load character map
    const charMap = await getImage(IMAGE_KEYS.CHARACTER_MAP);
    if (charMap) {
      setters.setCharacterMap(charMap);
    }
    
    // Load book illustrations
    const loadedIllustrations = [];
    for (let i = 1; i <= 12; i++) {
      const pageImage = await getImage(`${IMAGE_KEYS.PAGE_PREFIX}${i}`);
      if (pageImage) {
        loadedIllustrations.push(pageImage);
      }
    }
    
    if (loadedIllustrations.length > 0) {
      setters.setBookIllustrations(loadedIllustrations);
    }
    
    setters.setImagesLoaded(true);
  } catch (error) {
    console.error("Error loading images from IndexedDB:", error);
    setters.setImagesLoaded(true); // Set to true even on error to continue the app
    
    // Check if it's a quota error
    if (error.name === 'QuotaExceededError' || 
        error.message.includes('quota') || 
        error.message.includes('storage')) {
      setters.setStorageError(true);
    }
  }
}; 