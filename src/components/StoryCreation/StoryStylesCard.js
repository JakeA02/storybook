import React from "react";

export default function StoryStylesCard({ onClose }) {
  const styles = [
    { name: "Disney", id: "Disney" },
    { name: "Dr. Seuss", id: "Seuss" },
    { name: "Anime", id: "Anime" },
    { name: "Modern Cartoon", id: "Modern" },
    { name: "Ghibli", id: "Ghibli" },
  ];

  return (
    <div className="card-transition-container">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sky-500">Story Style Examples</h3>
        <button
          onClick={onClose}
          className="text-rose-400 hover:text-rose-500 text-xl"
          aria-label="Close styles card"
        >
          &times;
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {styles.map((style) => (
          <div key={style.id} className="style-example">
            <div className="bg-gradient-to-br from-sky-100 to-rose-100 aspect-square rounded-lg flex items-center justify-center border border-sky-200">
              <img
                src={`/images/${style.id}CartoonSoccer.png`}
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
      <p className="text-xs text-rose-400 mt-3 italic">
        Select your preferred style from the dropdown above.
      </p>
    </div>
  );
}
