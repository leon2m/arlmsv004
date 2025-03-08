import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string | null;
  organization: string | null;
  active_days_streak: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserStats {
  id?: string;
  user_id: string;
  xp: number;
  level: number;
  completedtrainings: number;
  monthlycompletions: number;
  streak: number;
  longeststreak: number;
  badges: number;
  totalhours: number;
  coursesinprogress: number;
  certificatesearned: number;
  contributions: number;
  mentoring?: any;
  weeklyprogress?: any;
  skilllevels?: any;
}

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Kullanıcı profili getir
  public async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      // userId kontrolü
      if (!userId) {
        console.error('getUserProfile: userId is undefined or null');
        throw new Error('User ID is required');
      }

      console.log('getUserProfile called with userId:', userId);

      // UUID formatını kontrol et
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.error('Invalid UUID format:', userId);
        throw new Error('Invalid UUID format');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // Profil bulunamadıysa yeni bir profil oluştur
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating a new one');
          return this.createUserProfile(userId);
        }
        
        throw error;
      }

      console.log('Profile data retrieved:', data);
      return data as UserProfile;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw new Error(`Kullanıcı profili alınamadı: ${error}`);
    }
  }
  
  // Yeni kullanıcı profili oluştur
  private async createUserProfile(userId: string): Promise<UserProfile> {
    try {
      const newProfile: UserProfile = {
        id: userId,
        full_name: '',
        avatar_url: null,
        role: null,
        organization: null,
        active_days_streak: 0
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }
      
      console.log('New profile created:', data);
      return data as UserProfile;
    } catch (error) {
      console.error('Failed to create user profile:', error);
      // Hata durumunda bile bir profil döndür
      return {
        id: userId,
        full_name: '',
        avatar_url: null,
        role: null,
        organization: null,
        active_days_streak: 0
      };
    }
  }
  
  // Kullanıcı profili güncelle
  public async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      if (!userId) {
        console.error('updateUserProfile: userId is undefined or null');
        throw new Error('User ID is required');
      }

      console.log('Updating profile for user:', userId, 'with data:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }

      console.log('Profile updated successfully:', data);
      return data as UserProfile;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  // Kullanıcı ayarlarını getir
  public async getUserSettings(userId: string): Promise<any> {
    try {
      if (!userId) {
        console.error('getUserSettings: userId is undefined or null');
        throw new Error('User ID is required');
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

      return data;
    } catch (error) {
      console.error('Failed to get user settings:', error);
      throw error;
    }
  }

  // Kullanıcı ayarlarını güncelle
  public async updateUserSettings(userId: string, settings: any): Promise<any> {
    try {
      if (!userId) {
        console.error('updateUserSettings: userId is undefined or null');
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Error updating user settings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to update user settings:', error);
      throw error;
    }
  }

  // Kullanıcı istatistiklerini getir
  public async getUserStats(userId: string): Promise<UserStats> {
    try {
      if (!userId) {
        console.error('getUserStats: userId is undefined or null');
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }

      return data as UserStats;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      throw error;
    }
  }
  
  // Kullanıcı istatistiklerini güncelle
  public async updateUserStats(userId: string, stats: Partial<UserStats>): Promise<UserStats> {
    try {
      if (!userId) {
        console.error('updateUserStats: userId is undefined or null');
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          ...stats,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Error updating user stats:', error);
        throw error;
      }

      return data as UserStats;
    } catch (error) {
      console.error('Failed to update user stats:', error);
      throw error;
    }
  }
}

export const userService = UserService.getInstance();
