import { createContext, useContext, useState, useEffect } from "react";

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
  const [step, setStep] = useState("start");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Validate data before proceeding to certain steps
  useEffect(() => {
    // If we're in the illustration step, validate we have the required data
    if (step === "illustration") {
      const hasRequiredData = childData && 
                             childData.type && 
                             childData.data && 
                             storyDetails && 
                             storyDetails.childName && 
                             storyScript;
      
      if (!hasRequiredData) {
        console.warn("Missing required data for illustration step, redirecting back to script step");
        setStep("script");
      }
    }
  }, [step, childData, storyDetails, storyScript]);

  // Safe transition between steps with data validation
  const safelySetStep = (nextStep) => {
    setIsTransitioning(true);
    
    // Add a small delay to ensure state has settled
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 50);
  };

  // Handle moving back in the story creation flow
  const handleBack = () => {
    if (step === "upload" || step === "form") {
      safelySetStep("start");
    } else if (step === "details") {
      safelySetStep(childData?.type === "photo" ? "upload" : "form");
    } else if (step === "script") {
      safelySetStep("details");
    } else if (step === "illustration") {
      safelySetStep("script");
    }
  };

  // Handle photo upload submission
  const handlePhotoSubmit = (photo) => {
    setChildData({ type: "photo", data: photo });
    safelySetStep("details");
  };

  // Handle form submission
  const handleFormSubmit = (formData) => {
    setChildData({ type: "description", data: formData });
    safelySetStep("details");
  };

  // Handle story details form submission
  const handleStoryDetailsSubmit = (details) => {
    setStoryDetails(details);
    safelySetStep("script");
  };

  // Handle script generation completion
  const handleScriptComplete = (scriptData) => {
    setStoryScript(scriptData);
    safelySetStep("illustration");
    return {
      childData: childData,
      storyDetails: storyDetails,
      storyScript: scriptData,
    };
  };

  // Handle illustration generation completion
  const handleIllustrationComplete = (illustrationUrl) => {
    setCharacterIllustration(illustrationUrl);
    // Add your next step here, for example "preview" or "publish"
    // safelySetStep("preview");
    return {
      childData: childData,
      storyDetails: storyDetails,
      storyScript: storyScript,
      characterIllustration: illustrationUrl,
    };
  };

  // Function to handle option selection in the first step
  const handleOptionSelect = (option) => {
    safelySetStep(option);
  };

  const value = {
    childData,
    storyDetails,
    storyScript,
    characterIllustration,
    step,
    isTransitioning,
    handleBack,
    handlePhotoSubmit,
    handleFormSubmit,
    handleStoryDetailsSubmit,
    handleScriptComplete,
    handleIllustrationComplete,
    handleOptionSelect,
  };

  return (
    <StoryContext.Provider value={value}>{children}</StoryContext.Provider>
  );
}
