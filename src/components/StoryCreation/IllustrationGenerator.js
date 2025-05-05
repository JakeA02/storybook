import { useState, useEffect, useRef } from "react";
import { useStory } from "../../context/index";
// Ensure this path is correct
import { generateCharacterIllustration } from "../../services/imageGenerationService";
import IllustrationLoadingState from "./StoryGeneratorStates/IllustrationLoadingState";

/**
 * Component for generating and displaying character illustrations
 */
export default function IllustrationGenerator({ onComplete }) {
  // Assuming useStory provides childData with { type: 'photo'/'description', data: File/Object }
  const { storyDetails, childData, handleBack } = useStory();
  const [isLoading, setIsLoading] = useState(false);
  const [illustrationDataUri, setIllustrationDataUri] = useState(null);
  const [error, setError] = useState(null);
  const generationRequestedRef = useRef(false);

  useEffect(() => {
    // Check if all required data is available and valid
    const isDataValid = 
      childData && 
      childData.type && 
      childData.data && 
      storyDetails && 
      storyDetails.childName;
    
    if (isDataValid && !isLoading && !generationRequestedRef.current) {
      console.log("Data is valid, calling handleGenerateIllustration...");
      generationRequestedRef.current = true;
      handleGenerateIllustration();
    } else if (!isDataValid && !generationRequestedRef.current) {
      console.warn(
        "IllustrationGenerator: Missing or invalid data - ",
        { childData, storyDetails }
      );
      setError("Missing or invalid data needed to generate illustration. Please go back and ensure all information is provided.");
    }
  }, [childData, storyDetails]); // Dependencies to prevent double mounting & API calls

  const handleGenerateIllustration = async () => {
    // Basic check to prevent calls without data
    if (!childData || !childData.data || !storyDetails) {
      setError("Cannot generate illustration: missing data.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIllustrationDataUri(null);

    try {
      console.log("Generating illustration using:", { childData, storyDetails });
      const dataUri = await generateCharacterIllustration(
        childData,
        storyDetails
      );
      setIllustrationDataUri(dataUri);
    } catch (err) {
      console.error("Error generating/editing illustration:", err);
      setError(
        `We couldn't create your character illustration. ${
          err.message || "Please try again."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the ref when manually triggering a regeneration
  const handleRegenerateIllustration = () => {
    generationRequestedRef.current = false;
    handleGenerateIllustration();
  };

  const handleComplete = () => {
    if (illustrationDataUri) {
      onComplete(illustrationDataUri);
    } else {
      console.warn("Attempted to complete without a generated illustration.");
      setError(
        "Cannot continue without a character illustration. Please try generating again."
      );
    }
  };

  const renderIllustrationResult = () => {
    if (!illustrationDataUri) return null;
    return (
      <div className="flex flex-col items-center">
        <div className="mb-4 p-2 border-4 border-primary rounded-lg bg-white">
          {" "}
          {/* Added bg-white for contrast */}
          <img
            src={illustrationDataUri}
            alt={`${storyDetails.childName || "Character"} as a cartoon`}
            className="w-full max-w-md h-auto rounded"
            onError={(e) => {
              console.error("Image failed to load from data URI:", e);
              setError("Failed to display the generated image.");
              setIllustrationDataUri(null); // Clear broken image
            }}
          />
        </div>
        <p className="text-center mb-6 font-story">
          Here's {storyDetails.childName || "your character"}! What do you
          think?
        </p>
      </div>
    );
  };

  const renderError = () => {
    if (!error) return null;
    return (
      <div className="text-center py-6">
        <p className="text-red-500 mb-4">{error}</p>
        {/* Allow retry only if not loading */}
        {!isLoading && (
          <button
            onClick={handleRegenerateIllustration}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 ease-in-out disabled:opacity-50"
          >
            Try Again
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="card-transition-container">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Character Illustration
      </h2>

      {isLoading ? (
        <IllustrationLoadingState
          childName={storyDetails?.childName || "your character"}
        />
      ) : (
        <>
          {error ? renderError() : renderIllustrationResult()}

          {/* Buttons Container */}
          {!isLoading && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              {/* Go Back Button */}
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 ease-in-out order-1 sm:order-1"
              >
                Go Back
              </button>

              {/* Right-aligned Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap justify-end gap-4 order-2 sm:order-2">
                {/* Regenerate Button (Show if we have an image OR an error) */}
                {(illustrationDataUri || error) && (
                  <button
                    onClick={handleRegenerateIllustration}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-full border border-gray-400 text-secondary hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors duration-200 ease-in-out disabled:opacity-50"
                  >
                    Regenerate
                  </button>
                )}
                {/* Continue Button (Show only if we have image AND no error) */}
                {illustrationDataUri && !error && (
                  <button
                    onClick={handleComplete}
                    className="bg-gradient-to-r from-sky-400 to-rose-400 text-white px-6 py-3 rounded-full hover:scale-105 transition-transform duration-200 shadow-md font-medium"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
