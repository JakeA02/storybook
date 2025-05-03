import { useStory } from "../../context/StoryContext";
import CreationStart from "./CreationStart";
import PhotoUpload from "./PhotoUpload";
import ChildDescriptionForm from "./ChildDescriptionForm";
import StoryDetailsForm from "./StoryDetailsForm";
import StoryScriptGenerator from "./StoryScriptGenerator";
import IllustrationGenerator from "./IllustrationGenerator";

export default function StoryCreationContainer() {
  const { 
    step, 
    storyScript, 
    storyDetails, 
    childData, 
    handleScriptComplete, 
    handleIllustrationComplete 
  } = useStory();

  // Wrapper for handleScriptComplete to call onComplete with the result
  const handleScriptCompleteWrapper = (editedScript) => {
    // Get the result directly from the completed script parameter
    const result = handleScriptComplete(editedScript);
    // Now we can use the result directly, avoiding the race condition
    console.log("Story script complete:", result);
  };

  // Wrapper for handleIllustrationComplete to call onComplete with the result
  const handleIllustrationCompleteWrapper = (illustrationUrl) => {
    // Get the result directly from the completed illustration parameter
    const result = handleIllustrationComplete(illustrationUrl);
    // Now we can use the result directly
    console.log("Illustration complete:", result);
    // Add your navigation or next step logic here
  };

  // Check if we have all required data for the illustration step
  const canRenderIllustration = () => {
    return (
      childData && 
      childData.type && 
      childData.data && 
      storyDetails && 
      storyDetails.childName && 
      storyScript
    );
  };

  // Render the appropriate component based on the current step
  const renderStep = () => {
    switch (step) {
      case "start":
        return <CreationStart />;
      case "upload":
        return <PhotoUpload />;
      case "form":
        return <ChildDescriptionForm />;
      case "details":
        return <StoryDetailsForm />;
      case "script":
        return <StoryScriptGenerator onComplete={handleScriptCompleteWrapper} />;
      case "illustration":
        // Only render illustration if we have the required data
        return canRenderIllustration() ? (
          <IllustrationGenerator onComplete={handleIllustrationCompleteWrapper} />
        ) : (
          <div className="text-center py-6">
            <p className="text-red-500 mb-4">
              Missing required data for illustration generation. 
              Please ensure all previous steps are completed.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 ease-in-out"
            >
              Restart
            </button>
          </div>
        );
      default:
        return <CreationStart />;
    }
  };

  return <div className="story-creation-container">{renderStep()}</div>;
}
