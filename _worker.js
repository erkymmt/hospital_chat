export default {
  async fetch(request, env) {
    return await handleRequest(request, env);
  },
};

async function handleRequest(request, env) {
  const url = new URL(request.url);
  
  // APIリクエストの処理
  if (url.pathname.startsWith('/api/')) {
    // APIロジックの処理
    return new Response(JSON.stringify({ message: "API response" }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 静的コンテンツの処理
  try {
    return await env.ASSETS.fetch(request);
  } catch (e) {
    return new Response('Not Found', { status: 404 });
  }
} 