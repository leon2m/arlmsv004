import { supabase } from '@/lib/supabase';
import { BaseService } from './BaseService';
import { Team } from '@/types/taskManagement';

/**
 * Ekip yönetim servisi
 */
export class TeamService extends BaseService {
  /**
   * Kullanıcının ekiplerini getirir
   * @returns Ekipler listesi
   */
  async getTeams(): Promise<Team[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          description,
          created_at,
          updated_at,
          avatar_url
        `)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Ekipler alınırken hata:', error);
      return [];
    }
  }

  /**
   * Belirli bir ekibi getirir
   * @param teamId Ekip ID'si
   * @returns Ekip nesnesi veya null
   */
  async getTeam(teamId: string): Promise<Team | null> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          description,
          created_at,
          updated_at,
          avatar_url
        `)
        .eq('id', teamId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Ekip alınırken hata (ID: ${teamId}):`, error);
      return null;
    }
  }

  /**
   * Yeni bir ekip oluşturur
   * @param team Ekip verileri
   * @returns Oluşturulan ekip
   */
  async createTeam(team: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<Team | null> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert(team)
        .select()
        .single();
      
      if (error) throw error;
      
      // Ekip oluşturan kişiyi admin olarak ekle
      const userId = await this.getCurrentUserId();
      if (userId) {
        await supabase
          .from('team_members')
          .insert({
            team_id: data.id,
            user_id: userId,
            role: 'admin'
          });
      }
      
      return data;
    } catch (error) {
      console.error('Ekip oluşturulurken hata:', error);
      return null;
    }
  }

  /**
   * Bir ekibi günceller
   * @param teamId Ekip ID'si
   * @param team Güncellenecek ekip verileri
   * @returns Güncellenen ekip
   */
  async updateTeam(teamId: string, team: Partial<Team>): Promise<Team | null> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update({
          ...team,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Ekip güncellenirken hata:', error);
      return null;
    }
  }

  /**
   * Bir ekibi siler
   * @param teamId Ekip ID'si
   * @returns İşlem başarılıysa true, değilse false
   */
  async deleteTeam(teamId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Ekip silinirken hata:', error);
      return false;
    }
  }

  /**
   * Ekip üyelerini getirir
   * @param teamId Ekip ID'si
   * @returns Ekip üyeleri listesi
   */
  async getTeamMembers(teamId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          team_id,
          user_id,
          role,
          created_at,
          user:auth.users(id, email, user_metadata)
        `)
        .eq('team_id', teamId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Ekip üyeleri alınırken hata:', error);
      return [];
    }
  }

  /**
   * Ekibe üye ekler
   * @param teamId Ekip ID'si
   * @param userId Kullanıcı ID'si
   * @param role Rol
   * @returns İşlem başarılıysa true, değilse false
   */
  async addTeamMember(teamId: string, userId: string, role: string = 'member'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role: role
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Ekip üyesi eklenirken hata:', error);
      return false;
    }
  }

  /**
   * Ekip üyesinin rolünü günceller
   * @param teamId Ekip ID'si
   * @param userId Kullanıcı ID'si
   * @param role Yeni rol
   * @returns İşlem başarılıysa true, değilse false
   */
  async updateTeamMemberRole(teamId: string, userId: string, role: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: role })
        .eq('team_id', teamId)
        .eq('user_id', userId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Ekip üyesi rolü güncellenirken hata:', error);
      return false;
    }
  }

  /**
   * Ekipten üye çıkarır
   * @param teamId Ekip ID'si
   * @param userId Kullanıcı ID'si
   * @returns İşlem başarılıysa true, değilse false
   */
  async removeTeamMember(teamId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Ekip üyesi çıkarılırken hata:', error);
      return false;
    }
  }

  /**
   * Kullanıcının ekip üyeliklerini getirir
   * @returns Ekip üyelikleri listesi
   */
  async getUserTeamMemberships(): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          team_id,
          role,
          created_at,
          team:teams(id, name, description, avatar_url)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kullanıcı ekip üyelikleri alınırken hata:', error);
      return [];
    }
  }
}