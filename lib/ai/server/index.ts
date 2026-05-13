import { claudeCodeFactory } from './claude-code';
import { geminiFactory } from './gemini';
import type { AIChatSession, AIProvider, ProviderFactory } from './types';

function resolveProvider(): AIProvider {
  const raw = (process.env.AI_PROVIDER ?? 'gemini').trim().toLowerCase();
  if (raw === 'claude-code' || raw === 'claude_code' || raw === 'claudecode') {
    return 'claude-code';
  }
  return 'gemini';
}

function getFactory(): ProviderFactory {
  const provider = resolveProvider();
  return provider === 'claude-code' ? claudeCodeFactory : geminiFactory;
}

export function getServerAIChatSession(): AIChatSession {
  return getFactory().createChat();
}

export { resolveProvider };
export type { AIChatSession, AIProvider };
