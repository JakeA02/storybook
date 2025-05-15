/**
 * Service for generating story illustrations concurrently for all 12 pages
 * Handles character consistency and proper text formatting
 */

import {
  getStyleDescription,
  getTextExampleImage,
  base64ToBlob,
} from "../utils";
import { fakeBase64 } from "../utils/base64string";

/**
 * Creates prompt for story page illustration
 * @param {string} stanza - Text to include in the illustrationw
 * @param {Object} storyDetails - Story details including style preferences
 * @param {number} pageNumber - Page number (1-12)
 * @param {boolean} isFirstPage - Whether this is the first page being generated
 * @returns {string} - Prompt for the image generation
 */
const createStoryPagePrompt = (
  stanza,
  storyDetails,
  pageNumber,
  isFirstPage
) => {
  const style = storyDetails.cartoonStyle || "cartoon";
  const styleDesc = getStyleDescription(style);

  let prompt = `Create a ${style} style (${styleDesc}) storybook illustration for a children's story. 
  I've attached a character map reference with all the characters in a story`;

  if (isFirstPage) {
    prompt += `, and a reference image showing how text should be placed in the illustration. Do NOT include any elements from the reference image (like the dragon) as it's just for text placement guidance.`;
  } else {
    prompt += `, and the previous page's illustration to maintain consistency in style, character appearance, and text placement.`;
  }

  prompt += `\n\nInstead of including all the characters in the character map, only include characters that are explicity mentioned in the stanza.

  Scene description: Illustrate the following stanza for page ${pageNumber}: ###${stanza}###
  
  The scene and layout should be vibrant, clear/unhazy, engaging, and appropriate for a children's book. 
  
  The entire text from the stanza must be included in the illustration. The text should start at the top of the 
  image and blend into the scene, as you can see in the ${
    isFirstPage ? "reference image" : "previous page's illustration"
  }.`;

  return prompt;
};

/**
 * Handles the actual API request and response processing with retry logic
 * @param {string} url - The API endpoint URL
 * @param {object} options - The options for the fetch call (method, headers, body)
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} retryDelay - Delay between retries in milliseconds
 * @returns {Promise<string>} - The generated image as a base64 data URI
 */
