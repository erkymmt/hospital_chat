'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    console.log('スクロールを実行中...');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    console.log('メッセージが更新されたため、スクロールを実行');
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('フォーム送信を開始');
    
    if (!input.trim() || isLoading) {
      console.log('入力が空、または処理中のため送信をキャンセル');
      return;
    }

    try {
      console.log('送信処理を開始');
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'user', content: input }]);
      console.log('ユーザーメッセージを追加:', input);
      setInput('');

      console.log('APIリクエストを開始');
      const response = await fetch(`${process.env.NEXT_PUBLIC_DIFY_API_ENDPOINT}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {},
          query: input,
          user: 'default-user',
          response_mode: 'streaming',
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        console.error('APIリクエストが失敗:', response.status);
        throw new Error('API request failed');
      }

      console.log('ストリーミングレスポンスの処理を開始');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let currentMessage = '';

      while (reader) {
        const { value, done } = await reader.read();
        if (done) {
          console.log('ストリーミング完了');
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('受信したイベント:', data.event);
              
              if (data.event === 'agent_message') {
                currentMessage += data.answer;
                setMessages(prev => {
                  const newMessages = [...prev];
                  if (newMessages[newMessages.length - 1]?.role !== 'assistant') {
                    newMessages.push({ role: 'assistant', content: currentMessage });
                  } else {
                    newMessages[newMessages.length - 1].content = currentMessage;
                  }
                  return newMessages;
                });
              }

              if (data.conversation_id && !conversationId) {
                setConversationId(data.conversation_id);
              }
            } catch (e) {
              console.error('JSONパースエラー:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'エラーが発生しました。もう一度お試しください。' 
      }]);
    } finally {
      console.log('送信処理完了');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-[#0A1A3B] to-blue-950">
      <div className="container mx-auto p-6 max-w-3xl">
        {/* タイトル */}
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 p-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg">
          生活習慣病管理システム
          <span className="block text-xl font-medium text-gray-600 mt-2">問診編</span>
        </h1>

        {/* 説明文 - 太字に変更し、色は黒のまま */}
        <div className="mb-8 p-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg">
          <p className="text-lg font-bold text-gray-800 leading-relaxed">
            まず最初にあなたの情報をお伺いしますのでお答えください。
            <span className="block mt-2">
              会話をはじめるには、入力欄に何でもいいので入力してください。
            </span>
          </p>
        </div>

        {/* チャット履歴表示エリア */}
        <div className="mb-6 h-[400px] overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="p-6 space-y-4">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`inline-block p-4 rounded-2xl max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-800 shadow-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className="flex gap-3 p-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500"
            placeholder="メッセージを入力..."
            disabled={isLoading}
          />
          <button 
            type="submit"
            className={`px-8 py-4 rounded-xl font-medium transition-all duration-200 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 active:scale-95'
            } text-white shadow-lg`}
            disabled={isLoading}
          >
            送信
          </button>
        </form>

        {/* プラン作成へのリンク */}
        <div className="mt-6 text-center">
          <Link 
            href="/workflow" 
            className="inline-block px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-500 text-white rounded-xl hover:from-slate-700 hover:to-slate-600 transition-all duration-200 shadow-lg active:scale-95"
          >
            プラン作成 →
          </Link>
        </div>
      </div>
    </div>
  );
} 