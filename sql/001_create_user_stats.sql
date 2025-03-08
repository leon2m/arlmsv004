-- uuid-ossp uzantısını kur
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- user_stats tablosunu oluştur
DROP TABLE IF EXISTS user_stats;

CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  completedTrainings INTEGER NOT NULL DEFAULT 0,
  monthlyCompletions INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  longestStreak INTEGER NOT NULL DEFAULT 0,
  badges INTEGER NOT NULL DEFAULT 0,
  totalHours INTEGER NOT NULL DEFAULT 0,
  coursesInProgress INTEGER NOT NULL DEFAULT 0,
  certificatesEarned INTEGER NOT NULL DEFAULT 0,
  contributions INTEGER NOT NULL DEFAULT 0,
  
  -- JSON formatında saklanan iç içe yapılar
  mentoring JSONB NOT NULL DEFAULT '{
    "sessions": 0,
    "rating": 0,
    "students": 0
  }',
  
  weeklyProgress JSONB NOT NULL DEFAULT '{
    "target": 10,
    "completed": 0,
    "efficiency": 70
  }',
  
  skillLevels JSONB NOT NULL DEFAULT '{
    "frontend": 50,
    "backend": 50,
    "devops": 50,
    "database": 50,
    "testing": 50
  }',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS'yi devre dışı bırak (test için)
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;

-- Örnek veri
INSERT INTO user_stats (user_id, xp, level, completedTrainings, streak, badges)
VALUES 
  ('b3d4c231-7072-4c34-a41f-67d3ff135d80', 3750, 8, 24, 12, 15); 