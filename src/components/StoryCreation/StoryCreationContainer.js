import { useStory } from "../../context/index";
import CreationStart from "./CreationStart";
import PhotoUpload from "./PhotoUpload";
import ChildDescriptionForm from "./ChildDescriptionForm";
import StoryDetailsForm from "./StoryDetailsForm";
import StoryScriptGenerator from "./StoryScriptGenerator";
import IllustrationGenerator from "./IllustrationGenerator";
import BookCompilation from "./BookCompilation";
import BookPreview from "./BookPreview";
import Checkout from "./Checkout";
import { useState, useEffect, useRef } from "react";
import "../../styles/session.css";
import ErrorBoundary from '../ErrorBoundary';

// No need to define STEPS here, use from StoryContext
// Define step display names for the progress indicator
const STEP_LABELS = {
  start: "Start",
  upload: "Photo",
  form: "Description",
  details: "Details",
  script: "Story",
  illustration: "Character",
  compile: "Illustrations",
  preview: "Preview",
  checkout: "Checkout",
};

export default function StoryCreationContainer() {
  const {
    step,
    storyScript,
    storyDetails,
    childData,
    handleBack,
    handleScriptComplete,
    handleIllustrationComplete,
    handleCompileComplete,
    handlePreviewComplete,
    STEPS,
    goToStep,
    clearSavedData,
    imagesLoaded,
    storageError
  } = useStory();

  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [showRecoveryAlert, setShowRecoveryAlert] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showStorageAlert, setShowStorageAlert] = useState(false);
  const sessionMenuRef = useRef(null);
  const isInitialRender = useRef(true);

  // Check if session was recovered and handle navigation
  useEffect(() => {
    if (isInitialRender.current && imagesLoaded) {
      isInitialRender.current = false;
      
      // If we have saved data beyond the start step, automatically proceed to that step
      if (step !== STEPS.START) {
        setShowStartScreen(false);
        setShowRecoveryAlert(true);
        
        // Auto-hide the recovery alert after 5 seconds
        setTimeout(() => {
          setShowRecoveryAlert(false);
        }, 5000);
      }
    }
  }, [step, STEPS.START, imagesLoaded]);

  // Show storage error alert when storage error occurs
  useEffect(() => {
    if (storageError) {
      setShowStorageAlert(true);
    }
  }, [storageError]);

  // Handle clicks outside the session menu
  useEffect(() => {
    if (!showSessionMenu) return;
    
    const handleClickOutside = (event) => {
      if (sessionMenuRef.current && !sessionMenuRef.current.contains(event.target)) {
        setShowSessionMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSessionMenu]);

  // Show a temporary notification when session is saved
  useEffect(() => {
    let timer;
    if (sessionSaved) {
      timer = setTimeout(() => {
        setSessionSaved(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [sessionSaved]);

  // Show notification when state changes
  useEffect(() => {
    if (imagesLoaded) {
      setSessionSaved(true);
    }
  }, [step, storyScript, storyDetails, childData, imagesLoaded]);

  // Wrapper for handleScriptComplete to call onComplete with the result
  const handleScriptCompleteWrapper = (editedScript) => {
    const result = handleScriptComplete(editedScript);
  };

  // Wrapper for handleIllustrationComplete to call onComplete with the result
  const handleIllustrationCompleteWrapper = (illustrationUrl) => {
    const result = handleIllustrationComplete(illustrationUrl);
  };

  // Wrapper for compile completion
  const handleCompileCompleteWrapper = (illustrations) => {
    const result = handleCompileComplete(illustrations);
  };

  // Wrapper for preview completion
  const handlePreviewCompleteWrapper = (bookData) => {
    const result = handlePreviewComplete(bookData);
  };

  // Loading component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="loading-dots mb-4">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p className="text-gray-600">Loading your story data...</p>
    </div>
  );

  // Data validation helper functions
  const hasRequiredChildData = () =>
    childData && childData.type && childData.data;

  const hasRequiredStoryDetails = () => storyDetails && storyDetails.childName;

  const hasRequiredScript = () => !!storyScript;

  // Comprehensive validation function
  const validateDataForStep = (currentStep) => {
    switch (currentStep) {
      case STEPS.DETAILS:
        return hasRequiredChildData();
      case STEPS.SCRIPT:
        return hasRequiredChildData() && hasRequiredStoryDetails();
      case STEPS.ILLUSTRATION:
        return (
          hasRequiredChildData() &&
          hasRequiredStoryDetails() &&
          hasRequiredScript()
        );
      case STEPS.COMPILE:
        // Add validation for illustration data when you implement it
        return (
          hasRequiredChildData() &&
          hasRequiredStoryDetails() &&
          hasRequiredScript()
        );
      case STEPS.PREVIEW:
      case STEPS.CHECKOUT:
        // Add more validations as needed for later steps
        return (
          hasRequiredChildData() &&
          hasRequiredStoryDetails() &&
          hasRequiredScript()
        );
      default:
        return true;
    }
  };

  // Error component for missing data
  const MissingDataError = () => (
    <div className="text-center py-6">
      <p className="text-red-500 mb-4">
        Missing required data for this step. Please ensure all previous steps
        are completed.
      </p>
      <button
        onClick={handleBack}
        className="px-5 py-2.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 ease-in-out mr-4"
      >
        Go Back
      </button>
      <button
        onClick={() => window.location.reload()}
        className="px-5 py-2.5 rounded-full border border-secondary text-secondary hover:bg-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 transition-colors duration-200 ease-in-out"
      >
        Restart
      </button>
    </div>
  );

  // Storage error component
  const StorageErrorAlert = () => {
    if (!showStorageAlert) return null;
    
    return (
      <div className="session-recovery-alert error mb-4">
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          <div>
            <p className="font-medium">Storage quota exceeded</p>
            <p className="text-sm">Your story contains large images which may not all be saved. You can continue, but some progress might be lost if you close the browser.</p>
          </div>
          <button 
            onClick={() => setShowStorageAlert(false)}
            className="ml-auto text-sm font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  // Session Management component
  const SessionManager = () => (
    <div className="session-manager fixed top-4 right-4 z-20" ref={sessionMenuRef}>
      {sessionSaved && (
        <div className="session-saved-notification absolute -top-10 right-0 bg-green-500 text-white px-3 py-1 rounded text-sm animate-fade-in-out">
          Progress saved
        </div>
      )}
      <button
        onClick={() => setShowSessionMenu(!showSessionMenu)}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full shadow-md transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {showSessionMenu && (
        <div className="session-menu absolute top-10 right-0 bg-white p-3 rounded shadow-lg border border-gray-200 w-48">
          <p className="text-xs text-gray-500 mb-2">Your progress is automatically saved as you go.</p>
          
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => {
                window.location.reload();
                setShowSessionMenu(false);
              }}
              className="text-blue-500 text-sm hover:bg-blue-50 p-2 rounded text-left flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Page
            </button>
            
            <button
              onClick={() => {
                if (confirm("Are you sure you want to restart? All progress will be lost.")) {
                  clearSavedData();
                  window.location.reload();
                }
                setShowSessionMenu(false);
              }}
              className="text-red-500 text-sm hover:bg-red-50 p-2 rounded text-left flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Reset Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Recovery Alert Component
  const RecoveryAlert = () => {
    if (!showRecoveryAlert) return null;
    
    return (
      <div className="session-recovery-alert success">
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
          <p>We've restored your previous progress!</p>
          <button 
            onClick={() => setShowRecoveryAlert(false)}
            className="ml-auto text-sm font-bold"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  // Render the appropriate component based on the current step
  const renderStep = () => {
    // Show loading state if images aren't loaded yet
    if (!imagesLoaded) {
      return <LoadingState />;
    }
    
    // Check if we're at the start step and should show the start screen
    if (step === STEPS.START && showStartScreen) {
      return <CreationStart onStartClick={() => setShowStartScreen(false)} />;
    }
    
    // For all other cases or if we're bypassing the start screen
    // Validate data requirements for current step
    if (!validateDataForStep(step)) {
      return <MissingDataError />;
    }

    // Render the appropriate component for the current step
    switch (step) {
      case STEPS.START:
        // This will only render if showStartScreen is false
        return <CreationStart onStartClick={() => setShowStartScreen(false)} />;
      case STEPS.UPLOAD:
        return <PhotoUpload />;
      case STEPS.FORM:
        return <ChildDescriptionForm />;
      case STEPS.DETAILS:
        return <StoryDetailsForm />;
      case STEPS.SCRIPT:
        return (
          <StoryScriptGenerator onComplete={handleScriptCompleteWrapper} />
        );
      case STEPS.ILLUSTRATION:
        return (
          <IllustrationGenerator
            onComplete={handleIllustrationCompleteWrapper}
          />
        );
      case STEPS.COMPILE:
        return <BookCompilation onComplete={handleCompileCompleteWrapper} />;
      case STEPS.PREVIEW:
        return (
          <ErrorBoundary>
            <BookPreview onComplete={handlePreviewCompleteWrapper} />
          </ErrorBoundary>
        );
      case STEPS.CHECKOUT:
        return <Checkout />;
      default:
        return <CreationStart onStartClick={() => setShowStartScreen(false)} />;
    }
  };

  // Create the step progression indicator
  const StepProgress = () => {
    // Define the visual sequence for the progress bar
    const progressSteps = [
      { key: "step1", number: 1, label: STEP_LABELS[STEPS.START] },
      {
        key: "step2",
        number: 2,
        label: `${STEP_LABELS[STEPS.UPLOAD]}/${STEP_LABELS[STEPS.FORM]}`,
      },
      { key: "step3", number: 3, label: STEP_LABELS[STEPS.DETAILS] },
      { key: "step4", number: 4, label: STEP_LABELS[STEPS.SCRIPT] },
      { key: "step5", number: 5, label: STEP_LABELS[STEPS.ILLUSTRATION] },
      { key: "step6", number: 6, label: STEP_LABELS[STEPS.COMPILE] },
      { key: "step7", number: 7, label: STEP_LABELS[STEPS.PREVIEW] },
      { key: "step8", number: 8, label: STEP_LABELS[STEPS.CHECKOUT] },
    ];

    // Map the current step to a progress step number
    const getStepNumber = (currentStep) => {
      switch (currentStep) {
        case STEPS.START:
          return 1;
        case STEPS.UPLOAD:
        case STEPS.FORM:
          return 2;
        case STEPS.DETAILS:
          return 3;
        case STEPS.SCRIPT:
          return 4;
        case STEPS.ILLUSTRATION:
          return 5;
        case STEPS.COMPILE:
          return 6;
        case STEPS.PREVIEW:
          return 7;
        case STEPS.CHECKOUT:
          return 8;
        default:
          return 1;
      }
    };

    // Get current step number
    const currentStepNumber = getStepNumber(step);

    // Map step keys to actual step values for navigation
    const stepKeyMap = {
      step1: STEPS.START,
      step2: childData?.type === "photo" ? STEPS.UPLOAD : STEPS.FORM,
      step3: STEPS.DETAILS,
      step4: STEPS.SCRIPT,
      step5: STEPS.ILLUSTRATION,
      step6: STEPS.COMPILE,
      step7: STEPS.PREVIEW,
      step8: STEPS.CHECKOUT,
    };

    // Don't render step indicator during loading
    if (!imagesLoaded) {
      return null;
    }

    return (
      <div className="step-progress mb-6">
        <div className="flex justify-between items-center relative">
          {/* Connector lines - rendered first so they appear behind the bubbles */}
          <div className="absolute top-5 left-0 right-0 flex items-center">
            <div className="w-full h-px bg-gray-200">
              {/* Active/completed portion of the connector */}
              <div
                className="h-full bg-green-500 transition-all duration-300 ease-in-out"
                style={{
                  width:
                    currentStepNumber === 1
                      ? "0%"
                      : `${
                          ((currentStepNumber - 1) /
                            (progressSteps.length - 1)) *
                          100
                        }%`,
                }}
              />
            </div>
          </div>

          {/* Step bubbles and labels */}
          {progressSteps.map((stepItem) => {
            const isActive = stepItem.number === currentStepNumber;
            const isCompleted = stepItem.number < currentStepNumber;
            const isPending = stepItem.number > currentStepNumber;

            const actualStep = stepKeyMap[stepItem.key];
            const isClickable = isCompleted && validateDataForStep(actualStep);

            // Only show every other step on mobile to save space
            const hiddenOnMobile =
              stepItem.number % 2 !== 0 && !isActive && stepItem.number !== 1;

            return (
              <div
                key={stepItem.key}
                className={`
                  step-item relative flex flex-col items-center z-10
                  ${hiddenOnMobile ? "hidden md:flex" : "flex"}
                  ${isClickable ? "cursor-pointer" : ""}
                `}
                onClick={() => isClickable && goToStep(actualStep)}
              >
                <div
                  className={`
                  step-bubble h-10 w-10 rounded-full flex items-center justify-center text-sm
                  ${isActive ? "bg-rose-400 text-white font-bold" : ""}
                  ${isCompleted ? "bg-green-500 text-white" : ""}
                  ${isPending ? "bg-gray-200 text-secondary" : ""}
                  transition-colors duration-200 ease-in-out
                `}
                >
                  {isCompleted ? "✓" : stepItem.number}
                </div>
                <div
                  className={`
                  step-label mt-2 text-xs md:text-sm font-medium 
                  ${isActive ? "text-rose-400 font-bold" : ""}
                  ${isCompleted ? "text-green-300" : ""}
                  ${isPending ? "text-gray-500" : ""}
                `}
                >
                  {stepItem.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="story-creation-container max-w-4xl mx-auto">
      {showRecoveryAlert && <RecoveryAlert />}
      {showStorageAlert && <StorageErrorAlert />}
      <StepProgress />
      <SessionManager />
      <div className="step-content bg-none p-3">{renderStep()}</div>
    </div>
  );
}
