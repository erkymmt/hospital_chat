'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function DataRecordChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      console.log('送信処理を開始');
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'user', content: input }]);
      const currentInput = input;
      setInput('');

      const response = await fetch('/api/data-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: { input: currentInput }
        }),
      });

      if (!response.ok) {
        throw new Error('データ記録の開始に失敗しました');
      }

      console.log('ストリーミングレスポンスの処理を開始');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let currentMessage = '';

      // 最初のアシスタントメッセージを空で追加
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader!.read();
        if (done) {
          console.log('ストリーミング完了');
          break;
        }

        const chunk = decoder.decode(value);
        console.log('受信したチャンク:', chunk);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('パースしたデータ:', data);
              
              if (data.event === 'message' || data.event === 'text_chunk') {
                const newContent = data.event === 'message' 
                  ? (data.answer || '')
                  : (data.data?.text || '');
                
                console.log('新しいコンテンツ:', newContent);
                if (newContent) {
                  currentMessage += newContent;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant') {
                      lastMessage.content = currentMessage;
                    }
                    return newMessages;
                  });
                }
              } else if (data.event === 'workflow_finished') {
                console.log('ワークフロー完了イベント:', data);
                if (!currentMessage) {
                  const finalResponse = data.data?.response || 
                                     data.data?.message || 
                                     data.data?.content || 
                                     'データ記録は完了しましたが、応答がありませんでした。';
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant') {
                      lastMessage.content = finalResponse;
                    }
                    return newMessages;
                  });
                }
              }
            } catch (error) {
              console.error('JSONのパースエラー:', error, '行:', line);
            }
          }
        }
      }

    } catch (error) {
      console.error('エラー:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '申し訳ありません。エラーが発生しました。\n時間をおいて再度お試しください。' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-950 via-[#0A1A3B] to-blue-950">
      <h1 className="text-3xl font-bold p-4 text-center text-gray-100">データ記録</h1>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={message.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block p-2 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t bg-white">
        <div className="max-w-3xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 p-2 border rounded text-gray-900"
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded font-medium transition-all duration-200 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700'
              } text-white shadow-lg`}
            >
              送信
            </button>
          </form>
          <div className="mt-4 text-center space-y-2">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              トップページに戻る
            </button>
            <button
              onClick={() => router.push('/new-page')}
              className="px-4 py-2 text-sm bg-gradient-to-r from-slate-600 to-slate-500 text-white rounded hover:from-slate-700 hover:to-slate-600"
            >
              月間データに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
