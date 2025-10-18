import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// システムプロンプト：ユーザー質問を画面名に変換
const SYSTEM_PROMPT = `
あなたはWebサイトのナビゲーションアシスタントです。
ユーザーの質問内容に最も関連する画面を判断し、
日本語の自然な文章で回答してください。

回答には必ず以下3要素を含めてください：
1. 画面名（ホーム画面／商品一覧画面／事業一覧画面／ブログ一覧画面／お問い合わせ画面）
2. 案内文（例：「以下のリンクの画面で、質問内容が確認できます。」）
3. 対応するURL（下記のいずれか）

- ホーム画面: https://koudaunsou.jp/
- 商品一覧画面: https://koudaunsou.jp/product/
- 事業一覧画面: https://koudaunsou.jp/business/
- ブログ一覧画面: https://koudaunsou.jp/blog/
- お問い合わせ画面: https://koudaunsou.jp/contact/

【出力例】
お問い合わせをご希望ですね。  
以下のリンクの画面で、質問内容が確認できます。  

https://koudaunsou.jp/contact/

該当するページがない場合は「該当する画面が見つかりませんでした。」とだけ答えてください。
`;

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('chat')
  async chat(@Body() body: any) {
    const { message } = body;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or gpt-4o
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      temperature: 0,
      max_tokens: 50,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || '該当なし';
    return { reply };
  }
}
