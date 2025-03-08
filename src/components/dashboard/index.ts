// Re-export all dashboard components
import { ReactNode } from 'react';

// Type definitions
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role?: string;
  title?: string;
  department?: string;
  company?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface UserStats {
  id: string;
  userId: string;
  xp: number;
  level: number;
  streak: number;
  completedCourses: number;
  completedLessons: number;
  totalHours: number;
  badges: number;
  certifications: number;
  skillPoints: number;
  weeklyProgress: {
    target: number;
    completed: number;
    efficiency: number;
  };
  skillLevels: {
    [key: string]: number;
  };
  mentoring: {
    sessions: number;
    rating: number;
    students: number;
  };
}

export interface Activity {
  title: string;
  timestamp: string;
  icon: ReactNode;
  iconBg: string;
}

export interface Event {
  title: string;
  date: string;
  icon: ReactNode;
  iconBg: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
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
  price: number;
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
  progress: number;
  deadline: string;
  type: string;
  priority: string;
  estimatedHours: number;
  prerequisites: string[];
  resources: Array<{
    type: string;
    title: string;
    duration: string;
  }>;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    pointBackgroundColor?: string;
    tension?: number;
    fill?: boolean;
  }>;
}

// Re-export components - kullanılan içe aktarma ve dışa aktarma stiline bağlı olarak
// Bu bileşenleri dışa aktarma
export { DashboardHeader } from './DashboardHeader';
export { StatCards } from './StatCards';
export { PerformanceChart } from './PerformanceChart';
export { SkillsRadar } from './SkillsRadar';
export { LearningAnalytics } from './LearningAnalytics';
export { ProfileSummaryCard } from './ProfileSummaryCard';
export { ActivityFeed } from './ActivityFeed';
export { UpcomingEvents } from './UpcomingEvents';
export { TaskList } from './TaskList';
export { Achievements } from './Achievements';
export { PopularCourses } from './PopularCourses';
export { Certificates } from './Certificates';
export { AIAssistant } from './AIAssistant';
export { EditButton } from './EditButton';
export { ProfileCard } from './ProfileCard';

// Dashboard bileşenleri
export * from './types';
export * from './Sidebar';
export * from './CompetencyCard';
export * from './AIFeatureCard';
export * from './MetricsCard';
export * from './UpcomingEventCard'; 