-- Proje Yönetim Sistemi SQL Dosyası
-- Bu dosya, Supabase SQL Editor'da çalıştırılarak veritabanı tablolarını oluşturur

-- UUID uzantısını etkinleştir (eğer zaten etkin değilse)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Proje Rolleri Tablosu
CREATE TABLE IF NOT EXISTS project_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Rol İzinleri Tablosu
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES project_roles(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_key)
);

-- Proje Üyeleri Tablosu
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES project_roles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- İş Akışı Tablosu
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

-- İş Akışı Geçişleri Tablosu
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
  epic_id UUID REFERENCES epics(id) ON DELETE SET NULL,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  resolution VARCHAR(50),
  resolution_date TIMESTAMP WITH TIME ZONE,
  environment TEXT,
  start_date TIMESTAMP WITH TIME ZONE
);

-- Epikler Tablosu
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
  file_size INTEGER,
  file_type VARCHAR(100),
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT
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
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  goal TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'planning', -- 'planning', 'active', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Sprint Görevleri Tablosu
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
  depends_on_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(20) DEFAULT 'blocks', -- 'blocks', 'is-blocked-by', 'relates-to'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, depends_on_id)
);

-- Görev Bildirimleri Tablosu
CREATE TABLE IF NOT EXISTS task_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notification_type VARCHAR(50) DEFAULT 'mention', -- 'mention', 'assignment', 'comment', 'status_change'
  action_url TEXT
);

-- Zaman Kayıtları Tablosu
CREATE TABLE IF NOT EXISTS time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  hours DECIMAL(10, 2) NOT NULL,
  description TEXT,
  logged_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  work_type VARCHAR(50) DEFAULT 'development' -- 'development', 'testing', 'design', 'meeting', 'other'
);

-- Özel Alanlar Tablosu
CREATE TABLE IF NOT EXISTS custom_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- 'text', 'number', 'date', 'select', 'checkbox'
  options JSONB, -- Seçenek listesi için
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Özel Alan Değerleri Tablosu
CREATE TABLE IF NOT EXISTS custom_field_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  field_id UUID REFERENCES custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, field_id)
);

-- Proje Şablonları Tablosu
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  configuration JSONB NOT NULL, -- Proje yapılandırması
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE,
  UNIQUE(name, created_by)
);

-- Sürümler Tablosu
CREATE TABLE IF NOT EXISTS versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  release_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'planning', -- 'planning', 'development', 'testing', 'released'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Görev-Sürüm İlişki Tablosu
CREATE TABLE IF NOT EXISTS task_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  version_id UUID REFERENCES versions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, version_id)
);

-- Doküman Tablosu
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pano Tablosu
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

-- Pano Sütunları Tablosu
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
('Düşük', 'Düşük öncelikli görevler', '#3498db', 'low_priority', 1),
('Orta', 'Orta öncelikli görevler', '#f39c12', 'priority', 2),
('Yüksek', 'Yüksek öncelikli görevler', '#e74c3c', 'priority_high', 3),
('Acil', 'Acil görevler', '#c0392b', 'error', 4)
ON CONFLICT DO NOTHING;

-- Varsayılan Görev Tipleri
INSERT INTO task_types (name, description, color, icon) VALUES
('Görev', 'Standart görev', '#3498db', 'task'),
('Hata', 'Hata raporu', '#e74c3c', 'bug_report'),
('Özellik', 'Yeni özellik', '#2ecc71', 'new_releases'),
('İyileştirme', 'Mevcut özellik iyileştirmesi', '#f39c12', 'upgrade')
ON CONFLICT DO NOTHING;

-- Fonksiyonlar

-- Kullanıcının görevlerini getir
CREATE OR REPLACE FUNCTION get_user_tasks(p_user_id UUID)
RETURNS SETOF tasks
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM tasks
  WHERE assignee_id = p_user_id AND is_archived = FALSE
  ORDER BY updated_at DESC;
$$;

-- Kullanıcının projelerini getir
CREATE OR REPLACE FUNCTION get_user_projects(p_user_id UUID)
RETURNS SETOF projects
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT p.* FROM projects p
  JOIN project_members pm ON p.id = pm.project_id
  WHERE pm.user_id = p_user_id AND p.is_archived = FALSE
  UNION
  SELECT p.* FROM projects p
  WHERE p.owner_id = p_user_id AND p.is_archived = FALSE
  ORDER BY p.updated_at DESC;
