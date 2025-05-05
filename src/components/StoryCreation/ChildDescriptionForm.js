import { useState } from "react";
import { useStory } from "../../context/index";

export default function ChildDescriptionForm() {
  const { handleBack, handleFormSubmit, childData } = useStory();
  const [formData, setFormData] = useState({
    gender: childData?.data?.gender || "",
    age: childData?.data?.age || "",
    hairColor: childData?.data?.hairColor || "",
    hairStyle: childData?.data?.hairStyle || "",
    eyeColor: childData?.data?.eyeColor || "",
    skinTone: childData?.data?.skinTone || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFormSubmit(formData);
  };

  // Check if required fields are filled
  const isFormValid =
    formData.gender &&
    formData.hairColor &&
    formData.eyeColor &&
    formData.skinTone;

  return (
    <div className="card-transition-container">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Describe Your Child
      </h2>
      <p className="text-center mb-6 font-story">
        Tell us about your child so we can create a personalized character
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="gender" className="block text-sm font-medium mb-1">
              Gender*
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select Gender</option>
              <option value="boy">Boy</option>
              <option value="girl">Girl</option>
              <option value="nonbinary">Non-binary</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="age" className="block text-sm font-medium mb-1">
              Age
            </label>
            <select
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Age</option>
              <option value="toddler">Toddler (1-3)</option>
              <option value="preschool">Preschool (3-5)</option>
              <option value="child">Child (6-9)</option>
              <option value="preteen">Preteen (10-12)</option>
            </select>
          </div>

          <div className="form-group">
            <label
              htmlFor="hairColor"
              className="block text-sm font-medium mb-1"
            >
              Hair Color*
            </label>
            <select
              id="hairColor"
              name="hairColor"
              value={formData.hairColor}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select Hair Color</option>
              <option value="blonde">Blonde</option>
              <option value="brown">Brown</option>
              <option value="black">Black</option>
              <option value="red">Red/Auburn</option>
              <option value="white">White</option>
              <option value="gray">Gray</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className="form-group">
            <label
              htmlFor="hairStyle"
              className="block text-sm font-medium mb-1"
            >
              Hair Style
            </label>
            <select
              id="hairStyle"
              name="hairStyle"
              value={formData.hairStyle}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Hair Style</option>
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
              <option value="curly">Curly</option>
              <option value="wavy">Wavy</option>
              <option value="straight">Straight</option>
            </select>
          </div>

          <div className="form-group">
            <label
              htmlFor="eyeColor"
              className="block text-sm font-medium mb-1"
            >
              Eye Color*
            </label>
            <select
              id="eyeColor"
              name="eyeColor"
              value={formData.eyeColor}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select Eye Color</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="brown">Brown</option>
              <option value="hazel">Hazel</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label
              htmlFor="skinTone"
              className="block text-sm font-medium mb-1"
            >
              Skin Tone*
            </label>
            <select
              id="skinTone"
              name="skinTone"
              value={formData.skinTone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select Skin Tone</option>
              <option value="fair">Fair</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="olive">Olive</option>
              <option value="tan">Tan</option>
              <option value="deep">Deep</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!isFormValid}
            className={`px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white transition-transform duration-200 shadow-md font-medium ${
              !isFormValid ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
