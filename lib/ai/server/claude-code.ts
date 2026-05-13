import { query } from '@anthropic-ai/claude-agent-sdk';
import type { AIChatSession, ProviderFactory, SendMessageInput, SendMessageWithFileInput } from './types';

const DEFAULT_SYSTEM_PROMPT =
  'You are an AI assistant integrated into a resume builder. Respond directly with the requested content only. Do not use tools, do not explore the filesystem, do not ask clarifying questions. Output ONLY what the user asked for, with no preamble, no commentary, and no markdown code fences unless the user explicitly requested them.';

function resolveModel(): string | undefined {
  return process.env.CLAUDE_CODE_MODEL;
}

async function runQuery(prompt: string | AsyncIterable<unknown>, systemPrompt: string | undefined): Promise<string> {
  const model = resolveModel();
  const iterator = query({
    prompt: prompt as never,
    options: {
      ...(model ? { model } : {}),
      systemPrompt: systemPrompt ?? DEFAULT_SYSTEM_PROMPT,
      allowedTools: [],
      permissionMode: 'bypassPermissions',
      maxTurns: 1,
      includePartialMessages: false,
    },
  });

  const parts: string[] = [];
  let resultText: string | undefined;

  for await (const msg of iterator) {
    if (msg.type === 'assistant') {
      for (const block of msg.message.content) {
        if (block.type === 'text') {
          parts.push(block.text);
        }
      }
    } else if (msg.type === 'result') {
      if (msg.subtype === 'success' && 'result' in msg && typeof msg.result === 'string') {
        resultText = msg.result;
      } else if (msg.subtype !== 'success') {
        throw new Error(`Claude Code returned ${msg.subtype}`);
      }
    }
  }

  return (resultText ?? parts.join('')).trim();
}

export const claudeCodeFactory: ProviderFactory = {
  createChat(): AIChatSession {
    return {
      async sendMessage({ message, systemPrompt }: SendMessageInput) {
        const text = await runQuery(message, systemPrompt);
        return { text };
      },

      async sendMessageWithFile({ message, systemPrompt, file }: SendMessageWithFileInput) {
        const base64 = file.data.toString('base64');
        const userMessage = {
          type: 'user' as const,
          parent_tool_use_id: null,
          message: {
            role: 'user' as const,
            content: [
              {
                type: 'document' as const,
                source: {
                  type: 'base64' as const,
                  media_type: file.mimeType,
                  data: base64,
                },
              },
              { type: 'text' as const, text: message },
            ],
          },
        };
        const promptIterable: AsyncIterable<typeof userMessage> = {
          [Symbol.asyncIterator]() {
            let done = false;
            return {
              next() {
                if (done) return Promise.resolve({ value: undefined, done: true });
                done = true;
                return Promise.resolve({ value: userMessage, done: false });
              },
            };
          },
        };
        const text = await runQuery(promptIterable, systemPrompt);
        return { text };
      },
    };
  },
};
