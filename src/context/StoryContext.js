import { createContext, useContext, useState, useEffect } from "react";
import { STEPS, STORAGE_KEY } from "./constants";
import { safeStringify } from "./storageHelpers";
import { validateStepData } from "./validationHelpers";
import { loadInitialState, loadImagesFromIndexedDB } from "./stateInitializer";
import { 
  saveCharacterIllustration, 
  saveCharacterMap, 
  saveBookIllustrations 
} from "./imageStorage";
import { 
  safelySetStep as safelySetStepHelper, 
  handleBack as handleBackHelper,
  goToStep as goToStepHelper
} from "./navigationHelpers";
import {
  clearSavedData as clearSavedDataHelper,
  handlePhotoSubmit as handlePhotoSubmitHelper,
  handleFormSubmit as handleFormSubmitHelper,
  handleStoryDetailsSubmit as handleStoryDetailsSubmitHelper,
  handleScriptComplete as handleScriptCompleteHelper,
  handleIllustrationComplete as handleIllustrationCompleteHelper,
  handleCompileComplete as handleCompileCompleteHelper,
  handlePreviewComplete as handlePreviewCompleteHelper,
  handleOptionSelect as handleOptionSelectHelper,
  handleCharacterMapComplete as handleCharacterMapCompleteHelper
} from "./handlerFunctions";

// Create the context
const StoryContext = createContext(null);

// Custom hook to use the context
export function useStory() {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error("useStory must be used within a StoryProvider");
  }
  return context;
}

