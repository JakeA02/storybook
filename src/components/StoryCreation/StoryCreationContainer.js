import { useStory } from '../../context/StoryContext';
import CreationStart from './CreationStart';
import PhotoUpload from './PhotoUpload';
import ChildDescriptionForm from './ChildDescriptionForm';
import StoryDetailsForm from './StoryDetailsForm';
import StoryScriptGenerator from './StoryScriptGenerator';

export default function StoryCreationContainer({ onComplete }) {
  const { step, handleScriptComplete } = useStory();
  
  // Wrapper for handleScriptComplete to call onComplete with the result
  const handleCompleteWrapper = (scriptData) => {
    const result = handleScriptComplete(scriptData);
    onComplete(result);
  };
  
  // Render the appropriate component based on the current step
  const renderStep = () => {
    switch (step) {
      case 'start':
        return <CreationStart />;
      case 'upload':
        return <PhotoUpload />;
      case 'form':
        return <ChildDescriptionForm />;
      case 'details':
        return <StoryDetailsForm />;
      case 'script':
        return <StoryScriptGenerator onComplete={handleCompleteWrapper} />;
      default:
        return <CreationStart />;
    }
  };
  
  return (
    <div className="story-creation-container">
      {renderStep()}
    </div>
  );
} 