import { supabase } from '../lib/supabase';
import { UserProfile } from './userService';

// Supabase istemcisini dışa aktar (geriye dönük uyumluluk için)
export { supabase };

// Kullanıcı işlemleri
export const userService = {
  getUserProfile: async (userId: string) => {
    try {
      // Kullanıcı ID'si kontrolü
      if (!userId) {
        console.error('getUserProfile: userId is undefined or null');
        throw new Error('User ID is required');
      }

      console.log(`Getting user profile for ID: ${userId}`);
      
      // UUID formatını kontrol et
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.warn(`Invalid UUID format: ${userId}`);
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
          
          const newProfile = {
            id: userId,
            full_name: 'Yeni Kullanıcı',
            avatar_url: null,
            email: '',
            phone: null,
            address: null,
            company: null,
            role: 'student',
            bio: null
          };
          
          const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();
          
          if (insertError) {
            console.error('Error creating new profile:', insertError);
            throw insertError;
          }
          
          return insertData;
        }
        
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Exception in getUserProfile:', error);
      throw error;
    }
  },

  updateUserProfile: async (userId: string, profileData: Partial<UserProfile>) => {
    try {
      // Kullanıcı ID'si kontrolü
      if (!userId) {
        console.error('updateUserProfile: userId is undefined or null');
        throw new Error('User ID is required');
      }

      console.log(`Updating user profile for ID: ${userId}`, profileData);
      
      // Güncellenecek verileri hazırla
      const { id, user_id, ...updateData } = profileData;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Exception in updateUserProfile:', error);
      throw error;
    }
  }
};

// Öğrenme analitikleri
export const analyticsService = {
  getUserStats: async (userId: string) => {
    try {
      if (!userId) {
        console.error('getUserStats: userId is undefined or null');
        throw new Error('User ID is required');
      }
      
      console.log('Getting user stats for userId:', userId);
      
      // UUID formatını kontrol et
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.error('Invalid UUID format:', userId);
        // Hata fırlatmak yerine varsayılan değerleri döndür
        return { data: createDefaultUserStatsObject(userId) };
      }
      
      try {
        // Kullanıcı istatistiklerini getir
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (error) {
          console.error('Error loading stats:', error);
          
          // Tablo yoksa veya erişim hatası varsa varsayılan değerleri döndür
          if (error.code === '42P01' || error.code === 'PGRST301') {
            console.warn('user_stats table may not exist or access denied, using default stats');
            return { data: createDefaultUserStatsObject(userId) };
          }
          
          throw error;
        }
        
        // Eğer veri yoksa varsayılan değerlerle yeni bir kayıt oluştur
        if (!data) {
          console.log('No stats found for user, using default stats');
          return { data: createDefaultUserStatsObject(userId) };
        }
        
        console.log('User stats retrieved:', data);
        return { data };
      } catch (dbError) {
        console.error('Database error when loading stats:', dbError);
        // Veritabanı hatası durumunda varsayılan değerleri döndür
        return { data: createDefaultUserStatsObject(userId) };
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Herhangi bir hata durumunda varsayılan değerleri döndür
      return { data: createDefaultUserStatsObject(userId) };
    }
  },

  updateUserStats: async (userId: string, stats: any) => {
    try {
      if (!userId) {
        console.error('updateUserStats: userId is undefined or null');
        throw new Error('User ID is required');
      }
      
      try {
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
          
          // Tablo yoksa veya erişim hatası varsa varsayılan değerleri döndür
          if (error.code === '42P01' || error.code === 'PGRST301') {
            console.warn('user_stats table may not exist or access denied, using provided stats');
            return { 
              user_id: userId, 
              ...stats,
              updated_at: new Date().toISOString() 
            };
          }
          
          throw error;
        }
        
        return data;
      } catch (dbError) {
        console.error('Database error when updating user stats:', dbError);
        // Veritabanı hatası durumunda gönderilen değerleri döndür
        return { 
          user_id: userId, 
          ...stats,
          updated_at: new Date().toISOString() 
        };
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
      // Herhangi bir hata durumunda gönderilen değerleri döndür
      return { 
        user_id: userId, 
        ...stats,
        updated_at: new Date().toISOString() 
      };
    }
  }
};

