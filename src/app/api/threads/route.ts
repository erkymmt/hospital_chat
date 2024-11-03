import { getEnv } from '@/lib/env';

export const runtime = 'edge';

// スレッド一覧取得
export async function GET() {
  try {
    const env = getEnv();

    // DBの存在確認を追加
    if (!env.DB) {
      console.error('Database is not available in GET /api/threads');
      return Response.json({ error: 'Database not configured' }, { status: 500 });
    }

    const threads = await env.DB
      .prepare('SELECT * FROM threads ORDER BY created_at DESC')
      .all();

    return Response.json(threads.results);
  } catch (error) {
    console.error('Error in GET /api/threads:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// 新規スレッド作成
export async function POST(request: Request) {
  try {
    const env = getEnv();
    const { title } = await request.json() as { title: string };

    const thread = {
      id: crypto.randomUUID(),
      title,
      created_at: new Date().toISOString()
    };

    await env.DB
      .prepare('INSERT INTO threads (id, title, created_at) VALUES (?, ?, ?)')
      .bind(thread.id, thread.title, thread.created_at)
      .run();

    return Response.json(thread);
  } catch (error) {
    console.error('Error in POST /api/threads:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 