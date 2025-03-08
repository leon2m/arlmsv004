-- Görev Yönetim Sistemi Veritabanı Şeması

-- Proje Tablosu
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  key VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  icon VARCHAR(50),
  avatar_url TEXT,
  project_type VARCHAR(20) DEFAULT 'classic', -- 'classic', 'scrum', 'kanban'
  default_assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Ekip Tablosu
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_url TEXT
);

-- Ekip Üyeleri Tablosu
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member', 'viewer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Proje Ekipleri Tablosu
CREATE TABLE IF NOT EXISTS project_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, team_id)
);

-- Proje Rolleri Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS project_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Rol İzinleri Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES project_roles(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_key)
);

-- Proje Üyeleri Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES project_roles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- İş Akışı Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- İş Akışı Geçişleri Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS workflow_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  from_status_id UUID REFERENCES task_statuses(id) ON DELETE CASCADE,
  to_status_id UUID REFERENCES task_statuses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workflow_id, from_status_id, to_status_id)
);

-- Görev Durumları Tablosu
CREATE TABLE IF NOT EXISTS task_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#808080',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status_category VARCHAR(20) DEFAULT 'to-do', -- 'to-do', 'in-progress', 'done', 'backlog'
  icon VARCHAR(50),
  UNIQUE(project_id, name)
);

-- Görev Öncelikleri Tablosu
CREATE TABLE IF NOT EXISTS task_priorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#808080',
  icon VARCHAR(50),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- Görev Tipleri Tablosu
CREATE TABLE IF NOT EXISTS task_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#808080',
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- Görevler Tablosu
DROP TABLE IF EXISTS tasks CASCADE;
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status_id UUID REFERENCES task_statuses(id) ON DELETE SET NULL,
  priority_id UUID REFERENCES task_priorities(id) ON DELETE SET NULL,
  type_id UUID REFERENCES task_types(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours DECIMAL(10, 2),
  logged_hours DECIMAL(10, 2) DEFAULT 0,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  original_estimate DECIMAL(10, 2),
  remaining_estimate DECIMAL(10, 2),
  epic_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  resolution VARCHAR(50),
  resolution_date TIMESTAMP WITH TIME ZONE,
  environment TEXT,
  start_date TIMESTAMP WITH TIME ZONE
);

-- Epikler Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS epics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  summary TEXT,
  color VARCHAR(20) DEFAULT '#808080',
  start_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Görev Etiketleri Tablosu
CREATE TABLE IF NOT EXISTS task_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) DEFAULT '#808080',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Görev-Etiket İlişki Tablosu
CREATE TABLE IF NOT EXISTS task_tag_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES task_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, tag_id)
);

-- Görev Yorumları Tablosu
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Görev Ekleri Tablosu
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Görev Geçmişi Tablosu
CREATE TABLE IF NOT EXISTS task_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sprint Tablosu
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  goal TEXT,
  status VARCHAR(20) DEFAULT 'planning', -- 'planning', 'active', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  complete_date TIMESTAMP WITH TIME ZONE
);

-- Sprint-Görev İlişki Tablosu
CREATE TABLE IF NOT EXISTS sprint_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sprint_id, task_id)
);

-- Görev Bağımlılıkları Tablosu
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) DEFAULT 'blocks', -- 'blocks', 'is_blocked_by', 'relates_to'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id)
);

-- Bildirimler Tablosu
CREATE TABLE IF NOT EXISTS task_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'assigned', 'mentioned', 'due_soon', 'status_changed'
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zaman Kaydı Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  time_spent DECIMAL(10, 2) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Özel Alanlar Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS custom_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- 'text', 'number', 'date', 'select', 'user', 'checkbox'
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  options JSONB, -- Select tipi için seçenekler
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Özel Alan Değerleri Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS custom_field_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  field_id UUID REFERENCES custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, field_id)
);

-- Proje Şablonları Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT FALSE,
  configuration JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sürüm Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  release_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'unreleased', -- 'unreleased', 'released', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Görev-Sürüm İlişki Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS task_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  version_id UUID REFERENCES versions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, version_id)
);

-- Doküman Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pano Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'kanban', 'scrum'
  is_default BOOLEAN DEFAULT FALSE,
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Pano Sütunları Tablosu (Yeni)
CREATE TABLE IF NOT EXISTS board_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  status_id UUID REFERENCES task_statuses(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_id, status_id)
);

