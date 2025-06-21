import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const ai = new GoogleGenAI({
  apiKey,
});

const MODEL_NAME = "gemini-2.5-flash-preview-04-17";

const config = {
  thinkingConfig: {
    thinkingBudget: -1,
  },
  responseMimeType: "application/json",
  systemInstruction: [
    {
      text: `{
  "safetySettings": [],
  "generationConfig": {
      "temperature": 1,
      "topP": 0.95,
      "topK": 64,
      "maxOutputTokens": 8192,
      "responseMimeType": "application/json"
  }
}`,
    },
  ],
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
  return {
    sendMessage: async (prompt: string) => {
      const responseText = await getAIResponse(prompt);
      return {
        response: {
          text: () => responseText,
        },
      };
    },
  };
}

export async function getCurrentModel(): Promise<string> {
  return MODEL_NAME;
}
