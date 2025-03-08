export interface UserStats {
  completedTasks: number;
  totalTasks: number;
  averageCompletion: number;
  learningHours: number;
  skillsCount: number;
  averageSkillLevel: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  level: number;
  skill: Skill;
  created_at?: string;
  updated_at?: string;
} 