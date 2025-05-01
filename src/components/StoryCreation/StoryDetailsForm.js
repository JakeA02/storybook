import { useState } from "react";
import { useStory } from "../../context/StoryContext";

export default function StoryDetailsForm() {
  const { handleBack, handleStoryDetailsSubmit, storyDetails } = useStory();
  const [formData, setFormData] = useState({
    childName: storyDetails?.childName || "",
    lesson: storyDetails?.lesson || "",
    childLikes: storyDetails?.childLikes || "",
    cartoonStyle: storyDetails?.cartoonStyle || "",
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStyleSelect = (styleId) => {
    setFormData((prev) => ({
      ...prev,
      cartoonStyle: styleId.toLowerCase(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleStoryDetailsSubmit(formData);
  };

  // Check if required fields are filled
  const isFormValid =
    formData.childName && formData.childLikes && formData.cartoonStyle;

  const styles = [
    { name: "Disney", id: "disney" },
    { name: "Dr. Seuss", id: "seuss" },
    { name: "Anime", id: "anime" },
    { name: "Modern Cartoon", id: "modern" },
    { name: "Ghibli", id: "ghibli" },
  ];

  return (
    <div className="card-transition-container">
      <h2 className="text-2xl font-bold mb-4 text-center">Story Details</h2>
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
            Lesson of the Story{" "}
            <span className="text-gray-400 text-xs">(optional)</span>
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
          <label
            htmlFor="childLikes"
            className="block text-sm font-medium mb-1"
          >
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
          <label className="block text-sm font-medium mb-2">
            Cartoon Style*
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {styles.map((style) => (
              <div
                key={style.id}
                className={`style-example cursor-pointer transition-all duration-200 rounded-lg ${
                  formData.cartoonStyle === style.id
                    ? 
                      "ring-2 ring-offset-1 ring-green-500 scale-105"
                    : "hover:scale-102"
                }`}
                onClick={() => handleStyleSelect(style.id)}
              >
                <div className="bg-gradient-to-br from-sky-100 to-rose-100 aspect-square rounded-lg flex items-center justify-center border border-sky-200">
                  <img
                    src={`/images/${
                      style.id.charAt(0).toUpperCase() + style.id.slice(1)
                    }CartoonSoccer.png`}
                    alt={style.name}
                    width={100}
                    height={100}
                    className="rounded-md"
                  />
                </div>
                <p className="text-center text-sm mt-1 font-story text-sky-600">
                  {style.name}
                </p>
              </div>
            ))}
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
