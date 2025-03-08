// Görev Yönetim Sistemi Tipleri

// Proje
export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  is_archived: boolean;
  project_type?: string;
  settings?: Record<string, any>;
}

// Ekip
export interface Team {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  members?: TeamMember[];
}

// Ekip Üyesi
export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  created_at: string;
  user?: User;
}

// Kullanıcı
export interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

// Proje Rolü
export interface ProjectRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  project_id?: string;
}

// Rol İzni
export interface RolePermission {
  id: string;
  role_id: string;
  permission_key: string;
  created_at: string;
}

// Proje Üyesi
export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role_id: string;
  created_at: string;
  updated_at: string;
}

// İş Akışı
export interface Workflow {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  transitions?: WorkflowTransition[];
}

// İş Akışı Geçişi
export interface WorkflowTransition {
  id: string;
  workflow_id: string;
  from_status_id: string;
  to_status_id: string;
  name: string;
  description: string | null;
  created_at: string;
  from_status?: TaskStatus;
  to_status?: TaskStatus;
}

// Görev Durumu
export interface TaskStatus {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  color: string;
  position: number;
  is_default: boolean;
  status_category: 'to-do' | 'in-progress' | 'done' | 'blocked' | 'review';
  icon: string;
  created_at: string;
  updated_at: string;
}

// Görev Önceliği
export interface TaskPriority {
  id: string;
  name: string;
  color: string;
  icon?: string;
  position: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Görev Tipi
export interface TaskType {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Görev
export interface Task {
  id: string;
  project_id: string;
  status_id: string;
  title: string;
  description?: string;
  priority_id: string;
  priority?: TaskPriority;
  due_date?: string;
  assignee_id?: string;
  reporter_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  position?: number;
  labels?: string[];
  attachments?: any[];
  metadata?: Record<string, any>;
  status_category?: 'to-do' | 'in-progress' | 'done';
  project?: Project;
  status?: TaskStatus;
  assignee?: User;
  reporter?: User;
  creator?: User;
  type?: TaskType;
}

// Epik
export interface Epic {
  id: string;
  project_id: string;
  name: string;
  summary: string | null;
  color: string;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

// Görev Etiketi
export interface TaskTag {
  id: string;
  name: string;
  color: string;
  project_id: string;
  created_at: string;
}

// Görev-Etiket İlişkisi
export interface TaskTagRelation {
  id: string;
  task_id: string;
  tag_id: string;
  created_at: string;
}

// Görev Yorumu
export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

// Görev Eki
export interface TaskAttachment {
  id: string;
  task_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string | null;
  created_at: string;
  user?: User;
}

// Görev Geçmişi
export interface TaskHistory {
  id: string;
  task_id: string;
  user_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  user?: User;
}

// Sprint
export interface Sprint {
  id: string;
  name: string;
  project_id: string;
  start_date: string | null;
  end_date: string | null;
  goal: string | null;
  status: 'planning' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
  complete_date: string | null;
  tasks?: Task[];
}

// Sprint-Görev İlişkisi
export interface SprintTask {
  id: string;
  sprint_id: string;
  task_id: string;
  created_at: string;
}

// Görev Bağımlılığı
export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: 'blocks' | 'is_blocked_by' | 'relates_to';
  created_at: string;
  depends_on_task?: Task;
}

// Bildirim
export interface TaskNotification {
  id: string;
  user_id: string;
  task_id: string;
  type: 'assigned' | 'mentioned' | 'due_soon' | 'status_changed';
  message: string;
  is_read: boolean;
  created_at: string;
  task?: {
    id: string;
    title: string;
    project_id: string;
  };
}

// Zaman Kaydı
export interface TimeLog {
  id: string;
  task_id: string;
  user_id: string;
  time_spent: number;
  start_time: string | null;
  end_time: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

// Özel Alan
export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox';
  options?: string[];
  required: boolean;
  project_id: string;
}

// Özel Alan Değeri
export interface CustomFieldValue {
  id: string;
  field_id: string;
  task_id: string;
  value: string | number | boolean | string[];
}

// Proje Şablonu
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  is_public: boolean;
  configuration: any;
  created_at: string;
  updated_at: string;
}

// Sürüm
export interface Version {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  release_date: string | null;
  status: 'unreleased' | 'released' | 'archived';
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

// Doküman
export interface Document {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  creator?: User;
}

// Pano
export interface Board {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  is_default: boolean;
}

// Pano Sütunu
export interface BoardColumn {
  id: string;
  name: string;
  board_id: string;
  status_id: string;
  order: number;
  limit?: number | null;
}

// Dosya eki tipi
export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  created_at: string;
  created_by: string;
  task_id: string;
}

// Yorum tipi
export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  task_id: string;
  parent_id?: string | null;
}

export interface TaskLabel {
  id: string;
  project_id: string;
  name: string;
  color?: string;
  created_at: string;
}

export interface TaskActivity {
  id: string;
  task_id: string;
  user_id: string;
  activity_type: string;
  old_value?: any;
  new_value?: any;
  created_at: string;
} 