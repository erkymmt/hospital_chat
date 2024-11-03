import { getEnv } from '@/lib/env';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
type ChatCompletionMessageParam = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export const runtime = 'edge';

// スレッドのメッセージ履歴取得
export async function GET(request: Request) {
  try {
    const env = getEnv();
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
      return Response.json({ error: 'Thread ID is required' }, { status: 400 });
    }

    const result = await env.DB.prepare(`
      SELECT * FROM messages
      WHERE thread_id = ?
      ORDER BY created_at ASC
    `).bind(threadId).all();

    return Response.json(result.results);
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

interface RequestBody {
  threadId: string;
  content: string;
  history: any[];
}

// メッセージ送信
export async function POST(request: Request) {
  try {
    const env = getEnv();

    // OpenAIクラ���アントの初期化
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    const { threadId, content, history } = await request.json() as RequestBody;

    // 履歴を含めたメッセージを構築
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...history.map((msg: any): ChatCompletionMessageParam => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content }
    ];

    // AI応答を生成（履歴込みで）
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages
    });

    // ユーザーメッセージをDBに保存
    const userMessageId = uuidv4();
    await env.DB.prepare(
      'INSERT INTO messages (id, thread_id, content, sender, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userMessageId, threadId, content, 'user', new Date().toISOString()).run();

    // AIメッセージをDBに保存
    const aiMessageId = uuidv4();
    await env.DB.prepare(
      'INSERT INTO messages (id, thread_id, content, sender, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(aiMessageId, threadId, aiResponse.choices[0].message.content, 'ai', new Date().toISOString()).run();

    return Response.json({
      userMessage: {
        id: userMessageId,
        content,
        sender: 'user'
      },
      aiMessage: {
        id: aiMessageId,
        content: aiResponse.choices[0].message.content,
        sender: 'ai'
      }
    });

  } catch (error) {
    console.error('Message handling error:', error);
    return Response.json(
      { error: 'Failed to process message', details: error.message },
      { status: 500 }
    );
  }
} 