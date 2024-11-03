import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

// 開発環境でのバインディング設定
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform({
    bindings: {
      // D1データベースのバインディングを明示的に設定
      DB: {
        type: 'd1',
        databaseName: 'hospital_chat_db',
      }
    }
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  }
};

export default nextConfig;