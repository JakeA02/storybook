import { useState } from "react";
import { useStory } from "../../context/StoryContext";
import DetailsPreview from "./DetailsPreview";
import LoadingState from "./StoryGeneratorStates/LoadingState";
import ErrorState from "./StoryGeneratorStates/ErrorState";
import ScriptDisplay from "./StoryGeneratorStates/ScriptDisplay";
import InitialState from "./StoryGeneratorStates/InitialState";
import { generateStoryScript } from "../../services/scriptGenerationService";

export default function StoryScriptGenerator({ onComplete }) {
  const { storyDetails, childData, handleBack } = useStory();
  const [isLoading, setIsLoading] = useState(false);
  const [script, setScript] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateScript = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const generatedScript = await generateStoryScript(storyDetails);
      setScript(generatedScript);
    } catch (err) {
      console.error("Error generating script:", err);
      setError(
        `We couldn't generate your story script. ${
          err.message || "Please try again."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = (editedScript) => {
    // If editedScript is passed directly from ScriptDisplay, use it
    // Otherwise use the stored script
    const finalScript = typeof editedScript === 'string' ? editedScript : script;
    
    if (finalScript) {
      onComplete({
        ...storyDetails,
        script: finalScript,
        childData: childData.data,
      });
    } else {
      console.warn("Attempted to complete without a generated script.");
      setError(
        "Cannot continue without a story script. Please try generating again."
      );
    }
  };

  const handleRetry = () => {
    setError(null);
    handleGenerateScript();
  };

  return (
    <div className="card-transition-container">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Ready to Generate Your Story?
      </h2>

      {/* Display Story & Child Details Section */}
      {!isLoading && !script && !error && <DetailsPreview />}

      {isLoading ? (
        <LoadingState childName={storyDetails.childName} />
      ) : error ? (
        <ErrorState 
          error={error} 
          storyDetails={storyDetails} 
          onRetry={handleRetry} 
          onBack={handleBack} 
        />
      ) : script ? (
        <ScriptDisplay
          script={script}
          childName={storyDetails.childName}
          onBack={handleBack}
          onRegenerate={handleGenerateScript}
          onComplete={handleComplete}
        />
      ) : (
        <InitialState onBack={handleBack} onGenerate={handleGenerateScript} />
      )}
    </div>
  );
}
