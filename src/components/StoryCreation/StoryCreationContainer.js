import { useState } from 'react';
import CreationStart from './CreationStart';
import PhotoUpload from './PhotoUpload';
import ChildDescriptionForm from './ChildDescriptionForm';
import StoryDetailsForm from './StoryDetailsForm';

export default function StoryCreationContainer({ onComplete }) {
  const [step, setStep] = useState('start');
  const [childData, setChildData] = useState(null);
  const [storyDetails, setStoryDetails] = useState(null);
  
  // Function to handle option selection in the first step
  const handleOptionSelect = (option) => {
    setStep(option);
  };
  
  // Function to handle going back to the previous step
  const handleBack = () => {
    if (step === 'upload' || step === 'form') {
      setStep('start');
    } else if (step === 'details') {
      // Go back to either upload or form depending on the previous step
      setStep(childData.type === 'photo' ? 'upload' : 'form');
    }
  };
  
  // Function to handle photo upload submission
  const handlePhotoSubmit = (photo) => {
    setChildData({ type: 'photo', data: photo });
    setStep('details');
  };
  
  // Function to handle form submission
  const handleFormSubmit = (formData) => {
    setChildData({ type: 'description', data: formData });
    setStep('details');
  };
  
  // Function to handle story details form submission
  const handleStoryDetailsSubmit = (details) => {
    setStoryDetails(details);
    // Combine all data and pass to the parent component
    onComplete({
      childData: childData,
      storyDetails: details
    });
  };
  
  // Render the appropriate component based on the current step
  const renderStep = () => {
    switch (step) {
      case 'start':
        return <CreationStart onSelectOption={handleOptionSelect} />;
      case 'upload':
        return <PhotoUpload onSubmit={handlePhotoSubmit} onBack={handleBack} />;
      case 'form':
        return <ChildDescriptionForm onSubmit={handleFormSubmit} onBack={handleBack} />;
      case 'details':
        return <StoryDetailsForm onSubmit={handleStoryDetailsSubmit} onBack={handleBack} />;
      default:
        return <CreationStart onSelectOption={handleOptionSelect} />;
    }
  };
  
  return (
    <div className="story-creation-container">
      {renderStep()}
    </div>
  );
} 