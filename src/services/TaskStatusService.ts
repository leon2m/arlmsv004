import { supabase } from '@/lib/supabase';
import { TaskStatus } from '@/types/taskManagement';
import { BaseService } from './BaseService';

/**
 * Görev durumları yönetim servisi
 */
export class TaskStatusService extends BaseService {
  private static instance: TaskStatusService;

  private constructor() {
    super();
  }

  /**
   * Singleton instance
   */
  public static getInstance(): TaskStatusService {
    if (!TaskStatusService.instance) {
      TaskStatusService.instance = new TaskStatusService();
    }
    return TaskStatusService.instance;
  }

  /**
   * Proje için görev durumlarını getirir
   * @param projectId Proje ID'si
   * @returns Görev durumları listesi
   */
  async getTaskStatuses(projectId: string): Promise<TaskStatus[]> {
    try {
      const { data, error } = await supabase
        .from('task_statuses')
        .select('*')
        .eq('project_id', projectId)
        .order('position');

      if (error) {
        console.error('Durumlar getirilirken hata:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Durumlar getirilirken hata:', error);
      throw error;
    }
  }

  /**
   * Proje için varsayılan görev durumlarını oluşturur
   * @param projectId Proje ID'si
   * @returns Oluşturulan durumlar
   */
  async createDefaultTaskStatuses(projectId: string): Promise<TaskStatus[]> {
    try {
      const defaultStatuses = [
        {
          name: 'Yapılacak',
          description: 'Henüz başlanmamış görevler',
          color: '#3498db',
          project_id: projectId,
          position: 1,
          is_default: true,
          status_category: 'to-do',
          icon: 'assignment'
        },
        {
          name: 'Devam Ediyor',
          description: 'Üzerinde çalışılan görevler',
          color: '#f1c40f',
          project_id: projectId,
          position: 2,
          is_default: true,
          status_category: 'in-progress',
          icon: 'autorenew'
        },
        {
          name: 'Tamamlandı',
          description: 'Tamamlanmış görevler',
          color: '#2ecc71',
          project_id: projectId,
          position: 3,
          is_default: true,
          status_category: 'done',
          icon: 'check_circle'
        }
      ];

      const { data, error } = await supabase
        .from('task_statuses')
        .insert(defaultStatuses)
        .select();

      if (error) {
        console.error('Varsayılan durumlar oluşturulurken hata:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Varsayılan durumlar oluşturulurken hata:', error);
      throw error;
    }
  }

  /**
   * Yeni bir görev durumu oluşturur
   * @param status Durum verileri
   * @returns Oluşturulan durum
   */
  async createStatus(status: Partial<TaskStatus>): Promise<TaskStatus> {
    try {
      const currentTimestamp = new Date().toISOString();
      const newStatus = {
        ...status,
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
        color: status.color || '#3498db',
        icon: status.icon || 'task_alt',
        status_category: status.status_category || 'to-do',
        is_default: status.is_default || false,
        position: status.position || 0
      };

      const { data, error } = await supabase
        .from('task_statuses')
        .insert([newStatus])
        .select()
        .single();

      if (error) {
        console.error('Durum oluşturulurken hata:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Durum oluşturulurken hata:', error);
      throw error;
    }
  }

  /**
   * Görev durumunu günceller
   * @param statusId Durum ID'si
   * @param status Güncellenecek durum verileri
   * @returns Güncellenen durum
   */
  async updateStatus(statusId: string, status: Partial<TaskStatus>): Promise<TaskStatus> {
    try {
      const updateData = {
        ...status,
        updated_at: new Date().toISOString(),
        color: status.color || '#3498db',
        icon: status.icon || 'task_alt',
        status_category: status.status_category || 'to-do'
      };

      const { data, error } = await supabase
        .from('task_statuses')
        .update(updateData)
        .eq('id', statusId)
        .select()
        .single();

      if (error) {
        console.error('Durum güncellenirken hata:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      throw error;
    }
  }

  /**
   * Görev durumunu siler
   * @param statusId Durum ID'si
   * @returns İşlem başarılı ise true
   */
  async deleteStatus(statusId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('task_statuses')
        .delete()
        .eq('id', statusId);

      if (error) {
        console.error('Durum silinirken hata:', error);
        throw error;
      }
    } catch (error) {
      console.error('Durum silinirken hata:', error);
      throw error;
    }
  }

  /**
   * Durum pozisyonunu günceller
   * @param statusId Durum ID'si
   * @param newPosition Yeni pozisyon
   * @returns Güncellenen durum
   */
  async updateStatusPosition(statusId: string, newPosition: number): Promise<TaskStatus> {
    try {
      const { data, error } = await supabase
        .from('task_statuses')
        .update({
          position: newPosition,
          updated_at: new Date().toISOString()
        })
        .eq('id', statusId)
        .select()
        .single();
      
      if (error) {
        console.error('Durum pozisyonu güncellenirken hata:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Durum pozisyonu güncellenirken hata:', error);
      throw error;
    }
  }
}

// Singleton instance
export const taskStatusService = TaskStatusService.getInstance(); 