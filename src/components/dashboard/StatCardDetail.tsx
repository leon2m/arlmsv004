import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import { Star, GraduationCap, Flame, Medal, Award, Target, CheckCircle, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { analyticsService } from '@/services/supabase';
import { Card, CardContent } from '@/components/ui/card';

// Kart tipi için arayüz
export type StatCardType = 'xp' | 'completedTrainings' | 'streak' | 'badges';

interface StatCardDetailProps {
  type: StatCardType;
  stats: any; // UserStats tipini buraya ekleyebilirsiniz
  userId?: string;
  onClose: () => void;
}

// Her kart için başlık ve açıklama yapılandırması
const cardConfig = {
  xp: {
    title: 'XP ve Seviye Detayları',
    description: 'Kazandığınız deneyim puanları ve seviyeniz hakkında detaylı bilgi.',
    icon: <Star className="h-6 w-6 text-yellow-500" />,
    color: 'from-indigo-500 to-purple-600'
  },
  completedTrainings: {
    title: 'Tamamlanan Eğitimler',
    description: 'Bugüne kadar tamamladığınız eğitimler ve başarılarınız.',
    icon: <GraduationCap className="h-6 w-6 text-blue-500" />,
    color: 'from-blue-500 to-cyan-600'
  },
  streak: {
    title: 'Öğrenme Serisi',
    description: 'Kesintisiz öğrenme seriniz ve günlük aktiviteleriniz.',
    icon: <Flame className="h-6 w-6 text-orange-500" />,
    color: 'from-orange-500 to-red-600'
  },
  badges: {
    title: 'Başarı Rozetleri',
    description: 'Kazandığınız tüm rozetler ve başarı ödülleri.',
    icon: <Medal className="h-6 w-6 text-green-500" />,
    color: 'from-emerald-500 to-green-600'
  }
};

export const StatCardDetail: React.FC<StatCardDetailProps> = ({ type, stats, userId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [detailData, setDetailData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const config = cardConfig[type];

  useEffect(() => {
    if (stats) {
      // Stats doğrudan props'tan geldiği için, bazı temel verileri hemen ayarlayabiliriz
      setDetailData({
        basic: stats,
        // Diğer detaylar API'den gelecek
      });
      
      // Eğer userId varsa, ek detayları getir
      if (userId) {
        fetchDetails();
      } else {
        setLoading(false);
      }
    } else {
      setError("İstatistik verileri bulunamadı");
      setLoading(false);
    }
  }, [type, stats, userId]);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // İlgili kart tipine göre veri çek
      const { data } = await analyticsService.getUserStats(userId);
      
      if (data) {
        // Her kart tipi için özel detaylar hazırla
        let detailData;
        switch (type) {
          case 'xp':
            detailData = {
              current: data.xp || 0,
              level: data.level || 1,
              nextLevel: (data.level || 1) + 1,
              progress: ((data.xp || 0) % 1000) / 10, // Yüzde olarak ilerleme
              xpToNextLevel: 1000 - ((data.xp || 0) % 1000),
              recentActivities: [
                { title: 'Günlük aktivite tamamlandı', points: '+15 XP', date: '1 gün önce' },
                { title: 'Kurs: React Fundamentals', points: '+50 XP', date: '3 gün önce' },
                { title: 'Test: JavaScript Advanced', points: '+35 XP', date: '5 gün önce' }
              ]
            };
            break;
          case 'completedTrainings':
            // weeklyProgress'in varlığını kontrol et ve varsayılan değerler sağla
            const weeklyProgress = data.weeklyProgress || {};
            
            detailData = {
              total: data.completedTrainings || 0,
              monthly: data.monthlyCompletions || 0,
              efficiency: weeklyProgress.efficiency || 70, // Varsayılan değer
              target: weeklyProgress.target || 10,
              completed: weeklyProgress.completed || 0,
              // Gerçek tamamlanan kursları getiren servisi entegre edebiliriz
              // Şimdilik varsayılan değer kullanacağız, ama gelecekte 
              // bu veri analytics veya kurs servisinden getirilebilir
              recentCompletions: [
                { title: 'React Hooks Masterclass', date: '2 gün önce', rating: 4.8 },
                { title: 'TypeScript Basics', date: '1 hafta önce', rating: 4.5 },
                { title: 'Node.js API Development', date: '2 hafta önce', rating: 4.7 }
              ]
            };
            break;
          case 'streak':
            const streak = data.streak || 0;
            const longestStreak = data.longestStreak || 1; // 0'a bölmemek için en az 1
            
            detailData = {
              current: streak,
              longest: longestStreak,
              progress: Math.min(100, (streak / longestStreak) * 100 || 0), // Sınırlama ve 0 kontrolü
              weekActivity: [
                { day: 'Pazartesi', minutes: 45, active: true },
                { day: 'Salı', minutes: 60, active: true },
                { day: 'Çarşamba', minutes: 30, active: true },
                { day: 'Perşembe', minutes: 50, active: true },
                { day: 'Cuma', minutes: 25, active: true },
                { day: 'Cumartesi', minutes: 40, active: true },
                { day: 'Pazar', minutes: 15, active: false }
              ]
            };
            break;
          case 'badges':
            detailData = {
              total: data.badges || 0,
              progress: ((data.badges || 0) / 20) * 100, // Toplam 20 rozet olduğunu varsayalım
              recent: 'Frontend Master',
              badges: [
                { title: 'Frontend Master', description: 'Frontend geliştirmede uzmanlaştınız', date: '1 hafta önce', icon: '🏆' },
                { title: 'Streak Champion', description: '20 gün kesintisiz öğrenme', date: '2 hafta önce', icon: '🔥' },
                { title: 'Code Review Expert', description: '50 kod incelemesi tamamlandı', date: '3 hafta önce', icon: '👁️' }
              ]
            };
            break;
          default:
            detailData = {};
        }
        
        setDetailData(detailData);
      } else {
        setError('Veri alınamadı');
      }
    } catch (err) {
      console.error('Detay verisi yüklenirken hata:', err);
      setError('Veri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!type) return null;
  
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {config.icon}
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        {error && (
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && detailData && (
          <div className="space-y-6 mt-4">
            {/* XP ve Seviye Detayları */}
            {type === 'xp' && (
              <>
                <div className={`p-6 rounded-lg bg-gradient-to-r ${config.color} text-white`}>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{detailData.current} XP</h3>
                      <p className="text-white/80">Seviye {detailData.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">Sonraki Seviye: {detailData.nextLevel}</p>
                      <p className="text-white/80">{detailData.xpToNextLevel} XP kaldı</p>
                    </div>
                  </div>
                  <Progress value={detailData.progress} className="h-2 bg-white/20" />
                </div>
                
                <h3 className="text-lg font-semibold">Son XP Aktiviteleri</h3>
                <div className="space-y-3">
                  {detailData.recentActivities.map((activity: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-indigo-500" />
                        <span>{activity.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-green-600">{activity.points}</span>
                        <span className="text-sm text-gray-500">{activity.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Tamamlanan Eğitimler Detayları */}
            {type === 'completedTrainings' && (
              <>
                <div className={`p-6 rounded-lg bg-gradient-to-r ${config.color} text-white`}>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{detailData.total} Eğitim</h3>
                      <p className="text-white/80">Bu ay: +{detailData.monthly}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">Haftalık Hedef: {detailData.target}</p>
                      <p className="text-white/80">Tamamlanan: {detailData.completed}</p>
                    </div>
                  </div>
                  <Progress value={detailData.efficiency} className="h-2 bg-white/20" />
                </div>
                
                <h3 className="text-lg font-semibold">Son Tamamlanan Eğitimler</h3>
                <div className="space-y-3">
                  {detailData.recentCompletions.map((course: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                        <span>{course.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="ml-1">{course.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">{course.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Öğrenme Serisi Detayları */}
            {type === 'streak' && (
              <>
                <div className={`p-6 rounded-lg bg-gradient-to-r ${config.color} text-white`}>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{detailData.current} Gün</h3>
                      <p className="text-white/80">En uzun: {detailData.longest} gün</p>
                    </div>
                    <div>
                      <Flame className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <Progress value={detailData.progress} className="h-2 bg-white/20" />
                </div>
                
                <h3 className="text-lg font-semibold">Haftalık Aktivite</h3>
                <div className="grid grid-cols-7 gap-2">
                  {detailData.weekActivity.map((day: any, index: number) => (
                    <div key={index} className="text-center">
                      <div className={`h-24 relative rounded-lg ${day.active ? 'bg-orange-100' : 'bg-gray-100'}`}>
                        <div 
                          className={`absolute bottom-0 w-full rounded-b-lg ${day.active ? 'bg-orange-500' : 'bg-gray-300'}`} 
                          style={{ height: `${(day.minutes / 60) * 100}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                          {day.minutes} dk
                        </div>
                      </div>
                      <p className="mt-2 text-xs font-medium">{day.day.substring(0, 3)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Başarı Rozetleri Detayları */}
            {type === 'badges' && (
              <>
                <div className={`p-6 rounded-lg bg-gradient-to-r ${config.color} text-white`}>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{detailData.total} Rozet</h3>
                      <p className="text-white/80">Son kazanılan: {detailData.recent}</p>
                    </div>
                    <div>
                      <Target className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <Progress value={detailData.progress} className="h-2 bg-white/20" />
                </div>
                
                <h3 className="text-lg font-semibold">Kazanılan Rozetler</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {detailData.badges.map((badge: any, index: number) => (
                    <Card key={index} className="bg-gradient-to-br from-white to-gray-50 border overflow-hidden">
                      <CardContent className="p-6">
                        <div className="text-4xl mb-3">{badge.icon}</div>
                        <h4 className="text-lg font-semibold">{badge.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                        <p className="text-xs text-gray-500">{badge.date}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 