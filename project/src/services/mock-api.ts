import { supabase } from './supabase';

// Demo amaçlı veri yapısı
export interface UserSettings {
  user_id: string;
  settings: {
    preferences?: {
      general?: {
        language?: string;
        timezone?: string;
        dateFormat?: string;
        startPage?: string;
      };
      accessibility?: {
        highContrast?: boolean;
        largeText?: boolean;
        reducedMotion?: boolean;
        screenReader?: boolean;
      };
    };
    notifications?: {
      emailNotifications?: {
        courseUpdates?: boolean;
        assignments?: boolean;
        messages?: boolean;
        systemAnnouncements?: boolean;
      };
      pushNotifications?: {
        newMessages?: boolean;
        deadlineReminders?: boolean;
        courseNotifications?: boolean;
        loginAlerts?: boolean;
      };
    };
    appearance?: {
      theme?: {
        colorTheme?: string;
        fontFamily?: string;
        fontSize?: string;
        compactMode?: boolean;
      };
      layout?: {
        sidebarPosition?: string;
        menuCollapsed?: boolean;
        showBreadcrumbs?: boolean;
        denseLayout?: boolean;
      };
    };
    security?: {
      accountSecurity?: {
        twoFactorAuth?: boolean;
        sessionTimeout?: number;
        loginNotifications?: boolean;
        passwordChangeReminder?: number;
      };
      privacy?: {
        profileVisibility?: string;
        activityTracking?: boolean;
        dataSharing?: boolean;
        cookiePreferences?: string;
      };
    };
  };
  updated_at: string;
}

interface UserProfile {
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

// Mock veritabanı verisi
const mockDatabase: Record<string, any> = {
  user_profiles: {},
  user_settings: {}
};

// Kullanıcı profili oluştur
export const createMockUserProfile = (userId: string): UserProfile => {
  const nameSuffix = userId.substring(0, 4); 
  return {
    id: userId,
    full_name: `Demo Kullanıcı ${nameSuffix}`,
    avatar_url: null,
    email: `demo.user.${nameSuffix}@example.com`,
    phone: '+90 555 123 4567',
    address: 'İstanbul, Türkiye',
    company: 'Demo Şirket',
    role: 'Öğrenci',
    bio: 'Bu bir demo kullanıcı profilidir.'
  };
};

// Kullanıcı ayarları oluştur
export const createMockUserSettings = (userId: string): UserSettings => {
  return {
    user_id: userId,
    settings: {
      preferences: {
        general: {
          language: 'Türkçe',
          timezone: '(GMT+03:00) İstanbul',
          dateFormat: 'DD/MM/YYYY',
          startPage: 'Dashboard'
        },
        accessibility: {
          highContrast: false,
          largeText: false,
          reducedMotion: false,
          screenReader: false
        }
      },
      notifications: {
        emailNotifications: {
          courseUpdates: true,
          assignments: true,
          messages: true,
          systemAnnouncements: true
        },
        pushNotifications: {
          newMessages: true,
          deadlineReminders: true,
          courseNotifications: true,
          loginAlerts: true
        }
      },
      appearance: {
        theme: {
          colorTheme: 'Sistem',
          fontFamily: 'System',
          fontSize: 'Normal',
          compactMode: false
        },
        layout: {
          sidebarPosition: 'Sol',
          menuCollapsed: false,
          showBreadcrumbs: true,
          denseLayout: false
        }
      },
      security: {
        accountSecurity: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          loginNotifications: true,
          passwordChangeReminder: 90
        },
        privacy: {
          profileVisibility: 'Herkes',
          activityTracking: true,
          dataSharing: true,
          cookiePreferences: 'Tümü'
        }
      }
    },
    updated_at: new Date().toISOString()
  };
};

// Mock API servis fonksiyonları
export const mockApiService = {
  // Kullanıcı profili al
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      // Önce gerçek veritabanını dene
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Eğer mock veritabanında varsa kullan
        if (mockDatabase.user_profiles[userId]) {
          return mockDatabase.user_profiles[userId];
        }

        // Yoksa yeni mock veri oluştur
        const mockProfile = createMockUserProfile(userId);
        mockDatabase.user_profiles[userId] = mockProfile;
        return mockProfile;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Kullanıcı profili alınırken hata:', error);
      
      // Hata durumunda mock veri döndür
      if (!mockDatabase.user_profiles[userId]) {
        mockDatabase.user_profiles[userId] = createMockUserProfile(userId);
      }
      
      return mockDatabase.user_profiles[userId];
    }
  },

  // Kullanıcı profili güncelle
  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Önce gerçek veritabanını dene
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Mock veritabanını güncelle
        if (!mockDatabase.user_profiles[userId]) {
          mockDatabase.user_profiles[userId] = createMockUserProfile(userId);
        }
        
        mockDatabase.user_profiles[userId] = {
          ...mockDatabase.user_profiles[userId],
          ...profileData,
          updated_at: new Date().toISOString()
        };
        
        return mockDatabase.user_profiles[userId];
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Kullanıcı profili güncellenirken hata:', error);
      
      // Mock veritabanını güncelle
      if (!mockDatabase.user_profiles[userId]) {
        mockDatabase.user_profiles[userId] = createMockUserProfile(userId);
      }
      
      mockDatabase.user_profiles[userId] = {
        ...mockDatabase.user_profiles[userId],
        ...profileData,
        updated_at: new Date().toISOString()
      };
      
      return mockDatabase.user_profiles[userId];
    }
  },

  // Kullanıcı ayarlarını al
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      // Önce gerçek veritabanını dene
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Eğer mock veritabanında varsa kullan
        if (mockDatabase.user_settings[userId]) {
          return mockDatabase.user_settings[userId];
        }

        // Yoksa yeni mock veri oluştur
        const mockSettings = createMockUserSettings(userId);
        mockDatabase.user_settings[userId] = mockSettings;
        return mockSettings;
      }

      return data as UserSettings;
    } catch (error) {
      console.error('Kullanıcı ayarları alınırken hata:', error);
      
      // Hata durumunda mock veri döndür
      if (!mockDatabase.user_settings[userId]) {
        mockDatabase.user_settings[userId] = createMockUserSettings(userId);
      }
      
      return mockDatabase.user_settings[userId];
    }
  },

  // Kullanıcı ayarlarını güncelle
  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      // Önce gerçek veritabanını dene
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error || !data) {
        // Mock veritabanını güncelle
        if (!mockDatabase.user_settings[userId]) {
          mockDatabase.user_settings[userId] = createMockUserSettings(userId);
        }
        
        mockDatabase.user_settings[userId] = {
          ...mockDatabase.user_settings[userId],
          ...settings,
          updated_at: new Date().toISOString()
        };
        
        return mockDatabase.user_settings[userId];
      }

      return data as unknown as UserSettings;
    } catch (error) {
      console.error('Kullanıcı ayarları güncellenirken hata:', error);
      
      // Mock veritabanını güncelle
      if (!mockDatabase.user_settings[userId]) {
        mockDatabase.user_settings[userId] = createMockUserSettings(userId);
      }
      
      mockDatabase.user_settings[userId] = {
        ...mockDatabase.user_settings[userId],
        ...settings,
        updated_at: new Date().toISOString()
      };
      
      return mockDatabase.user_settings[userId];
    }
  }
}; 