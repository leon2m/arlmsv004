import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { competencyService, CompetencySet } from '@/services/competencyService';
import { initializeUserCompetencies } from '@/services/api';
import { userService, analyticsService } from '../services/supabase';
import { taskService } from '../services/taskService';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { UserProfile, UserStats, Task as TaskType } from '../components/dashboard';

export const useDashboardData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [competencySets, setCompetencySets] = useState<CompetencySet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<TaskType[]>([]);
  const dataLoaded = useRef(false);
  
  // Sayfa görünürlüğü hook'unu kullan
  const { isVisible, isFocused } = usePageVisibility();

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Kullanıcı istatistiklerini al
      const statsResult = await analyticsService.getUserStats(user.id);
      if (statsResult && 'data' in statsResult) {
        // Veriyi işlemeden önce gerekli tüm özelliklerin varlığını kontrol et
        const userData = statsResult.data;
        
        // Ana özellikler için kontrol
        if (userData) {
          // Alt nesnelerin varlığını kontrol et ve gerekirse oluştur
          if (!userData.weeklyProgress) {
            userData.weeklyProgress = { target: 10, completed: 0, efficiency: 0 };
          }
          
          if (!userData.skillLevels) {
            userData.skillLevels = { 
              frontend: 0, 
              backend: 0, 
              devops: 0, 
              database: 0, 
              testing: 0 
            };
          }
          
          if (!userData.mentoring) {
            userData.mentoring = { sessions: 0, rating: 0, students: 0 };
          }
          
          setUserStats(userData as UserStats);
        }
      }

      // Kullanıcı profilini al
      const profileResult = await userService.getUserProfile(user.id);
      if (profileResult && 'data' in profileResult) {
        setUserProfile(profileResult.data as UserProfile);
      }

      // Kullanıcı yetkinliklerini al
      try {
        const userCompetencies = await competencyService.getUserCompetencies(user.id);
        setCompetencySets(userCompetencies || []);

        // Eğer yetkinlik seti yoksa, örnek verileri yükle
        if (!userCompetencies || userCompetencies.length === 0) {
          try {
            await initializeUserCompetencies(user.id);
            const initialCompetencies = await competencyService.getUserCompetencies(user.id);
            setCompetencySets(initialCompetencies || []);
          } catch (initError) {
            console.warn('Yetkinlik verileri başlatılırken hata:', initError);
            // Hata durumunda boş dizi ile devam et
          }
        }
      } catch (compError) {
        console.error('Yetkinlik verileri alınırken hata:', compError);
        // Hata durumunda boş dizi ile devam et
        setCompetencySets([]);
      }

      // Kullanıcı görevlerini al
      const tasksResult = await taskService.getUserTasks(user.id);
      if (tasksResult && 'data' in tasksResult && Array.isArray(tasksResult.data)) {
        setAssignedTasks(tasksResult.data as TaskType[]);
      } else {
        // Veri yoksa veya geçersizse boş dizi kullan
        setAssignedTasks([]);
      }
    } catch (error) {
      console.error('Kullanıcı verileri yüklenirken hata:', error);
      // Hata durumunda varsayılan değerler ile devam et
      setUserStats(null);
      setCompetencySets([]);
      setAssignedTasks([]);
    } finally {
      setLoading(false);
      dataLoaded.current = true;
    }
  }, [user]);

  // Kullanıcı istatistiklerini güncelle
  const updateStats = async (userId: string, newStats: any) => {
    if (!userId) return { data: null, error: new Error('User ID is required') };
    
    try {
      const { data, error } = await analyticsService.updateUserStats(userId, newStats);
      if (error) console.error('İstatistikler güncellenirken hata:', error);
      return { data, error };
    } catch (err) {
      console.error('İstatistikler güncellenirken hata:', err);
      return { data: null, error: err };
    }
  };

  // Sessizce veri güncelleme fonksiyonu
  const silentUpdateData = async () => {
    if (!user) return;
    
    try {
      // Kullanıcı istatistiklerini al ama loading state'i değiştirme
      const statsResult = await analyticsService.getUserStats(user.id);
      if (statsResult && 'data' in statsResult && statsResult.data) {
        // Veriyi işlemeden önce gerekli tüm özelliklerin varlığını kontrol et
        const userData = statsResult.data;
        
        // Alt nesnelerin varlığını kontrol et ve gerekirse oluştur
        if (!userData.weeklyProgress) {
          userData.weeklyProgress = { target: 10, completed: 0, efficiency: 0 };
        }
        
        if (!userData.skillLevels) {
          userData.skillLevels = { 
            frontend: 0, 
            backend: 0, 
            devops: 0, 
            database: 0, 
            testing: 0 
          };
        }
        
        if (!userData.mentoring) {
          userData.mentoring = { sessions: 0, rating: 0, students: 0 };
        }
        
        // Veriyi state'e sessizce ayarla
        setUserStats(userData as UserStats);
      }
      
      // Diğer verileri sessizce güncelle...
      const profileResult = await userService.getUserProfile(user.id);
      if (profileResult && 'data' in profileResult) {
        setUserProfile(profileResult.data as UserProfile);
      }
      
      console.log('Veriler arkaplanda başarıyla güncellendi');
    } catch (error) {
      console.error('Arkaplanda veri yenilenirken hata:', error);
      // Hata durumunda mevcut veriyi koru, kullanıcıya hata gösterme
    }
  };

  // İlk yükleme için useEffect
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchUserData();
  }, [user, fetchUserData]);
  
  // Sayfa görünürlüğünü izleyen useEffect
  useEffect(() => {
    // Sayfa görünür hale geldiğinde ve daha önce yüklendiyse veriyi yeniden yükle
    // Ancak loading durumunu true yapmadan veriyi arkaplanda güncelle
    if (isVisible && isFocused && user && dataLoaded.current && document.visibilityState === 'visible') {
      // Son görünürlük değişim zamanını kontrol et - çok sık yenileme yapmasın
      const lastRefreshTime = sessionStorage.getItem('lastDashboardRefresh');
      const now = Date.now();
      
      // En az 30 saniye (veya başka bir uygun süre) geçmişse veriyi yenile
      if (!lastRefreshTime || (now - parseInt(lastRefreshTime)) > 30000) {
        console.log('Sayfa tekrar görünür ve odakta, verileri arkaplanda yeniliyorum...');
        sessionStorage.setItem('lastDashboardRefresh', now.toString());
        
        // Veriyi sessizce güncelle
        silentUpdateData();
      }
    }
  }, [isVisible, isFocused, user]);

  const handleTaskActions = {
    addTask: (task: any) => {
      if (user) {
        const taskWithUserId = {
          ...task,
          user_id: user.id
        };
        taskService.createTask(taskWithUserId as any).then(({ data }) => {
          if (data) {
            setAssignedTasks(prev => [
              {
                id: data.id,
                title: data.title,
                description: data.description,
                priority: data.priority,
                dueDate: data.dueDate,
                status: data.status,
                tags: data.tags || []
              },
              ...(Array.isArray(prev) ? prev : [])
            ]);
          }
        });
      }
    },
    
    updateTask: (taskId: string, updatedTask: any) => {
      const apiData = {
        ...updatedTask,
        due_date: updatedTask.dueDate
      };
      delete (apiData as any).dueDate;
      
      taskService.updateTask(taskId, apiData as any).then(({ data }) => {
        if (data) {
          setAssignedTasks(prev => {
            if (!Array.isArray(prev)) return []; 
            return prev.map(task => task.id === taskId ? {
              id: data.id,
              title: data.title,
              description: data.description,
              priority: data.priority,
              dueDate: data.due_date,
              status: data.status,
              tags: data.tags || []
            } : task);
          });
        }
      });
    },
    
    deleteTask: (taskId: string) => {
      taskService.deleteTask(taskId).then(({ success }) => {
        if (success) {
          setAssignedTasks(prev => {
            if (!Array.isArray(prev)) return [];
            return prev.filter(task => task.id !== taskId);
          });
        }
      });
    }
  };

  const getFilteredCompetencySets = () => selectedCategory === 'all'
    ? competencySets
    : competencySets.filter(set => set.category === selectedCategory);

  return {
    loading,
    userProfile,
    userStats,
    competencySets,
    assignedTasks,
    selectedCategory,
    setSelectedCategory,
    filteredCompetencySets: getFilteredCompetencySets(),
    fetchUserData,
    updateStats,
    handleTaskActions
  };
}; 