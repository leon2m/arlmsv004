import { supabase } from '@/lib/supabase';
import { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  TaskType, 
  TaskTag,
  TaskDependency,
  TaskNotification,
  TimeLog,
  CustomField,
  CustomFieldValue,
  Project
} from '@/types/taskManagement';
import { api } from './api';
import { taskStatusService } from './TaskStatusService';
import { taskPriorityService } from './TaskPriorityService';
import { taskOperationsService } from './TaskOperationsService';
import { BaseService } from './BaseService';

/**
 * Görev yönetim servisi
 */
export class TaskService extends BaseService {
  private static instance: TaskService;

  private constructor() {
    super();
  }

  /**
   * Singleton instance
   */
  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  /**
   * Geçerli kullanıcı ID'sini getirir
   */
  public async getCurrentUserId(): Promise<string | null> {
    return super.getCurrentUserId();
  }

  /**
   * Tüm görevleri getir
   * @param projectId Proje ID'si (opsiyonel)
   * @returns Görevler listesi
   */
  async getTasks(projectId?: string): Promise<Task[]> {
    try {
      let query = supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          status_id,
          assignee_id,
          reporter_id,
          project_id,
          priority_id,
          due_date,
          estimated_time,
          position,
          created_at,
          updated_at,
          created_by,
          project:projects(id, name, key),
          status:task_statuses(id, name, color, position),
          priority:task_priorities(id, name, color, icon),
          type:task_types(id, name, color, icon)
        `)
        .order('position', { ascending: true });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Görevler getirilirken hata:', error.message);
        console.error('Hata detayları:', error);
        return [];
      }
      
      // Kullanıcı bilgilerini ayrı bir sorgu ile alalım
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(task => [
          task.assignee_id, 
          task.reporter_id, 
          task.created_by
        ]).flat())].filter(Boolean);

        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, email')
            .in('id', userIds);

          if (!profilesError && profiles) {
            const tasksWithUsers = data.map(task => ({
              ...task,
              assignee: profiles.find(u => u.id === task.assignee_id),
              reporter: profiles.find(u => u.id === task.reporter_id),
              creator: profiles.find(u => u.id === task.created_by)
            })) as Task[];
            
            return tasksWithUsers;
          }
        }
      }
      
      return data as Task[] || [];
    } catch (error) {
      console.error('Görevler getirilirken beklenmeyen hata:', error);
      return [];
    }
  }

  /**
   * Görev detaylarını getir
   * @param taskId Görev ID'si
   * @returns Görev detayları
   */
  async getTaskById(taskId: string): Promise<Task> {
    return this.executeQuery(
      supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(*),
          reporter:reporter_id(*),
          creator:created_by(*),
          status:status_id(*)
        `)
        .eq('id', taskId)
        .single(),
      'Görev detayı getirilirken hata'
    );
  }

  /**
   * Yeni görev oluştur
   * @param task Görev verileri
   * @returns Oluşturulan görev
   */
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    return taskOperationsService.createTask(task);
  }

  /**
   * Görevi güncelle
   * @param taskId Görev ID'si
   * @param task Güncellenecek görev verileri
   * @returns Güncellenen görev
   */
  async updateTask(taskId: string, task: Partial<Task>): Promise<Task> {
    return this.executeQuery(
      supabase
        .from('tasks')
        .update({
          ...task,
          updated_at: this.getCurrentTimestamp()
        })
        .eq('id', taskId)
        .select()
        .single(),
      'Görev güncellenirken hata'
    );
  }

  /**
   * Görevi sil
   * @param taskId Görev ID'si
   * @returns İşlem başarılı ise true
   */
  async deleteTask(taskId: string): Promise<void> {
    await this.executeQuery(
      supabase
        .from('tasks')
        .delete()
        .eq('id', taskId),
      'Görev silinirken hata'
    );
  }

  /**
   * Görev durumlarını getir
   * @param projectId Proje ID'si
   * @returns Görev durumları listesi
   */
  async getTaskStatuses(projectId: string): Promise<TaskStatus[]> {
    return taskStatusService.getTaskStatuses(projectId);
  }

  /**
   * Yeni görev durumu oluştur
   * @param status Durum verileri
   * @returns Oluşturulan durum
   */
  async createStatus(status: Omit<TaskStatus, 'id' | 'created_at' | 'updated_at'>): Promise<TaskStatus> {
    return taskStatusService.createStatus(status);
  }

  /**
   * Görev durumunu güncelle
   * @param statusId Durum ID'si
   * @param status Güncellenecek durum verileri
   * @returns Güncellenen durum
   */
  async updateStatus(statusId: string, status: Partial<TaskStatus>): Promise<TaskStatus> {
    return taskStatusService.updateStatus(statusId, status);
  }

  /**
   * Görev durumunu sil
   * @param statusId Durum ID'si
   */
  async deleteStatus(statusId: string): Promise<void> {
    return taskStatusService.deleteStatus(statusId);
  }

  /**
   * Görev önceliklerini getir
   * @param projectId Proje ID'si
   * @returns Görev öncelikleri listesi
   */
  async getTaskPriorities(projectId: string): Promise<TaskPriority[]> {
    return taskPriorityService.getTaskPriorities(projectId);
  }

  /**
   * Yeni görev önceliği oluştur
   * @param priority Öncelik verileri
   * @param projectId Proje ID'si
   * @returns Oluşturulan öncelik
   */
  async createPriority(
    priority: Omit<TaskPriority, 'id' | 'created_at' | 'updated_at'>,
    projectId: string
  ): Promise<TaskPriority> {
    return taskPriorityService.createPriority(priority, projectId);
  }

  /**
   * Görev önceliğini güncelle
   * @param priorityId Öncelik ID'si
   * @param priority Güncellenecek öncelik verileri
   * @returns Güncellenen öncelik
   */
  async updatePriority(priorityId: string, priority: Partial<TaskPriority>): Promise<TaskPriority> {
    return taskPriorityService.updatePriority(priorityId, priority);
  }

  /**
   * Görev önceliğini sil
   * @param priorityId Öncelik ID'si
   * @returns İşlem başarılı ise true
   */
  async deletePriority(priorityId: string): Promise<boolean> {
    return taskPriorityService.deletePriority(priorityId);
  }

  /**
   * Belirli bir kullanıcının görevlerini getir
   * @param userId Kullanıcı ID'si
   * @returns Kullanıcının görevleri listesi
   */
  async getUserTasks(userId: string): Promise<Task[]> {
    try {
      if (!userId) {
        console.error('getUserTasks: userId is undefined or null');
        throw new Error('User ID is required');
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user tasks:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to get user tasks:', error);
      throw error;
    }
  }

  /**
   * Görev tiplerini getirir
   * @returns Görev tipleri listesi
   */
  async getTaskTypes(): Promise<TaskType[]> {
    try {
      const { data, error } = await supabase
        .from('task_types')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Görev tipleri alınırken hata:', error);
        // Hata durumunda varsayılan tipleri döndür
        return [
          {
            id: 'type-1',
            name: 'Görev',
            description: 'Standart görev',
            color: '#3498db',
            icon: 'task',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'type-2',
            name: 'Hata',
            description: 'Hata raporu',
            color: '#e74c3c',
            icon: 'bug_report',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'type-3',
            name: 'Özellik',
            description: 'Yeni özellik',
            color: '#2ecc71',
            icon: 'new_releases',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'type-4',
            name: 'İyileştirme',
            description: 'Mevcut özellik iyileştirmesi',
            color: '#f39c12',
            icon: 'upgrade',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      }
      
      return data || [];
    } catch (error) {
      console.error('Görev tipleri alınırken hata:', error);
      // Hata durumunda varsayılan tipleri döndür
      return [
        {
          id: 'type-1',
          name: 'Görev',
          description: 'Standart görev',
          color: '#3498db',
          icon: 'task',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'type-2',
          name: 'Hata',
          description: 'Hata raporu',
          color: '#e74c3c',
          icon: 'bug_report',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'type-3',
          name: 'Özellik',
          description: 'Yeni özellik',
          color: '#2ecc71',
          icon: 'new_releases',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'type-4',
          name: 'İyileştirme',
          description: 'Mevcut özellik iyileştirmesi',
          color: '#f39c12',
          icon: 'upgrade',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
  }

  /**
   * Görev etiketlerini getirir
   * @param projectId Proje ID'si
   * @returns Görev etiketleri listesi
   */
  async getTaskTags(projectId: string): Promise<TaskTag[]> {
    try {
      const { data, error } = await supabase
        .from('task_tags')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Görev etiketleri alınırken hata:', error);
      return [];
    }
  }

  /**
   * Görev bağımlılıklarını getirir
   * @param taskId Görev ID'si
   * @returns Görev bağımlılıkları listesi
   */
  async getTaskDependencies(taskId: string): Promise<TaskDependency[]> {
    try {
      const { data, error } = await supabase
        .from('task_dependencies')
        .select('*')
        .eq('task_id', taskId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Görev bağımlılıkları alınırken hata:', error);
      return [];
    }
  }

  /**
   * Görev bildirimlerini getirir
   * @returns Görev bildirimleri listesi
   */
  async getTaskNotifications(): Promise<TaskNotification[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('task_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Görev bildirimleri alınırken hata:', error);
      return [];
    }
  }

  /**
   * Zaman kayıtlarını getirir
   * @param taskId Görev ID'si
   * @returns Zaman kayıtları listesi
   */
  async getTimeLogs(taskId: string): Promise<TimeLog[]> {
    try {
      const { data, error } = await supabase
        .from('time_logs')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Zaman kayıtları alınırken hata:', error);
      return [];
    }
  }

  /**
   * Özel alanları getirir
   * @param projectId Proje ID'si
   * @returns Özel alanlar listesi
   */
  async getCustomFields(projectId: string): Promise<CustomField[]> {
    try {
      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Özel alanlar alınırken hata:', error);
      return [];
    }
  }

  /**
   * Özel alan değerlerini getirir
   * @param taskId Görev ID'si
   * @returns Özel alan değerleri listesi
   */
  async getCustomFieldValues(taskId: string): Promise<CustomFieldValue[]> {
    try {
      const { data, error } = await supabase
        .from('custom_field_values')
        .select('*')
        .eq('task_id', taskId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Özel alan değerleri alınırken hata:', error);
      return [];
    }
  }

  /**
   * Proje için görevleri getirir
   * @param projectId Proje ID
   * @returns Görev listesi
   */
  async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      if (!projectId) {
        console.error('getTasksByProject: projectId is undefined or null');
        throw new Error('Project ID is required');
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching project tasks:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to get project tasks:', error);
      throw error;
    }
  }

  /**
   * Görev durumunu günceller
   * @param taskId Görev ID
   * @param statusId Yeni durum ID
   * @returns Güncellenmiş görev
   */
  async updateTaskStatus(taskId: string, statusId: string): Promise<Task> {
    return this.executeQuery(
      supabase
        .from('tasks')
        .update({
          status_id: statusId,
          updated_at: this.getCurrentTimestamp()
        })
        .eq('id', taskId)
        .select()
        .single(),
      'Görev durumu güncellenirken hata'
    );
  }

  /**
   * Kullanıcının erişebileceği projeleri getirir
   * @returns Projeler listesi
   */
  async getProjects(): Promise<Project[]> {
    const projects = await this.executeQuery<Project[]>(
      supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false }),
      'Projeler getirilirken hata'
    );
    return projects || [];
  }

  /**
   * Yeni bir proje oluşturur
   * @param projectData Proje verileri
   * @returns Oluşturulan proje
   */
  async createProject(projectData: any): Promise<Project> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.error('createProject: userId is undefined or null');
        throw new Error('User ID is required');
      }
      
      // Proje verilerini hazırla
      const newProject = {
        name: projectData.name,
        key: projectData.key,
        description: projectData.description || '',
        owner_id: userId,
        status: 'active',
        type: 'kanban',
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Projeyi oluştur
      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  /**
   * Bir projeyi arşivler
   * @param projectId Proje ID'si
   * @returns İşlem başarılıysa true, değilse false
   */
  async archiveProject(projectId: string): Promise<boolean> {
    try {
      if (!projectId) {
        console.error('archiveProject: projectId is undefined or null');
        throw new Error('Project ID is required');
      }
      
      const { error } = await supabase
        .from('projects')
        .update({ is_archived: true, status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', projectId);
      
      if (error) {
        console.error('Error archiving project:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to archive project:', error);
      throw error;
    }
  }

  /**
   * Proje ID'sine göre proje detaylarını getirir
   * @param projectId Proje ID'si
   * @returns Proje detayları
   */
  async getProjectById(projectId: string): Promise<Project> {
    return this.executeQuery(
      supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single(),
      'Proje detayı getirilirken hata'
    );
  }
  
  /**
   * Proje için varsayılan görev durumlarını oluşturur
   * @param projectId Proje ID'si
   * @returns Oluşturulan durumlar
   */
  async createDefaultTaskStatuses(projectId: string): Promise<TaskStatus[]> {
    return taskStatusService.createDefaultTaskStatuses(projectId);
  }

  // Görev Ekleme
  async addTask(task: Partial<Task>): Promise<Task> {
    return this.executeQuery(
      supabase
        .from('tasks')
        .insert([{
          ...task,
          created_at: this.getCurrentTimestamp(),
          updated_at: this.getCurrentTimestamp()
        }])
        .select()
        .single(),
      'Görev eklenirken hata'
    );
  }

  // Görev Pozisyonunu Güncelleme
  async updateTaskPosition(taskId: string, newPosition: number): Promise<Task> {
    return this.executeQuery(
      supabase
        .from('tasks')
        .update({
          position: newPosition,
          updated_at: this.getCurrentTimestamp()
        })
        .eq('id', taskId)
        .select()
        .single(),
      'Görev pozisyonu güncellenirken hata'
    );
  }

  // Proje Ekleme
  async addProject(project: Partial<Project>): Promise<Project> {
    return this.executeQuery(
      supabase
        .from('projects')
        .insert([{
          ...project,
          created_at: this.getCurrentTimestamp(),
          updated_at: this.getCurrentTimestamp()
        }])
        .select()
        .single(),
      'Proje eklenirken hata'
    );
  }

  // Proje Güncelleme
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    return this.executeQuery(
      supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: this.getCurrentTimestamp()
        })
        .eq('id', projectId)
        .select()
        .single(),
      'Proje güncellenirken hata'
    );
  }

  // Proje Silme
  async deleteProject(projectId: string): Promise<void> {
    await this.executeQuery(
      supabase
        .from('projects')
        .delete()
        .eq('id', projectId),
      'Proje silinirken hata'
    );
  }
}

// Singleton instance
export const taskService = TaskService.getInstance();