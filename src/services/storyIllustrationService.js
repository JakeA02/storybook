/**
 * Service for generating story illustrations concurrently for all 12 pages
 * Handles character consistency and proper text formatting
 */

import {
  getStyleDescription,
  getTextExampleImage,
  base64ToBlob,
} from "../utils";

/**
 * Creates prompt for story page illustration
 * @param {string} stanza - Text to include in the illustrationw
 * @param {Object} storyDetails - Story details including style preferences
 * @param {number} pageNumber - Page number (1-12)
 * @returns {string} - Prompt for the image generation
 */
const createStoryPagePrompt = (stanza, storyDetails, pageNumber) => {
  const style = storyDetails.cartoonStyle || "cartoon";
  const styleDesc = getStyleDescription(style);
  const storyTheme = storyDetails.storyTheme || "adventure";

  return `Create a ${style} style (${styleDesc}) storybook illustration for a children's story. 
  I've attached a character map reference with all the characters in a story, and your stanza is only one page of the story. 

  Instead of including all the characters in the character map, only include characters that are explicity mentioned in the stanza. 

  Scene description: Illustrate the following stanza for page ${pageNumber}: ###${stanza}###
  
  The scene and layout should be colorful, engaging, and appropriate for a children's book about ${storyTheme}.
  
  The entire text from the stanza must be included in the illustration. The text should start at the top of the 
  image and blend into the scene. I've attached a reference image from another cartoon as an example of how the text should be placed.
  
  Make sure the all the characters are clearly recognizable and consistent with the reference image.`;
};

/**
 * Handles the actual API request and response processing
 * @param {string} url - The API endpoint URL
 * @param {object} options - The options for the fetch call (method, headers, body)
 * @returns {Promise<string>} - The generated image as a base64 data URI
 */
const makeApiCall = async (url, options) => {
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
 * Generate a single story page illustration
 * @param {string} stanza - Text to include in the illustration
 * @param {string} characterImageUri - Base64 data URI of character illustration
 * @param {Object} storyDetails - Story details including style preferences
 * @param {number} pageNumber - Page number (1-12)
 * @returns {Promise<string>} - The generated image as a base64 data URI
 */
const generateSinglePageIllustration = async (
  stanza,
  characterMapUri,
  storyDetails,
  pageNumber
) => {
  const prompt = createStoryPagePrompt(stanza, storyDetails, pageNumber);
  console.log("prompt", prompt);
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
  const imageFetch = await fetch(getTextExampleImage(storyDetails.cartoonStyle));
  const referenceImageBlob = await imageFetch.blob();
  
  // Structure for the JSON payload
  const requestBody = {
    model: "gpt-image-1",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    quality: "high"
  };
  
  // Add files to formData using array syntax
  formData.append("image[]", characterMapImage, "character_map.png");
  formData.append("image[]", referenceImageBlob, "reference_image.png");
  
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
 * Generate all 12 story page illustrations concurrently
 * @param {Array<string>} stanzas - Array of 12 text stanzas for the story
 * @param {string} characterImageUri - Base64 data URI of character illustration
 * @param {Object} storyDetails - Story details including style preferences
 * @param {Function} onProgressUpdate - Callback for progress updates (pageNumber, dataUri)
 * @returns {Promise<Array<string>>} - Array of 12 generated images as base64 data URIs
 */
export const generateStoryIllustrations = async (
  stanzas,
  characterMapUri,
  storyDetails,
  onProgressUpdate = null
) => {
  if (!stanzas || !Array.isArray(stanzas) || stanzas.length !== 12) {
    throw new Error("Invalid stanzas: must provide exactly 12 stanzas.");
  }

  if (!storyDetails || !storyDetails.childName) {
    throw new Error(
      "Invalid storyDetails: missing required field 'childName'."
    );
  }

  // Use concurrency limit to prevent overwhelming the API
  const concurrencyLimit = 3; // Process 3 requests at a time
  const results = new Array(12).fill(null);
  let activeTasks = 0;
  let nextPageToProcess = 0;

  // Create a promise that will resolve when all pages are generated
  return new Promise((resolve, reject) => {
    // Function to start a new task when possible
    const startNextTask = () => {
      if (nextPageToProcess >= stanzas.length) {
        // No more tasks to start
        return;
      }

      const pageIndex = nextPageToProcess;
      const pageNumber = pageIndex + 1; // 1-indexed for user display
      nextPageToProcess++;
      activeTasks++;

      // Generate this page's illustration
      generateSinglePageIllustration(
        stanzas[pageIndex],
        characterMapUri,
        storyDetails,
        pageNumber
      )
        .then((dataUri) => {
          results[pageIndex] = dataUri;

          // Notify of progress if callback provided
          if (onProgressUpdate) {
            onProgressUpdate(pageNumber, dataUri);
          }

          // Log progress
          console.log(`Generated illustration for page ${pageNumber}`);

          // This task is done
          activeTasks--;

          // Check if we're all done
          if (activeTasks === 0 && nextPageToProcess >= stanzas.length) {
            resolve(results);
          } else {
            if (nextPageToProcess === 6) {
              setTimeout(() => {
                startNextTask();
              }, 60000);
            } else {
              // Start another task if available
              startNextTask();
            }
          }
        })
        .catch((error) => {
          console.error(`Error generating page ${pageNumber}:`, error);
          reject(error);
        });
    };

    // Start initial batch of tasks up to concurrency limit
    for (let i = 0; i < Math.min(concurrencyLimit, stanzas.length); i++) {
      startNextTask();
    }
  });
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
