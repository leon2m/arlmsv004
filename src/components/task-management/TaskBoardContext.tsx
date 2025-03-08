import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskStatus, Project, TaskPriority } from '@/types/taskManagement';
import { taskService } from '@/services/taskService';
import { taskStatusService } from '@/services/TaskStatusService';
import { useNavigate } from 'react-router-dom';
import { ColorResult } from 'react-color';

// Seçilen projeyi localStorage'da saklayacak anahtar
const SELECTED_PROJECT_KEY = 'selected_project';

interface TaskBoardContextType {
  // Veri
  project: Project | null;
  statuses: TaskStatus[];
  tasks: Task[];
  priorities: TaskPriority[];
  loading: boolean;
  error: string | null;
  
  // Durum yönetimi
  selectedStatusId: string | null;
  editingStatusId: string | null;
  newStatus: Partial<TaskStatus>;
  openStatusDialog: boolean;
  showColorPicker: boolean;
  anchorEl: HTMLElement | null;
  
  // Fonksiyonlar
  setStatuses: React.Dispatch<React.SetStateAction<TaskStatus[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setPriorities: React.Dispatch<React.SetStateAction<TaskPriority[]>>;
  setSelectedStatusId: React.Dispatch<React.SetStateAction<string | null>>;
  setEditingStatusId: React.Dispatch<React.SetStateAction<string | null>>;
  setNewStatus: React.Dispatch<React.SetStateAction<Partial<TaskStatus>>>;
  setOpenStatusDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setShowColorPicker: (show: boolean) => void;
  setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setProject: React.Dispatch<React.SetStateAction<Project | null>>;
  
  // İşlemler
  loadData: () => Promise<void>;
  handleTaskMove: (taskId: string, newStatusId: string) => Promise<void>;
  handleTaskClick: (taskId: string) => void;
  handleStatusMenuOpen: (event: React.MouseEvent<HTMLElement>, statusId: string) => void;
  handleStatusMenuClose: () => void;
  handleEditStatus: () => void;
  handleDeleteStatus: () => Promise<void>;
  handleOpenNewStatusDialog: () => void;
  handleCloseStatusDialog: () => void;
  handleStatusFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleColorChange: (color: ColorResult) => void;
  handleStatusSubmit: () => Promise<void>;
  handleBackToProjects: () => void;
  handleChangeProject: (projectId: string) => Promise<void>;
  handleReorderStatus: (sourceIndex: number, destinationIndex: number) => Promise<void>;
  handleAddTask: (task: Partial<Task>) => Promise<void>;
}

interface TaskBoardProviderProps {
  children: React.ReactNode;
  project: Project;
}

const TaskBoardContext = createContext<TaskBoardContextType | undefined>(undefined);

export const TaskBoardProvider: React.FC<TaskBoardProviderProps> = ({ children, project: initialProject }) => {
  // Veri state'leri
  const [project, setProject] = useState<Project | null>(initialProject);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priorities, setPriorities] = useState<TaskPriority[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state'leri
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<Partial<TaskStatus>>({
    name: '',
    description: '',
    color: '#3498db',
    status_category: 'to-do',
    icon: 'task_alt'
  });
  const [openStatusDialog, setOpenStatusDialog] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  
  const navigate = useNavigate();

  // Seçilen projeyi localStorage'dan yükle
  useEffect(() => {
    const savedProject = localStorage.getItem(SELECTED_PROJECT_KEY);
    if (savedProject) {
      try {
        const parsedProject = JSON.parse(savedProject);
        setProject(parsedProject);
      } catch (err) {
        console.error('Kaydedilmiş proje yüklenirken hata:', err);
        localStorage.removeItem(SELECTED_PROJECT_KEY);
      }
    }
  }, []);

  // Proje değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (project) {
      localStorage.setItem(SELECTED_PROJECT_KEY, JSON.stringify(project));
    }
  }, [project]);
  
  // Veri yükleme fonksiyonu - Hata kontrolü iyileştirilmiş
  const loadData = async () => {
    if (!project || !project.id) {
      console.error('loadData: project or project.id is undefined');
      setLoading(false);
      setStatuses([]);
      setTasks([]);
      setPriorities([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading data for project:', project.id);
      
      // Durumları yükle
      let statusesData = await taskStatusService.getTaskStatuses(project.id);
      
      // Eğer durum yoksa veya boş geliyorsa, varsayılan durumları oluştur
      if (!statusesData || statusesData.length === 0) {
        console.log('Proje için durum bulunamadı, varsayılan durumlar oluşturuluyor');
        try {
          statusesData = await taskStatusService.createDefaultTaskStatuses(project.id);
          if (!statusesData || statusesData.length === 0) {
            throw new Error('Varsayılan durumlar oluşturulamadı');
          }
        } catch (err) {
          console.error('Varsayılan durumlar oluşturulurken hata:', err);
          throw new Error('Varsayılan durumlar oluşturulamadı');
        }
      }
      
      setStatuses(statusesData);
      
      // Öncelikleri yükle
      const prioritiesData = await taskService.getTaskPriorities(project.id);
      setPriorities(prioritiesData);
      
      // Görevleri yükle
      const tasksData = await taskService.getTasks(project.id);
      setTasks(tasksData || []);
      
    } catch (err) {
      console.error('Veri yüklenirken hata:', err);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setStatuses([]);
      setTasks([]);
      setPriorities([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Proje değiştiğinde verileri yükle
  useEffect(() => {
    if (project) {
      loadData();
    }
  }, [project]);
  
  // Görev taşıma işlemi
  const handleTaskMove = async (taskId: string, newStatusId: string) => {
    try {
      // Önce UI'ı güncelle
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status_id: newStatusId } : task
        )
      );
      
      // Sonra veritabanını güncelle
      await taskService.updateTaskStatus(taskId, newStatusId);
    } catch (err) {
      console.error('Görev taşınırken hata:', err);
      // Hata durumunda verileri tekrar yükle
      loadData();
    }
  };
  
  // Görev detaylarına gitme
  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };
  
  // Durum menüsü açma
  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>, statusId: string) => {
    setSelectedStatusId(statusId);
    setAnchorEl(event.currentTarget);
  };
  
  // Durum menüsü kapatma
  const handleStatusMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Durum düzenleme
  const handleEditStatus = () => {
    if (!selectedStatusId) return;
    
    const statusToEdit = statuses.find(status => status.id === selectedStatusId);
    if (!statusToEdit) return;
    
    setEditingStatusId(selectedStatusId);
    setNewStatus({
      name: statusToEdit.name,
      description: statusToEdit.description || '',
      color: statusToEdit.color || '#3498db',
      status_category: statusToEdit.status_category || 'to-do',
      icon: statusToEdit.icon || 'task_alt'
    });
    
    setOpenStatusDialog(true);
    handleStatusMenuClose();
  };
  
  // Durum silme
  const handleDeleteStatus = async () => {
    if (!selectedStatusId || !project) return;
    
    try {
      // Durumu sil
      await taskStatusService.deleteStatus(selectedStatusId);
      
      // UI güncelleme
      setStatuses(prevStatuses => 
        prevStatuses.filter(status => status.id !== selectedStatusId)
      );
      
      handleStatusMenuClose();
    } catch (err: any) {
      console.error('Durum silinirken hata:', err);
      alert(err.message || 'Durum silinirken bir hata oluştu.');
    }
  };
  
  // Yeni durum ekleme diyaloğunu aç
  const handleOpenNewStatusDialog = () => {
    setEditingStatusId(null);
    setNewStatus({
      name: '',
      description: '',
      color: '#3498db',
      status_category: 'to-do',
      icon: 'task_alt'
    });
    setOpenStatusDialog(true);
  };
  
  // Durum diyaloğunu kapat
  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setShowColorPicker(false);
  };
  
  // Durum form değişikliklerini işle
  const handleStatusFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewStatus(prev => ({ ...prev, [name]: value }));
  };
  
  // Renk değişikliğini işle
  const handleColorChange = (color: ColorResult) => {
    setNewStatus(prev => ({ ...prev, color: color.hex }));
  };
  
  // Durum formunu gönder
  const handleStatusSubmit = async () => {
    if (!project) {
      console.error('Proje bulunamadı');
      return;
    }
    
    try {
      const currentTimestamp = new Date().toISOString();
      
      if (editingStatusId) {
        // Mevcut durumu güncelle
        const updatedStatus = await taskStatusService.updateStatus(editingStatusId, {
          name: newStatus.name,
          description: newStatus.description,
          color: newStatus.color,
          status_category: newStatus.status_category as TaskStatus['status_category'],
          icon: newStatus.icon,
          updated_at: currentTimestamp
        });
        
        // UI güncelleme
        setStatuses(prevStatuses =>
          prevStatuses.map(status =>
            status.id === editingStatusId ? updatedStatus : status
          )
        );
      } else {
        // Yeni durum ekle
        const createdStatus = await taskStatusService.createStatus({
          project_id: project.id,
          name: newStatus.name || 'Yeni Durum',
          description: newStatus.description || '',
          color: newStatus.color || '#3498db',
          position: statuses.length + 1,
          is_default: false,
          status_category: newStatus.status_category as TaskStatus['status_category'] || 'to-do',
          icon: newStatus.icon || 'task_alt',
          created_at: currentTimestamp,
          updated_at: currentTimestamp
        });
        
        // UI güncelleme
        setStatuses(prevStatuses => [...prevStatuses, createdStatus]);
      }
      
      handleCloseStatusDialog();
    } catch (err: any) {
      console.error('Durum kaydedilirken hata:', err);
      alert(err.message || 'Durum kaydedilirken bir hata oluştu.');
    }
  };

  // Durumları sırala
  const handleReorderStatus = async (sourceIndex: number, destinationIndex: number) => {
    if (!project) return;
    
    try {
      const newStatuses = Array.from(statuses);
      const [removed] = newStatuses.splice(sourceIndex, 1);
      newStatuses.splice(destinationIndex, 0, removed);
      
      // UI güncelleme
      setStatuses(newStatuses);
      
      // Backend güncelleme
      await Promise.all(
        newStatuses.map((status, index) =>
          taskStatusService.updateStatusPosition(status.id, index + 1)
        )
      );
    } catch (err: any) {
      console.error('Durumlar sıralanırken hata:', err);
      // Hata durumunda orijinal sıralamaya geri dön
      loadData();
    }
  };

  // Projeler listesine dön
  const handleBackToProjects = () => {
    navigate('/projects');
  };

  // Proje değiştir - Hata kontrolü iyileştirilmiş
  const handleChangeProject = async (projectId: string) => {
    if (!projectId) {
      console.error('handleChangeProject: projectId is undefined or null');
      setError('Geçersiz proje ID\'si');
      return;
    }
    
    try {
      setLoading(true);
      
      // Proje detaylarını getir
      const projectData = await taskService.getProjectById(projectId);
      
      if (!projectData) {
        throw new Error('Proje bulunamadı');
      }
      
      // Projeyi ayarla
      setProject(projectData);
      
      // loadData fonksiyonu useEffect tarafından otomatik çağrılacak
    } catch (err) {
      console.error('Proje değiştirilirken hata:', err);
      setError('Proje değiştirilirken bir hata oluştu.');
      setProject(null);
      setStatuses([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Yeni görev ekleme
  const handleAddTask = async (task: Partial<Task>) => {
    if (!project) {
      console.error('Proje bulunamadı');
      return;
    }

    try {
      const currentTimestamp = new Date().toISOString();
      const userId = await taskService.getCurrentUserId();

      if (!userId) {
        throw new Error('Kullanıcı kimliği bulunamadı');
      }

      // Eğer öncelikler boşsa, yeniden yükle
      if (priorities.length === 0) {
        const prioritiesData = await taskService.getTaskPriorities(project.id);
        setPriorities(prioritiesData);
      }

      const newTask: Partial<Task> = {
        ...task,
        project_id: project.id,
        created_by: userId,
        status_id: task.status_id || statuses[0]?.id, // İlk durumu varsayılan olarak kullan
        priority_id: task.priority_id || priorities[0]?.id, // İlk önceliği varsayılan olarak kullan
        position: tasks.filter(t => t.status_id === task.status_id).length + 1,
        created_at: currentTimestamp,
        updated_at: currentTimestamp
      };

      const createdTask = await taskService.addTask(newTask);
      
      // UI güncelleme
      setTasks(prevTasks => [...prevTasks, createdTask]);
    } catch (err: any) {
      console.error('Görev eklenirken hata:', err);
      alert(err.message || 'Görev eklenirken bir hata oluştu.');
    }
  };
  
  const contextValue: TaskBoardContextType = {
    project,
    statuses,
    tasks,
    priorities,
    loading,
    error,
    selectedStatusId,
    editingStatusId,
    newStatus,
    openStatusDialog,
    showColorPicker,
    anchorEl,
    setStatuses,
    setTasks,
    setPriorities,
    setSelectedStatusId,
    setEditingStatusId,
    setNewStatus,
    setOpenStatusDialog,
    setShowColorPicker: (show: boolean) => setShowColorPicker(show),
    setAnchorEl,
    setProject,
    loadData,
    handleTaskMove,
    handleTaskClick,
    handleStatusMenuOpen,
    handleStatusMenuClose,
    handleEditStatus,
    handleDeleteStatus,
    handleOpenNewStatusDialog,
    handleCloseStatusDialog,
    handleStatusFormChange,
    handleColorChange,
    handleStatusSubmit,
    handleBackToProjects,
    handleChangeProject,
    handleReorderStatus,
    handleAddTask,
  };
  
  return (
    <TaskBoardContext.Provider value={contextValue}>
      {children}
    </TaskBoardContext.Provider>
  );
};

export const useTaskBoard = () => {
  const context = useContext(TaskBoardContext);
  if (context === undefined) {
    throw new Error('useTaskBoard must be used within a TaskBoardProvider');
  }
  return context;
};