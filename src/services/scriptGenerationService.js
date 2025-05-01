/**
 * Service for generating story scripts using the Groq API
 */

/**
 * Generates a story script based on provided story details
 * @param {Object} storyDetails - Details about the story to be generated
 * @returns {Promise<string>} - The generated script content
 */
export const generateStoryScript = async (storyDetails) => {
  const prompt = createPrompt(storyDetails);
  if (process.env.NODE_ENV === "development") {
    return `The Princess's Secret

  Stanza 1  
  In a village where tales of princesses swirled,  
  Lived a boy named Johnny, with a heart full of cheer.  
  He dreamed of their castles, their flags all unfurled,  
  Wishing to meet them, his wish was sincere.  

  Stanza 2  
  One sunny morning, he set off to explore,  
  With his backpack packed and a map in his hand.  
  He dreamed of a princess who lived by the shore,  
  And he vowed to treat her with respect so grand.  

  Stanza 3  
  As he wandered through woods, he heard a soft song,  
  It led him to a glade where the flowers bloomed bright.  
  There stood a young princess, her smile felt so strong,  
  Johnny knew in that moment, he'd treat her just right.  

  Stanza 4  
  “Hello, dear princess!” he called with delight,  
  “I've come from afar, just to see you today.”  
  With kindness and grace, he spoke with pure light,  
  Respecting her spirit in every word he’d say.  

  Stanza 5  
  The princess smiled gently, her eyes full of glee,  
  “I've heard of your journey, so brave and so true.  
  But tell me, young Johnny, how will you agree,  
  To treat me with honor in all that you do?”  

  Stanza 6  
  Johnny thought for a moment, then answered with care,  
  “Respect is a treasure, it shines bright and clear.  
  I’ll listen and learn, with kindness to share,  
  For every princess deserves to feel dear.”  

  Stanza 7  
  They danced through the glade, under skies oh so blue,  
  With laughter and joy, they spun round and round.  
  Johnny learned that respect in friendship is true,  
  It builds a strong bond that’s forever profound.  

  Stanza 8  
  But then came a storm, dark clouds filled the sky,  
  The princess grew worried, her heart filled with fear.  
  “Don’t worry, dear friend, I’ll always stand by,  
  With respect in our hearts, we have nothing to fear!”  

  Stanza 9  
  Together they faced the wild winds and the rain,  
  Johnny held her hand, a promise he made.  
  “Through thick and through thin, we’ll share joy and pain,  
  With respect as our guide, we’ll never let shade.”  

  Stanza 10  
  When the storm finally passed, a rainbow appeared,  
  The princess was grateful, her smile shining bright.  
  “Thank you, dear Johnny, my heart is now cleared,  
  For respect has brought us together in light.”  

  Stanza 11  
  As the sun set low, casting gold on the glen,  
  Johnny hugged the princess, a bond they had formed.  
  “Respect is the magic that lives in all men,  
  It nurtures our hearts, keeps our friendships warmed.”  

  Stanza 12  
  So remember, dear friends, as you go on your way,  
  Respect is a treasure, it grows day by day.  
  With kindness and love, let your heart always sway,  
  And like Johnny and princess, let friendship hold sway.`;

  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert children's story writer who specializes in creating engaging, intriguing stories following specific structural requirements. Your task is to create a story script. Provide just the script and it's title, nothing more.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("API Error:", errorData);
    throw new Error(
      `API request failed with status ${response.status}: ${
        errorData.error?.message || "Unknown error"
      }`
    );
  }

  const data = await response.json();
  const generatedScript = data.choices?.[0]?.message?.content;

  if (!generatedScript) {
    throw new Error("No script content received from API.");
  }
  console.log(generatedScript);
  return generatedScript;
};

/**
 * Creates a prompt for the story generation based on story details
 * @param {Object} storyDetails - Details about the story
 * @returns {string} - The formatted prompt
 */
const createPrompt = (storyDetails) => {
  return `Create a children's story script about a character named ${
    storyDetails.childName
  } who loves ${storyDetails.childLikes}. ${
    storyDetails.lesson
      ? `The story should teach a lesson about ${storyDetails.lesson}.`
      : ""
  }.
  Only output the script and it's title, nothing more. Write exactly 12 stanzas, with each stanza containing 4 lines that follow an A/B/A/B rhyme scheme. At the top of the script, write the title of the story. An output example is below:
  The Magic of the Stars

  Stanza 1
  In a town where the stars sparkled bright,
  Lived a boy with dreams of the sky.
  He'd gaze at the moon, filled with pure delight,
  Wishing one day he could soar up high.
  
  Stanza 2
  ...`;
};
