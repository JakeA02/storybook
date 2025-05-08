import { STEPS } from './constants';
import { clearImageStore } from '../utils';
import { saveUserPhoto } from './imageStorage';

// Function to clear saved data
export const clearSavedData = async (
  setChildData,
  setStoryDetails,
  setStoryScript,
  setCharacterIllustration,
  setBookIllustrations,
  setCompiledBook,
  setStep,
  setHistory,
  setCharacterMap,
  setStorageError
) => {
  // Clear localStorage
  localStorage.removeItem('storybook_session_data');
  
  // Clear IndexedDB
  try {
    await clearImageStore();
  } catch (error) {
    console.error("Error clearing image store:", error);
  }
  
  // Reset all state to initial values
  setChildData(null);
  setStoryDetails(null);
  setStoryScript(null);
  setCharacterIllustration(null);
  setBookIllustrations([]);
  setCompiledBook(null);
  setStep(STEPS.START);
  setHistory([STEPS.START]);
  setCharacterMap(null);
  setStorageError(false);
};

// Handle photo upload submission
export const handlePhotoSubmit = (photo, setChildData, safelySetStepFn, setStorageError) => {
  setChildData({ type: "photo", data: photo });
  
  // Save the photo to IndexedDB
  saveUserPhoto(photo, setStorageError);
  
  safelySetStepFn(STEPS.DETAILS);
};

// Handle form submission
export const handleFormSubmit = (formData, setChildData, safelySetStepFn) => {
  setChildData({ type: "description", data: formData });
  safelySetStepFn(STEPS.DETAILS);
};

// Handle story details form submission
export const handleStoryDetailsSubmit = (details, setStoryDetails, safelySetStepFn) => {
  setStoryDetails(details);
  safelySetStepFn(STEPS.SCRIPT);
};

// Handle script generation completion
export const handleScriptComplete = (
  scriptData, 
  setStoryScript, 
  safelySetStepFn, 
  childData, 
  storyDetails
) => {
  setStoryScript(scriptData);
  safelySetStepFn(STEPS.ILLUSTRATION);
  return {
    childData: childData,
    storyDetails: storyDetails,
    storyScript: scriptData,
  };
};

// Handle illustration generation completion
export const handleIllustrationComplete = (
  illustrationUrl, 
  setCharacterIllustration, 
  safelySetStepFn,
  childData,
  storyDetails,
  storyScript
) => {
  setCharacterIllustration(illustrationUrl);
  safelySetStepFn(STEPS.COMPILE);
  return {
    childData: childData,
    storyDetails: storyDetails,
    storyScript: storyScript,
    characterIllustration: illustrationUrl,
  };
};

// Handle book compilation completion
export const handleCompileComplete = (
  illustrations, 
  setBookIllustrations, 
  safelySetStepFn,
  childData,
  storyDetails,
  storyScript,
  characterIllustration
) => {
  setBookIllustrations(illustrations);
  safelySetStepFn(STEPS.PREVIEW);
  return {
    childData,
    storyDetails,
    storyScript,
    characterIllustration,
    bookIllustrations: illustrations
  };
};

// Handle preview completion
export const handlePreviewComplete = (
  bookData, 
  setCompiledBook, 
  safelySetStepFn,
  childData,
  storyDetails,
  storyScript,
  characterIllustration,
  bookIllustrations
) => {
  setCompiledBook(bookData);
  safelySetStepFn(STEPS.CHECKOUT);
  return {
    childData,
    storyDetails,
    storyScript,
    characterIllustration,
    bookIllustrations,
    compiledBook: bookData
  };
};

// Function to handle option selection in the first step
export const handleOptionSelect = (option, safelySetStepFn) => {
  safelySetStepFn(option);
};

export const handleCharacterMapComplete = (characterMap, setCharacterMap, safelySetStepFn) => {
  setCharacterMap(characterMap);
  safelySetStepFn(STEPS.ILLUSTRATION);
}; 