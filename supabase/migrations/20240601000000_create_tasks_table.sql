-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create a simple tasks table without RLS or foreign key constraints
DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) NOT NULL DEFAULT 'medium',
  due_date DATE,
  status TEXT CHECK (status IN ('todo', 'in-progress', 'completed')) NOT NULL DEFAULT 'todo',
  tags TEXT[] DEFAULT '{}',
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- =============================================

-- Tabloda RLS'i etkinleştir
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Güvenli bir şekilde oturum açmış kullanıcı ID'sini almak için yardımcı fonksiyon
CREATE OR REPLACE FUNCTION auth.get_auth_user_id() 
RETURNS UUID 
LANGUAGE SQL STABLE 
AS $$
  SELECT coalesce(
    auth.uid(),
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  );
$$;

-- Kullanıcının kendi görevlerini görmesine izin veren politika
CREATE POLICY tasks_select_policy ON tasks
  FOR SELECT
  USING (user_id = auth.get_auth_user_id());

-- Kullanıcının kendi görevlerini eklemesine izin veren politika
CREATE POLICY tasks_insert_policy ON tasks
  FOR INSERT
  WITH CHECK (user_id = auth.get_auth_user_id());

-- Kullanıcının kendi görevlerini güncellemesine izin veren politika
CREATE POLICY tasks_update_policy ON tasks
  FOR UPDATE
  USING (user_id = auth.get_auth_user_id())
  WITH CHECK (user_id = auth.get_auth_user_id());

-- Kullanıcının kendi görevlerini silmesine izin veren politika
CREATE POLICY tasks_delete_policy ON tasks
  FOR DELETE
  USING (user_id = auth.get_auth_user_id());

-- Süper kullanıcıya tam erişim sağlayan politikalar (isteğe bağlı)
CREATE POLICY tasks_admin_policy ON tasks
  FOR ALL
  USING (
    -- is_admin değişkenini kendi uygulamanıza göre değiştirin
    -- Burada örnek olarak mevcut kullanıcının rolünü kontrol ediyoruz
    (current_setting('request.jwt.claims', true)::json->>'role')::text = 'admin'
  ); 