import { supabase } from './supabase';
import { Task } from '@/components/dashboard/types';

// Görevler tablosu için sabit değişkenler
const TASKS_TABLE = 'tasks';

// API için uyumlu veri tipleri
interface CreateTaskDTO {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string; // Client tarafında kullanılan ad
  status: 'in-progress' | 'todo' | 'completed';
  tags: string[];
  user_id: string;
}

// Veritabanı tarafında kullanılan tip
interface TaskDB {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string; // Veritabanında kullanılan ad
  status: 'in-progress' | 'todo' | 'completed';
  tags: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface UpdateTaskDTO {
  title?: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string;
  status?: 'in-progress' | 'todo' | 'completed';
  tags?: string[];
}

export const taskService = {
  /**
   * Kullanıcının görevlerini getirir
   * @param userId Kullanıcı ID'si
   * @returns Görevler listesi
   */
  async getUserTasks(userId: string) {
    try {
      if (!userId) {
        console.error('Geçerli bir kullanıcı ID\'si gerekli');
        return { data: null, error: new Error('Geçerli bir kullanıcı ID\'si gerekli') };
      }

      const { data, error } = await supabase
        .from(TASKS_TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Görevler alınırken hata:', error);
        return { data: null, error };
      }

      // Veritabanından gelen verileri client tarafı için uyumlu formata dönüştür
      const clientTasks: Task[] = data.map((task: TaskDB) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.due_date, // due_date -> dueDate dönüşümü
        status: task.status,
        tags: task.tags || [],
        user_id: task.user_id,
        created_at: task.created_at
      }));

      return { data: clientTasks, error: null };
    } catch (error) {
      console.error('Görevler alınırken beklenmeyen hata:', error);
      return { data: null, error };
    }
  },

  /**
   * Yeni bir görev oluşturur
   * @param taskData Görev verileri
   * @returns Oluşturulan görev
   */
  async createTask(taskData: CreateTaskDTO) {
    try {
      // user_id kontrolü yap
      if (!taskData.user_id) {
        console.error('Kullanıcı ID\'si eksik');
        return { data: null, error: new Error('Kullanıcı ID\'si gerekli') };
      }
      
      // dueDate alanını veritabanı uyumlu due_date alanına dönüştür
      const dbTaskData: any = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        due_date: taskData.dueDate, // dueDate -> due_date dönüşümü
        status: taskData.status,
        tags: taskData.tags,
        user_id: taskData.user_id
      };

      console.log('Gönderilen görev verileri:', dbTaskData);
      
      const { data, error } = await supabase
        .from(TASKS_TABLE)
        .insert([dbTaskData])
        .select()
        .single();

      if (error) {
        console.error('Görev oluşturulurken hata:', error);
        return { data: null, error };
      }

      // Veritabanından gelen veriyi client tarafı için uyumlu formata dönüştür
      const clientTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.due_date, // due_date -> dueDate dönüşümü
        status: data.status,
        tags: data.tags || [],
        user_id: data.user_id,
        created_at: data.created_at
      };

      return { data: clientTask, error: null };
    } catch (error) {
      console.error('Görev oluşturulurken beklenmeyen hata:', error);
      return { data: null, error };
    }
  },

  /**
   * Görevi günceller
   * @param taskId Görev ID'si
   * @param taskData Güncellenecek görev verileri
   * @returns Güncellenmiş görev
   */
  async updateTask(taskId: string, taskData: UpdateTaskDTO) {
    try {
      const { data, error } = await supabase
        .from(TASKS_TABLE)
        .update(taskData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Görev güncellenirken hata:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Görev güncellenirken beklenmeyen hata:', error);
      return { data: null, error };
    }
  },

  /**
   * Görevi siler
   * @param taskId Görev ID'si
   * @returns İşlem sonucu
   */
  async deleteTask(taskId: string) {
    try {
      const { error } = await supabase
        .from(TASKS_TABLE)
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Görev silinirken hata:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Görev silinirken beklenmeyen hata:', error);
      return { success: false, error };
    }
  },

  /**
   * Görevi tamamlandı olarak işaretler
   * @param taskId Görev ID'si
   * @param status Görev durumu
   * @returns Güncellenmiş görev
   */
  async updateTaskStatus(taskId: string, status: 'in-progress' | 'todo' | 'completed') {
    return await this.updateTask(taskId, { status });
  },

  /**
   * Görevin önceliğini günceller
   * @param taskId Görev ID'si
   * @param priority Görev önceliği
   * @returns Güncellenmiş görev
   */
  async updateTaskPriority(taskId: string, priority: 'high' | 'medium' | 'low') {
    return await this.updateTask(taskId, { priority });
  },

  /**
   * Geçici olarak örnek görevleri döndürür (Geliştirme için)
   * @returns Örnek görevler
   */
  getMockTasks() {
    return [
      {
        id: 't1',
        title: 'API Dokümantasyonu',
        description: 'REST API endpoints için Swagger dökümantasyonu hazırla',
        priority: 'high',
        dueDate: '2025-02-23',
        status: 'in-progress',
        tags: ['documentation', 'api'],
        user_id: 'mock-user-id',
        created_at: new Date().toISOString()
      },
      {
        id: 't2',
        title: 'Unit Testleri',
        description: 'Yeni eklenen özelliklerin birim testlerini yaz',
        priority: 'medium',
        dueDate: '2025-02-25',
        status: 'todo',
        tags: ['testing', 'quality'],
        user_id: 'mock-user-id',
        created_at: new Date().toISOString()
      },
      {
        id: 't3',
        title: 'Code Review',
        description: 'Frontend PR\'larını incele ve geri bildirim ver',
        priority: 'low',
        dueDate: '2025-02-24',
        status: 'todo',
        tags: ['review', 'collaboration'],
        user_id: 'mock-user-id',
        created_at: new Date().toISOString()
      },
      {
        id: 't4',
        title: 'Analitik Raporu',
        description: 'Kullanıcı davranışlarını analiz eden haftalık raporu hazırla',
        priority: 'medium',
        dueDate: '2025-02-26',
        status: 'todo',
        tags: ['analytics', 'reporting'],
        user_id: 'mock-user-id',
        created_at: new Date().toISOString()
      },
      {
        id: 't5',
        title: 'Performans Optimizasyonu',
        description: 'Ana sayfa yükleme süresini %20 azalt',
        priority: 'high',
        dueDate: '2025-02-28',
        status: 'todo',
        tags: ['performance', 'optimization'],
        user_id: 'mock-user-id',
        created_at: new Date().toISOString()
      }
    ] as Task[];
  }
};