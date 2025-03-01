// Merkezi Supabase istemcisini kullan
import { supabase } from '../lib/supabase';

// Supabase istemcisini dışa aktar (geriye dönük uyumluluk için)
export { supabase };

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

// Mock API fonksiyonları - gerçek veritabanı yoksa bu fonksiyonlar kullanılabilir
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

// Mock Supabase fonksiyonları
// Bu fonksiyonlar gerçek veritabanı olmadığı durumda kullanılır
const mockDB: Record<string, any> = {};

// Mevcut Supabase fonksiyonlarını patching
const originalFrom = supabase.from;
supabase.from = function(table: string) {
  // Orijinal fonksiyonu çağır
  const original = originalFrom.call(this, table);
  
  // Eğer tablo user_settings ise ve gerçek veritabanı bağlantısı yoksa
  if (table === 'user_settings') {
    const originalSelect = original.select;
    
    original.select = function(columns: string) {
      const originalQuery = originalSelect.call(this, columns);
      
      // Eq metodunu override et
      const originalEq = originalQuery.eq;
      originalQuery.eq = function(column: string, value: any) {
        // Orijinal eq'i çağır
        const result = originalEq.call(this, column, value);
        
        // Single metodunu override et
        const originalSingle = result.single;
        result.single = async function() {
          try {
            // Önce gerçek veritabanını dene
            const data = await originalSingle.call(this);
            
            // Eğer veri bulunamazsa mock veri döndür
            if (!data.data && column === 'user_id') {
              // Mock veriyi kaydet
              if (!mockDB[`${table}_${value}`]) {
                mockDB[`${table}_${value}`] = createMockUserSettings(value);
              }
              
              return {
                data: mockDB[`${table}_${value}`],
                error: null
              };
            }
            
            return data;
          } catch (error) {
            console.error('Error in Supabase query:', error);
            
            // Mock veriyi döndür
            if (column === 'user_id') {
              // Mock veriyi kaydet
              if (!mockDB[`${table}_${value}`]) {
                mockDB[`${table}_${value}`] = createMockUserSettings(value);
              }
              
              return {
                data: mockDB[`${table}_${value}`],
                error: null
              };
            }
            
            return { data: null, error };
          }
        };
        
        return result;
      };
      
      return originalQuery;
    };
  }
  
  // Upsert için override
  const originalUpsert = original.upsert;
  original.upsert = async function(value: any, options?: any) {
    try {
      // Orijinal upsert'i çağır
      const result = await originalUpsert.call(this, value, options);
      
      // Eğer gerçek veritabanı çalışmazsa mock verileri güncelle
      if ((result.error || !result.data) && table === 'user_settings' && value.user_id) {
        mockDB[`${table}_${value.user_id}`] = value;
        return { data: value, error: null };
      }
      
      return result;
    } catch (error) {
      console.error('Error in Supabase upsert:', error);
      
      // Mock olarak kaydet
      if (table === 'user_settings' && value.user_id) {
        mockDB[`${table}_${value.user_id}`] = value;
        return { data: value, error: null };
      }
      
      return { data: null, error };
    }
  };
  
  return original;
};

// Örnek kullanıcı yetkinlikleri verilerini ekle
export const initializeUserCompetencies = async (userId: string) => {
  try {
    // Önce yetkinlik setlerini kontrol et
    const { data: existingSets } = await supabase
      .from('competency_sets')
      .select('id');

    if (!existingSets?.length) {
      // Yetkinlik setlerini ekle
      const { data: sets } = await supabase
        .from('competency_sets')
        .insert([
          {
            name: 'İletişim Yetkinlikleri',
            description: 'Etkili iletişim ve işbirliği becerileri',
            category: 'Soft Skills'
          },
          {
            name: 'Teknik Yetkinlikler',
            description: 'Teknik ve mesleki beceriler',
            category: 'Hard Skills'
          },
          {
            name: 'Liderlik Yetkinlikleri',
            description: 'Liderlik ve yönetim becerileri',
            category: 'Leadership'
          }
        ])
        .select();

      if (sets) {
        // Yetkinlikleri ekle
        for (const set of sets) {
          await supabase.from('competencies').insert([
            {
              set_id: set.id,
              name: 'Ekip İçi İletişim',
              description: 'Ekip üyeleriyle etkili iletişim kurabilme',
              min_score: 1,
              max_score: 5
            },
            {
              set_id: set.id,
              name: 'Problem Çözme',
              description: 'Analitik düşünme ve problem çözme',
              min_score: 1,
              max_score: 5
            }
          ]);
        }
      }
    }

    // Kullanıcı yetkinliklerini ekle
    const { data: competencies } = await supabase
      .from('competencies')
      .select('id');

    if (competencies) {
      for (const comp of competencies) {
        await supabase.from('user_competencies').upsert({
          user_id: userId,
          competency_id: comp.id,
          current_score: 3.6,
          target_score: 5.0,
          last_assessment_date: new Date().toISOString(),
          next_assessment_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 gün sonra
        });
      }
    }
  } catch (error) {
    console.error('Yetkinlik verileri eklenirken hata:', error);
    throw error;
  }
};
