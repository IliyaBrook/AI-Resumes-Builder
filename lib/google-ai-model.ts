interface ChatSession {
  sendMessage(input: { message: string }): Promise<{ text: string }>;
}

interface ChatResponse {
  success?: string | boolean;
  data?: { text?: string };
  message?: string;
}

function buildUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? '';
  return `${base.replace(/\/$/, '')}/api/ai/chat`;
}

export function getAIChatSession(): ChatSession {
  return {
    async sendMessage({ message }) {
      const res = await fetch(buildUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const payload = (await res.json().catch(() => ({}))) as ChatResponse;

      if (!res.ok || payload.success === false) {
        throw new Error(payload.message ?? `AI request failed with status ${res.status}`);
      }

      return { text: payload.data?.text ?? '' };
    },
  };
}
