import { useState } from 'react';
import StoryStylesCard from './StoryStylesCard';

export default function StoryDetailsForm({ onSubmit, onBack }) {
  const [formData, setFormData] = useState({
    childName: '',
    lesson: '',
    childLikes: '',
    cartoonStyle: ''
  });
  const [showStylesCard, setShowStylesCard] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Check if required fields are filled
  const isFormValid = formData.childName && formData.childLikes && formData.cartoonStyle;

  return (
    <div className="card-transition-container">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Story Details
      </h2>
      <p className="text-center mb-6 font-story">
        Let's personalize your story
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="childName" className="block text-sm font-medium mb-1">
            Child's Name*
          </label>
          <input
            type="text"
            id="childName"
            name="childName"
            value={formData.childName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Enter your child's name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lesson" className="block text-sm font-medium mb-1">
            Lesson of the Story <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            id="lesson"
            name="lesson"
            value={formData.lesson}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="e.g., Friendship, Trust, Courage"
          />
        </div>

        <div className="form-group">
          <label htmlFor="childLikes" className="block text-sm font-medium mb-1">
            What Your Child Likes*
          </label>
          <textarea
            id="childLikes"
            name="childLikes"
            value={formData.childLikes}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="e.g., Dinosaurs, Space, Princesses, Animals"
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cartoonStyle" className="block text-sm font-medium mb-1">
            Cartoon Style*
          </label>
          <select
            id="cartoonStyle"
            name="cartoonStyle"
            value={formData.cartoonStyle}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select Cartoon Style</option>
            <option value="disney">Disney</option>
            <option value="seuss">Dr. Seuss</option>
            <option value="watercolor">Watercolor</option>
            <option value="modern-cartoon">Modern Cartoon</option>
            <option value="ghibli">Ghibli</option>
          </select>
          <button 
            type="button"
            className="text-primary underline text-sm mt-1 hover:text-primary-dark focus:outline-none"
            onClick={() => setShowStylesCard(!showStylesCard)}
          >
            {showStylesCard ? "Hide story styles" : "Show story styles"}
          </button>
        </div>

        {showStylesCard && <StoryStylesCard onClose={() => setShowStylesCard(false)} />}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={onBack}
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