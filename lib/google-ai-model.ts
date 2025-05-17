import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export function getAIChatSession(modelName: string) {
  const model = genAI.getGenerativeModel({ model: modelName });
  return model.startChat({ generationConfig, history: [] });
}

export async function getCurrentModel(): Promise<string> {
  try {
    const res = await fetch('/api/llm-model');
    const data = await res.json();
    return data.modelName || 'gemini-1.5-flash';
  } catch {
    return 'gemini-1.5-flash';
  }
}
