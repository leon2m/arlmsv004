import { supabase } from '@/lib/supabase';
import { BaseService } from './BaseService';
import { TaskComment } from '@/types/taskManagement';

/**
 * Yorum yönetim servisi
 */
export class CommentService extends BaseService {
  /**
   * Görev yorumlarını getirir
   * @param taskId Görev ID'si
   * @returns Yorumlar listesi
   */
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          id,
          task_id,
          user_id,
          content,
          created_at,
          updated_at
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Yorumlar alınırken hata:', error);
      return [];
    }
  }

  /**
   * Yeni bir yorum ekler
   * @param taskId Görev ID'si
   * @param content Yorum içeriği
   * @returns Eklenen yorum
   */
  async addComment(taskId: string, content: string): Promise<TaskComment | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('Kullanıcı oturumu bulunamadı');
      
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: userId,
          content: content
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Yorum eklenirken hata:', error);
      return null;
    }
  }

  /**
   * Bir yorumu günceller
   * @param commentId Yorum ID'si
   * @param content Yeni yorum içeriği
   * @returns Güncellenen yorum
   */
  async updateComment(commentId: string, content: string): Promise<TaskComment | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('Kullanıcı oturumu bulunamadı');
      
      // Önce yorumun sahibi olduğundan emin ol
      const { data: comment, error: checkError } = await supabase
        .from('task_comments')
        .select('user_id')
        .eq('id', commentId)
        .single();
      
      if (checkError) throw checkError;
      
      if (comment.user_id !== userId) {
        throw new Error('Bu yorumu düzenleme yetkiniz yok');
      }
      
      const { data, error } = await supabase
        .from('task_comments')
        .update({
          content: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Yorum güncellenirken hata:', error);
      return null;
    }
  }

  /**
   * Bir yorumu siler
   * @param commentId Yorum ID'si
   * @returns İşlem başarılıysa true, değilse false
   */
  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('Kullanıcı oturumu bulunamadı');
      
      // Önce yorumun sahibi olduğundan emin ol
      const { data: comment, error: checkError } = await supabase
        .from('task_comments')
        .select('user_id')
        .eq('id', commentId)
        .single();
      
      if (checkError) throw checkError;
      
      if (comment.user_id !== userId) {
        throw new Error('Bu yorumu silme yetkiniz yok');
      }
      
      const { error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Yorum silinirken hata:', error);
      return false;
    }
  }
}