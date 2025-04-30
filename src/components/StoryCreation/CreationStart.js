import Image from "next/image";

export default function CreationStart({ onSelectOption }) {
  return (
    <div className="card-transition-container">
      <h2 className="text-2xl font-bold mb-6 text-center">Tell Us About Your Child</h2>
      <p className="text-center mb-8 font-story">
        Choose how you'd like to personalize your story
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="option-card" 
          onClick={() => onSelectOption('upload')}
        >
          <div className="mb-4 text-center">
            <Image src="/images/upload-icon.svg" width={64} height={64} alt="Upload" className="mx-auto" />
          </div>
          <h3 className="text-xl font-bold mb-2">Upload a Photo</h3>
          <p className="text-sm text-muted">
            Upload a photo of your child and we'll create a character that looks like them
          </p>
        </div>
        
        <div 
          className="option-card" 
          onClick={() => onSelectOption('form')}
        >
          <div className="mb-4 text-center">
            <Image src="/images/form-icon.svg" width={64} height={64} alt="Form" className="mx-auto" />
          </div>
          <h3 className="text-xl font-bold mb-2">Describe Your Child</h3>
          <p className="text-sm text-muted">
            Tell us about your child's appearance and we'll create a character based on your description
          </p>
        </div>
      </div>
    </div>
  );
} 