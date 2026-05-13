import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { getServerAIChatSession } from '@/lib/ai/server';

const chatSchema = z.object({
  message: z.string().min(1),
});

const aiRoute = new Hono().post('/chat', zValidator('json', chatSchema), async c => {
  try {
    const { message } = c.req.valid('json');
    const chat = getServerAIChatSession();
    const { text } = await chat.sendMessage({ message });
    return c.json({ success: 'ok', data: { text } }, 200);
  } catch (error) {
    const messageText = error instanceof Error ? error.message : 'AI request failed';
    return c.json(
      {
        success: false,
        message: messageText,
      },
      500
    );
  }
});

export default aiRoute;
