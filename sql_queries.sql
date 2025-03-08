-- Profil tablosu oluşturma
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  organization TEXT,
  role TEXT,
  avatar_url TEXT,
  active_days_streak INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı istatistikleri tablosu oluşturma
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  completedtrainings INTEGER DEFAULT 0,
  monthlycompletions INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  longeststreak INTEGER DEFAULT 0,
  badges INTEGER DEFAULT 0,
  totalhours INTEGER DEFAULT 0,
  coursesinprogress INTEGER DEFAULT 0,
  certificatesearned INTEGER DEFAULT 0,
  contributions INTEGER DEFAULT 0,
  mentoring JSONB DEFAULT '{}',
  weeklyprogress JSONB DEFAULT '{}',
  skilllevels JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı ayarları tablosu oluşturma
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'tr',
  notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Görev durumları tablosu oluşturma
CREATE TABLE IF NOT EXISTS task_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name CHARACTER VARYING NOT NULL,
  description TEXT,
  color CHARACTER VARYING,
  project_id UUID,
  position INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  status_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Görev öncelikleri tablosu oluşturma
CREATE TABLE IF NOT EXISTS task_priorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name CHARACTER VARYING NOT NULL,
  description TEXT,
  color CHARACTER VARYING,
  icon CHARACTER VARYING,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Görev tipleri tablosu oluşturma
CREATE TABLE IF NOT EXISTS task_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name CHARACTER VARYING NOT NULL,
  description TEXT,
  color CHARACTER VARYING,
  icon CHARACTER VARYING,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Görevler tablosu oluşturma
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title CHARACTER VARYING NOT NULL,
  description TEXT,
  project_id UUID,
  status_id UUID REFERENCES task_statuses(id),
  priority_id UUID REFERENCES task_priorities(id),
  type_id UUID REFERENCES task_types(id),
  reporter_id UUID REFERENCES auth.users(id),
  assignee_id UUID REFERENCES auth.users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours NUMERIC,
  logged_hours NUMERIC DEFAULT 0,
  parent_task_id UUID REFERENCES tasks(id),
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE
);

-- Örnek veri ekleme
-- Profil verisi
INSERT INTO profiles (id, full_name, avatar_url, role, organization)
VALUES (
  'b3d4c231-7072-4c34-a41f-67d3ff135d80',
  'Ramazan Çakıcı',
  'https://ui-avatars.com/api/?name=Ramazan+Çakıcı&background=random',
  'Yazılım Geliştirici',
  'Acme Ltd.'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  role = EXCLUDED.role,
  organization = EXCLUDED.organization,
  updated_at = NOW();

-- Kullanıcı istatistikleri verisi
INSERT INTO user_stats (
  id, user_id, xp, level, completedtrainings, monthlycompletions, 
  streak, longeststreak, badges, totalhours, 
  coursesinprogress, certificatesearned, contributions
)
VALUES (
  uuid_generate_v4(),
  'b3d4c231-7072-4c34-a41f-67d3ff135d80',
  1250, 5, 12, 3,
  7, 14, 8, 45,
  3, 5, 10
) ON CONFLICT (id) DO NOTHING;

-- Kullanıcı ayarları verisi
INSERT INTO user_settings (user_id, theme, language, notifications, email_notifications)
VALUES (
  'b3d4c231-7072-4c34-a41f-67d3ff135d80',
  'dark',
  'tr',
  TRUE,
  TRUE
) ON CONFLICT (user_id) DO UPDATE SET
  theme = EXCLUDED.theme,
  language = EXCLUDED.language,
  notifications = EXCLUDED.notifications,
  email_notifications = EXCLUDED.email_notifications,
  updated_at = NOW();

-- Görev tipleri örnek verileri
INSERT INTO task_types (id, name, color, description, icon)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Bug', '#e74c3c', 'Hata düzeltme görevi', 'bug'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Feature', '#2ecc71', 'Yeni özellik geliştirme', 'star'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Task', '#3498db', 'Genel görev', 'check-square')
ON CONFLICT DO NOTHING;

-- Görev durumları örnek verileri
INSERT INTO task_statuses (id, name, color, description, position, status_category)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Todo', '#3498db', 'Yapılacak görevler', 1, 'to_do'),
  ('22222222-2222-2222-2222-222222222222', 'In Progress', '#f39c12', 'Devam eden görevler', 2, 'in_progress'),
  ('33333333-3333-3333-3333-333333333333', 'Completed', '#2ecc71', 'Tamamlanan görevler', 3, 'done')
ON CONFLICT DO NOTHING;

-- Görev öncelikleri örnek verileri
INSERT INTO task_priorities (id, name, color, description, position, icon)
VALUES 
  ('44444444-4444-4444-4444-444444444444', 'Low', '#3498db', 'Düşük öncelikli görevler', 1, 'arrow-down'),
  ('55555555-5555-5555-5555-555555555555', 'Medium', '#f39c12', 'Orta öncelikli görevler', 2, 'minus'),
  ('66666666-6666-6666-6666-666666666666', 'High', '#e74c3c', 'Yüksek öncelikli görevler', 3, 'arrow-up')
ON CONFLICT DO NOTHING;

-- Görev örnek verileri
INSERT INTO tasks (
  id, title, description, status_id, priority_id, type_id,
  assignee_id, reporter_id, due_date, estimated_hours
)
VALUES 
  (
    '77777777-7777-7777-7777-777777777777',
    'Proje Planı Hazırlama',
    'Yeni proje için detaylı bir plan hazırlanması gerekiyor.',
    '11111111-1111-1111-1111-111111111111', -- Todo
    '55555555-5555-5555-5555-555555555555', -- Medium
    'cccccccc-cccc-cccc-cccc-cccccccccccc', -- Task
    'b3d4c231-7072-4c34-a41f-67d3ff135d80',
    'b3d4c231-7072-4c34-a41f-67d3ff135d80',
    NOW() + INTERVAL '7 days',
    8
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    'Tasarım İncelemesi',
    'Yeni arayüz tasarımlarının incelenmesi ve geri bildirim verilmesi.',
    '22222222-2222-2222-2222-222222222222', -- In Progress
    '66666666-6666-6666-6666-666666666666', -- High
    'cccccccc-cccc-cccc-cccc-cccccccccccc', -- Task
    'b3d4c231-7072-4c34-a41f-67d3ff135d80',
    'b3d4c231-7072-4c34-a41f-67d3ff135d80',
    NOW() + INTERVAL '3 days',
    4
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'Dokümantasyon Güncelleme',
    'API dokümantasyonunun güncellenmesi.',
    '33333333-3333-3333-3333-333333333333', -- Completed
    '44444444-4444-4444-4444-444444444444', -- Low
    'cccccccc-cccc-cccc-cccc-cccccccccccc', -- Task
    'b3d4c231-7072-4c34-a41f-67d3ff135d80',
    'b3d4c231-7072-4c34-a41f-67d3ff135d80',
    NOW() - INTERVAL '2 days',
    2
  )
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) politikaları
-- Profiller için RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_policy ON profiles
  FOR SELECT USING (true);