$$;

-- Projenin görevlerini getir
CREATE OR REPLACE FUNCTION get_project_tasks(p_project_id UUID)
RETURNS SETOF tasks
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT * FROM tasks
  WHERE project_id = p_project_id AND is_archived = FALSE
  ORDER BY position, updated_at DESC;
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
  v_max_position INTEGER;
BEGIN
  -- Mevcut en yüksek pozisyonu bul
  SELECT COALESCE(MAX(position), 0) INTO v_max_position
  FROM tasks
  WHERE project_id = p_project_id AND status_id = p_status_id;
  
  -- Yeni görevi ekle
  INSERT INTO tasks (
    title,
    description,
    project_id,
    status_id,
    priority_id,
    type_id,
    reporter_id,
    assignee_id,
    due_date,
    estimated_hours,
    position,
    original_estimate,
    remaining_estimate
  ) VALUES (
    p_title,
    p_description,
    p_project_id,
    p_status_id,
    p_priority_id,
    p_type_id,
    p_reporter_id,
    p_assignee_id,
    p_due_date,
    p_estimated_hours,
    v_max_position + 1,
    p_estimated_hours,
    p_estimated_hours
  ) RETURNING * INTO v_task;
  
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
  v_old_status_id UUID;
  v_old_assignee_id UUID;
BEGIN
  -- Eski değerleri al
  SELECT status_id, assignee_id INTO v_old_status_id, v_old_assignee_id
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
  
  -- Durum değişikliği varsa geçmişe ekle
  IF v_old_status_id IS DISTINCT FROM p_status_id THEN
    INSERT INTO task_history (
      task_id,
      user_id,
      field_name,
      old_value,
      new_value
    ) VALUES (
      p_task_id,
      auth.uid(),
      'status_id',
      v_old_status_id::TEXT,
      p_status_id::TEXT
    );
  END IF;
  
  -- Atanan kişi değişikliği varsa geçmişe ekle
  IF v_old_assignee_id IS DISTINCT FROM p_assignee_id THEN
    INSERT INTO task_history (
      task_id,
      user_id,
      field_name,
      old_value,
      new_value
    ) VALUES (
      p_task_id,
      auth.uid(),
      'assignee_id',
      v_old_assignee_id::TEXT,
      p_assignee_id::TEXT
    );
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
  SET is_archived = TRUE, updated_at = NOW()
  WHERE id = p_task_id;
  
  RETURN TRUE;
END;
$$;

-- RLS Politikaları

-- Projeler tablosu için RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_select_policy ON projects
  FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY projects_insert_policy ON projects
  FOR INSERT
  WITH CHECK (
    owner_id = auth.uid()
  );

CREATE POLICY projects_update_policy ON projects
  FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members pm
      JOIN project_roles pr ON pm.role_id = pr.id
      JOIN role_permissions rp ON pr.id = rp.role_id
      WHERE pm.project_id = id AND pm.user_id = auth.uid() AND rp.permission_key = 'project:update'
    )
  );

CREATE POLICY projects_delete_policy ON projects
  FOR DELETE
  USING (
    owner_id = auth.uid()
  );

-- Görevler tablosu için RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY tasks_select_policy ON tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pm.user_id = auth.uid())
    )
  );

CREATE POLICY tasks_insert_policy ON tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pm.user_id = auth.uid())
    )
  );

CREATE POLICY tasks_update_policy ON tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pm.user_id = auth.uid())
    )
  );

CREATE POLICY tasks_delete_policy ON tasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.id = project_id AND (p.owner_id = auth.uid() OR pm.user_id = auth.uid())
    )
  );

-- Tetikleyiciler

-- Proje güncellendiğinde updated_at alanını güncelle
CREATE OR REPLACE FUNCTION update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_timestamp_trigger
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_project_timestamp();

-- Görev güncellendiğinde updated_at alanını güncelle
CREATE OR REPLACE FUNCTION update_task_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_task_timestamp_trigger
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_task_timestamp(); 