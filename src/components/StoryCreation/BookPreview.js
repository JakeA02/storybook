import { useState, useMemo, useEffect } from "react";
import { useStory } from "../../context/index";
import { ChevronLeft, ChevronRight, Grid, Book } from "lucide-react";
import ImageGallery from "./ImageGallery";
import DownloadImagesButton from "./DownloadImagesButton";

// Helper component for rendering a single page (can be blank or content)
function Page({ pageData, isLeft }) {
  const pageNumber = pageData?.pageNumber;
  const alignmentClass = isLeft ? "page-left" : "page-right"; // For potential specific styling

  if (!pageData || pageData.type === "blank") {
    return (
      <div className={`book-page book-page-blank ${alignmentClass}`}></div>
    );
  }

  return (
    <div
      className={`book-page bg-white h-full w-full flex flex-col relative ${
        isLeft ? "page-left" : "page-right"
      }`}
    >
      {/* Image container - ensure it handles flex layout well */}
      <div className="flex-grow flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        <img
          key={pageData.illustration} // Key for potential re-renders
          src={pageData.illustration}
          alt={`Illustration for page ${pageNumber}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>
      {/* Text container (optional, below image) */}
      {/* You might want to add text display logic here later */}
      {/* <div className="p-2 sm:p-4 text-sm text-center font-story">
        <p>{pageData.text}</p>
      </div> */}
      {/* Page Number */}
      {pageNumber && (
        <div className="page-number text-xs text-gray-500 absolute bottom-2 right-3">
          {pageNumber}
        </div>
      )}
    </div>
  );
}

export default function BookPreview({ onComplete }) {
  const { storyScript, storyDetails, bookIllustrations } = useStory();
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState("book");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Add local backup of illustrations
  const [localIllustrations, setLocalIllustrations] = useState(null);

  // Keep local backup of illustrations when they're valid
  useEffect(() => {
    if (bookIllustrations && Array.isArray(bookIllustrations) && bookIllustrations.length === 12) {
      setLocalIllustrations(bookIllustrations);
    }
  }, [bookIllustrations]);

  // Use local backup if context illustrations become invalid
  const effectiveIllustrations = useMemo(() => {
    if (bookIllustrations && Array.isArray(bookIllustrations) && bookIllustrations.length === 12) {
      return bookIllustrations;
    }
    return localIllustrations;
  }, [bookIllustrations, localIllustrations]);

  // Validate illustrations on mount and when they change
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const validateIllustrations = async () => {
      try {
        const illustrations = effectiveIllustrations;
        
        // Check if we have any illustrations (either from context or local backup)
        if (!illustrations) {
          throw new Error("No illustrations available");
        }

        // Check if we have all 12 illustrations
        if (!Array.isArray(illustrations) || illustrations.length !== 12) {
          throw new Error("Invalid illustration data: Expected 12 illustrations");
        }

        // Validate each illustration is a valid data URI
        const invalidIllustrations = illustrations.filter(
          (uri) => !uri || typeof uri !== 'string' || !uri.startsWith('data:image')
        );

        if (invalidIllustrations.length > 0) {
          throw new Error(`Found ${invalidIllustrations.length} invalid illustration(s)`);
        }

        // Preload all images to ensure they're valid
        await Promise.all(
          illustrations.map((uri) => {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = () => reject(new Error('Failed to load image'));
              img.src = uri;
            });
          })
        );

        setIsLoading(false);
      } catch (err) {
        console.error('Error validating illustrations:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    validateIllustrations();
  }, [effectiveIllustrations]);

  // Create book pages data structure
  const bookPages = useMemo(() => {
    if (error || isLoading || !effectiveIllustrations) return [];
    return effectiveIllustrations.map((illustration, index) => ({
      illustration,
      text: `Page ${index + 1} of the story about ${
        storyDetails?.childName ?? "the character"
      }. This would contain actual story text.`,
      pageNumber: index + 1,
    }));
  }, [effectiveIllustrations, storyDetails, error, isLoading]);

  const totalPages = bookPages.length;

  // Calculate the total number of spreads needed
  // Spread 0: Blank | Page 1
  // Spread 1: Page 2 | Page 3
  // ...
  // Last Spread: Page N | Blank (if N is even) OR Page N-1 | Page N (if N is odd)
  const numSpreads = Math.ceil((totalPages + 1) / 2);

  // Determine which page data goes on the left and right for the current spread
  const getSpreadData = (spreadIndex) => {
    let leftPageData = null;
    let rightPageData = null;

    if (spreadIndex === 0) {
      // First spread: Blank on left, Page 1 on right
      leftPageData = { type: "blank" };
      rightPageData = totalPages >= 1 ? bookPages[0] : { type: "blank" };
    } else {
      // Subsequent spreads
      const leftPageNumber = spreadIndex * 2;
      const rightPageNumber = spreadIndex * 2 + 1;

      // Get left page data (index = page number - 1)
      if (leftPageNumber <= totalPages) {
        leftPageData = bookPages[leftPageNumber - 1];
      } else {
        leftPageData = { type: "blank" }; // Should not happen with correct numSpreads logic, but safe fallback
      }

      // Get right page data
      if (rightPageNumber <= totalPages) {
        rightPageData = bookPages[rightPageNumber - 1];
      } else {
        // If right page number exceeds total, it's a blank page on the right
        rightPageData = { type: "blank" };
      }
    }
    return { leftPageData, rightPageData };
  };

  const { leftPageData, rightPageData } = getSpreadData(currentSpreadIndex);

  const handlePrevPage = () => {
    setCurrentSpreadIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentSpreadIndex((prev) => Math.min(numSpreads - 1, prev + 1));
  };

  const handleFullscreen = () => {
    // Basic fullscreen toggle (consider browser Fullscreen API for true fullscreen)
    const elem = document.querySelector(".book-preview-container"); // Target the main container
    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        elem
          .requestFullscreen()
          .catch((err) =>
            console.error(
              `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
            )
          );
      } else if (elem.webkitRequestFullscreen) {
        /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE11 */
        elem.msRequestFullscreen();
      }
      // We use the Fullscreen API event listener to set state, not here directly
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement || !!document.webkitFullscreenElement
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange); // Safari

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  const handleFinalize = () => {
    onComplete({
      id: `book-${Date.now()}`,
      title: storyDetails?.title || `${storyDetails?.childName}'s Story`,
      pages: totalPages,
      dateCreated: new Date().toISOString(),
      // You might want to pass the structured bookPages here
      // bookData: bookPages
    });
  };

  // Generate text for the page indicator
  const pageIndicatorText = () => {
    if (totalPages === 0) return "No Pages";
    if (currentSpreadIndex === 0) {
      return `Cover / Page 1`;
    }
    const leftPageNum = currentSpreadIndex * 2;
    const rightPageNum = currentSpreadIndex * 2 + 1;

    if (rightPageNum <= totalPages) {
      return `Pages ${leftPageNum}-${rightPageNum}`;
    } else if (leftPageNum <= totalPages) {
      return `Page ${leftPageNum} / End`;
    } else {
      // Should ideally not be reached with correct numSpreads
      return `Spread ${currentSpreadIndex + 1} of ${numSpreads}`;
    }
  };

  // If there's an error but we have local backup, show warning instead of error
  if (error && localIllustrations) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800">
            Warning: Using locally saved illustrations. Some features may be limited.
          </p>
        </div>
        {/* Continue with normal render using localIllustrations */}
        {/* ... rest of the component render ... */}
      </div>
    );
  }

  // If there's an error, show error state
  if (error) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Book Preview</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">Error loading illustrations: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Book Preview</h2>
        <p className="text-gray-600">Loading your storybook...</p>
        <div className="w-10 h-10 border-4 border-t-sky-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mt-4"></div>
      </div>
    );
  }

  // If there are no illustrations/pages yet, show a placeholder
  if (totalPages === 0) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Book Preview</h2>
        <p className="text-gray-600">Generating illustrations...</p>
        <div className="w-10 h-10 border-4 border-t-sky-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mt-4"></div>
      </div>
    );
  }

  return (
    // Container adjusts padding based on fullscreen, uses flex column
    <div
      className={`book-preview-container flex flex-col h-full ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-sky-500 p-4 sm:p-8"
          : "p-4 md:p-8"
      }`}
    >
      {/* Header: Hidden in Fullscreen via direct style or class */}
      <div style={{ display: isFullscreen ? "none" : "block" }}>
        <h2 className="text-2xl font-bold mb-2 text-center">Book Preview</h2>
        <p className="text-center mb-6 text-gray-600 font-story">
          Preview your storybook page by page.
        </p>
      </div>

      {/* View mode toggle */}
      <div className="flex justify-center mb-6 gap-4">
        <button 
          onClick={() => setViewMode("book")} 
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${viewMode === "book" ? "bg-sky-500 text-white" : "bg-white-200"}`}
        >
          <Book className="w-4 h-4" />
          <span>Book View</span>
        </button>
        <button 
          onClick={() => setViewMode("gallery")} 
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${viewMode === "gallery" ? "bg-sky-500 text-white" : "bg-white-200"}`}
        >
          <Grid className="w-4 h-4" />
          <span>Gallery View</span>
        </button>
      </div>

      {/* Download all images button */}
      <div className="flex justify-center mb-6">
        <DownloadImagesButton illustrations={effectiveIllustrations} storyTitle={storyDetails?.title || `${storyDetails?.childName}'s Story`} />
      </div>

      {viewMode === "gallery" ? (
        <ImageGallery images={effectiveIllustrations} />
      ) : (
        <>
          {/* --- Book Viewer --- */}
          <div
            className={`book-viewer-outer-wrapper relative w-full mx-auto mb-6 ${
              isFullscreen
                ? "flex-grow flex items-center justify-center"
                : "max-w-5xl" // Wider max-width for spread
            }`}
          >
            {/* Inner wrapper for aspect ratio and centering the Prev/Next buttons */}
            <div className="book-viewer-inner-wrapper relative w-full">
              {/* The Book Spread */}
              <div className="book-spread flex items-stretch shadow-xl border border-gray-300 rounded-lg overflow-hidden">
                {/* Left Page Wrapper */}
                <div className="w-1/2 flex-shrink-0 relative">
                  <Page pageData={leftPageData} isLeft={true} />
                </div>

                {/* Spine - Give it a small width */}
                <div className="book-spine w-1 sm:w-2 bg-gray-300 flex-shrink-0"></div>

                {/* Right Page Wrapper */}
                <div className="w-1/2 flex-shrink-0 relative">
                  <Page pageData={rightPageData} isLeft={false} />
                </div>
              </div>

              {/* Prev/Next Buttons - Positioned absolutely relative to inner-wrapper */}
              {currentSpreadIndex > 0 && (
                <button
                  onClick={handlePrevPage}
                  className="absolute left-[-15px] sm:left-[-25px] md:left-[-40px] top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-20 transition-colors"
                  aria-label="Previous Spread"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
              )}

              {currentSpreadIndex < numSpreads - 1 && (
                <button
                  onClick={handleNextPage}
                  className="absolute right-[-15px] sm:right-[-25px] md:right-[-40px] top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-20 transition-colors"
                  aria-label="Next Spread"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* --- Navigation Controls --- */}
          <div className="book-navigation-controls flex justify-center items-center gap-2 sm:gap-4 mb-6 px-4 flex-shrink-0">
            <button
              onClick={() => setCurrentSpreadIndex(0)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentSpreadIndex === 0}
            >
              First
            </button>
            <button
              onClick={handlePrevPage}
              className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              disabled={currentSpreadIndex === 0}
              aria-label="Previous Spread"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500 hidden sm:inline" />
              <span>Prev</span>
            </button>

            {/* Page Indicator */}
            <div className="text-center text-sm text-gray-600 mx-2 whitespace-nowrap font-medium">
              {pageIndicatorText()}
            </div>

            <button
              onClick={handleNextPage}
              className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              disabled={currentSpreadIndex >= numSpreads - 1}
              aria-label="Next Spread"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 text-gray-500 hidden sm:inline" />
            </button>
            <button
              onClick={() => setCurrentSpreadIndex(numSpreads - 1)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentSpreadIndex === numSpreads - 1}
            >
              Last
            </button>
          </div>

          {/* --- Action Controls --- */}
          <div className="action-controls flex flex-col sm:flex-row justify-center items-center gap-4 mb-6 flex-shrink-0">
            <button
              onClick={handleFullscreen}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-rose-400 w-full sm:w-auto"
            >
              {isFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
            </button>
          </div>
        </>
      )}

      {/* --- Finalize Section --- */}
      <div
        className={`text-center flex-shrink-0 ${
          isFullscreen ? "mt-auto pt-4" : "mt-8"
        }`}
      >
        <button
          onClick={handleFinalize}
          className="px-6 py-3 bg-gradient-to-r from-sky-400 to-rose-400 text-white rounded-full hover:scale-105 transition-transform duration-200 shadow-md font-medium flex items-center gap-2 mx-auto"
        >
          <span>Finalize Book</span>
          <ChevronRight className="w-5 h-5" />
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Once finalized, you'll proceed to checkout
        </p>
      </div>
    </div>
  );
}
