
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserProfile, RitualStep } from "../types";

export async function generateRitualFlow(ritualTitle: string, user: UserProfile): Promise<RitualStep[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const date = new Date();
  
  const prompt = `Generate a detailed step-by-step Vedic ritual flow for "${ritualTitle}". 
  The user (Yajamana) is ${user.name} of ${user.gotra} gotra. 
  Current Date: ${date.toDateString()}. 
  Current Time: ${date.toLocaleTimeString()}.
  Location: ${user.location?.city || 'Unknown'}.
  
  IMPORTANT: 
  1. The first step MUST be "Sankalpam". 
  2. The Sankalpam text must be a meaningful recitation in a mix of Sanskrit and context (date, time, location, name, gotra).
  3. Respond strictly with a JSON array of objects.
  4. Each object must have: "id" (number), "title" (string), "instruction" (string), "mantra" (string), "isSankalpam" (boolean).
  5. Use Devanagari script for mantras where appropriate.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Removed strict responseSchema to avoid INVALID_ARGUMENT issues in preview models
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini.");
    }

    const cleanText = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(cleanText);
  } catch (error: any) {
    console.error("Failed to generate ritual flow:", error);
    if (error?.message?.includes("INVALID_ARGUMENT")) {
      throw new Error("The ritual generator encountered a configuration error. Please try again.");
    }
    throw error;
  }
}

export async function getPanditAudio(text: string, voiceName: string = 'Kore'): Promise<string | undefined> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Please recite this: ${text}` }] }],
      config: {
        systemInstruction: "You are a traditional Vedic Pandit. Recite mantras and instructions with proper Vedic intonation, devotion, and clarity.",
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const candidates = response.candidates || [];
    if (candidates.length === 0) {
      console.error("TTS: No candidates returned.");
      return undefined;
    }

    const parts = candidates[0].content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }

    console.warn("TTS: Candidate returned but no audio data found. Check safety filters or finish reason.");
    return undefined;
  } catch (error) {
    console.error("TTS API call failed:", error);
    return undefined;
  }
}
