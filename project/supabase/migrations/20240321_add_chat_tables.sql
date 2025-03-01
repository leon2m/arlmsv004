-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  title VARCHAR(255) NOT NULL,
  course_id UUID REFERENCES courses(id),
  lesson_id UUID REFERENCES lessons(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  content TEXT NOT NULL,
  type VARCHAR(10) CHECK (type IN ('user', 'bot')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies for chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own chat sessions
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to create chat sessions
CREATE POLICY "Users can create chat sessions"
  ON chat_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view messages in their sessions
CREATE POLICY "Users can view messages in their sessions"
  ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Policy to allow users to create messages in their sessions
CREATE POLICY "Users can create messages in their sessions"
  ON chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );