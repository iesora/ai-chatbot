import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('chat')
  async chat(@Body() body: any) {
    const { message } = body;

    // ← ここで独自プロンプト／RAG等で応答生成
    const reply = `「${message}」への返答です（ダミー）`;

    return { reply };
  }
}
