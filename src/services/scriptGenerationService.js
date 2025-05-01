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
  
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
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
    }
  );

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
  Title: The Magic of the Stars

  Stanza 1
  In a town where the stars sparkled bright,
  Lived a boy with dreams of the sky.
  He'd gaze at the moon, filled with pure delight,
  Wishing one day he could soar up high.
  
  Stanza 2
  ...`;
}; 