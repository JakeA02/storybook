import React from "react";
import Image from "next/image";

/**
 * Component to display loading state while generating a story script
 */
export default function LoadingState({ childName }) {
  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <Image
          src="/images/book-logo.svg"
          width={80}
          height={80}
          alt="Creating your story"
          className="mx-auto animate-pulse"
        />
      </div>
      <p className="text-lg mb-4">Creating your magical story...</p>
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p className="text-sm text-muted mt-8">
        We're crafting a personalized story with {childName} as the main character!
      </p>
    </div>
  );
} 