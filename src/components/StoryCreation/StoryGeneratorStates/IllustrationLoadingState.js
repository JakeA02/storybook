import React from "react";
import Image from "next/image";

/**
 * Component to display loading state while generating character illustrations
 */
export default function IllustrationLoadingState({ childName }) {
  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <Image
          src="/images/book-logo.svg"
          width={80}
          height={80}
          alt="Creating your illustration"
          className="mx-auto animate-pulse"
        />
      </div>
      <p className="text-lg mb-4">Creating your character illustration...</p>
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p className="text-sm text-muted mt-8">
        We're turning {childName} into a magical cartoon character!
      </p>
    </div>
  );
} 