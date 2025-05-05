import { STEPS } from './constants';
import { 
  hasRequiredChildData, 
  hasRequiredStoryDetails, 
  hasRequiredScript, 
  hasRequiredIllustration, 
  hasRequiredBookIllustrations 
} from './validationHelpers';

// Safe transition between steps with data validation and history tracking
export const safelySetStep = (nextStep, setStep, setIsTransitioning, history, setHistory) => {
  setIsTransitioning(true);
  
  // Add to history if moving forward
  if (!history.includes(nextStep)) {
    setHistory(prevHistory => [...prevHistory, nextStep]);
  }
  
  // Add a small delay to ensure state has settled
  setTimeout(() => {
    setStep(nextStep);
    setIsTransitioning(false);
  }, 50);
};

// Handle moving back in the story creation flow
export const handleBack = (history, setHistory, setStep, setIsTransitioning) => {
  if (history.length > 1) {
    // Remove current step from history and go to previous
    setHistory(prevHistory => {
      const newHistory = [...prevHistory];
      newHistory.pop(); // Remove current step
      return newHistory;
    });
    
    const previousStep = history[history.length - 2];
    if (previousStep) {
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(previousStep);
        setIsTransitioning(false);
      }, 50);
    }
  }
};

// Function to go to a specific step (with validation)
export const goToStep = (
  targetStep, 
  childData, 
  storyDetails, 
  storyScript, 
  characterIllustration, 
  bookIllustrations, 
  compiledBook,
  safelySetStepFn
) => {
  // First check if we have the required data for this step
  const validateStepData = () => {
    if (targetStep === STEPS.DETAILS && !hasRequiredChildData(childData)) {
      return false;
    }
    if (targetStep === STEPS.SCRIPT && (!hasRequiredChildData(childData) || !hasRequiredStoryDetails(storyDetails))) {
      return false;
    }
    if (targetStep === STEPS.ILLUSTRATION && (!hasRequiredChildData(childData) || !hasRequiredStoryDetails(storyDetails) || !hasRequiredScript(storyScript))) {
      return false;
    }
    if (targetStep === STEPS.COMPILE && (!hasRequiredChildData(childData) || !hasRequiredStoryDetails(storyDetails) || !hasRequiredScript(storyScript) || !hasRequiredIllustration(characterIllustration))) {
      return false;
    }
    if (targetStep === STEPS.PREVIEW && !hasRequiredBookIllustrations(bookIllustrations)) {
      return false;
    }
    if (targetStep === STEPS.CHECKOUT && !compiledBook) {
      return false;
    }
    return true;
  };

  if (validateStepData()) {
    safelySetStepFn(targetStep);
    return true;
  }
  return false;
}; 