const makeApiCall = async (url, options, maxRetries = 3, retryDelay = 3000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: { message: response.statusText } };
        }
        throw new Error(
          `API request failed with status ${response.status}: ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();

      if (!data || !data.data || !data.data[0] || !data.data[0].b64_json) {
        throw new Error(
          "No image data received from API or invalid structure."
        );
      }

      const image_base64 = data.data[0].b64_json;
      const dataUri = `data:image/png;base64,${image_base64}`;
      return dataUri;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw lastError;
};

/**
 * Generate a single story page illustration
 * @param {string} stanza - Text to include in the illustration
 * @param {string} characterImageUri - Base64 data URI of character illustration
 * @param {Object} storyDetails - Story details including style preferences
 * @param {number} pageNumber - Page number (1-12)
 * @param {string} previousPageUri - Base64 data URI of previous page's illustration (null for first page)
 * @returns {Promise<string>} - The generated image as a base64 data URI
 */
const generateSinglePageIllustration = async (
  stanza,
  characterMapUri,
  storyDetails,
  pageNumber,
  previousPageUri = null
) => {
  const isFirstPage = !previousPageUri;
  const prompt = createStoryPagePrompt(
    stanza,
    storyDetails,
    pageNumber,
    isFirstPage
  );
  const url = "https://api.openai.com/v1/images/edits";

  // Extract base64 data from the URI by removing the prefix
  let characterMapBase64 = null;
  if (
    characterMapUri &&
    typeof characterMapUri === "string" &&
    characterMapUri.includes("base64")
  ) {
    characterMapBase64 = characterMapUri.replace(
      /^data:image\/\w+;base64,/,
      ""
    );
  }

  const characterMapImage = base64ToBlob(characterMapBase64, "image/png");
  const formData = new FormData();

  // Add character map as first image
  formData.append("image[]", characterMapImage, "character_map.png");

  // For first page, add reference image. For subsequent pages, add previous page
  if (isFirstPage) {
    const imageFetch = await fetch(
      getTextExampleImage(storyDetails.cartoonStyle)
    );
    const referenceImageBlob = await imageFetch.blob();
    formData.append("image[]", referenceImageBlob, "reference_image.png");
  } else {
    const previousPageBase64 = previousPageUri.replace(
      /^data:image\/\w+;base64,/,
      ""
    );
    const previousPageImage = base64ToBlob(previousPageBase64, "image/png");
    formData.append("image[]", previousPageImage, "previous_page.png");
  }

  // Structure for the JSON payload
  const requestBody = {
    model: "gpt-image-1",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    quality: "high",
  };

  // Add JSON payload as a string
  Object.entries(requestBody).forEach(([key, value]) => {
    formData.append(key, value.toString());
  });

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    },
    body: formData,
  };

  return makeApiCall(url, options);
};

/**
 * Generate all 12 story page illustrations sequentially
 * @param {Array<string>} stanzas - Array of 12 text stanzas for the story
 * @param {string} characterImageUri - Base64 data URI of character illustration
 * @param {Object} storyDetails - Story details including style preferences
 * @param {Function} onProgressUpdate - Callback for progress updates (pageNumber, dataUri)
 * @param {Function} onError - Callback for error handling (pageNumber, error)
 * @returns {Promise<{results: Array<string|null>, failedPages: Array<{pageNumber: number, error: Error}>>}
 */
export const generateStoryIllustrations = async (
  stanzas,
  characterMapUri,
  storyDetails,
  onProgressUpdate = null,
  onError = null
) => {
  if (!stanzas || !Array.isArray(stanzas) || stanzas.length !== 12) {
    throw new Error("Invalid stanzas: must provide exactly 12 stanzas.");
  }

  if (!storyDetails || !storyDetails.childName) {
    throw new Error(
      "Invalid storyDetails: missing required field 'childName'."
    );
  }

  const results = new Array(12).fill(null);
  const failedPages = [];

  if (false) {
    // Create fake base64 image data URIs for testing
    const fakeImageUri = fakeBase64;
    const fakeImageUris = [];
    for (let i = 0; i < 12; i++) {
      fakeImageUris.push(fakeImageUri);
    }
    // Create array of 12 fake image URIs
    return {
      results: fakeImageUris,
      failedPages: [],
    };
  }

  // Process pages sequentially
  for (let pageIndex = 0; pageIndex < stanzas.length; pageIndex++) {
    const pageNumber = pageIndex + 1; // 1-indexed for user display

    try {
      // Get previous page's image URI (null for first page)
      const previousPageUri = pageIndex > 0 ? results[pageIndex - 1] : null;

      // Generate this page's illustration
      const dataUri = await generateSinglePageIllustration(
        stanzas[pageIndex],
        characterMapUri,
        storyDetails,
        pageNumber,
        previousPageUri
      );

      results[pageIndex] = dataUri;

      // Notify of progress if callback provided
      if (onProgressUpdate) {
        onProgressUpdate(pageNumber, dataUri);
      }

      // Add delay between requests to respect rate limits
      // Skip delay for the last page
      if (pageIndex < stanzas.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(`Error generating page ${pageNumber}:`, error);
      failedPages.push({ pageNumber, error });

      // Notify of error if callback provided
      if (onError) {
        onError(pageNumber, error);
      }

      // Continue with next page instead of stopping
      continue;
    }
  }

  // If all pages failed, throw an error
  if (failedPages.length === stanzas.length) {
    throw new Error("Failed to generate any story illustrations");
  }

  return { results, failedPages };
};

/**
 * Regenerate a specific page illustration
 * @param {string} stanza - Text stanza for the page
 * @param {string} characterImageUri - Base64 data URI of character illustration
 * @param {Object} storyDetails - Story details including style preferences
 * @param {number} pageNumber - Page number to regenerate (1-12)
 * @returns {Promise<string>} - The regenerated image as a base64 data URI
 */
export const regeneratePageIllustration = async (
  stanza,
  characterImageUri,
  storyDetails,
  pageNumber
) => {
  if (!stanza || typeof stanza !== "string") {
    throw new Error("Invalid stanza: must provide a text string.");
  }

  if (pageNumber < 1 || pageNumber > 12) {
    throw new Error("Invalid page number: must be between 1 and 12.");
  }

  return generateSinglePageIllustration(
    stanza,
    characterImageUri,
    storyDetails,
    pageNumber
  );
};
