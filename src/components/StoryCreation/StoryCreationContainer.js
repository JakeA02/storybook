import { useStory } from "../../context/StoryContext";
import CreationStart from "./CreationStart";
import PhotoUpload from "./PhotoUpload";
import ChildDescriptionForm from "./ChildDescriptionForm";
import StoryDetailsForm from "./StoryDetailsForm";
import StoryScriptGenerator from "./StoryScriptGenerator";
import IllustrationGenerator from "./IllustrationGenerator";
import BookCompilation from "./BookCompilation";
import BookPreview from "./BookPreview";
import Checkout from "./Checkout";

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
  } = useStory();

  // Wrapper for handleScriptComplete to call onComplete with the result
  const handleScriptCompleteWrapper = (editedScript) => {
    const result = handleScriptComplete(editedScript);
    console.log("Story script complete:", result);
  };

  // Wrapper for handleIllustrationComplete to call onComplete with the result
  const handleIllustrationCompleteWrapper = (illustrationUrl) => {
    const result = handleIllustrationComplete(illustrationUrl);
    console.log("Illustration complete:", result);
  };

  // Wrapper for compile completion
  const handleCompileCompleteWrapper = (illustrations) => {
    const result = handleCompileComplete(illustrations);
    console.log("Compilation complete:", result);
  };

  // Wrapper for preview completion
  const handlePreviewCompleteWrapper = (bookData) => {
    const result = handlePreviewComplete(bookData);
    console.log("Preview complete:", result);
  };

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

  // Render the appropriate component based on the current step
  const renderStep = () => {
    // Validate data requirements for current step
    if (!validateDataForStep(step)) {
      return <MissingDataError />;
    }

    // Render the appropriate component for the current step
    switch (step) {
      case STEPS.START:
        return <CreationStart />;
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
        return <BookPreview onComplete={handlePreviewCompleteWrapper} />;
      case STEPS.CHECKOUT:
        return <Checkout />;
      default:
        return <CreationStart />;
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
      <StepProgress />
      <div className="step-content bg-none p-3">{renderStep()}</div>
    </div>
  );
}
