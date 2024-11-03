import OpenAI from 'openai';
import { getEnv } from '@/lib/env';

// Edge Runtimeの設定を追加
export const runtime = 'edge';

// メッセージの型定義
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  thread_id?: string;
}

// ランダムなIDを生成する関数
function generateUUID() {
  return crypto.randomUUID();  // ブラウザのWeb Crypto APIを使用
}

export async function POST(request: Request) {
  try {
    const env = getEnv();
    
    // OpenAI APIキーのチェック
    if (!env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return Response.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    // メッセージの受信確認
    const { messages }: { messages: ChatMessage[] } = await request.json();
    if (!messages || messages.length === 0) {
      console.error('No messages received');
      return Response.json({ error: 'No messages provided' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY
    });

    console.log('Received messages:', messages); // デバッグ用

    // thread_idの処理を確実に
    const thread_id = messages[0]?.thread_id || generateUUID();
    console.log('Thread ID:', thread_id); // デバッグ用

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.7,
    });
    console.log('OpenAI Response:', chatResponse); // デバッグ用

    // DBチェック
    if (!env.DB) {
      console.error('Database connection is missing');
      return Response.json({ error: 'Database is not configured' }, { status: 500 });
    }

    // データベース保存処理
    const dbResponse = await env.DB.prepare(
      'INSERT INTO messages (id, thread_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      generateUUID(),
      thread_id,
      chatResponse.choices[0].message.role,
      chatResponse.choices[0].message.content,
      new Date().toISOString()
    ).run();
    console.log('DB Response:', dbResponse); // デバッグ用

    return Response.json({
      role: chatResponse.choices[0].message.role,
      content: chatResponse.choices[0].message.content,
      thread_id
    });

  } catch (error) {
    // エラーの詳細をログに出力
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Unknown error:', error);
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 