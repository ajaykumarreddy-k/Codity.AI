import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK.
// WARNING: Using the API key directly in the frontend exposes it to users.
// For production applications, this logic should be moved to a secure backend endpoint
// (e.g., using the Express server you have installed) to keep your API key secure.
export const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
});

/**
 * A simple utility function to generate content using a specific model.
 * @param prompt The prompt to send to the model.
 * @param modelName The model to use (default: gemini-2.5-flash).
 * @returns The response text from the model.
 */
export const generateText = async (prompt: string, modelName: string = 'gemini-2.5-flash') => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error('Error generating content with Google AI:', error);
    throw error;
  }
};
