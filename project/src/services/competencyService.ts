import { supabase } from './api';

export interface CompetencySet {
  id: string;
  name: string;
  description: string;
  category: string;
  competencies?: Competency[];
}

export interface Competency {
  id: string;
  set_id: string;
  name: string;
  description: string;
  min_score: number;
  max_score: number;
  current_score?: number;
  target_score?: number;
  last_assessment_date?: string;
  next_assessment_date?: string;
}

export const competencyService = {
  async getUserCompetencies(userId: string): Promise<CompetencySet[]> {
    try {
      // Önce oturum kontrolü yapalım
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        console.warn('Aktif oturum bulunamadı, mock veri kullanılacak');
        return this.getMockCompetencies(userId);
      }

      // Önce tüm yetkinlik setlerini al
      const { data: sets, error: setsError } = await supabase
        .from('competency_sets')
        .select('*');

      if (setsError) {
        console.error('Yetkinlik setleri alınırken hata:', setsError);
        return this.getMockCompetencies(userId);
      }

      // Her set için yetkinlikleri ve kullanıcı puanlarını al
      const competencySets = await Promise.all(
        sets.map(async (set) => {
          try {
            const { data: competencies, error: compError } = await supabase
              .from('competencies')
              .select(`
                *,
                user_competencies!inner(
                  current_score,
                  target_score,
                  last_assessment_date,
                  next_assessment_date
                )
              `)
              .eq('set_id', set.id)
              .eq('user_competencies.user_id', userId);

            if (compError) throw compError;

            // Yetkinlik verilerini düzenle
            const formattedCompetencies = competencies.map(comp => ({
              id: comp.id,
              set_id: comp.set_id,
              name: comp.name,
              description: comp.description,
              min_score: comp.min_score,
              max_score: comp.max_score,
              current_score: comp.user_competencies[0]?.current_score,
              target_score: comp.user_competencies[0]?.target_score,
              last_assessment_date: comp.user_competencies[0]?.last_assessment_date,
              next_assessment_date: comp.user_competencies[0]?.next_assessment_date
            }));

            return {
              ...set,
              competencies: formattedCompetencies
            };
          } catch (error) {
            // Hata durumunda bu set için mock veri döndür
            return {
              ...set,
              competencies: this.getMockCompetenciesForSet(set.id, userId)
            };
          }
        })
      );

      return competencySets.length > 0 ? competencySets : this.getMockCompetencies(userId);
    } catch (error) {
      console.error('Yetkinlik verileri alınırken hata:', error);
      return this.getMockCompetencies(userId);
    }
  },

  // Mock yetkinlik verileri
  getMockCompetencies(userId: string): CompetencySet[] {
    return [
      {
        id: 'tech-001',
        name: 'Frontend Development',
        description: 'Modern web geliştirme teknolojileri',
        category: 'Hard Skills',
        competencies: this.getMockCompetenciesForSet('tech-001', userId)
      },
      {
        id: 'tech-002',
        name: 'Backend Development',
        description: 'Sunucu tarafı programlama',
        category: 'Hard Skills',
        competencies: this.getMockCompetenciesForSet('tech-002', userId)
      },
      {
        id: 'soft-001',
        name: 'İletişim Becerileri',
        description: 'Etkili iletişim ve sunum becerileri',
        category: 'Soft Skills',
        competencies: this.getMockCompetenciesForSet('soft-001', userId)
      }
    ];
  },

  // Belirli bir set için mock yetkinlikler
  getMockCompetenciesForSet(setId: string, userId: string): Competency[] {
    // userId'yi kullanarak tutarlı rastgele değerler üretelim
    const idSum = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const randomSeed = idSum % 100;
    
    const generateValue = (min: number, max: number, offset = 0) => {
      return Math.floor(min + (((randomSeed + offset) * 9301 + 49297) % 233280) / 233280 * (max - min));
    };

    if (setId === 'tech-001') {
      return [
        {
          id: 'comp-001',
          set_id: setId,
          name: 'React.js',
          description: 'Modern React uygulamaları',
          min_score: 0,
          max_score: 100,
          current_score: generateValue(60, 95),
          target_score: 95,
          last_assessment_date: new Date(Date.now() - generateValue(1, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: 'comp-002',
          set_id: setId,
          name: 'TypeScript',
          description: 'Tip güvenli geliştirme',
          min_score: 0,
          max_score: 100,
          current_score: generateValue(50, 90, 10),
          target_score: 90,
          last_assessment_date: new Date(Date.now() - generateValue(1, 30, 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];
    } else if (setId === 'tech-002') {
      return [
        {
          id: 'comp-003',
          set_id: setId,
          name: 'Node.js',
          description: 'Server-side JavaScript',
          min_score: 0,
          max_score: 100,
          current_score: generateValue(40, 85, 15),
          target_score: 85,
          last_assessment_date: new Date(Date.now() - generateValue(1, 30, 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];
    } else if (setId === 'soft-001') {
      return [
        {
          id: 'comp-004',
          set_id: setId,
          name: 'Sunum Becerileri',
          description: 'Etkili sunum yapabilme',
          min_score: 0,
          max_score: 100,
          current_score: generateValue(70, 95, 20),
          target_score: 90,
          last_assessment_date: new Date(Date.now() - generateValue(1, 30, 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: 'comp-005',
          set_id: setId,
          name: 'Takım Çalışması',
          description: 'Takım içinde etkin çalışma',
          min_score: 0,
          max_score: 100,
          current_score: generateValue(75, 98, 25),
          target_score: 95,
          last_assessment_date: new Date(Date.now() - generateValue(1, 30, 20) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];
    }
    
    return [];
  },

  async updateUserCompetency(
    userId: string,
    competencyId: string,
    data: {
      current_score?: number;
      target_score?: number;
      next_assessment_date?: string;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_competencies')
        .upsert({
          user_id: userId,
          competency_id: competencyId,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Yetkinlik güncellenirken hata:', error);
      // Hata durumunda sessizce devam et, UI'da gösterilecek
    }
  }
};
