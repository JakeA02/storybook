import { useState } from 'react';
import CreationStart from './CreationStart';
import PhotoUpload from './PhotoUpload';
import ChildDescriptionForm from './ChildDescriptionForm';

export default function StoryCreationContainer({ onComplete }) {
  const [step, setStep] = useState('start');
  const [childData, setChildData] = useState(null);
  
  // Function to handle option selection in the first step
  const handleOptionSelect = (option) => {
    setStep(option);
  };
  
  // Function to handle going back to the previous step
  const handleBack = () => {
    if (step === 'upload' || step === 'form') {
      setStep('start');
    }
  };
  
  // Function to handle photo upload submission
  const handlePhotoSubmit = (photo) => {
    setChildData({ type: 'photo', data: photo });
    onComplete({ type: 'photo', data: photo });
  };
  
  // Function to handle form submission
  const handleFormSubmit = (formData) => {
    setChildData({ type: 'description', data: formData });
    onComplete({ type: 'description', data: formData });
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