-- Varsayılan Görev Durumları
INSERT INTO task_statuses (name, description, color, position, is_default, status_category) VALUES
('Yapılacak', 'Henüz başlanmamış görevler', '#3498db', 1, TRUE, 'to-do'),
('Devam Ediyor', 'Üzerinde çalışılan görevler', '#f39c12', 2, FALSE, 'in-progress'),
('İncelemede', 'Gözden geçirilmeyi bekleyen görevler', '#9b59b6', 3, FALSE, 'in-progress'),
('Tamamlandı', 'Tamamlanmış görevler', '#2ecc71', 4, FALSE, 'done'),
('Backlog', 'Henüz planlanmamış görevler', '#95a5a6', 0, FALSE, 'backlog')
ON CONFLICT DO NOTHING;

-- Varsayılan Görev Öncelikleri
INSERT INTO task_priorities (name, description, color, icon, position) VALUES
('Acil', 'En yüksek öncelikli görevler', '#e74c3c', 'alert-triangle', 1),
('Yüksek', 'Yüksek öncelikli görevler', '#e67e22', 'arrow-up', 2),
('Orta', 'Orta öncelikli görevler', '#f1c40f', 'minus', 3),
('Düşük', 'Düşük öncelikli görevler', '#3498db', 'arrow-down', 4)
ON CONFLICT DO NOTHING;

-- Varsayılan Görev Tipleri
INSERT INTO task_types (name, description, color, icon) VALUES
('Görev', 'Standart görev', '#3498db', 'check-square'),
('Hata', 'Düzeltilmesi gereken bir hata', '#e74c3c', 'bug'),
('Özellik', 'Yeni bir özellik', '#2ecc71', 'star'),
('İyileştirme', 'Mevcut bir özelliğin iyileştirilmesi', '#9b59b6', 'trending-up'),
('Epik', 'Büyük bir iş parçası', '#8e44ad', 'bookmark'),
('Hikaye', 'Kullanıcı hikayesi', '#27ae60', 'book-open')
ON CONFLICT DO NOTHING;

-- Varsayılan Proje Rolleri
INSERT INTO project_roles (name, description) VALUES
('Proje Yöneticisi', 'Proje üzerinde tam yetkiye sahip'),
('Geliştirici', 'Görevleri görüntüleme, düzenleme ve çözme yetkisine sahip'),
('Test Uzmanı', 'Görevleri görüntüleme ve test etme yetkisine sahip'),
('Gözlemci', 'Sadece görüntüleme yetkisine sahip')
ON CONFLICT DO NOTHING;

-- RLS Politikaları
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_columns ENABLE ROW LEVEL SECURITY;

-- Proje Erişim Politikası
CREATE POLICY project_access_policy ON projects
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_teams pt
      JOIN team_members tm ON pt.team_id = tm.team_id
      WHERE pt.project_id = projects.id AND tm.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
    )
  );

-- Görev Erişim Politikası
CREATE POLICY task_access_policy ON tasks
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tasks.project_id AND (
        p.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM project_teams pt
          JOIN team_members tm ON pt.team_id = tm.team_id
          WHERE pt.project_id = p.id AND tm.user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM project_members pm
          WHERE pm.project_id = p.id AND pm.user_id = auth.uid()
        )
      )
    )
  );

-- Fonksiyonlar
-- Kullanıcının görevlerini getir
CREATE OR REPLACE FUNCTION get_user_tasks(p_user_id UUID)
RETURNS SETOF tasks
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT t.*
  FROM tasks t
  WHERE t.assignee_id = p_user_id
  AND t.is_archived = FALSE
  ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC;
$$;

-- Kullanıcının projelerini getir
CREATE OR REPLACE FUNCTION get_user_projects(p_user_id UUID)
RETURNS SETOF projects
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT p.*
  FROM projects p
  WHERE p.owner_id = p_user_id
  OR EXISTS (
    SELECT 1 FROM project_teams pt
    JOIN team_members tm ON pt.team_id = tm.team_id
    WHERE pt.project_id = p.id AND tm.user_id = p_user_id
  )
  AND p.is_archived = FALSE
  ORDER BY p.created_at DESC;
