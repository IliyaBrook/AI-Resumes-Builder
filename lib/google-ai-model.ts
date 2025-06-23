import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const ai = new GoogleGenAI({
  apiKey,
});

const MODEL_NAME = 'gemini-2.5-flash';

const config = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

export function getAIChatSession() {
  return ai.chats.create({
    model: MODEL_NAME,
    config,
  });
}
