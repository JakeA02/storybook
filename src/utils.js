export const getStyleDescription = (style) => {
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

/**
 * Converts a base64 encoded string to a Blob object.
 * @param {string} base64 - The base64 encoded string (without the data URI prefix).
 * @param {string} mimeType - The MIME type of the data (e.g., 'image/png').
 * @returns {Blob} - The Blob object representing the decoded data.
 * @throws {Error} If the base64 string is invalid.
 */
export const base64ToBlob = (base64, mimeType) => {
  try {
    // Decode Base64 string
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    // Create and return Blob
    return new Blob([byteArray], { type: mimeType });
  } catch (e) {
    console.error("Error decoding base64 string:", e);
    throw new Error("Failed to decode base64 string."); // Re-throw for caller handling
  }
};
