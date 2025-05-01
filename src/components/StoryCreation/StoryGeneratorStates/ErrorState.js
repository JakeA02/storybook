import React from "react";
import DetailsPreview from "../DetailsPreview";

/**
 * Component to display error state when script generation fails
 */
export default function ErrorState({ error, storyDetails, onRetry, onBack }) {
  return (
    <div className="text-center py-8">
      <p className="text-red-500 mb-4">{error}</p>
      
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
        <div className="mt-4">
          <DetailsPreview />
        </div>
      </div>
      
      <button
        onClick={onRetry}
        className="px-6 py-2 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors"
      >
        Try Again
      </button>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 ml-4 px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
      >
        Edit Details
      </button>
    </div>
  );
} 