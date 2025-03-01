import { supabase } from '../lib/supabase';

// Supabase istemcisini dışa aktar (geriye dönük uyumluluk için)
export { supabase };

// Kullanıcı işlemleri
export const userService = {
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profil yüklenirken hata:', error);
        
        // Mevcut oturum bilgilerini al
        const { data: sessionData } = await supabase.auth.getSession();
        const userEmail = sessionData?.session?.user?.email || '';
        const userName = userEmail ? userEmail.split('@')[0] : `Kullanıcı_${userId.substring(0, 6)}`;
        
        // Dinamik varsayılan profil verisi oluştur
        return {
          data: {
            id: userId,
            full_name: userName,
            title: 'Kullanıcı',
            bio: 'Profil bilgisi girilmemiş',
            avatar_url: `https://i.pravatar.cc/150?u=${userId}`, // Benzersiz avatar
            email: userEmail,
            department: 'Belirtilmemiş',
            role: 'Üye',
            joined_date: new Date().toISOString().split('T')[0],
            skills: [],
            certifications: []
          }
        };
      }

      return { data };
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      return { data: null, error };
    }
  },

  async updateUserProfile(userId: string, data: any) {
    return await supabase
      .from('user_profiles')
      .update(data)
      .eq('id', userId);
  }
};

// Öğrenme analitikleri
export const analyticsService = {
  async getUserStats(userId: string) {
    try {
      if (!userId) {
        throw new Error("Kullanıcı ID'si gereklidir");
      }
      
      // Önce kaç satır döndüğünü kontrol edelim
      const { count, error: countError } = await supabase
        .from('user_stats')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (countError) {
        console.error('İstatistik sayısı kontrol edilirken hata:', countError);
        throw countError;
      }
      
      // Eğer hiç sonuç yoksa veya birden fazla sonuç varsa, farklı bir sorgu yöntemi kullan
      if (count === 0) {
        console.log('Kullanıcı için istatistik bulunamadı, varsayılan değerler döndürülüyor');
        throw new Error('Kullanıcı istatistikleri bulunamadı');
      } else if (count && count > 1) {
        console.log(`Kullanıcı için ${count} istatistik bulundu, en sonuncusu alınıyor`);
        // En son oluşturulan istatistiği al
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('İstatistikler yüklenirken hata:', error);
          throw error;
        }
        
        return { data: data[0] };
      } else {
        // Tam olarak bir sonuç varsa, .single() kullanabiliriz
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error) {
          console.error('İstatistikler yüklenirken hata:', error);
          throw error;
        }
        
        return { data };
      }
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
      
      // Hata durumunda varsayılan değerleri döndür
      const defaultData = {
        user_id: userId,
        xp: 0,
        level: 1,
        completedTrainings: 0,
        monthlyCompletions: 0,
        streak: 0,
        longestStreak: 1,
        badges: 0,
        totalHours: 0,
        coursesInProgress: 0,
        certificatesEarned: 0,
        contributions: 0,
        weeklyProgress: {
          monday: 0,
          tuesday: 0,
          wednesday: 0,
          thursday: 0,
          friday: 0,
          saturday: 0,
          sunday: 0
        },
        skillLevels: {
          programming: 0,
          design: 0,
          dataAnalysis: 0,
          problemSolving: 0,
          communication: 0
        },
        lastActive: new Date().toISOString()
      };
      
      return { data: defaultData };
    }
  },

  async updateUserStats(userId: string, stats: any) {
    return await supabase
      .from('user_stats')
      .upsert({ user_id: userId, ...stats });
  }
};

// Yetkinlik analitikleri
export const competencyService = {
  async getUserCompetencies(userId: string) {
    try {
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
        // Varsayılan yetkinlik verisi
        return [
          {
            id: 'tech-001',
            name: 'Frontend Development',
            description: 'Modern web geliştirme teknolojileri',
            category: 'Hard Skills',
            competencies: [
              {
                id: 'comp-001',
                name: 'React.js',
                description: 'Modern React uygulamaları',
                current_score: 85,
                target_score: 95,
                min_score: 0,
                max_score: 100,
                last_assessment_date: '2025-02-15'
              },
              {
                id: 'comp-002',
                name: 'TypeScript',
                description: 'Tip güvenli geliştirme',
                current_score: 75,
                target_score: 90,
                min_score: 0,
                max_score: 100,
                last_assessment_date: '2025-02-10'
              }
            ]
          },
          {
            id: 'tech-002',
            name: 'Backend Development',
            description: 'Sunucu tarafı programlama',
            category: 'Hard Skills',
            competencies: [
              {
                id: 'comp-003',
                name: 'Node.js',
                description: 'Server-side JavaScript',
                current_score: 65,
                target_score: 85,
                min_score: 0,
                max_score: 100,
                last_assessment_date: '2025-02-12'
              }
            ]
          }
        ];
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
      return [];
    }
  }
};

async function updateUserName(oldName: string, newName: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ full_name: newName })
    .eq('full_name', oldName);

  if (error) {
    console.error('Error updating user name:', error);
    return null;
  }
  return data;
}

export { updateUserName };
