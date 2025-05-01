import { useStory } from "../../context/StoryContext";
import Image from "next/image";
import { CloudUpload, Clipboard } from "lucide-react";

export default function CreationStart() {
  const { handleOptionSelect } = useStory();

  return (
    <div className="card-transition-container">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Your Story</h2>
      <p className="text-center mb-8 font-story">
        Choose how you'd like to create your child's character
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="option-card cursor-pointer hover:scale-105 transition-transform"
          onClick={() => handleOptionSelect("upload")}
        >
          <div className="card-inner p-6 bg-white rounded-xl shadow-md hover:shadow-lg border-2 border-sky-100">
            <h3 className="text-xl font-semibold mb-3 text-center text-primary flex items-center justify-center gap-2">
              Upload a Photo
              <CloudUpload className="w-6 h-6" />
            </h3>
            <p className="text-center text-gray-600 mb-4">
              Upload a photo of your child and we'll create a character based on
              their appearance
            </p>
          </div>
        </div>

        <div
          className="option-card cursor-pointer hover:scale-105 transition-transform"
          onClick={() => handleOptionSelect("form")}
        >
          <div className="card-inner p-6 bg-white rounded-xl shadow-md hover:shadow-lg border-2 border-rose-100">
            <h3 className="text-xl font-semibold mb-3 text-center text-secondary flex items-center justify-center gap-2">
              Describe Your Child
              <Clipboard className="w-6 h-6" />
            </h3>
            <p className="text-center text-gray-600 mb-4">
              Fill in a form with your child's characteristics and we'll create
              a character for them
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
