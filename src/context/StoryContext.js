import { createContext, useContext, useState, useEffect } from "react";

// Define step configuration for the entire application
export const STEPS = {
  START: "start",
  UPLOAD: "upload",
  FORM: "form",
  DETAILS: "details",
  SCRIPT: "script",
  ILLUSTRATION: "illustration",
  COMPILE: "compile",
  PREVIEW: "preview",
  CHECKOUT: "checkout"
};

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
  const [childData, setChildData] = useState(null);
  const [storyDetails, setStoryDetails] = useState(null);
  const [storyScript, setStoryScript] = useState(null);
  const [characterIllustration, setCharacterIllustration] = useState(null);
  const [bookIllustrations, setBookIllustrations] = useState([]);
  const [compiledBook, setCompiledBook] = useState(null);
  const [step, setStep] = useState(STEPS.START);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [history, setHistory] = useState([STEPS.START]); // Track step history for navigation

  // Data validation helpers
  const hasRequiredChildData = () => 
    childData && childData.type && childData.data;

  const hasRequiredStoryDetails = () => 
    storyDetails && storyDetails.childName;

  const hasRequiredScript = () => !!storyScript;
  
  const hasRequiredIllustration = () => !!characterIllustration;

  const hasRequiredBookIllustrations = () => 
    Array.isArray(bookIllustrations) && bookIllustrations.length === 12;

  // Validate data before proceeding to certain steps
  useEffect(() => {
    // Validation logic for steps that require certain data
    const validateStepData = () => {
      if (step === STEPS.DETAILS && !hasRequiredChildData()) {
        return STEPS.START;
      }
      if (step === STEPS.SCRIPT && (!hasRequiredChildData() || !hasRequiredStoryDetails())) {
        return STEPS.DETAILS;
      }
      if (step === STEPS.ILLUSTRATION && (!hasRequiredChildData() || !hasRequiredStoryDetails() || !hasRequiredScript())) {
        return STEPS.SCRIPT;
      }
      if (step === STEPS.COMPILE && (!hasRequiredChildData() || !hasRequiredStoryDetails() || !hasRequiredScript() || !hasRequiredIllustration())) {
        return STEPS.ILLUSTRATION;
      }
      if (step === STEPS.PREVIEW && !hasRequiredBookIllustrations()) {
        return STEPS.COMPILE;
      }
      if (step === STEPS.CHECKOUT && !compiledBook) {
        return STEPS.PREVIEW;
      }
      return null;
    };

    const redirectStep = validateStepData();
    if (redirectStep) {
      console.warn(`Missing required data for ${step} step, redirecting to ${redirectStep}`);
      safelySetStep(redirectStep);
    }
  }, [step, childData, storyDetails, storyScript, characterIllustration, bookIllustrations, compiledBook]);

  // Safe transition between steps with data validation and history tracking
  const safelySetStep = (nextStep) => {
    setIsTransitioning(true);
    
    // Add to history if moving forward
    if (!history.includes(nextStep)) {
      setHistory(prevHistory => [...prevHistory, nextStep]);
    }
    
    // Add a small delay to ensure state has settled
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 50);
  };

  // Handle moving back in the story creation flow
  const handleBack = () => {
    if (history.length > 1) {
      // Remove current step from history and go to previous
      setHistory(prevHistory => {
        const newHistory = [...prevHistory];
        newHistory.pop(); // Remove current step
        return newHistory;
      });
      
      const previousStep = history[history.length - 2];
      if (previousStep) {
        setIsTransitioning(true);
        setTimeout(() => {
          setStep(previousStep);
          setIsTransitioning(false);
        }, 50);
      }
    }
  };

  // Handle photo upload submission
  const handlePhotoSubmit = (photo) => {
    setChildData({ type: "photo", data: photo });
    safelySetStep(STEPS.DETAILS);
  };

  // Handle form submission
  const handleFormSubmit = (formData) => {
    setChildData({ type: "description", data: formData });
    safelySetStep(STEPS.DETAILS);
  };

  // Handle story details form submission
  const handleStoryDetailsSubmit = (details) => {
    setStoryDetails(details);
    safelySetStep(STEPS.SCRIPT);
  };

  // Handle script generation completion
  const handleScriptComplete = (scriptData) => {
    setStoryScript(scriptData);
    safelySetStep(STEPS.ILLUSTRATION);
    return {
      childData: childData,
      storyDetails: storyDetails,
      storyScript: scriptData,
    };
  };

  // Handle illustration generation completion
  const handleIllustrationComplete = (illustrationUrl) => {
    setCharacterIllustration(illustrationUrl);
    safelySetStep(STEPS.COMPILE);
    return {
      childData: childData,
      storyDetails: storyDetails,
      storyScript: storyScript,
      characterIllustration: illustrationUrl,
    };
  };

  // Handle book compilation completion
  const handleCompileComplete = (illustrations) => {
    setBookIllustrations(illustrations);
    safelySetStep(STEPS.PREVIEW);
    return {
      childData,
      storyDetails,
      storyScript,
      characterIllustration,
      bookIllustrations: illustrations
    };
  };

  // Handle preview completion
  const handlePreviewComplete = (bookData) => {
    setCompiledBook(bookData);
    safelySetStep(STEPS.CHECKOUT);
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
  const handleOptionSelect = (option) => {
    safelySetStep(option);
  };

  // Function to go to a specific step (with validation)
  const goToStep = (targetStep) => {
    // First check if we have the required data for this step
    const validateStepData = () => {
      if (targetStep === STEPS.DETAILS && !hasRequiredChildData()) {
        return false;
      }
      if (targetStep === STEPS.SCRIPT && (!hasRequiredChildData() || !hasRequiredStoryDetails())) {
        return false;
      }
      if (targetStep === STEPS.ILLUSTRATION && (!hasRequiredChildData() || !hasRequiredStoryDetails() || !hasRequiredScript())) {
        return false;
      }
      if (targetStep === STEPS.COMPILE && (!hasRequiredChildData() || !hasRequiredStoryDetails() || !hasRequiredScript() || !hasRequiredIllustration())) {
        return false;
      }
      if (targetStep === STEPS.PREVIEW && !hasRequiredBookIllustrations()) {
        return false;
      }
      if (targetStep === STEPS.CHECKOUT && !compiledBook) {
        return false;
      }
      return true;
    };

    if (validateStepData()) {
      safelySetStep(targetStep);
      return true;
    }
    return false;
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
    // Export STEPS for use in components
    STEPS
  };

  return (
    <StoryContext.Provider value={value}>{children}</StoryContext.Provider>
  );
}
