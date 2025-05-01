import React, { useState, useEffect } from "react"; // Import useState and useEffect

/**
 * Component to display and edit the generated story script line by line
 */
export default function ScriptDisplay({
  script,
  childName,
  onBack,
  onRegenerate,
  onComplete,
}) {
  // State to hold the script lines as an array for editing
  const [scriptLines, setScriptLines] = useState([]);
  const isProhibitedLine = (index) => {
    return index % 6 === 2 || index % 6 === 1;
  };

  // Effect to initialize or update the scriptLines state when the script prop changes
  useEffect(() => {
    if (script) {
      // Split the script into lines, preserving empty lines which might be stanza breaks
      setScriptLines(script.split("\n"));
    } else {
      setScriptLines([]);
    }
  }, [script]); // Re-run effect if the script prop changes

  /**
   * Handles changes in any line's input field.
   * Updates the scriptLines state.
   */
  const handleLineChange = (index, newValue) => {
    // Create a new array with the updated line
    const newScriptLines = [...scriptLines];
    newScriptLines[index] = newValue;
    setScriptLines(newScriptLines);
  };

  /**
   * Handles the completion action.
   * Joins the edited lines back into a single string and passes it to the parent.
   */
  const handleComplete = () => {
    const editedScriptString = scriptLines.join("\n");
    onComplete(editedScriptString); // Pass the updated script string
  };




  return (
    <div className="flex flex-col h-full">
      <p className="text-center mb-4 font-story">
        Here's the magical story we created for {childName} (you can edit it
        below!):
      </p>
      {/* Scrollable container for the editable script */}
      <div className="script-card flex-grow overflow-y-auto max-h-96 mb-8 p-4 rounded-lg border border-gray-300 bg-white shadow-sm">
        {/* Render each line as an input field */}
        {scriptLines.map((line, index) => (
          <input
            key={index}
            type="text"
            value={line}
            onChange={(e) => handleLineChange(index, e.target.value)}
            disabled={isProhibitedLine(index)}
            className={`w-full font-story text-secondary bg-transparent mb-1 p-1 border-b border-gray-200 focus:border-primary focus:outline-none ${
              index===0 ? "font-bold" : index%6===2 ? "font-bold" : ""
            }`}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 ease-in-out order-1 sm:order-1"
        >
          Edit Details
        </button>
        <div className="flex flex-wrap sm:flex-nowrap justify-end gap-4 order-2 sm:order-2">
          <button
            onClick={onRegenerate}
            className="px-5 py-2.5 rounded-full border border-gray-400 text-secondary hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors duration-200 ease-in-out"
          >
            Regenerate Story
          </button>
          {/* Updated to call handleComplete which processes the state */}
          <button
            onClick={handleComplete}
            className="px-5 py-2.5 rounded-full bg-primary text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 ease-in-out"
          >
            Continue to Illustrations
          </button>
        </div>
      </div>
    </div>
  );
}