CREATE POLICY profiles_insert_policy ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_policy ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Kullanıcı istatistikleri için RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_stats_select_policy ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_stats_insert_policy ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_stats_update_policy ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Kullanıcı ayarları için RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_settings_select_policy ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_settings_insert_policy ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_settings_update_policy ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Görevler için RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY tasks_select_policy ON tasks
  FOR SELECT USING (auth.uid() = assignee_id OR auth.uid() = reporter_id);

CREATE POLICY tasks_insert_policy ON tasks
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY tasks_update_policy ON tasks
  FOR UPDATE USING (auth.uid() = assignee_id OR auth.uid() = reporter_id);

CREATE POLICY tasks_delete_policy ON tasks
  FOR DELETE USING (auth.uid() = reporter_id);

-- Görev durumları için RLS
ALTER TABLE task_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY task_statuses_select_policy ON task_statuses
  FOR SELECT USING (true);

-- Görev öncelikleri için RLS
ALTER TABLE task_priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY task_priorities_select_policy ON task_priorities
  FOR SELECT USING (true);

-- Görev tipleri için RLS
ALTER TABLE task_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY task_types_select_policy ON task_types
  FOR SELECT USING (true);

-- Kullanıcı profili getirme fonksiyonu
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data JSONB;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'avatar_url', p.avatar_url,
    'role', p.role,
    'organization', p.organization,
    'active_days_streak', p.active_days_streak,
    'created_at', p.created_at,
    'updated_at', p.updated_at
  ) INTO profile_data
  FROM profiles p
  WHERE p.id = user_id;
  
  IF profile_data IS NULL THEN
    -- Profil bulunamadıysa boş bir profil döndür
    RETURN json_build_object(
      'id', user_id,
      'full_name', '',
      'avatar_url', '',
      'role', '',
      'organization', '',
      'active_days_streak', 0
    );
  END IF;
  
  RETURN profile_data;
END;
$$;

-- Kullanıcı istatistiklerini getirme fonksiyonu
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats_data JSONB;
BEGIN
  SELECT json_build_object(
    'id', us.id,
    'user_id', us.user_id,
    'xp', us.xp,
    'level', us.level,
    'completedtrainings', us.completedtrainings,
    'monthlycompletions', us.monthlycompletions,
    'streak', us.streak,
    'longeststreak', us.longeststreak,
    'badges', us.badges,
    'totalhours', us.totalhours,
    'coursesinprogress', us.coursesinprogress,
    'certificatesearned', us.certificatesearned,
    'contributions', us.contributions,
    'mentoring', us.mentoring,
    'weeklyprogress', us.weeklyprogress,
    'skilllevels', us.skilllevels
  ) INTO stats_data
  FROM user_stats us
  WHERE us.user_id = user_id;
  
  IF stats_data IS NULL THEN
    -- İstatistik bulunamadıysa varsayılan değerlerle döndür
    RETURN json_build_object(
      'user_id', user_id,
      'xp', 0,
      'level', 1,
      'completedtrainings', 0,
      'monthlycompletions', 0,
      'streak', 0,
      'longeststreak', 0,
      'badges', 0,
      'totalhours', 0,
      'coursesinprogress', 0,
      'certificatesearned', 0,
      'contributions', 0,
      'mentoring', '{}',
      'weeklyprogress', '{}',
      'skilllevels', '{}'
    );
  END IF;
  
  RETURN stats_data;
END;
$$;
