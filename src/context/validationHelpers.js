import { STEPS } from './constants';

// Data validation helpers
export const hasRequiredChildData = (childData) => 
  childData && childData.type && childData.data;

export const hasRequiredStoryDetails = (storyDetails) => 
  storyDetails && storyDetails.childName;

export const hasRequiredScript = (storyScript) => !!storyScript;

export const hasRequiredIllustration = (characterIllustration) => !!characterIllustration;

export const hasRequiredBookIllustrations = (bookIllustrations) => 
  Array.isArray(bookIllustrations) && bookIllustrations.length === 12;

export const validateStepData = (
  step, 
  childData, 
  storyDetails, 
  storyScript,
  characterIllustration,
  bookIllustrations,
  compiledBook
) => {
  if (step === STEPS.DETAILS && !hasRequiredChildData(childData)) {
    return STEPS.START;
  }
  if (step === STEPS.SCRIPT && (!hasRequiredChildData(childData) || !hasRequiredStoryDetails(storyDetails))) {
    return STEPS.DETAILS;
  }
  if (step === STEPS.ILLUSTRATION && (!hasRequiredChildData(childData) || !hasRequiredStoryDetails(storyDetails) || !hasRequiredScript(storyScript))) {
    return STEPS.SCRIPT;
  }
  if (step === STEPS.COMPILE && (!hasRequiredChildData(childData) || !hasRequiredStoryDetails(storyDetails) || !hasRequiredScript(storyScript) || !hasRequiredIllustration(characterIllustration))) {
    return STEPS.ILLUSTRATION;
  }
  if (step === STEPS.PREVIEW && !hasRequiredBookIllustrations(bookIllustrations)) {
    return STEPS.COMPILE;
  }
  if (step === STEPS.CHECKOUT && !compiledBook) {
    return STEPS.PREVIEW;
  }
  return null;
}; 