$$;

-- Proje görevlerini getir
CREATE OR REPLACE FUNCTION get_project_tasks(p_project_id UUID)
RETURNS SETOF tasks
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT t.*
  FROM tasks t
  WHERE t.project_id = p_project_id
  AND t.is_archived = FALSE
  ORDER BY t.position ASC, t.created_at DESC;
$$;

-- Görev oluştur
CREATE OR REPLACE FUNCTION create_task(
  p_title VARCHAR(255),
  p_description TEXT,
  p_project_id UUID,
  p_status_id UUID,
  p_priority_id UUID,
  p_type_id UUID,
  p_reporter_id UUID,
  p_assignee_id UUID,
  p_due_date TIMESTAMP WITH TIME ZONE,
  p_estimated_hours DECIMAL(10, 2)
)
RETURNS tasks
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_task tasks;
BEGIN
  INSERT INTO tasks (
    title, description, project_id, status_id, priority_id, type_id,
    reporter_id, assignee_id, due_date, estimated_hours
  )
  VALUES (
    p_title, p_description, p_project_id, p_status_id, p_priority_id, p_type_id,
    p_reporter_id, p_assignee_id, p_due_date, p_estimated_hours
  )
  RETURNING * INTO v_task;
  
  -- Bildirim oluştur (atanan kişi için)
  IF p_assignee_id IS NOT NULL AND p_assignee_id != p_reporter_id THEN
    INSERT INTO task_notifications (user_id, task_id, type, message)
    VALUES (p_assignee_id, v_task.id, 'assigned', 'Size yeni bir görev atandı: ' || p_title);
  END IF;
  
  RETURN v_task;
END;
$$;

-- Görev güncelle
CREATE OR REPLACE FUNCTION update_task(
  p_task_id UUID,
  p_title VARCHAR(255),
  p_description TEXT,
  p_status_id UUID,
  p_priority_id UUID,
  p_assignee_id UUID,
  p_due_date TIMESTAMP WITH TIME ZONE,
  p_estimated_hours DECIMAL(10, 2)
)
RETURNS tasks
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_task tasks;
  v_old_assignee_id UUID;
  v_old_status_id UUID;
BEGIN
  -- Eski değerleri al
  SELECT assignee_id, status_id INTO v_old_assignee_id, v_old_status_id
  FROM tasks
  WHERE id = p_task_id;
  
  -- Görevi güncelle
  UPDATE tasks
  SET
    title = p_title,
    description = p_description,
    status_id = p_status_id,
    priority_id = p_priority_id,
    assignee_id = p_assignee_id,
    due_date = p_due_date,
    estimated_hours = p_estimated_hours,
    updated_at = NOW()
  WHERE id = p_task_id
  RETURNING * INTO v_task;
  
  -- Atanan kişi değiştiyse bildirim oluştur
  IF p_assignee_id IS NOT NULL AND p_assignee_id != v_old_assignee_id THEN
    INSERT INTO task_notifications (user_id, task_id, type, message)
    VALUES (p_assignee_id, p_task_id, 'assigned', 'Size yeni bir görev atandı: ' || p_title);
  END IF;
  
  -- Durum değiştiyse bildirim oluştur
  IF p_status_id != v_old_status_id THEN
    -- Eski atanan kişiye bildirim
    IF v_old_assignee_id IS NOT NULL THEN
      INSERT INTO task_notifications (user_id, task_id, type, message)
      VALUES (v_old_assignee_id, p_task_id, 'status_changed', 'Görevin durumu değişti: ' || p_title);
    END IF;
    
    -- Yeni atanan kişiye bildirim (eğer farklıysa)
    IF p_assignee_id IS NOT NULL AND p_assignee_id != v_old_assignee_id THEN
      INSERT INTO task_notifications (user_id, task_id, type, message)
      VALUES (p_assignee_id, p_task_id, 'status_changed', 'Görevin durumu değişti: ' || p_title);
    END IF;
  END IF;
  
  RETURN v_task;
END;
$$;

-- Görev sil
CREATE OR REPLACE FUNCTION delete_task(p_task_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE tasks
  SET is_archived = TRUE
  WHERE id = p_task_id;
  
  RETURN FOUND;
END;
$$; 