export async function onRequestGet(context) {
  try {
    const { env } = context;
    const { DB } = env;
    
    // スレッド一覧を取得
    const threads = await DB.prepare(
      'SELECT * FROM threads ORDER BY created_at DESC'
    ).all();

    return new Response(JSON.stringify(threads.results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { env } = context;
    const { DB } = env;
    
    const data = await context.request.json();
    const userAgent = context.request.headers.get('user-agent') || 'unknown';
    
    // タイトルの確認
    if (!data.title) {
      return new Response(JSON.stringify({ error: 'Title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // UUIDを生成
    const id = crypto.randomUUID();

    // スレッドを作成（idを明示的に指定）
    await DB.prepare(
      'INSERT INTO threads (id, title, user_agent, created_at) VALUES (?, ?, ?, datetime("now"))'
    ).bind(id, data.title, userAgent).run();

    // 作成したスレッドを取得
    const thread = await DB.prepare(
      'SELECT * FROM threads WHERE id = ?'
    ).bind(id).first();

    return new Response(JSON.stringify(thread), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Detailed error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      type: error.constructor.name 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 