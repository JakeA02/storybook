// Define step configuration for the entire application
export const STEPS = {
  START: "start",
  UPLOAD: "upload",
  FORM: "form",
  DETAILS: "details",
  SCRIPT: "script",
  ILLUSTRATION: "illustration",
  COMPILE: "compile",
  PREVIEW: "preview",
  CHECKOUT: "checkout"
};

// Storage key for saving state to localStorage
export const STORAGE_KEY = "storybook_session_data";

// Image keys for IndexedDB
export const IMAGE_KEYS = {
  CHARACTER: 'character_illustration',
  CHARACTER_MAP: 'character_map',
  PAGE_PREFIX: 'page_illustration_' 
}; 