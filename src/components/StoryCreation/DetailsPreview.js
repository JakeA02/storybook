import { useState, useEffect } from "react";
import { useStory } from "../../context/StoryContext";

const DetailsPreview = () => {
  const { storyDetails, childData } = useStory();
  const [photoUrl, setPhotoUrl] = useState(null);
  const shouldRenderDescription =
    childData?.type === "description" &&
    childData.data &&
    Object.keys(childData.data).length > 0;

  useEffect(() => {
    let currentUrl = null;
    if (childData?.type === "photo" && childData.data instanceof File) {
      currentUrl = URL.createObjectURL(childData.data);
      setPhotoUrl(currentUrl);
    } else {
      setPhotoUrl(null);
    }
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [childData]);

  const formatLabel = (key) => {
    let formatted = key.charAt(0).toUpperCase() + key.slice(1);
    formatted = formatted.replace(/([A-Z])/g, " $1").trim();
    // Keep value formatting simple for display consistency
    return formatted;
  };

  const formatValue = (value) => {
    // Capitalize first letter of value if it's a string
    if (typeof value === "string") {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value; // Return non-strings as is
  };

  return (
    <div className="mb-6 px-8 py-6 border-l-[5px] border-secondary rounded-lg bg-amber-50 shadow-md font-story text-story">
      {/* Conditionally render Child Photo */}
      {childData?.type === "photo" && photoUrl && (
        // Use amber border for consistency within the card
        <div className="mb-4 pb-4 border-b border-amber-500">
          {/* Use text-story color */}
          <h3 className="text-lg font-semibold text-story mb-2">
            Child's Photo:
          </h3>
          <img
            src={photoUrl}
            alt="Uploaded child preview"
            className="max-w-xs w-full sm:w-48 h-auto rounded-md border border-amber-300 object-cover"
          />
        </div>
      )}

      {/* Conditionally render Child Description */}
      {shouldRenderDescription && (
        // Use amber border for consistency
        <div className="mb-4 pb-4 border-b border-amber-200">
          {/* Use text-story color */}
          <h3 className="text-lg font-semibold text-story mb-2">
            Child's Description:
          </h3>
          {/* Inherit text-story color from parent */}
          <div className="space-y-1 text-sm">
            {Object.entries(childData.data).map(([key, value]) => {
              if (!value) return null;
              // Format value for display (e.g., capitalize)
              const displayValue = formatValue(value);
              return (
                <p key={key}>
                  <strong>{formatLabel(key)}:</strong> {displayValue}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Render Story Details */}
      <div>
        {/* Use text-story color */}
        <h3 className="text-lg font-semibold text-story mb-3">
          Story Details:
        </h3>
        {storyDetails ? (
          // Inherit text-story color from parent
          <div className="space-y-2 text-sm">
            {storyDetails.childName && (
              <p>
                <strong>Child's Name:</strong> {storyDetails.childName}
              </p>
            )}
            {storyDetails.childLikes && (
              <p>
                <strong>Likes:</strong> {storyDetails.childLikes}
              </p>
            )}
            {storyDetails.lesson && (
              <p>
                <strong>Lesson(s):</strong> {storyDetails.lesson}
              </p>
            )}
            {storyDetails.cartoonStyle && (
              <p>
                <strong>Style:</strong>{" "}
                <span className="capitalize">{storyDetails.cartoonStyle}</span>
              </p>
            )}
          </div>
        ) : (
          // Use a slightly muted story color for placeholder
          <p className="text-sm text-amber-800/90">
            Story details not yet entered.
          </p>
        )}
      </div>
    </div>
  );
};

export default DetailsPreview;
