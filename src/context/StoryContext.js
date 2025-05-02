import { createContext, useContext, useState } from "react";

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

  // Handle moving back in the story creation flow
  const handleBack = () => {
    if (step === "upload" || step === "form") {
      setStep("start");
    } else if (step === "details") {
      setStep(childData?.type === "photo" ? "upload" : "form");
    } else if (step === "script") {
      setStep("details");
    } else if (step === "illustration") {
      setStep("script");
    }
  };

  // Handle photo upload submission
  const handlePhotoSubmit = (photo) => {
    setChildData({ type: "photo", data: photo });
    setStep("details");
  };

  // Handle form submission
  const handleFormSubmit = (formData) => {
    setChildData({ type: "description", data: formData });
    setStep("details");
  };

  // Handle story details form submission
  const handleStoryDetailsSubmit = (details) => {
    setStoryDetails(details);
    setStep("script");
  };

  // Handle script generation completion
  const handleScriptComplete = (scriptData) => {
    setStoryScript(scriptData);
    setStep("illustration");
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
    // setStep("preview");
    return {
      childData: childData,
      storyDetails: storyDetails,
      storyScript: storyScript,
      characterIllustration: illustrationUrl,
    };
  };

  // Function to handle option selection in the first step
  const handleOptionSelect = (option) => {
    setStep(option);
  };

  const value = {
    childData,
    storyDetails,
    storyScript,
    characterIllustration,
    step,
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
