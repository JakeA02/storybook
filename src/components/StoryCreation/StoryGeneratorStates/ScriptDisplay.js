import React from "react";

/**
 * Component to display the generated story script
 */
export default function ScriptDisplay({
  script,
  childName,
  onBack,
  onRegenerate,
  onComplete,
}) {
  /**
   * Format the script text into renderable stanzas.
   * Attempts to bold lines starting with "Stanza ".
   */
  const formatScript = (scriptText) => {
    if (!scriptText) return [];

    // Split the script into stanzas based on double line breaks
    const stanzas = scriptText.trim().split("\n\n");

    return stanzas
      .map((stanza) => stanza.trim()) // Trim each stanza
      .filter((stanza) => stanza.length > 0) // Remove empty stanzas
      .map((stanza, index) => {
        // Split stanza into lines to check the first line
        const lines = stanza.split("\n");
        const firstLine = lines[0];
        const restOfLines = lines.slice(1).join("\n");

        // Check if the first line looks like a title (e.g., "Stanza 1")
        // You might adjust the condition based on the actual format
        const isTitle = /^(Stanza\s+\d+|Chapter\s+\d+)/i.test(firstLine.trim());

        if (isTitle && lines.length > 1) {
          // If it's a title and there's more content, bold the title
          return (
            <p key={index} className="stanza mb-4 whitespace-pre-line">
              {" "}
              {/* Added mb-4 for spacing between stanzas */}
              <strong>{firstLine}</strong>
              {"\n"}
              {restOfLines}
            </p>
          );
        } else {
          // Otherwise, render the whole stanza normally (or bold if it's a single line title)
          return (
            <p key={index} className="stanza mb-4 whitespace-pre-line">
              {" "}
              {/* Added mb-4 */}
              {isTitle ? <strong>{stanza}</strong> : stanza}
            </p>
          );
        }
      });
  };

  return (
    <div className="flex flex-col h-full">
      {" "}
      {/* Ensure component takes height if needed */}
      <p className="text-center mb-4 font-story">
        {" "}
        {/* Reduced mb slightly */}
        Here's the magical story we created for {childName}:
      </p>
      {/* Scrollable container for the script */}
      {/* Increased max-h slightly, adjusted margin */}
      <div className="script-card flex-grow overflow-y-auto max-h-96 mb-8 p-4 rounded-lg border border-gray-300 bg-white shadow-sm">
        {formatScript(script)}
      </div>
      {/* Action Buttons - Reorganized Layout */}
      {/* Using flex, justify-between to push Back left and others right */}
      {/* Items-center for vertical alignment, especially on mobile wrap */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
        {" "}
        {/* Added gap-4 for consistent spacing */}
        {/* Back Button - Positioned Left */}
        <button
          type="button"
          onClick={onBack}
          // Consistent padding, outline style for secondary action
          className="px-5 py-2.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 ease-in-out order-1 sm:order-1" // Explicit order
        >
          Edit Details
        </button>
        {/* Group Regenerate and Continue Buttons - Positioned Right */}
        <div className="flex flex-wrap sm:flex-nowrap justify-end gap-4 order-2 sm:order-2">
          {" "}
          {/* Grouping, ensure no wrap on sm+, consistent gap */}
          {/* Regenerate Button - Secondary action style */}
          <button
            onClick={onRegenerate}
            // Slightly less prominent style (e.g., lighter background or outline)
            // Using a gray outline style here as an example
            className="px-5 py-2.5 rounded-full border border-gray-400 text-secondary hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors duration-200 ease-in-out"
          >
            Regenerate Story
          </button>
          {/* Continue Button - Primary action style */}
          <button
            onClick={onComplete}
            // Prominent style for primary action
            className="px-5 py-2.5 rounded-full bg-primary text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200 ease-in-out"
          >
            Continue to Illustrations
          </button>
        </div>
      </div>
    </div> // Close the main flex container
  );
}
