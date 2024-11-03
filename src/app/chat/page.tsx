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

// レスポンスの型を定義
interface AIResponse {
  content: string;
}

// APIとの通信用メッセージ型
interface APIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  thread_id?: string
}

// UI表示用メッセージ型
interface UIMessage {
  id?: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
}

// APIレスポンスの型定義を追加
interface APIMessageResponse extends UIMessage {
  created_at: string;
}

export default function Chat() {
  const [message, setMessage] = useState<string>('')
  const [chatHistory, setChatHistory] = useState<UIMessage[]>([])
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
        setChatHistory((data as APIMessageResponse[]).map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.created_at  // サーバーからのタイムスタンプを使用
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
      // ユーザーメッセージを即時追加
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, userMessage]);
      
      const currentMessage = message;
      setMessage('');

      const messages: APIMessage[] = [
        ...chatHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content,
          thread_id: currentThread
        })),
        {
          role: 'user',
          content: currentMessage,
          thread_id: currentThread
        }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // 一時的な変数でメッセージを構築
      let messageContent = '';
      const aiMessageId = Date.now().toString();

      const reader = response.body?.getReader();
      if (!reader) throw new Error('レスポンスの読み取りに失敗した');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = new TextDecoder().decode(value);
        const lines = text.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.event === 'agent_message' && data.message) {
                messageContent += data.message;
              }
            } catch (e) {
              console.error('Failed to parse JSON:', e);
            }
          }
        }
      }

      // ストリーミングが完了した後に1回だけメッセージを追加
      if (messageContent) {
        const aiMessage: Message = {
          id: aiMessageId,
          content: messageContent,
          sender: 'ai',
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, aiMessage]);
      }

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