
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile, RitualStep } from "../types";

export async function generateRitualFlow(ritualTitle: string, user: UserProfile): Promise<RitualStep[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const date = new Date();
  const prompt = `Generate a detailed step-by-step Vedic ritual flow for "${ritualTitle}". 
  The user is ${user.name} of ${user.gotra} gotra. 
  Current Date: ${date.toDateString()}. 
  Current Time: ${date.toLocaleTimeString()}.
  Location: ${user.location?.city || 'Unknown'}.
  
  IMPORTANT: The first step MUST be "Sankalpam". 
  The Sankalpam text must be in a mix of Sanskrit and the user's context (date, time, location, name, gotra).
  For other steps, provide the name, instructions for the user (what to offer), and the specific Mantra in Sanskrit (Devanagari or transliterated).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              title: { type: Type.STRING },
              instruction: { type: Type.STRING },
              mantra: { type: Type.STRING },
              isSankalpam: { type: Type.BOOLEAN }
            },
            required: ["id", "title", "instruction", "mantra"]
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from ritual flow generation");
    }

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Failed to generate ritual flow:", error);
    throw error;
  }
}

export async function getPanditAudio(text: string, voiceName: string = 'Kore'): Promise<string | undefined> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Recite this mantra or ritual instruction as a traditional Vedic Pandit with deep, resonant, and clear Sanskrit pronunciation: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }

    console.warn("No audio data found in any part of the Gemini TTS response.");
    return undefined;
  } catch (error) {
    console.error("TTS generation failed:", error);
    return undefined;
  }
}
