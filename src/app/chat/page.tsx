'use client'
import { useState, useEffect, FormEvent } from 'react'

// 型定義
interface Message {
  id?: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
}

interface Thread {
  id: string
  title: string
  lastMessage?: string
  created_at: string
}

// チャット履歴の型を拡張
interface ChatMessage {
  id?: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  created_at: string;
}

// メッセージの型を OpenAI 用に修正
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  thread_id?: string;
}

// 古いChatMessage定義を削除し、1つの定義にまとめる
interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  created_at: string;
  thread_id?: string;
}

// ChatMessageインターフェースを2つに分割
interface APIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  thread_id?: string;
}

interface UIMessage {
  id?: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  created_at: string;
}

// レスポンスの型を定義
interface AIResponse {
  content: string;
}

export default function Chat() {
  const [message, setMessage] = useState<string>('')
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [currentThread, setCurrentThread] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // スレッド一覧の取得関数を外に出す
  const fetchThreads = async () => {
    try {
      const response = await fetch('/api/threads');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setThreads(data as Thread[]);  // 型アサーションを追加
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  // 初回読み込み時にスレッド一覧を取得
  useEffect(() => {
    fetchThreads();
  }, []);

  // メッセージ履歴の取得
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentThread) {
        setChatHistory([]);
        return;
      }

      try {
        const response = await fetch(`/api/messages?threadId=${currentThread}`);
        const data = await response.json();
        setChatHistory((data as ChatMessage[]).map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.created_at
        })));
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [currentThread]);

  // 新規スレッド作成の修正
  const createNewThread = async () => {
    try {
      const title = `新規チャット ${new Date().toLocaleString('ja-JP')}`;
      console.log('Creating thread with title:', title); // デバッグ用

      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error details:', errorData); // デバッグ用
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as { id: string; title: string; created_at: string };
      console.log('Response data:', data); // デバッグ用

      setCurrentThread(data.id);
      await fetchThreads();

    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  // メッセージ送信関数を修正
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !currentThread) return;

    setIsLoading(true);

    try {
      // チャット履歴を OpenAI 形式に変換
      const messages: APIMessage[] = [
        ...chatHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content,
          thread_id: currentThread
        })),
        {
          role: 'user',
          content: message,
          thread_id: currentThread
        }
      ];

      const response = await fetch('/api/chat', {  // /api/messages から /api/chat に変更
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const aiResponse = await response.json() as AIResponse;  // 型アサーションを追加

      // 新しいメッセージをチャット履歴に追加
      setChatHistory(prev => [...prev,
        {
          id: Date.now().toString(),
          content: message,
          sender: 'user',
          timestamp: new Date().toISOString()
        },
        {
          id: (Date.now() + 1).toString(),
          content: aiResponse.content,
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
      ]);

      setMessage('');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー：スレッド一覧 */}
      <div className="w-80 bg-white p-4 overflow-y-auto shadow-lg border-r">
        <h2 className="text-xl font-bold mb-4 text-gray-800">チャット履歴</h2>
        <button 
          className="w-full bg-blue-600 text-white py-3 rounded-lg mb-6 
          hover:bg-blue-700 transition-colors shadow-sm font-medium"
          onClick={createNewThread}
        >
          新規チャットを開始
        </button>
        <div className="space-y-3">
          {threads.map((thread) => {
            console.log('Thread data:', thread);  // デバッグ用
            return (
              <div 
                key={thread.id}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentThread === thread.id 
                    ? 'bg-blue-50 border-blue-500 border-2' 
                    : 'hover:bg-gray-50 border border-gray-200'
                }`}
                onClick={() => setCurrentThread(thread.id)}
              >
                <div className="text-xs text-gray-500 mb-1">
                  {thread.created_at ? new Date(thread.created_at).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  }) : '日時不明'}
                </div>
                
                <div className="text-sm text-gray-700 line-clamp-2">
                  {thread.lastMessage || ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col bg-white">
        {/* チャット履歴 */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {chatHistory.map((chat) => (
            <div 
              key={chat.id}
              className={`mb-4 ${
                chat.sender === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div className={`inline-block max-w-[70%] p-3 rounded-lg ${
                chat.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-800 shadow-md'
              }`}>
                <div className="text-sm">{chat.content}</div>
                <div className={`text-xs mt-1 ${
                  chat.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {new Date(chat.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-center text-gray-600">
              AIが応答を生成中...
            </div>
          )}
        </div>

        {/* 入力フォーム */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
          {!currentThread && (
            <div className="text-red-500 mb-2 text-sm">
              スレッドを選択するか、新規スレッドを作成してください
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                console.log('Input change triggered'); // デバッグ用
                setMessage(e.target.value);
              }}
              placeholder={currentThread ? "メッセージを入力..." : "スレッドを選択てください"}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                text-gray-900 placeholder-gray-500 bg-white border-gray-300"
              // disabled={!currentThread} // 一時的コメントアウト
            />
            <button 
              type="submit"
              onClick={() => {
                console.log('Current Thread State:', currentThread); // デバッグ用
              }}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 
                transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!message.trim() || isLoading}
            >
              送信
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 