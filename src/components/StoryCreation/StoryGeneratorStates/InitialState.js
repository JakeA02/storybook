import React from "react";

/**
 * Component to display the initial state before generating a story script
 */
export default function InitialState({ onBack, onGenerate }) {
  return (
    <div className="text-center py-8">
      <p className="mb-6 text-white-600">
        Review your story details above. When you're ready, generate the script!
      </p>
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
        >
          Edit Details
        </button>
        <button
          onClick={onGenerate}
          className="bg-gradient-to-r from-sky-400 to-rose-400 text-white px-6 py-3 rounded-full hover:scale-105 transition-transform duration-200 shadow-md font-medium"
          >
          Generate Story Script
        </button>
      </div>
    </div>
  );
} 