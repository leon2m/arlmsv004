-- uuid-ossp uzantısını yükle
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Eğer varsa user_stats tablosunu kaldır
DROP TABLE IF EXISTS user_stats;

-- user_stats tablosunu oluştur
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  weekly_progress JSONB DEFAULT '{"completed": 0, "target": 5, "efficiency": 70}',
  streak JSONB DEFAULT '{"current": 0, "longest": 0}',
  badges INTEGER DEFAULT 0,
  competencies JSONB DEFAULT '{"technical": [], "soft": []}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row-Level Security'i devre dışı bırak (test için)
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;

-- Örnek veri ekle
INSERT INTO user_stats (user_id, xp, level, weekly_progress, streak, badges, competencies)
VALUES 
  ('d1c41779-151f-4512-a41f-67d3ff135d80', 1250, 3, 
   '{"completed": 3, "target": 5, "efficiency": 75}',
   '{"current": 5, "longest": 7}',
   8,
   '{"technical": ["JavaScript", "React", "Node.js"], "soft": ["İletişim", "Problem Çözme"]}'
  ); 