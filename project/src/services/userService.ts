import { supabase } from './supabase';
import { mockApiService, UserSettings } from './mock-api';

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  company: string | null;
  role: string | null;
  bio: string | null;
}

export interface UserStats {
  xp: number;
  level: number;
  completed_trainings: number;
  monthly_completions: number;
  streak: number;
  longest_streak: number;
  badges: number;
  total_hours: number;
  courses_in_progress: number;
  certificates_earned: number;
  contributions: number;
}

export class UserService {
  private static instance: UserService;
  private mockEnabled: boolean = true; // Mock servisi aktif etmek için

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Mock modu değiştirme
  public toggleMockMode(enable: boolean): void {
    this.mockEnabled = enable;
    console.log(`Mock API ${enable ? 'aktif' : 'deaktif'} edildi`);
  }

  // Kullanıcı profili getir
  public async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      if (this.mockEnabled) {
        return await mockApiService.getUserProfile(userId);
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      
      // Hata durumunda geçici profil oluştur
      return {
        id: userId,
        full_name: `User ${userId.substring(0, 5)}`,
        avatar_url: null,
        email: `user.${userId.substring(0, 5)}@example.com`,
        phone: null,
        address: null, 
        company: null,
        role: null,
        bio: null
      };
    }
  }
  
  // Kullanıcı profili güncelle
  public async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      if (this.mockEnabled) {
        return await mockApiService.updateUserProfile(userId, profileData);
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  // Kullanıcı ayarlarını getir
  public async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      if (this.mockEnabled) {
        return await mockApiService.getUserSettings(userId);
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user settings:', error);
        throw error;
      }

      return data as UserSettings;
    } catch (error) {
      console.error('Failed to get user settings:', error);
      throw error;
    }
  }

  // Kullanıcı ayarlarını güncelle
  public async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      if (this.mockEnabled) {
        return await mockApiService.updateUserSettings(userId, settings);
      }

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error updating user settings:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Güncelleme tamamlandı ancak veri döndürülmedi');
      }

      // Güncellenmiş verileri tekrar çekelim
      const { data: updatedData, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (fetchError || !updatedData) {
        throw new Error('Güncelleme sonrası veri alınamadı');
      }

      return updatedData as UserSettings;
    } catch (error) {
      console.error('Failed to update user settings:', error);
      throw error;
    }
  }

  // Kullanıcı istatistiklerini getir (demo)
  public async getUserStats(userId: string): Promise<any> {
    try {
      // Gerçek veri yoksa rastgele değerler üret
      return {
        coursesCompleted: Math.floor(Math.random() * 15),
        certificatesEarned: Math.floor(Math.random() * 8),
        totalHoursLearned: Math.floor(Math.random() * 200),
        averageScore: Math.floor(70 + Math.random() * 30),
        activeDays: Math.floor(Math.random() * 30),
        currentStreak: Math.floor(Math.random() * 14)
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      // Hata durumunda varsayılan değerler
      return {
        coursesCompleted: 0,
        certificatesEarned: 0,
        totalHoursLearned: 0,
        averageScore: 0,
        activeDays: 0,
        currentStreak: 0
      };
    }
  }
}

export const userService = UserService.getInstance();
