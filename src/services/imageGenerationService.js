const createPrompt = (childData, storyDetails, type) => {
  const characterName = storyDetails.childName;
  const style = storyDetails.cartoonStyle || "cartoon";
  const styleDesc = getStyleDescription(style);

  if (type === "photo") {
    // Prompt for editing an existing image
    return `Use the provided image to represent a friendly, approachable cartoon character in a ${style} style (${styleDesc}). Maintain key features but adapt to the cartoon style.`;
  } else {
    // Prompt for generating an image from description
    const description = childData.data || {};
    return `Create a friendly, approachable cartoon character with the following features: ${
      description.hairColor || "unspecified"
    } hair, ${description.eyeColor || "unspecified"} eyes, ${
      description.skinTone || "unspecified"
    } skin tone, ${description.age || "unspecified"} years old, ${
      description.gender || "unspecified"
    }. Style: ${style} (${styleDesc}). The character should be smiling.`;
  }
};

// Helper function to get style descriptions (keep as is)
const getStyleDescription = (style) => {
  switch (style) {
    case "disney":
      return "Soft rounded characters, big expressive eyes, warm pastel colors, subtle shading. Like classic Bambi or Cinderella illustrations. Wholesome, magical, and heartwarming.";
    case "seuss":
      return "Wobbly ink lines, exaggerated features, tall skinny or short round characters, unusual architecture, bright primary colors, and playful surreal landscapes. Whimsical and quirky.";
    case "anime":
      return "Big sparkling eyes, soft blush cheeks, simple linework, bright pastel tones, and expressive facial reactions. Cute proportions like chibi or early Pokémon style";
    case "modern":
      return "Simple vector shapes, bold outlines, bright solid colors, minimal shadows. Inspired by shows like Peppa Pig or Cocomelon. Fun, clear, and toddler-friendly.";
    case "ghibli":
      return "Hand-painted look with soft lighting, expressive faces, detailed nature backgrounds, and gentle colors. Magical realism with a warm, peaceful feeling.";
    default:
      return "General cartoon style, friendly and appealing.";
  }
};

// --- API Call Functions ---

/**
 * Handles the actual API request and response processing
 * @param {string} url - The API endpoint URL
 * @param {object} options - The options for the fetch call (method, headers, body)
 * @returns {Promise<string>} - The generated image as a base64 data URI
 */
const makeApiCall = async (url, options) => {
  console.log("Making API call to:", url);
  const response = await fetch(url, options);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: { message: response.statusText } };
    }
    console.error("API Error:", errorData);
    throw new Error(
      `API request failed to ${url} with status ${response.status}: ${
        errorData.error?.message || "Unknown error"
      }`
    );
  }

  const data = await response.json();

  if (!data || !data.data || !data.data[0] || !data.data[0].b64_json) {
    console.error("Invalid API response structure:", data);
    throw new Error("No image data received from API or invalid structure.");
  }

  const image_base64 = data.data[0].b64_json;
  const dataUri = `data:image/png;base64,${image_base64}`;
  return dataUri;
};

/**
 * Generates an illustration from a text description
 * @param {Object} childData - Must contain childData.data with description fields
 * @param {Object} storyDetails - Story details including style preferences
 * @returns {Promise<string>} - The generated image as a base64 data URI
 */
const generateIllustrationFromDescription = async (childData, storyDetails) => {
  const prompt = createPrompt(childData, storyDetails, "generate");
  const url = "https://api.openai.com/v1/images/generations";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1", // Standard model for generation
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "low",
      background: "transparent",
    }),
  };
  return makeApiCall(url, options);
};

/**
 * Edits an illustration based on an uploaded photo
 * @param {Object} childData - Must contain childData.data as a File object
 * @param {Object} storyDetails - Story details including style preferences
 * @returns {Promise<string>} - The edited image as a base64 data URI
 */
const editIllustrationFromPhoto = async (childData, storyDetails) => {
  // Ensure childData.data is a File object (or similar blob)
  if (!(childData.data instanceof Blob)) {
    throw new Error(
      "childData.data must be a File or Blob object for photo edits."
    );
  }

  const prompt = createPrompt(childData, storyDetails, "photo");
  const url = "https://api.openai.com/v1/images/edits";

  // Use FormData for multipart request as required by the edits endpoint
  const formData = new FormData();
  formData.append("image", childData.data); // Append the actual file/blob
  formData.append("prompt", prompt);
  formData.append("model", "gpt-image-1"); // Standard model for edits
  formData.append("n", "1");
  formData.append("size", "1024x1024");

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    },
    body: formData,
  };

  return makeApiCall(url, options);
};

// --- Main Exported Function ---

/**
 * Generates or edits a character illustration based on provided child data (photo or description)
 * @param {Object} childData - Data about the child (type: 'photo' or 'description', data: File object or description object)
 * @param {Object} storyDetails - Details about the story and style preferences
 * @returns {Promise<string>} - The generated/edited image as a base64 data URI
 */
export const generateCharacterIllustration = async (
  childData,
  storyDetails
) => {
  if (!childData || !childData.type) {
    throw new Error("Invalid childData: 'type' field is missing.");
  }

  if (childData.type === "photo") {
    console.log("Calling editIllustrationFromPhoto");
    return editIllustrationFromPhoto(childData, storyDetails);
  } else if (childData.type === "description") {
    console.log("Calling generateIllustrationFromDescription");
    return generateIllustrationFromDescription(childData, storyDetails);
  } else {
    throw new Error(`Unsupported childData type: ${childData.type}`);
  }
};
