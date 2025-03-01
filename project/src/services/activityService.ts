import { supabase } from './supabase';

export interface Activity {
  id: string;
  user_id: string;
  title: string;
  timestamp: string;
  icon_type: string;
  icon_bg: string;
}

export interface Event {
  id: string;
  title: string;
  event_date: string;
  icon_type: string;
  icon_bg: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  due_date: string;
  status: string;
  tags: string[];
  assigned_to: string;
}

export const activityService = {
  async getUserActivities(userId: string): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching user activities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserActivities:', error);
      return [];
    }
  },

  async getUpcomingEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gt('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(3);

      if (error) {
        console.error('Error fetching upcoming events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUpcomingEvents:', error);
      return [];
    }
  },

  async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', userId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching user tasks:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserTasks:', error);
      return [];
    }
  }
};
