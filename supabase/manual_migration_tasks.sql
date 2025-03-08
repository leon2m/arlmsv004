-- uuid-ossp uzantısını yükle
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Eğer varsa tasks tablosunu kaldır
DROP TABLE IF EXISTS tasks;

-- Basit bir tasks tablosu oluştur
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('todo', 'in-progress', 'completed')),
  tags TEXT[],
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row-Level Security'i devre dışı bırak (test için)
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Örnek veri ekle
INSERT INTO tasks (title, description, priority, due_date, status, tags, user_id)
VALUES 
  ('API Dokümantasyonu', 'REST API dokümantasyonu güncelle', 'medium', now() + interval '7 days', 'todo', ARRAY['documentation', 'api'], 'd1c41779-151f-4512-a41f-67d3ff135d80'),
  ('Unit Testleri', 'Yeni eklenen modüller için unit testler yazın', 'high', now() + interval '3 days', 'in-progress', ARRAY['testing', 'quality'], 'd1c41779-151f-4512-a41f-67d3ff135d80'); 