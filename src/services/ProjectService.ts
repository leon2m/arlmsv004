import { supabase } from './supabase';
import { BaseService } from './BaseService';
import { 
  Project, 
  ProjectRole, 
  RolePermission, 
  ProjectMember,
  ProjectTemplate,
  Board,
  BoardColumn,
  Document,
  Version,
  TaskStatus
} from '@/types/taskManagement';
import { v4 as uuidv4 } from 'uuid';
import { api, mockApi } from './api';

/**
 * Proje yönetim servisi
 */
export class ProjectService extends BaseService {
  /**
   * Tüm projeleri getirir
   */
  async getProjects(): Promise<Project[]> {
    try {
      // API isteği yapılacak
      // const response = await api.get('/projects');
      // return response.data;
      
      // Şimdilik mock veri kullan
      const response = await mockApi.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Projeler getirilirken hata:', error);
      throw error;
    }
  }

  /**
   * Belirli bir projeyi ID'ye göre getirir
   */
  async getProject(projectId: string): Promise<Project | null> {
    try {
      // API isteği yapılacak
      // const response = await api.get(`/projects/${projectId}`);
      // return response.data;
      
      // Şimdilik mock veri kullan
      const response = await mockApi.get('/projects');
      const project = response.data.find((p: Project) => p.id === projectId);
      return project || null;
    } catch (error) {
      console.error('Proje detayları getirilirken hata:', error);
      throw error;
    }
  }

  /**
   * Yeni bir proje oluşturur
   */
  async createProject(project: Partial<Project>): Promise<Project> {
    try {
      // API isteği yapılacak
      // const response = await api.post('/projects', project);
      // return response.data;
      
      // Şimdilik mock veri kullan
      const response = await mockApi.post('/projects', project);
      return response.data;
    } catch (error) {
      console.error('Proje oluşturulurken hata:', error);
      throw error;
    }
  }

