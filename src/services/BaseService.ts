import { supabase } from '@/lib/supabase';

/**
 * Tüm servisler için temel sınıf
 */
export abstract class BaseService {
  protected constructor() {}

  /**
   * Mevcut kullanıcının ID'sini getirir
   * @returns Kullanıcı ID'si veya null
   */
  protected async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Oturum bilgisi alınırken hata:', error);
        return null;
      }
      
      if (!session) {
        console.warn('Aktif oturum bulunamadı');
        return null;
      }
      
      return session.user.id;
    } catch (error) {
      console.error('Kullanıcı ID\'si alınırken hata:', error);
      return null;
    }
  }

  /**
   * UUID formatını kontrol eder
   * @param id Kontrol edilecek ID
   * @returns Geçerli UUID ise true
   */
  protected isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  /**
   * Hata mesajını formatlar
   * @param error Hata objesi
   * @returns Formatlanmış hata mesajı
   */
  protected formatErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    if (error && error.message) {
      return error.message;
    }
    
    return 'Bilinmeyen bir hata oluştu';
  }

  /**
   * Tarih formatını kontrol eder
   * @param date Kontrol edilecek tarih
   * @returns Geçerli tarih ise true
   */
  protected isValidDate(date: string): boolean {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  }

  /**
   * Veritabanı hatasını işler
   * @param error Hata objesi
   * @param defaultMessage Varsayılan hata mesajı
   * @returns Hata mesajı
   */
  protected handleDatabaseError(error: any, defaultMessage: string = 'Veritabanı işlemi sırasında bir hata oluştu'): string {
    if (!error) {
      return defaultMessage;
    }
    
    // Supabase hata kodlarını kontrol et
    if (error.code) {
      switch (error.code) {
        case '42P01':
          return 'Tablo bulunamadı';
        case 'PGRST301':
          return 'Tabloya erişim reddedildi';
        case '23505':
          return 'Bu kayıt zaten mevcut';
        case '23503':
          return 'İlişkili kayıt bulunamadı';
        case '23502':
          return 'Zorunlu alanlar eksik';
        default:
          return `Veritabanı hatası: ${error.message || error.code}`;
      }
    }
    
    return this.formatErrorMessage(error) || defaultMessage;
  }

  protected async checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      throw new Error('Oturum bulunamadı');
    }
    return session;
  }

  protected handleError(error: any, message: string): never {
    console.error(message, error);
    throw error;
  }

  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  protected async executeQuery<T>(
    query: any,
    errorMessage: string
  ): Promise<T> {
    try {
      const { data, error } = await query;
      
      if (error) {
        console.error(errorMessage, error);
        // Handle specific Supabase error codes
        if (error.code === 'PGRST116') {
          return [] as unknown as T; // Record not found, return empty array
        }
        throw error;
      }
      
      return data as T;
    } catch (error) {
      console.error(errorMessage, error);
      throw error;
    }
  }
}