// Varsayılan kullanıcı istatistikleri nesnesi oluştur
function createDefaultUserStatsObject(userId: string) {
  return {
    user_id: userId,
    xp: 0,
    level: 1,
    completedTrainings: 0,
    monthlyCompletions: 0,
    streak: 0,
    longestStreak: 0,
    badges: 0,
    totalHours: 0,
    coursesInProgress: 0,
    certificatesEarned: 0,
    contributions: 0,
    mentoring: {
      sessions: 0,
      rating: 0,
      students: 0
    },
    weeklyProgress: {
      efficiency: 0,
      consistency: 0,
      focus: 0,
      target: 5,
      completed: 0
    },
    skillLevels: {
      frontend: 0,
      backend: 0,
      devops: 0,
      database: 0,
      testing: 0
    }
  };
}

// Varsayılan kullanıcı istatistikleri oluştur
async function createDefaultUserStats(userId: string) {
  try {
    console.log('Attempting to create default user stats for user:', userId);
    
    // Varsayılan istatistik verileri
    const defaultStats = createDefaultUserStatsObject(userId);
    
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .insert(defaultStats)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating default user stats:', error);
        
        // 403 hatası veya diğer izin hataları için varsayılan veriyi döndür
        if (error.code === '403' || error.code === 'PGRST301' || error.code === '23505' || error.code === '42P01') {
          console.warn('Permission denied or duplicate key or table not found when creating user stats. Using fallback data.');
          return { data: defaultStats };
        }
        
        throw error;
      }
      
      console.log('Default user stats created successfully:', data);
      return { data };
    } catch (insertError) {
      console.error('Failed to insert default user stats:', insertError);
      // Hata durumunda varsayılan veriyi döndür
      return { data: defaultStats };
    }
  } catch (error) {
    console.error('Failed to create default user stats:', error);
    // Herhangi bir hata durumunda varsayılan veriyi döndür
    return { data: createDefaultUserStatsObject(userId) };
  }
}

// Yetkinlik analitikleri
export const competencyService = {
  getUserCompetencies: async (userId: string) => {
    try {
      if (!userId) {
        console.error('getUserCompetencies: userId is undefined or null');
        throw new Error('User ID is required');
      }
      
      const { data, error } = await supabase
        .from('competency_sets')
        .select(`
          *,
          competencies (
            *,
            user_competencies (*)
          )
        `)
        .order('name');

      if (error) {
        console.error('Yetkinlikler yüklenirken hata:', error);
        throw error;
      }

      // Veriyi işle ve kullanıcıya özel hale getir
      const processedData = data.map((set: any) => ({
        ...set,
        competencies: set.competencies.map((comp: any) => ({
          ...comp,
          current_score: comp.user_competencies[0]?.current_score || 0,
          target_score: comp.user_competencies[0]?.target_score || comp.max_score,
          last_assessment_date: comp.user_competencies[0]?.last_assessment_date
        }))
      }));

      return processedData;
    } catch (error) {
      console.error('Yetkinlikler yüklenirken hata:', error);
      throw error;
    }
  },
  
  updateUserCompetency: async (userId: string, competencyId: string, data: any) => {
    try {
      if (!userId || !competencyId) {
        console.error('updateUserCompetency: userId ve competencyId gereklidir');
        throw new Error('User ID and Competency ID are required');
      }
      
      const { data: result, error } = await supabase
        .from('user_competencies')
        .upsert({
          user_id: userId,
          competency_id: competencyId,
          ...data,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,competency_id' })
        .select()
        .single();
      
      if (error) {
        console.error('Yetkinlik güncellenirken hata:', error);
        throw error;
      }
      
      return result;
    } catch (error) {
      console.error('Yetkinlik güncellenirken hata:', error);
      throw error;
    }
  }
};

// Kullanıcı adı güncelleme
export const updateUserName = async (userId: string, newName: string) => {
  try {
    if (!userId || !newName) {
      console.error('updateUserName: userId ve newName gereklidir');
      throw new Error('User ID and new name are required');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        full_name: newName,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user name:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in updateUserName:', error);
    throw error;
  }
};
