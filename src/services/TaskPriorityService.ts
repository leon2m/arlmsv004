import { supabase } from '@/lib/supabase';
import { TaskPriority } from '@/types/taskManagement';
import { BaseService } from './BaseService';

// Veritabanı için TaskPriority tipi (veritabanı sütunlarını içerir)
interface DbTaskPriority extends TaskPriority {
  project_id: string;
  value?: number;
}

/**
 * Görev öncelikleri yönetim servisi
 */
export class TaskPriorityService extends BaseService {
  private static instance: TaskPriorityService;

  private constructor() {
    super();
  }

  /**
   * Singleton instance
   */
  public static getInstance(): TaskPriorityService {
    if (!TaskPriorityService.instance) {
      TaskPriorityService.instance = new TaskPriorityService();
    }
    return TaskPriorityService.instance;
  }

  /**
   * Proje için görev önceliklerini getirir
   * @param projectId Proje ID'si
   * @returns Görev öncelikleri listesi
   */
  async getTaskPriorities(projectId: string): Promise<TaskPriority[]> {
    try {
      if (!projectId) {
        console.error('getTaskPriorities: projectId is undefined or null');
        return this.getDefaultTaskPriorities();
      }

      console.log('Getting task priorities for project:', projectId);
      
      const { data, error } = await supabase
        .from('task_priorities')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });
      
      if (error) {
        console.error('Error fetching task priorities:', error);
        
        // Tablo bulunamadı veya erişim reddedildi hatası
        if (error.code === '42P01' || error.code === 'PGRST301') {
          console.warn('Task priorities table not found or access denied, returning default priorities');
          return this.getDefaultTaskPriorities();
        }
        
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No task priorities found for project, creating default priorities');
        return this.createDefaultTaskPriorities(projectId);
      }
      