// Provider component
export function StoryProvider({ children }) {
  const initialState = loadInitialState();

  const [childData, setChildData] = useState(initialState.childData);
  const [storyDetails, setStoryDetails] = useState(initialState.storyDetails);
  const [storyScript, setStoryScript] = useState(initialState.storyScript);
  const [characterIllustration, setCharacterIllustration] = useState(initialState.characterIllustration);
  const [bookIllustrations, setBookIllustrations] = useState(initialState.bookIllustrations);
  const [compiledBook, setCompiledBook] = useState(initialState.compiledBook);
  const [step, setStep] = useState(initialState.step);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [history, setHistory] = useState(initialState.history);
  const [characterMap, setCharacterMap] = useState(initialState.characterMap);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [storageError, setStorageError] = useState(initialState.storageError || false);

  // Add recovery attempt state
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);

  // Load images from IndexedDB on initial render
  useEffect(() => {
    const setters = {
      setCharacterIllustration,
      setCharacterMap,
      setBookIllustrations,
      setImagesLoaded,
      setStorageError,
      setChildData
    };
    
    loadImagesFromIndexedDB(setters);
  }, []);

  // Save state to localStorage whenever relevant state changes
  useEffect(() => {
    // Don't save until images are loaded to prevent saving null images
    if (!imagesLoaded) return;
    
    const dataToSave = {
      childData,
      storyDetails,
      storyScript,
      step,
      history,
      compiledBook,
      storageError // Save the error state
      // We don't save images in localStorage, they go to IndexedDB
    };
    
    const serializedData = safeStringify(dataToSave);
    if (serializedData) {
      try {
        localStorage.setItem(STORAGE_KEY, serializedData);
        
      } catch (error) {
        console.error("Failed to save to localStorage:", error);
        setStorageError(true);
      }
    }
  }, [
    childData,
    storyDetails, 
    storyScript, 
    step,
    history,
    compiledBook,
    imagesLoaded,
    storageError
  ]);

  // Save images to IndexedDB when they change
  useEffect(() => {
    if (!imagesLoaded) return;
    saveCharacterIllustration(characterIllustration, setStorageError);
  }, [characterIllustration, imagesLoaded]);

  // Save character map to IndexedDB when it changes
  useEffect(() => {
    if (!imagesLoaded) return;
    saveCharacterMap(characterMap, setStorageError);
  }, [characterMap, imagesLoaded]);

  // Save book illustrations to IndexedDB when they change
  useEffect(() => {
    if (!imagesLoaded) return;
    saveBookIllustrations(bookIllustrations, setStorageError);
  }, [bookIllustrations, imagesLoaded]);

  // Validate data before proceeding to certain steps
  useEffect(() => {
    const redirectStep = validateStepData(
      step, 
      childData, 
      storyDetails, 
      storyScript, 
      characterIllustration, 
      bookIllustrations, 
      compiledBook
    );
    
    if (redirectStep) {
      console.warn(`Missing required data for ${step} step, redirecting to ${redirectStep}`);
      safelySetStep(redirectStep);
    }
  }, [step, childData, storyDetails, storyScript, characterIllustration, bookIllustrations, compiledBook]);

  // Monitor bookIllustrations for validity and attempt recovery if needed
  useEffect(() => {
    const attemptRecovery = async () => {
      // Only attempt recovery once
      if (recoveryAttempted) return;
      
      // Check if illustrations are invalid but we previously had them
      if ((!bookIllustrations || !Array.isArray(bookIllustrations) || bookIllustrations.length !== 12) && 
          step === STEPS.PREVIEW) {
        console.log("Attempting to recover illustrations from storage...");
        setRecoveryAttempted(true);
        
        try {
          // Attempt to reload just the book illustrations
          const setters = {
            setBookIllustrations,
            setImagesLoaded: () => {},  // No-op since we're already loaded
            setStorageError,
            setCharacterIllustration: () => {},
            setCharacterMap: () => {},
            setChildData: () => {}
          };
          
          await loadImagesFromIndexedDB(setters);
          console.log("Successfully recovered illustrations from storage");
        } catch (error) {
          console.error("Failed to recover illustrations:", error);
          setStorageError(true);
        }
      }
    };

    attemptRecovery();
  }, [bookIllustrations, step, recoveryAttempted]);

  // Safe transition between steps with data validation and history tracking
  const safelySetStep = (nextStep) => {
    safelySetStepHelper(nextStep, setStep, setIsTransitioning, history, setHistory);
  };

  // Handle moving back in the story creation flow
  const handleBack = () => {
    handleBackHelper(history, setHistory, setStep, setIsTransitioning);
  };

  // Function to clear saved data
  const clearSavedData = async () => {
    await clearSavedDataHelper(
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
    );
  };

  // Handle photo upload submission
  const handlePhotoSubmit = (photo) => {
    handlePhotoSubmitHelper(photo, setChildData, safelySetStep, setStorageError);
  };

  // Handle form submission
  const handleFormSubmit = (formData) => {
    handleFormSubmitHelper(formData, setChildData, safelySetStep);
  };

  // Handle story details form submission
  const handleStoryDetailsSubmit = (details) => {
    handleStoryDetailsSubmitHelper(details, setStoryDetails, safelySetStep);
  };

  // Handle script generation completion
  const handleScriptComplete = (scriptData) => {
    return handleScriptCompleteHelper(
      scriptData, 
      setStoryScript, 
      safelySetStep, 
      childData, 
      storyDetails
    );
  };

  // Handle illustration generation completion
  const handleIllustrationComplete = (illustrationUrl) => {
    return handleIllustrationCompleteHelper(
      illustrationUrl, 
      setCharacterIllustration, 
      safelySetStep,
      childData,
      storyDetails,
      storyScript
    );
  };

  // Handle book compilation completion
  const handleCompileComplete = (illustrations) => {
    // Validate illustrations before saving to context
    if (!illustrations || !Array.isArray(illustrations) || illustrations.length !== 12) {
      throw new Error("Invalid illustrations data received from compilation");
    }

    // Validate each illustration
    const invalidIllustrations = illustrations.filter(
      (uri) => !uri || typeof uri !== 'string' || !uri.startsWith('data:image')
    );

    if (invalidIllustrations.length > 0) {
      throw new Error(`Received ${invalidIllustrations.length} invalid illustration(s) from compilation`);
    }

    // Save illustrations to storage
    saveBookIllustrations(illustrations, setStorageError).catch(error => {
      console.error("Failed to save illustrations:", error);
      setStorageError(true);
    });

    // Update context and proceed to next step
    return handleCompileCompleteHelper(
      illustrations, 
      setBookIllustrations, 
      safelySetStep,
      childData,
      storyDetails,
      storyScript,
      characterIllustration
    );
  };

  // Handle preview completion
  const handlePreviewComplete = (bookData) => {
    return handlePreviewCompleteHelper(
      bookData, 
      setCompiledBook, 
      safelySetStep,
      childData,
      storyDetails,
      storyScript,
      characterIllustration,
      bookIllustrations
    );
  };

  // Function to handle option selection in the first step
  const handleOptionSelect = (option) => {
    handleOptionSelectHelper(option, safelySetStep);
  };

  const handleCharacterMapComplete = (characterMapData) => {
    handleCharacterMapCompleteHelper(characterMapData, setCharacterMap, safelySetStep);
  };

  // Function to go to a specific step (with validation)
  const goToStep = (targetStep) => {
    return goToStepHelper(
      targetStep, 
      childData, 
      storyDetails, 
      storyScript, 
      characterIllustration, 
      bookIllustrations, 
      compiledBook,
      safelySetStep
    );
  };

  const value = {
    childData,
    storyDetails,
    storyScript,
    characterIllustration,
    bookIllustrations,
    compiledBook,
    step,
    isTransitioning,
    history,
    characterMap,
    handleBack,
    handlePhotoSubmit,
    handleFormSubmit,
    handleStoryDetailsSubmit,
    handleScriptComplete,
    handleIllustrationComplete,
    handleCompileComplete,
    handlePreviewComplete,
    handleOptionSelect,
    goToStep,
    handleCharacterMapComplete,
    clearSavedData,
    imagesLoaded,
    storageError,
    // Export STEPS for use in components
    STEPS
  };

  return (
    <StoryContext.Provider value={value}>{children}</StoryContext.Provider>
  );
}
