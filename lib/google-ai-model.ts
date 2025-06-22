import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const ai = new GoogleGenAI({
  apiKey,
});

const MODEL_NAME = "gemini-2.5-flash";

const config = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export async function getAIResponse(prompt: string): Promise<string> {
  const contents = [
    {
      role: "user" as const,
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model: MODEL_NAME,
    config,
    contents,
  });

  let fullResponse = "";
  for await (const chunk of response) {
    fullResponse += chunk.text || "";
  }

  return fullResponse;
}

export function getAIChatSession() {
  return ai.chats.create({
    model: MODEL_NAME,
    config,
  });
}

export async function getCurrentModel(): Promise<string> {
  return MODEL_NAME;
}
