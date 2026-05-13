export type AIProvider = 'gemini' | 'claude-code';

export type AIFileMimeType = 'application/pdf';

export type AIFile = {
  data: Buffer;
  mimeType: AIFileMimeType;
};

export type SendMessageInput = {
  message: string;
  systemPrompt?: string;
};

export type SendMessageWithFileInput = SendMessageInput & {
  file: AIFile;
};

export interface AIChatSession {
  sendMessage(input: SendMessageInput): Promise<{ text: string }>;
  sendMessageWithFile(input: SendMessageWithFileInput): Promise<{ text: string }>;
}

export interface ProviderFactory {
  createChat(): AIChatSession;
}
