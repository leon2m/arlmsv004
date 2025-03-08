import { Task as BaseTask } from '@/types/taskManagement';
import { UserProfile, UserStats } from '@/types/user';

// Dashboard bileşenleri için ortak tipler
export interface UserProfile {
  id?: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  title?: string;
  role?: string;
  bio?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  nextLevelXp?: number;
  completedTrainings: number;
  monthlyCompletions: number;
  streak: number;
  longestStreak: number;
  badges: number;
  totalHours: number;
  coursesInProgress: number;
  certificatesEarned: number;
  contributions: number;
  weeklyProgress: {
    target: number;
    completed: number;
    efficiency: number;
  };
  skillLevels: {
    frontend: number;
    backend: number;
    devops: number;
    database: number;
    testing: number;
  };
  mentoring?: {
    sessions: number;
    rating: number;
    students: number;
  };
}

export interface Activity {
  title: string;
  timestamp: string;
  icon: React.ReactNode;
  iconBg: string;
}

export interface Event {
  title: string;
  date: string;
  icon: React.ReactNode;
  iconBg: string;
}

export interface Task extends BaseTask {
  dueDate?: string;
  status?: string;
  tags?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  icon: string;
  criteria: {
    total: number;
    completed: number;
    remaining: number;
  };
  rewards: {
    xp: number;
    badge: string;
    certificate: boolean;
  };
  dateStarted: string;
  estimatedCompletion: string;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  rating: number;
  students: number;
  image: string;
  price?: number;
  level: string;
  language: string;
  lastUpdated: string;
  topics: string[];
  includes: string[];
}

export interface Certificate {
  id: string;
  title: string;
  description: string;
  progress: number;
  image: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  createdAt: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    tension?: number;
    fill?: boolean;
    pointBackgroundColor?: string;
  }[];
}

export interface DashboardHeaderProps {
  userProfile: UserProfile | null;
  userStats: UserStats | null;
}

export interface StatCardsProps {
  stats: UserStats | null;
  userId?: string;
}

export interface ProfileSummaryCardProps {
  userProfile: UserProfile | null;
  stats: UserStats | null;
}

export interface TaskListProps {
  tasks: Task[];
  onAddTask: (task: Partial<Task>) => Promise<Task>;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<Task>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export interface AIAssistantProps {
  recommendations: AIRecommendation[];
  onRefresh: () => void;
} 