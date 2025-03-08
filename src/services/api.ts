// Merkezi Supabase istemcisini kullan
import { supabase } from '../lib/supabase';
import axios from 'axios';

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

// API temel URL'si
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Axios instance oluştur
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// İstek interceptor'ı - her istekte token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Cevap interceptor'ı - hata yönetimi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 401 hatası ve refresh token varsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh token ile yeni token al
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });
          
          // Yeni token'ı kaydet
          const { token } = response.data;
          localStorage.setItem('token', token);
          
          // Orijinal isteği yeni token ile tekrarla
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token hatası - kullanıcıyı logout yap
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Mock API fonksiyonları
export const mockApi = {
  // Gecikme simülasyonu
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock veri döndür
  get: async (url: string) => {
    await mockApi.delay(500); // 500ms gecikme
    
    // URL'ye göre mock veri döndür
    if (url.includes('/projects')) {
      return { data: mockData.projects };
    }
    
    if (url.includes('/tasks')) {
      return { data: mockData.tasks };
    }
    
    return { data: {} };
  },
  
  // Mock post isteği
  post: async (url: string, data: any) => {
    await mockApi.delay(700); // 700ms gecikme
    
    // Yeni ID oluştur
    const newId = `${Date.now()}`;
    
    return {
      data: {
        ...data,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  },
  
  // Mock put isteği
  put: async (url: string, data: any) => {
    await mockApi.delay(600); // 600ms gecikme
    
    return {
      data: {
        ...data,
        updated_at: new Date().toISOString(),
      },
    };
  },
  
  // Mock delete isteği
  delete: async (url: string) => {
    await mockApi.delay(500); // 500ms gecikme
    
    return { data: { success: true } };
  },
};

// Mock veri
const mockData = {
  projects: [
    {
      id: 'project-1',
      name: 'Web Uygulaması Geliştirme',
      key: 'WEB',
      description: 'Yeni web uygulaması geliştirme projesi',
      type: 'software',
      created_at: '2023-11-15',
      updated_at: '2023-12-01',
      status: 'active',
      owner_id: 'user-1',
    },
    {
      id: 'project-2',
      name: 'Mobil Uygulama Geliştirme',
      key: 'MOB',
      description: 'iOS ve Android için mobil uygulama geliştirme',
      type: 'software',
      created_at: '2023-10-20',
      updated_at: '2023-11-25',
      status: 'active',
      owner_id: 'user-2',
    },
  ],
  
  tasks: [
    {
      id: 'task-1',
      title: 'Tasarım dokümanlarını hazırla',
      description: 'Proje için gerekli tasarım dokümanlarını hazırla ve paylaş.',
      status_id: 'todo',
      priority_id: 'high',
      assignee_id: 'user-1',
      due_date: '2023-12-15',
      created_at: '2023-11-30',
      updated_at: '2023-11-30',
      project_id: 'project-1',
      estimated_hours: 8
    },
    {
      id: 'task-2',
      title: 'API entegrasyonunu tamamla',
      description: 'Backend API ile frontend entegrasyonunu tamamla.',
      status_id: 'in-progress',
      priority_id: 'medium',
      assignee_id: 'user-2',
      due_date: '2023-12-20',
      created_at: '2023-12-01',
      updated_at: '2023-12-05',
      project_id: 'project-1',
      estimated_hours: 16
    },
    {
      id: 'task-3',
      title: 'Test senaryolarını yaz',
      description: 'Uygulama için test senaryolarını hazırla ve dokümante et.',
      status_id: 'completed',
      priority_id: 'low',
      assignee_id: 'user-3',
      due_date: '2023-12-10',
      created_at: '2023-12-02',
      updated_at: '2023-12-08',
      project_id: 'project-1',
      estimated_hours: 4
    },
  ],
};
