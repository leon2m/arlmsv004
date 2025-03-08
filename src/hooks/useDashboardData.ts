import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { taskService } from '@/services/taskService';
import { taskStatusService } from '@/services/TaskStatusService';
import { Project, Task, TaskStatus } from '@/types/taskManagement';
import { UserStats, UserProfile } from '@/types/user';
import { supabase } from '@/services/supabase';
import { userService } from '@/services/userService';

interface DashboardData {
  projects: Array<Project & {
    tasks: Task[];
    statuses: TaskStatus[];
    taskCount: number;
    completedTaskCount: number;
  }>;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  recentActivity: any[];
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSkills, setUserSkills] = useState<any[]>([]);

  // Kullanıcı becerilerini yenileme fonksiyonu
  const refreshUserSkills = async () => {
    try {
      const { data: skills, error } = await supabase
        .from('user_skills')
        .select(`
          id,
          user_id,
          skill_id,
          level,
          skill:skills (
            id,
            name,
            description,
            category
          )
        `)
        .eq('user_id', userProfile?.id);

      if (error) throw error;
      setUserSkills(skills || []);
    } catch (error) {
      console.error('Error refreshing skills:', error);
      setError('Beceriler yüklenirken bir hata oluştu.');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const profile = await userService.getUserProfile(user.id);
        if (isMounted && profile) {
          setUserProfile(profile);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    const fetchUserSkills = async () => {
      if (!user?.id) return;
      
      try {
        const { data: skills, error } = await supabase
          .from('user_skills')
          .select(`
            *,
            skill:skills(*)
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        
        if (isMounted && skills) {
          setUserSkills(skills);
        }
      } catch (err) {
        console.error('Error fetching user skills:', err);
      }
    };

    const fetchDashboardData = async () => {
      if (!user?.id) {
        console.log('User ID is not available, waiting for auth...');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel
        await Promise.all([
          fetchUserProfile(),
          fetchUserSkills(),
          // Kullanıcının projelerini getir
          taskService.getProjects(),
          // Kullanıcıya atanan görevleri getir
          taskService.getUserTasks(user.id)
        ]);

        // Kullanıcının projelerini getir
        const projects = await taskService.getProjects();
        
        if (!isMounted) return;

        // Her proje için görevleri ve durumları getir
        const projectsWithDetails = await Promise.all(
          projects.map(async (project) => {
            try {
              const [tasks, statuses] = await Promise.all([
                taskService.getTasks(project.id),
                taskStatusService.getTaskStatuses(project.id)
              ]);

              return {
                ...project,
                tasks: tasks || [],
                statuses: statuses || [],
                taskCount: tasks?.length || 0,
                completedTaskCount: tasks?.filter(task => 
                  task.status_category === 'done' || 
                  statuses?.find(s => s.id === task.status_id)?.status_category === 'done'
                ).length || 0
              };
            } catch (err) {
              console.error(`Error fetching details for project ${project.id}:`, err);
              return {
                ...project,
                tasks: [],
                statuses: [],
                taskCount: 0,
                completedTaskCount: 0
              };
            }
          })
        );

        if (!isMounted) return;

        // Kullanıcıya atanan görevleri getir
        const userTasks = await taskService.getUserTasks(user.id);
        if (isMounted) {
          setAssignedTasks(userTasks);
        }

        // Dashboard verilerini hazırla
        const dashboardData: DashboardData = {
          projects: projectsWithDetails,
          totalProjects: projects.length,
          totalTasks: projectsWithDetails.reduce((acc, project) => acc + project.taskCount, 0),
          completedTasks: projectsWithDetails.reduce((acc, project) => acc + project.completedTaskCount, 0),
          recentActivity: []
        };

        setData(dashboardData);
      } catch (err) {
        console.error('Dashboard verileri yüklenirken hata:', err);
        if (isMounted) {
          setError('Veriler yüklenirken bir hata oluştu');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Görev işlemleri
  const handleTaskActions = {
    addTask: async (task: Partial<Task>) => {
      try {
        const newTask = await taskService.addTask(task);
        setAssignedTasks(prev => [newTask, ...prev]);
        return newTask;
      } catch (error) {
        console.error('Görev eklenirken hata:', error);
        throw error;
      }
    },
    updateTask: async (taskId: string, updates: Partial<Task>) => {
      try {
        const updatedTask = await taskService.updateTask(taskId, updates);
        setAssignedTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
        return updatedTask;
      } catch (error) {
        console.error('Görev güncellenirken hata:', error);
        throw error;
      }
    },
    deleteTask: async (taskId: string) => {
      try {
        await taskService.deleteTask(taskId);
        setAssignedTasks(prev => prev.filter(t => t.id !== taskId));
      } catch (error) {
        console.error('Görev silinirken hata:', error);
        throw error;
      }
    }
  };

  // Kullanıcı istatistiklerini oluştur
  const userStats: UserStats | null = data ? {
    xp: 0,
    level: 1,
    completedTrainings: data.completedTasks,
    monthlyCompletions: 0,
    weeklyCompletions: 0,
    dailyCompletions: 0,
    totalTasks: data.totalTasks,
    completedTasks: data.completedTasks,
    totalProjects: data.totalProjects,
    activeProjects: data.projects.filter(p => !p.is_archived).length,
    taskCompletionRate: data.totalTasks > 0 ? (data.completedTasks / data.totalTasks) * 100 : 0,
    projectCompletionRate: data.totalProjects > 0 ? (data.projects.filter(p => p.is_archived).length / data.totalProjects) * 100 : 0
  } : null;

  return { 
    isLoading, 
    error, 
    data,
    assignedTasks,
    handleTaskActions,
    userProfile,
    userStats,
    userSkills,
    refreshUserSkills
  };
};
