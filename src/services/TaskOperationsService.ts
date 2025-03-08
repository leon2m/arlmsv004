import { supabase } from '@/lib/supabase';
import { Task } from '@/types/taskManagement';
import { BaseService } from './BaseService';

/**
 * Görev işlemleri servisi
 */
export class TaskOperationsService extends BaseService {
  private static instance: TaskOperationsService;

  private constructor() {
    super();
  }

  /**
   * Singleton instance
   */
  public static getInstance(): TaskOperationsService {
    if (!TaskOperationsService.instance) {
      TaskOperationsService.instance = new TaskOperationsService();
    }
    return TaskOperationsService.instance;
  }

  /**
   * Proje için görevleri getirir
   * @param projectId Proje ID'si
   * @param statusId Durum ID'si (opsiyonel)
   * @returns Görevler listesi
   */
  async getTasks(projectId: string, statusId?: string): Promise<Task[]> {
    try {
      if (!projectId) {
        console.error('getTasks: projectId is undefined or null');
        return [];
      }

      console.log('Getting tasks for project:', projectId, statusId ? `with status: ${statusId}` : '');
      
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (statusId) {
        query = query.eq('status_id', statusId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching tasks:', error);
        
        // Tablo bulunamadı veya erişim reddedildi hatası
        if (error.code === '42P01' || error.code === 'PGRST301') {
          console.warn('Tasks table not found or access denied, returning empty array');
          return [];
        }
        
        throw error;
      }
      
      if (!data) {
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get tasks:', error);
      return [];
    }
  }

  /**
   * Görev detaylarını getirir
   * @param taskId Görev ID'si
   * @returns Görev detayları
   */
  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      if (!taskId) {
        console.error('getTaskById: taskId is undefined or null');
        return null;
      }

      console.log('Getting task details for:', taskId);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
      
      if (error) {
        console.error('Error fetching task details:', error);
        
        // Kayıt bulunamadı hatası
        if (error.code === 'PGRST116') {
          console.warn('Task not found');
          return null;
        }
        
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get task details:', error);
      return null;
    }
  }

  /**
   * Yeni görev oluşturur
   * @param task Görev verileri
   * @returns Oluşturulan görev
   */
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    try {
      const now = new Date().toISOString();
      
      // Yeni görev oluştur
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();
      
      if (error) {
        console.error('Görev oluşturulurken hata:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Görev oluşturulurken hata:', error);
      throw error;
    }
  }

  /**
   * Görevi günceller
   * @param taskId Görev ID'si
   * @param task Güncellenecek görev verileri
   * @returns Güncellenen görev
   */
  async updateTask(taskId: string, task: Partial<Task>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...task,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) {
        console.error('Görev güncellenirken hata:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Görev güncellenirken hata:', error);
      throw error;
    }
  }

  /**
   * Görevi siler
   * @param taskId Görev ID'si
   * @returns İşlem başarılı ise true
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      // Alt görevleri kontrol et
      const { data: childTasks, error: childTasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('parent_task_id', taskId);
      
      if (childTasksError) {
        console.error('Alt görevler kontrol edilirken hata:', childTasksError);
        throw childTasksError;
      }
      
      // Eğer alt görevler varsa silme
      if (childTasks && childTasks.length > 0) {
        throw new Error(`Bu görevin ${childTasks.length} alt görevi bulunuyor. Silmeden önce alt görevleri silin.`);
      }
      
      // Görevi sil
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        console.error('Görev silinirken hata:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Görev silinirken hata:', error);
      throw error;
    }
  }

  /**
   * Görevin durumunu günceller
   * @param taskId Görev ID'si
   * @param statusId Yeni durum ID'si
   * @returns Güncellenen görev
   */
  async updateTaskStatus(taskId: string, statusId: string): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status_id: statusId,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) {
        console.error('Görev durumu güncellenirken hata:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Görev durumu güncellenirken hata:', error);
      throw error;
    }
  }

  /**
   * Görevin önceliğini günceller
   * @param taskId Görev ID'si
   * @param priorityId Yeni öncelik ID'si
   * @returns Güncellenen görev
   */
  async updateTaskPriority(taskId: string, priorityId: string): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          priority_id: priorityId,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) {
        console.error('Görev önceliği güncellenirken hata:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Görev önceliği güncellenirken hata:', error);
      throw error;
    }
  }

  /**
   * Görevi atama
   * @param taskId Görev ID'si
   * @param assigneeId Atanacak kullanıcı ID'si
   * @returns Güncellenen görev
   */
  async assignTask(taskId: string, assigneeId: string | null): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          assignee_id: assigneeId,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) {
        console.error('Görev atanırken hata:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Görev atanırken hata:', error);
      throw error;
    }
  }
}

// Singleton instance
export const taskOperationsService = TaskOperationsService.getInstance(); 