  /**
   * Bir projeyi günceller
   */
  async updateProject(projectId: string, projectData: Partial<Project>): Promise<Project> {
    try {
      // API isteği yapılacak
      // const response = await api.put(`/projects/${projectId}`, projectData);
      // return response.data;
      
      // Şimdilik mock veri kullan
      const response = await mockApi.put(`/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Proje güncellenirken hata:', error);
      throw error;
    }
  }

  /**
   * Bir projeyi arşivler
   */
  async archiveProject(projectId: string): Promise<boolean> {
    try {
      if (!projectId) {
        console.error('archiveProject: projectId is undefined or null');
        throw new Error('Project ID is required');
      }
      
      const { error } = await supabase
        .from('projects')
        .update({ 
          is_archived: true,
          updated_at: new Date().toISOString() 
        })
        .eq('id', projectId);
      
      if (error) {
        console.error('Error archiving project:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to archive project:', error);
      throw error;
    }
  }

  /**
   * Bir projeyi tamamen siler
   */
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      // API isteği yapılacak
      // await api.delete(`/projects/${projectId}`);
      
      // Şimdilik mock veri kullan
      await mockApi.delete(`/projects/${projectId}`);
      return true;
    } catch (error) {
      console.error('Proje silinirken hata:', error);
      throw error;
    }
  }

  /**
   * Proje üyelerini getirir
   * @param projectId Proje ID'si
   * @returns Proje üyeleri listesi
   */
  async getProjectMembers(projectId: string): Promise<any[]> {
    try {
      // API isteği yapılacak
      // const response = await api.get(`/projects/${projectId}/members`);
      // return response.data;
      
      // Şimdilik örnek veri dönelim
      return [
        { id: 'user-1', name: 'Ahmet Yılmaz', email: 'ahmet@example.com', role: 'owner' },
        { id: 'user-2', name: 'Ayşe Demir', email: 'ayse@example.com', role: 'admin' },
        { id: 'user-3', name: 'Mehmet Kaya', email: 'mehmet@example.com', role: 'member' }
      ];
    } catch (error) {
      console.error('Proje üyeleri getirilirken hata:', error);
      throw error;
    }
  }

  /**
   * Proje rollerini getirir
   * @param projectId Proje ID'si
   * @returns Proje rolleri listesi
   */
  async getProjectRoles(projectId: string): Promise<any[]> {
    try {
      // API isteği yapılacak
      // const response = await api.get(`/projects/${projectId}/roles`);
      // return response.data;
      
      // Şimdilik örnek veri dönelim
      return [
        { id: 'owner', name: 'Sahip', description: 'Tüm yetkilere sahip', permissions: ['read', 'write', 'delete', 'admin'] },
        { id: 'admin', name: 'Yönetici', description: 'Çoğu yetkiye sahip', permissions: ['read', 'write', 'delete'] },
        { id: 'member', name: 'Üye', description: 'Temel yetkiler', permissions: ['read', 'write'] },
        { id: 'viewer', name: 'İzleyici', description: 'Sadece görüntüleme', permissions: ['read'] }
      ];
    } catch (error) {
      console.error('Proje rolleri getirilirken hata:', error);
      throw error;
    }
  }

  /**
   * Proje panoları getirir
   */
  async getProjectBoards(projectId: string): Promise<Board[]> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select(`
          *,
          board_columns(*)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error(`Proje panoları getirilirken hata (ID: ${projectId}):`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Proje panoları getirilirken hata (ID: ${projectId}):`, error);
      // Geçici olarak mock veri döndür
      return this.getMockBoards(projectId);
    }
  }

  /**
   * Proje dokümanlarını getirir
   * @param projectId Proje ID'si
   * @returns Proje dokümanları listesi
   */
  async getProjectDocuments(projectId: string): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Proje dokümanları alınırken hata:', error);
      return [];
    }
  }

  /**
   * Proje sürümlerini getirir
   * @param projectId Proje ID'si
   * @returns Proje sürümleri listesi
   */
  async getProjectVersions(projectId: string): Promise<Version[]> {
    try {
      const { data, error } = await supabase
        .from('versions')
        .select('*')
        .eq('project_id', projectId)
        .order('release_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Proje sürümleri alınırken hata:', error);
      return [];
    }
  }

  /**
   * Varsayılan bir pano oluşturur
   */
  private async createDefaultBoard(projectId: string): Promise<Board> {
    try {
      // Önce varsayılan görev durumlarını oluştur
      const statuses = [
        { name: 'Yapılacak', description: 'Henüz başlanmamış görevler', color: '#3498db', position: 1, is_default: true, status_category: 'to-do' as const, icon: null },
        { name: 'Devam Ediyor', description: 'Üzerinde çalışılan görevler', color: '#f39c12', position: 2, is_default: false, status_category: 'in-progress' as const, icon: null },
        { name: 'İncelemede', description: 'Gözden geçirilmeyi bekleyen görevler', color: '#9b59b6', position: 3, is_default: false, status_category: 'in-progress' as const, icon: null },
        { name: 'Tamamlandı', description: 'Tamamlanmış görevler', color: '#2ecc71', position: 4, is_default: false, status_category: 'done' as const, icon: null }
      ];

      const statusPromises = statuses.map(status => 
        supabase
          .from('task_statuses')
          .insert([{ 
            ...status, 
            project_id: projectId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
      );

      const statusResults = await Promise.all(statusPromises);
      const createdStatuses = statusResults.map(result => result.data?.[0] as TaskStatus).filter(Boolean);

      // Panoyu oluştur
      const { data: boardData, error: boardError } = await supabase
        .from('boards')
        .insert([{
          project_id: projectId,
          name: 'Ana Pano',
          type: 'kanban' as const,
          is_default: true,
          configuration: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (boardError) {
        console.error('Pano oluşturulurken hata:', boardError);
        throw boardError;
      }

      // Pano sütunlarını oluştur
      const columnPromises = createdStatuses.map((status, index) => 
        supabase
          .from('board_columns')
          .insert([{
            board_id: boardData.id,
            name: status.name,
            status_id: status.id,
            position: index,
            created_at: new Date().toISOString()
          }])
      );

      await Promise.all(columnPromises);

      return boardData;
    } catch (error) {
      console.error('Varsayılan pano oluşturulurken hata:', error);
      // Geçici olarak mock veri döndür
      return {
        id: uuidv4(),
        project_id: projectId,
        name: 'Ana Pano',
        type: 'kanban',
        is_default: true,
        configuration: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        columns: []
      };
    }
  }

  /**
   * Mock projeler (geçici)
   */
  private getMockProjects(): Project[] {
    return [
      {
        id: '1',
        name: 'Öğrenme Yönetim Sistemi',
        key: 'LMS',
        description: 'Öğrenme yönetim sistemi geliştirme projesi',
        owner_id: 'user-1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        is_archived: false,
        icon: 'school',
        project_type: 'kanban',
        avatar_url: null,
        default_assignee_id: null
      },
      {
        id: '2',
        name: 'Web Sitesi Yenileme',
        key: 'WEB',
        description: 'Kurumsal web sitesi yenileme projesi',
        owner_id: 'user-1',
        created_at: '2023-02-01T00:00:00Z',
        updated_at: '2023-02-01T00:00:00Z',
        is_archived: false,
        icon: 'code',
        project_type: 'classic',
        avatar_url: null,
        default_assignee_id: null
      },
      {
        id: '3',
        name: 'Mobil Uygulama',
        key: 'MOB',
        description: 'iOS ve Android için mobil uygulama geliştirme',
        owner_id: 'user-1',
        created_at: '2023-03-01T00:00:00Z',
        updated_at: '2023-03-01T00:00:00Z',
        is_archived: false,
        icon: 'business',
        project_type: 'scrum',
        avatar_url: null,
        default_assignee_id: null
      }
    ];
  }

  /**
   * Mock panolar (geçici)
   */
  private getMockBoards(projectId: string): Board[] {
    return [
      {
        id: '1',
        project_id: projectId,
        name: 'Ana Pano',
        type: 'kanban',
        is_default: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        configuration: null,
        columns: []
      }
    ];
  }
}