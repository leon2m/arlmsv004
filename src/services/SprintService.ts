import { supabase } from '@/lib/supabase';
import { BaseService } from './BaseService';
import { Sprint } from '@/types/taskManagement';

/**
 * Sprint yönetim servisi
 */
export class SprintService extends BaseService {
  /**
   * Proje sprintlerini getirir
   * @param projectId Proje ID'si
   * @returns Sprintler listesi
   */
  async getSprints(projectId: string): Promise<Sprint[]> {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Sprintler alınırken hata:', error);
      return [];
    }
  }

  /**
   * Aktif sprinti getirir
   * @param projectId Proje ID'si
   * @returns Aktif sprint veya null
   */
  async getActiveSprint(projectId: string): Promise<Sprint | null> {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'active')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Aktif sprint bulunamadı
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Aktif sprint alınırken hata:', error);
      return null;
    }
  }

  /**
   * Belirli bir sprinti getirir
   * @param sprintId Sprint ID'si
   * @returns Sprint nesnesi veya null
   */
  async getSprint(sprintId: string): Promise<Sprint | null> {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('id', sprintId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Sprint alınırken hata (ID: ${sprintId}):`, error);
      return null;
    }
  }

  /**
   * Yeni bir sprint oluşturur
   * @param sprint Sprint verileri
   * @returns Oluşturulan sprint
   */
  async createSprint(sprint: Omit<Sprint, 'id' | 'created_at' | 'updated_at' | 'complete_date'>): Promise<Sprint | null> {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .insert(sprint)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sprint oluşturulurken hata:', error);
      return null;
    }
  }

  /**
   * Bir sprinti günceller
   * @param sprintId Sprint ID'si
   * @param sprint Güncellenecek sprint verileri
   * @returns Güncellenen sprint
   */
  async updateSprint(sprintId: string, sprint: Partial<Sprint>): Promise<Sprint | null> {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .update({
          ...sprint,
          updated_at: new Date().toISOString()
        })
        .eq('id', sprintId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sprint güncellenirken hata:', error);
      return null;
    }
  }

  /**
   * Bir sprinti başlatır
   * @param sprintId Sprint ID'si
   * @returns Başlatılan sprint
   */
  async startSprint(sprintId: string): Promise<Sprint | null> {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .update({
          status: 'active',
          start_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sprintId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sprint başlatılırken hata:', error);
      return null;
    }
  }

  /**
   * Bir sprinti tamamlar
   * @param sprintId Sprint ID'si
   * @returns Tamamlanan sprint
   */
  async completeSprint(sprintId: string): Promise<Sprint | null> {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .update({
          status: 'completed',
          complete_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sprintId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sprint tamamlanırken hata:', error);
      return null;
    }
  }

  /**
   * Bir sprinte görev ekler
   * @param sprintId Sprint ID'si
   * @param taskId Görev ID'si
   * @returns İşlem başarılıysa true, değilse false
   */
  async addTaskToSprint(sprintId: string, taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sprint_tasks')
        .insert({
          sprint_id: sprintId,
          task_id: taskId
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Görev sprinte eklenirken hata:', error);
      return false;
    }
  }

  /**
   * Bir sprintten görev çıkarır
   * @param sprintId Sprint ID'si
   * @param taskId Görev ID'si
   * @returns İşlem başarılıysa true, değilse false
   */
  async removeTaskFromSprint(sprintId: string, taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sprint_tasks')
        .delete()
        .eq('sprint_id', sprintId)
        .eq('task_id', taskId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Görev sprintten çıkarılırken hata:', error);
      return false;
    }
  }

  /**
   * Sprint görevlerini getirir
   * @param sprintId Sprint ID'si
   * @returns Görev ID'leri listesi
   */
  async getSprintTasks(sprintId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('sprint_tasks')
        .select('task_id')
        .eq('sprint_id', sprintId);
      
      if (error) throw error;
      return data.map(item => item.task_id) || [];
    } catch (error) {
      console.error('Sprint görevleri alınırken hata:', error);
      return [];
    }
  }
}