-- まず関連テーブルを削除
DROP TABLE IF EXISTS messages;

-- その後threadsテーブルを削除して再作成
DROP TABLE IF EXISTS threads;
CREATE TABLE threads (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  user_agent TEXT DEFAULT 'unknown'
);

-- 必要に応じてmessagesテーブルも再作成
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (thread_id) REFERENCES threads(id)
);