      // Veritabanından gelen verileri TaskPriority tipine dönüştür
      return data.map(item => this.mapDbToTaskPriority(item));
    } catch (error) {
      console.error('Failed to get task priorities:', error);
      return this.getDefaultTaskPriorities();
    }
  }

  /**
   * Yeni bir görev önceliği oluşturur
   * @param priority Öncelik verileri
   * @param projectId Proje ID'si
   * @returns Oluşturulan öncelik
   */
  async createPriority(
    priority: Omit<TaskPriority, 'id' | 'created_at' | 'updated_at'>, 
    projectId: string
  ): Promise<TaskPriority> {
    try {
      // Yeni öncelik oluştur
      const { data, error } = await supabase
        .from('task_priorities')
        .insert({
          name: priority.name,
          description: priority.description || '',
          color: priority.color || '#3498db',
          project_id: projectId,
          position: priority.position || 0,
          icon: priority.icon || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Öncelik oluşturulurken hata:', error);
        // Hata durumunda varsayılan bir öncelik döndür
        return {
          id: `temp-${Date.now()}`,
          name: priority.name,
          description: priority.description || '',
          color: priority.color,
          position: priority.position || 0,
          icon: priority.icon || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      return this.mapDbToTaskPriority(data);
    } catch (error) {
      console.error('Öncelik oluşturulurken hata:', error);
      // Hata durumunda varsayılan bir öncelik döndür
      return {
        id: `temp-${Date.now()}`,
        name: priority.name,
        description: priority.description || '',
        color: priority.color,
        position: priority.position || 0,
        icon: priority.icon || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  /**
   * Görev önceliğini günceller
   * @param priorityId Öncelik ID'si
   * @param priority Güncellenecek öncelik verileri
   * @returns Güncellenen öncelik
   */
  async updatePriority(priorityId: string, priority: Partial<TaskPriority>): Promise<TaskPriority> {
    try {
      const { data, error } = await supabase
        .from('task_priorities')
        .update({
          ...priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', priorityId)
        .select()
        .single();
      
      if (error) {
        console.error('Öncelik güncellenirken hata:', error);
        throw error;
      }
      
      return this.mapDbToTaskPriority(data);
    } catch (error) {
      console.error('Öncelik güncellenirken hata:', error);
      throw error;
    }
  }

  /**
   * Görev önceliğini siler
   * @param priorityId Öncelik ID'si
   * @returns İşlem başarılı ise true
   */
  async deletePriority(priorityId: string): Promise<boolean> {
    try {
      // Önce bu önceliğe ait görevleri kontrol et
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('priority_id', priorityId);
      
      if (tasksError) {
        console.error('Görevler kontrol edilirken hata:', tasksError);
        throw tasksError;
      }
      
      // Eğer bu öncelikte görevler varsa silme
      if (tasks && tasks.length > 0) {
        throw new Error(`Bu öncelikte ${tasks.length} görev bulunuyor. Silmeden önce görevleri başka bir önceliğe taşıyın.`);
      }
      
      // Önceliği sil
      const { error } = await supabase
        .from('task_priorities')
        .delete()
        .eq('id', priorityId);
      
      if (error) {
        console.error('Öncelik silinirken hata:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Öncelik silinirken hata:', error);
      throw error;
    }
  }

  /**
   * Varsayılan görev önceliklerini oluşturur
   * @param projectId Proje ID'si
   * @returns Oluşturulan öncelikler
   */
  private async createDefaultTaskPriorities(projectId: string): Promise<TaskPriority[]> {
    try {
      const now = new Date().toISOString();
      
      // Varsayılan öncelikleri hazırla
      const defaultPriorities = [
        {
          name: 'Düşük',
          description: 'Düşük öncelikli görevler',
          color: '#3498db',
          project_id: projectId,
          position: 1,
          icon: 'arrow_downward',
          created_at: now,
          updated_at: now
        },
        {
          name: 'Orta',
          description: 'Orta öncelikli görevler',
          color: '#f39c12',
          project_id: projectId,
          position: 2,
          icon: 'remove',
          created_at: now,
          updated_at: now
        },
        {
          name: 'Yüksek',
          description: 'Yüksek öncelikli görevler',
          color: '#e74c3c',
          project_id: projectId,
          position: 3,
          icon: 'arrow_upward',
          created_at: now,
          updated_at: now
        },
        {
          name: 'Acil',
          description: 'Acil görevler',
          color: '#c0392b',
          project_id: projectId,
          position: 4,
          icon: 'priority_high',
          created_at: now,
          updated_at: now
        }
      ];

      // Mevcut öncelikleri kontrol et
      const { data: existingPriorities, error: checkError } = await supabase
        .from('task_priorities')
        .select('name')
        .eq('project_id', projectId);

      if (checkError) {
        console.error('Mevcut öncelikler kontrol edilirken hata:', checkError);
        throw checkError;
      }

      // Sadece olmayan öncelikleri ekle
      const existingNames = new Set(existingPriorities?.map(p => p.name) || []);
      const prioritiesToAdd = defaultPriorities.filter(p => !existingNames.has(p.name));

      if (prioritiesToAdd.length === 0) {
        // Tüm öncelikler zaten mevcut, mevcut öncelikleri döndür
        const { data: allPriorities } = await supabase
          .from('task_priorities')
          .select('*')
          .eq('project_id', projectId)
          .order('position', { ascending: true });

        return allPriorities?.map(item => this.mapDbToTaskPriority(item)) || [];
      }

      // Eksik öncelikleri ekle
      const { data, error } = await supabase
        .from('task_priorities')
        .insert(prioritiesToAdd)
        .select();
      
      if (error) {
        console.error('Varsayılan öncelikler oluşturulurken hata:', error);
        return this.getDefaultTaskPriorities();
      }
      
      // Tüm öncelikleri getir (yeni eklenenler ve mevcut olanlar)
      const { data: allPriorities } = await supabase
        .from('task_priorities')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      return allPriorities?.map(item => this.mapDbToTaskPriority(item)) || [];
    } catch (error) {
      console.error('Varsayılan öncelikler oluşturulurken hata:', error);
      return this.getDefaultTaskPriorities();
    }
  }

  /**
   * Varsayılan görev önceliklerini döndürür
   * @returns Varsayılan öncelikler
   */
  private getDefaultTaskPriorities(): TaskPriority[] {
    const now = new Date().toISOString();
    
    return [
      {
        id: 'default-low',
        name: 'Düşük',
        description: 'Düşük öncelikli görevler',
        color: '#3498db',
        position: 1,
        icon: 'arrow_downward',
        created_at: now,
        updated_at: now
      },
      {
        id: 'default-medium',
        name: 'Orta',
        description: 'Orta öncelikli görevler',
        color: '#f39c12',
        position: 2,
        icon: 'remove',
        created_at: now,
        updated_at: now
      },
      {
        id: 'default-high',
        name: 'Yüksek',
        description: 'Yüksek öncelikli görevler',
        color: '#e74c3c',
        position: 3,
        icon: 'arrow_upward',
        created_at: now,
        updated_at: now
      },
      {
        id: 'default-urgent',
        name: 'Acil',
        description: 'Acil görevler',
        color: '#c0392b',
        position: 4,
        icon: 'priority_high',
        created_at: now,
        updated_at: now
      }
    ];
  }

  /**
   * Veritabanı nesnesini TaskPriority tipine dönüştürür
   * @param dbPriority Veritabanından gelen öncelik verisi
   * @returns TaskPriority nesnesi
   */
  private mapDbToTaskPriority(dbPriority: any): TaskPriority {
    return {
      id: dbPriority.id,
      name: dbPriority.name,
      description: dbPriority.description,
      color: dbPriority.color,
      position: dbPriority.position || dbPriority.value || 0,
      icon: dbPriority.icon,
      created_at: dbPriority.created_at,
      updated_at: dbPriority.updated_at
    };
  }
}

// Singleton instance
export const taskPriorityService = TaskPriorityService.getInstance(); 