import { IMAGE_KEYS } from "./constants";
import { storeImage } from "../utils";
import { handleStorageQuotaError } from "./storageHelpers";

// Save user photo to IndexedDB
export const saveUserPhoto = async (photoFile, setStorageError) => {
  if (photoFile) {
    try {
      await storeImage(IMAGE_KEYS.USER_PHOTO, photoFile);
    } catch (error) {
      console.error("Failed to save user photo:", error);

      // Handle quota exceeded errors
      if (
        error.name === "QuotaExceededError" ||
        error.message.includes("quota") ||
        error.message.includes("storage")
      ) {
        await handleStorageQuotaError(error, IMAGE_KEYS.USER_PHOTO, photoFile);
        setStorageError(true);
      }
    }
  }
};

// Save character illustration to IndexedDB
export const saveCharacterIllustration = async (
  characterIllustration,
  setStorageError
) => {
  if (characterIllustration) {
    try {
      await storeImage(IMAGE_KEYS.CHARACTER, characterIllustration);
    } catch (error) {
      console.error("Failed to save character illustration:", error);

      // Handle quota exceeded errors
      if (
        error.name === "QuotaExceededError" ||
        error.message.includes("quota") ||
        error.message.includes("storage")
      ) {
        await handleStorageQuotaError(
          error,
          IMAGE_KEYS.CHARACTER,
          characterIllustration
        );
        setStorageError(true);
      }
    }
  }
};

// Save character map to IndexedDB
export const saveCharacterMap = async (characterMap, setStorageError) => {
  if (characterMap) {
    try {
      await storeImage(IMAGE_KEYS.CHARACTER_MAP, characterMap);
    } catch (error) {
      console.error("Failed to save character map:", error);

      // Handle quota exceeded errors
      if (
        error.name === "QuotaExceededError" ||
        error.message.includes("quota") ||
        error.message.includes("storage")
      ) {
        await handleStorageQuotaError(
          error,
          IMAGE_KEYS.CHARACTER_MAP,
          characterMap
        );
        setStorageError(true);
      }
    }
  }
};

// Save book illustrations to IndexedDB
export const saveBookIllustrations = async (
  bookIllustrations,
  setStorageError
) => {
  if (bookIllustrations && bookIllustrations.length > 0) {
    try {
      // Save each illustration with a unique key
      for (let i = 0; i < bookIllustrations.length; i++) {
        if (bookIllustrations[i]) {
          const key = `${IMAGE_KEYS.PAGE_PREFIX}${i + 1}`;
          try {
            await storeImage(key, bookIllustrations[i]);
          } catch (error) {
            console.error(`Failed to save illustration ${i + 1}:`, error);

            // Handle quota exceeded errors
            if (
              error.name === "QuotaExceededError" ||
              error.message.includes("quota") ||
              error.message.includes("storage")
            ) {
              await handleStorageQuotaError(error, key, bookIllustrations[i]);
              setStorageError(true);
              // After first storage error, break the loop to avoid multiple alerts
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to save book illustrations:", error);

      // Handle quota exceeded errors
      if (
        error.name === "QuotaExceededError" ||
        error.message.includes("quota") ||
        error.message.includes("storage")
      ) {
        setStorageError(true);
      }
    }
  }
};
