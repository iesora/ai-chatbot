import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { z } from 'zod';

const ChatSchema = z.object({
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .optional(),
});

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('chat')
  async chat(@Body() body: any) {
    const { message, history = [] } = ChatSchema.parse(body);

    // ← ここで独自プロンプト／RAG等で応答生成
    const reply = `「${message}」への返答です（ダミー）`;

    return { reply };
  }
}
