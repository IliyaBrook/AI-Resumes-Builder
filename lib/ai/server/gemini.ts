import { GoogleGenAI } from '@google/genai';
import type { AIChatSession, ProviderFactory, SendMessageInput, SendMessageWithFileInput } from './types';

const MODEL_NAME = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

const baseConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
} as const;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenAI({ apiKey });
}

export const geminiFactory: ProviderFactory = {
  createChat(): AIChatSession {
    return {
      async sendMessage({ message, systemPrompt }: SendMessageInput) {
        const ai = getClient();
        const result = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: [{ role: 'user', parts: [{ text: message }] }],
          config: {
            ...baseConfig,
            responseMimeType: 'text/plain',
            ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
          },
        });
        return { text: result.text ?? '' };
      },

      async sendMessageWithFile({ message, systemPrompt, file }: SendMessageWithFileInput) {
        const ai = getClient();
        const base64 = file.data.toString('base64');
        const result = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            {
              role: 'user',
              parts: [{ inlineData: { mimeType: file.mimeType, data: base64 } }, { text: message }],
            },
          ],
          config: {
            ...baseConfig,
            responseMimeType: 'text/plain',
            ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
          },
        });
        return { text: result.text ?? '' };
      },
    };
  },
};
