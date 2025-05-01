import { useState, useEffect } from "react";
import Image from "next/image";
import { useStory } from "../../context/StoryContext";
import DetailsPreview from "./DetailsPreview";
export default function StoryScriptGenerator({ onComplete }) {
  const { storyDetails, childData, handleBack } = useStory();
  const [isLoading, setIsLoading] = useState(false);
  const [script, setScript] = useState(null);
  const [error, setError] = useState(null);

  const generateScript = async () => {
    setIsLoading(true);
    setError(null);
    console.log(process.env.NEXT_PUBLIC_OPENAI_API_KEY);
    try {
      const prompt = `Create a children's story script about a character named ${
        storyDetails.childName
      } who loves ${storyDetails.childLikes}. ${
        storyDetails.lesson
          ? `The story should teach a lesson about ${storyDetails.lesson}.`
          : ""
      }.
      Only output the script and it's title, nothing more. Write exactly 12 stanzas, with each stanza containing 4 lines that follow an A/B/A/B rhyme scheme. At the top of the script, write the title of the story. An output example is below:
      Title: The Magic of the Stars

      Stanza 1
      In a town where the stars sparkled bright,
      Lived a boy  with dreams of the sky.
      He'd gaze at the moon, filled with pure delight,
      Wishing one day he could soar up high.
      
      Stanza 2
      ...`;

      console.log(isLoading);
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert children's story writer who specializes in creating engaging, intriguing stories following specific structural requirements. Your task is to create a story script. Provide just the script and it's title, nothing more.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        // Handle non-successful API responses
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(
          `API request failed with status ${response.status}: ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      console.log("API Response Data:", data); // Log the response for debugging
      console.log(data.choices?.[0]?.message?.content);
      // Extract the generated script content
      const generatedScript = data.choices?.[0]?.message?.content;

      if (!generatedScript) {
        throw new Error("No script content received from API.");
      }

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

  // Function to pass the completed data (including script) back up
  const handleComplete = () => {
    if (script) {
      // Only complete if script exists
      onComplete({
        ...storyDetails, // Include original storyDetails
        script: script,
        childData: childData.data, // Pass childData along
      });
    } else {
      // Optionally handle the case where the user tries to continue without a script
      console.warn("Attempted to complete without a generated script.");
      setError(
        "Cannot continue without a story script. Please try generating again."
      );
    }
  };

  // Function to format the script text into renderable stanzas
  const formatScript = (scriptText) => {
    if (!scriptText) return [];

    // Split the script into stanzas based on double line breaks
    // Trim leading/trailing whitespace from the whole script first
    const stanzas = scriptText.trim().split("\n\n");
    // Further trim each stanza to remove extra whitespace around them
    return stanzas
      .map((stanza) => stanza.trim())
      .filter((stanza) => stanza.length > 0);
  };

  // Function to handle retrying script generation
  const handleRetry = () => {
    setError(null);
    generateScript(); // Call generateScript directly
  };

  // --- Helper function to render child details ---
  const renderChildDetails = () => {
    return <DetailsPreview />;
  };

  return (
    <div className="card-transition-container">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Ready to Generate Your Story?
      </h2>

      {/* --- Display Story & Child Details Section --- */}
      {!isLoading && !script && !error && <DetailsPreview />}
      {/* --- End Display Section --- */}

      {isLoading ? (
        // Loading State UI
        <div className="text-center py-12">
          <div className="mb-6">
            <Image
              src="/images/book-logo.svg"
              width={80}
              height={80}
              alt="Creating your story"
              className="mx-auto animate-pulse" // Simple pulse animation
            />
          </div>
          <p className="text-lg mb-4">Creating your magical story...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-sm text-muted mt-8">
            We're crafting a personalized story with {storyDetails.childName} as
            the main character!
          </p>
        </div>
      ) : error ? (
        // Error State UI
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          {/* Display details again on error */}
          <div className="mb-6 p-4 border rounded-lg bg-red-50/50 text-left">
            <h3 className="text-lg font-semibold mb-3 text-red-700">
              Story Details Used:
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Child's Name:</strong> {storyDetails?.childName}
              </p>
              <p>
                <strong>Child Likes:</strong> {storyDetails?.childLikes}
              </p>
              {storyDetails?.lesson && (
                <p>
                  <strong>Lesson:</strong> {storyDetails.lesson}
                </p>
              )}
              <p>
                <strong>Style:</strong>{" "}
                <span className="capitalize">{storyDetails?.cartoonStyle}</span>
              </p>
            </div>
            <div className="mt-4">{renderChildDetails()}</div>
          </div>
          <button
            onClick={handleRetry} // Use a dedicated retry handler
            className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={handleBack} // Go back to edit details
            className="mt-4 ml-4 px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            Edit Details
          </button>
        </div>
      ) : script ? (
        // Success State UI (Script Display)
        <>
          <p className="text-center mb-6 font-story">
            Here's the magical story we created for {storyDetails.childName}:
          </p>

          {/* Scrollable container for the script */}
          <div className="script-card overflow-y-auto max-h-80 mb-6">
            {formatScript(script).map((stanza, index) => {
              // Find the index of the first newline character
              const newlineIndex = stanza.indexOf("\n");

              if (newlineIndex === -1) {
                return (
                  <p key={index} className="stanza whitespace-pre-line">
                    <strong>{stanza}</strong>
                  </p>
                );
              }

              const firstLine = stanza.substring(0, newlineIndex);

              const restOfStanza = stanza.substring(newlineIndex + 1);

              return (
                <p key={index} className="stanza whitespace-pre-line">
                  <strong>{firstLine}</strong>
                  {"\n"}
                  {restOfStanza}
                </p>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={handleBack} // Go back to edit details
              className="w-full sm:w-auto px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
            >
              Edit Details
            </button>
            <button
              onClick={generateScript}
              className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              Regnerate Story
            </button>
            <button
              onClick={handleComplete} // Proceed to the next step
              className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              Continue to Illustrations
            </button>
          </div>
        </>
      ) : (
        // Initial State: Show details and Generate Button
        <div className="text-center py-8">
          <p className="mb-6 text-gray-600">
            Review your story details above. When you're ready, generate the
            script!
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={handleBack} // Go back to edit details
              className="w-full sm:w-auto px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
            >
              Edit Details
            </button>
            <button
              onClick={generateScript}
              className="w-full sm:w-auto px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white transition-transform duration-200 shadow-md font-medium hover:scale-105"
            >
              Generate Story Script
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
