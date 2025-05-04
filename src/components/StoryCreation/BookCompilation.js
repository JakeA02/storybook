import { useState, useEffect } from "react";
import { useStory } from "../../context/StoryContext";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { generateStoryIllustrations } from "../../services/storyIllustrationService";

export default function BookCompilation({ onComplete }) {
  const { storyScript, storyDetails, characterIllustration, childData } =
    useStory();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [illustrations, setIllustrations] = useState([]);
  const [showScript, setShowScript] = useState(false);
  const [formattedScript, setFormattedScript] = useState([]);
  const [stanzas, setStanzas] = useState([]);

  // Format the script when it's available
  useEffect(() => {
    if (storyScript) {
      // Split the script into lines, preserving empty lines
      const scriptLines = storyScript.split("\n");

      // Transform stanza headers to page numbers
      let pageCounter = 1;
      const transformedLines = scriptLines.map((line) => {
        if (line.includes("Stanza")) {
          return `Page ${pageCounter++}`;
        }
        return line;
      });

      setFormattedScript(transformedLines);
      
      // Extract stanzas for illustration generation
      const extractedStanzas = [];
      let currentStanza = "";
      let inStanza = false;
      
      for (let i = 0; i < scriptLines.length; i++) {
        const line = scriptLines[i];
        
        if (line.includes("Stanza")) {
          if (inStanza && currentStanza.trim()) {
            extractedStanzas.push(currentStanza.trim());
          }
          inStanza = true;
          currentStanza = "";
        } else if (inStanza) {
          currentStanza += line + " ";
        }
      }
      
      // Add the last stanza if it exists
      if (inStanza && currentStanza.trim()) {
        extractedStanzas.push(currentStanza.trim());
      }
      
      // Ensure we have exactly 12 stanzas, pad with empty ones if needed
      while (extractedStanzas.length < 12) {
        extractedStanzas.push("Empty page");
      }
      
      // Limit to 12 stanzas
      setStanzas(extractedStanzas.slice(0, 12));
    }
  }, [storyScript]);

  // Generate illustrations for each part of the story
  const generateBookIllustrations = async () => {
    setIsGenerating(true);
    setProgress(0);
    setIllustrations([]);

    try {
      const generatedIllustrations = await generateStoryIllustrations(
        stanzas,
        characterIllustration,
        storyDetails,
        (pageNumber, dataUri) => {
          // Update progress as each page is completed
          setProgress(Math.floor((pageNumber / 12) * 100));
          setIllustrations(prev => {
            const newIllustrations = [...prev];
            newIllustrations[pageNumber - 1] = dataUri;
            return newIllustrations;
          });
        }
      );

      setIllustrations(generatedIllustrations);
      
      // Call the onComplete handler with the generated illustrations
      onComplete(generatedIllustrations);
    } catch (error) {
      console.error("Error generating illustrations:", error);
      alert("There was an error generating illustrations. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="card-transition-container">
      <h2 className="text-2xl font-bold mb-4 text-center">Book Compilation</h2>
      <p className="text-center mb-8 font-story">
        We'll create illustrations for each part of your story
      </p>

      {!isGenerating && illustrations.length === 0 && (
        <div className="text-center">
          <button
            onClick={generateBookIllustrations}
            className="px-6 py-3 mb-4 bg-gradient-to-r from-sky-400 to-rose-400 text-white rounded-full hover:scale-105 transition-transform duration-200 shadow-md font-medium"
          >
            Generate Book Illustrations
          </button>

          <div className="justify-left">
            <h3 className="text-lg font-semibold mb-2">Story Information</h3>
            <p className="mb-2">
              <span className="font-medium">Child's Name:</span>{" "}
              {storyDetails?.childName}
            </p>
            <p className="mb-2">
              <span className="font-medium">Theme:</span> {storyDetails?.lesson}
            </p>
            <p className="mb-2">
              <span className="font-medium">Character Type:</span>{" "}
              {childData?.type}
            </p>
            <p className="mb-2">
              <span className="font-medium">Number of Illustrations:</span> 12
            </p>
            <button
              className="mb-4 flex items-center justify-center gap-2 mx-auto px-4 py-2 text-primary rounded-full border border-primary hover:bg-primary hover:text-white focus:outline-none transition-colors duration-200 ease-in-out"
              onClick={() => setShowScript(!showScript)}
            >
              {showScript ? (
                <>
                  <ChevronUp size={18} /> Hide Story Script
                </>
              ) : (
                <>
                  <ChevronDown size={18} /> Show Story Script
                </>
              )}
            </button>

            {showScript && (
              <div className="script-card overflow-y-auto max-h-96 mb-4 p-4 rounded-lg border border-gray-300 bg-white shadow-sm">
                <div className="space-y-2">
                  {formattedScript.map((line, index) => (
                    <div
                      key={index}
                      className={`font-story text-secondary w-full ${
                        line.trim() === "" ? "h-4" : "mb-1"
                      } ${index === 0 || line.includes("Page") ? "font-bold" : ""}`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="animate-spin w-10 h-10 text-primary" />
          </div>
          <p className="mb-4">
            Generating illustrations... {progress}% complete
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
            <div
              className="bg-gradient-to-r from-sky-400 to-rose-400 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          {illustrations.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {illustrations.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  {url ? (
                    <img
                      src={url}
                      alt={`Illustration ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      Generating...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isGenerating && illustrations.length > 0 && (
        <div className="text-center">
          <p className="text-green-500 font-medium mb-6">
            All illustrations generated successfully!
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {illustrations.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                <img
                  src={url}
                  alt={`Illustration ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
