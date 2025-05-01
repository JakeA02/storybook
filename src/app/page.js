"use client";

import { useState } from "react";
import Image from "next/image";
import StoryCreationContainer from "../components/StoryCreation/StoryCreationContainer";
import { StoryProvider } from "../context/StoryContext";
import "./globals.css";

export default function Home() {
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [storyData, setStoryData] = useState(null);

  const handleStartStoryCreation = () => {
    setIsCreatingStory(true);
  };

  const handleStoryCreationComplete = (data) => {
    setStoryData(data);
  };

  return (
    <div className="min-h-screen bg-sky-400 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 animate-float-slow">
        <Image
          src="/images/cloud.svg"
          width={80}
          height={40}
          alt="Decorative cloud"
        />
      </div>
      <div className="absolute bottom-10 right-16 animate-float">
        <Image
          src="/images/star.svg"
          width={50}
          height={50}
          alt="Decorative star"
        />
      </div>
      <div className="absolute top-1/4 right-10 animate-float-delay">
        <Image
          src="/images/moon.svg"
          width={60}
          height={60}
          alt="Decorative moon"
        />
      </div>

      {!isCreatingStory ? (
        <main className="card max-w-3xl w-full text-center z-10 border-dashed border-2 border-rose-400">
          <div className="mb-6">
            <Image
              src="/images/book-logo.svg"
              width={120}
              height={120}
              alt="Storybook logo"
              className="mx-auto"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-sky-400">
            Once Upon a Time...
          </h1>
          <p className="text-xl mb-6 font-story">
            Create magical, personalized storybooks that will delight!
          </p>
          <p className="text-md mb-8 text-gray-500 italic">
            Turn your child into the hero of their very own story in minutes.
          </p>
          <div className="flex justify-center">
            <button
              className="bg-gradient-to-r from-sky-400 to-rose-400 text-white px-6 py-3 rounded-full hover:scale-105 transition-transform duration-200 shadow-md font-medium"
              onClick={handleStartStoryCreation}
            >
              Begin Your Story
            </button>
          </div>
        </main>
      ) : (
        <StoryProvider>
          <StoryCreationContainer onComplete={handleStoryCreationComplete} />
        </StoryProvider>
      )}
    </div>
  );
}
