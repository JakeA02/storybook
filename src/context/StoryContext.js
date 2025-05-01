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
  const [step, setStep] = useState("start");

  // Handle moving back in the story creation flow
  const handleBack = () => {
    if (step === "upload" || step === "form") {
      setStep("start");
    } else if (step === "details") {
      setStep(childData?.type === "photo" ? "upload" : "form");
    } else if (step === "script") {
      setStep("details");
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
    return {
      childData: childData,
      storyDetails: storyDetails,
      storyScript: scriptData,
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
    step,
    handleBack,
    handlePhotoSubmit,
    handleFormSubmit,
    handleStoryDetailsSubmit,
    handleScriptComplete,
    handleOptionSelect,
  };

  return (
    <StoryContext.Provider value={value}>{children}</StoryContext.Provider>
  );
}
