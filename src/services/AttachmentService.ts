import { supabase } from '@/lib/supabase';
import { BaseService } from './BaseService';
import { TaskAttachment } from '@/types/taskManagement';

/**
 * Ek yönetim servisi
 */
export class AttachmentService extends BaseService {
  /**
   * Görev eklerini getirir
   * @param taskId Görev ID'si
   * @returns Ekler listesi
   */
  async getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
    try {
      const { data, error } = await supabase
        .from('task_attachments')
        .select(`
          id,
          task_id,
          user_id,
          file_name,
          file_path,
          file_size,
          file_type,
          created_at
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Ekler alınırken hata:', error);
      return [];
    }
  }

  /**
   * Yeni bir ek ekler
   * @param taskId Görev ID'si
   * @param file Dosya nesnesi
   * @returns Eklenen ek
   */
  async addAttachment(taskId: string, file: File): Promise<TaskAttachment | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('Kullanıcı oturumu bulunamadı');
      
      // Dosyayı storage'a yükle
      const filePath = `task-attachments/${taskId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Dosya URL'sini al
      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);
      
      // Ek kaydını oluştur
      const { data, error } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          user_id: userId,
          file_name: file.name,
          file_path: urlData.publicUrl,
          file_size: file.size,
          file_type: file.type
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Ek eklenirken hata:', error);
      return null;
    }
  }

  /**
   * Bir eki siler
   * @param attachmentId Ek ID'si
   * @returns İşlem başarılıysa true, değilse false
   */
  async deleteAttachment(attachmentId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('Kullanıcı oturumu bulunamadı');
      
      // Önce ekin bilgilerini al
      const { data: attachment, error: getError } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('id', attachmentId)
        .single();
      
      if (getError) throw getError;
      
      // Ekin sahibi olduğundan emin ol
      if (attachment.user_id !== userId) {
        throw new Error('Bu eki silme yetkiniz yok');
      }
      
      // Storage'dan dosyayı sil
      const filePath = attachment.file_path.split('/').slice(-3).join('/');
      const { error: storageError } = await supabase.storage
        .from('attachments')
        .remove([filePath]);
      
      if (storageError) throw storageError;
      
      // Ek kaydını sil
      const { error } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Ek silinirken hata:', error);
      return false;
    }
  }
}