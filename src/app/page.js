"use client";

import { useState } from "react";
import Image from "next/image";
import StoryCreationContainer from "../components/StoryCreation/StoryCreationContainer";
import { StoryProvider } from "../context/index";
import "./globals.css";

export default function Home() {
  const [isCreatingStory, setIsCreatingStory] = useState(false);

  const handleStartStoryCreation = () => {
    setIsCreatingStory(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-200 via-sky-400 to-indigo-400 flex flex-col items-center justify-center p-8 relative overflow-hidden">
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
            Create magical storybooks with your child as the main character!
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
          <StoryCreationContainer />
        </StoryProvider>
      )}
    </div>
  );
}
