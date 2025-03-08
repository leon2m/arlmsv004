import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  alpha,
  Tooltip,
  Avatar,
  Chip,
  Badge
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  BarChart as ChartIcon,
  ViewKanban as KanbanIcon,
  ViewList as ListIcon,
  Description as DocumentIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Business as BusinessIcon,
  Dashboard as DashboardIcon,
  BugReport as BugIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Board, Sprint, Task } from '@/types/taskManagement';
import { ProjectService } from '@/services/ProjectService';
import { TaskService } from '@/services/taskService';
import ProjectForm from './ProjectForm';
import { TaskBoard } from '@/components/task-management/TaskBoard';

// İkon bileşenlerini eşleştir
const getIconComponent = (iconName: string | null) => {
  switch (iconName) {
    case 'school': return <SchoolIcon />;
    case 'code': return <CodeIcon />;
    case 'business': return <BusinessIcon />;
    case 'bug': return <BugIcon />;
    case 'palette': return <PaletteIcon />;
    default: return <DashboardIcon />;
  }
};

// Proje tipi etiketleri
const getProjectTypeLabel = (type: string) => {
  switch (type) {
    case 'classic': return 'Klasik';
    case 'scrum': return 'Scrum';
    case 'kanban': return 'Kanban';
    default: return type;
  }
};

// Görünüm modları
type ViewMode = 'board' | 'list' | 'timeline' | 'reports';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const projectService = new ProjectService();
  const taskService = new TaskService();
  
  const [project, setProject] = useState<Project | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [tabValue, setTabValue] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Proje verilerini yükle
  const loadProjectData = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      
      // Proje detaylarını getir
      const projectData = await projectService.getProject(projectId);
      if (!projectData) {
        setError('Proje bulunamadı');
        return;
      }
      
      setProject(projectData);
      
      // Proje panolarını getir
      const boardsData = await projectService.getProjectBoards(projectId);
      setBoards(boardsData);
      
      // Proje görevlerini getir
      const tasksData = await taskService.getTasks();
      setTasks(tasksData);
      
      // Eğer Scrum projesi ise sprintleri getir
      if (projectData.project_type === 'scrum') {
        // Burada sprint servisi eklenebilir
        // const sprintsData = await sprintService.getProjectSprints(projectId);
        // setSprints(sprintsData);
      }
      
      setError(null);
    } catch (err) {
      console.error('Proje verileri yüklenirken hata:', err);
      setError('Proje verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Sayfa yüklendiğinde proje verilerini getir
  useEffect(() => {
    loadProjectData();
  }, [projectId]);
  
  // Proje güncelle
  const handleUpdateProject = async (projectData: Partial<Project>) => {
    if (!project) return Promise.reject('Proje bulunamadı');
    
    try {
      const updatedProject = await projectService.updateProject(project.id, projectData);
      setProject(updatedProject);
      return Promise.resolve();
    } catch (error) {
      console.error('Proje güncellenirken hata:', error);
      return Promise.reject(error);
    }
  };
  
  // Proje arşivle
  const handleArchiveProject = async () => {
    if (!project) return;
    
    try {
      await projectService.archiveProject(project.id);
      navigate('/projects');
    } catch (error) {
      console.error('Proje arşivlenirken hata:', error);
    }
  };
  
  // Menü işlemleri
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Tab değişimi
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Tab değerine göre görünüm modunu ayarla
    switch (newValue) {
      case 0:
        setViewMode('board');
        break;
      case 1:
        setViewMode('list');
        break;
      case 2:
        setViewMode('timeline');
        break;
      case 3:
        setViewMode('reports');
        break;
      default:
        setViewMode('board');
    }
  };
  
  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    }).format(date);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress sx={{ color: '#007aff' }} />
      </Box>
    );
  }
  
  if (error || !project) {
    return (
      <Paper 
        sx={{ 
          p: 3, 
          backgroundColor: alpha('#ff3b30', 0.05),
          borderRadius: '12px',
          border: '1px solid',
          borderColor: alpha('#ff3b30', 0.2)
        }}
      >
        <Typography color="error">{error || 'Proje bulunamadı'}</Typography>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Projelere Dön
        </Button>
      </Paper>
    );
  }
  
  return (
    <Box>
      {/* Proje Başlığı ve Kontroller */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid',
            borderColor: alpha('#000', 0.05)
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: '#007aff', 
                  width: 56, 
                  height: 56, 
                  mr: 2,
                  boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)'
                }}
              >
                {getIconComponent(project.icon)}
              </Avatar>
              
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#1d1d1f',
                      fontSize: { xs: '1.5rem', md: '1.75rem' },
                      mr: 1
                    }}
                  >
                    {project.name}
                  </Typography>
                  <Chip
                    label={project.key}
                    size="small"
                    sx={{
                      backgroundColor: alpha('#007aff', 0.1),
                      color: '#007aff',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      height: 24
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    label={getProjectTypeLabel(project.project_type)}
                    size="small"
                    icon={<KanbanIcon fontSize="small" />}
                    sx={{
                      backgroundColor: alpha('#8e8e93', 0.1),
                      color: '#8e8e93',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      height: 24
                    }}
                  />
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      ml: 1
                    }}
                  >
                    Oluşturulma: {formatDate(project.created_at)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, md: 0 } }}>
              <Button
                variant="outlined"
                startIcon={<PeopleIcon />}
                sx={{
                  borderRadius: '10px',
                  borderColor: alpha('#007aff', 0.3),
                  color: '#007aff',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: '#007aff',
                    backgroundColor: alpha('#007aff', 0.05)
                  }
                }}
              >
                Üyeler
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                sx={{
                  borderRadius: '10px',
                  borderColor: alpha('#8e8e93', 0.3),
                  color: '#8e8e93',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: '#8e8e93',
                    backgroundColor: alpha('#8e8e93', 0.05)
                  }
                }}
              >
                Ayarlar
              </Button>
              
              <IconButton 
                onClick={handleMenuOpen}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: alpha('#000', 0.05)
                  }
                }}
              >
                <MoreIcon />
              </IconButton>
            </Box>
          </Box>
          
          {project.description && (
            <Typography 
              variant="body1" 
              sx={{ 
                mt: 3,
                color: 'text.secondary',
                maxWidth: '800px'
              }}
            >
              {project.description}
            </Typography>
          )}
        </Paper>
      </motion.div>
      
      {/* Görünüm Seçenekleri */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Paper 
          sx={{ 
            p: 1, 
            mb: 3, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            backgroundColor: alpha('#fff', 0.8),
            backdropFilter: 'blur(10px)'
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#007aff',
                height: 3,
                borderRadius: '3px'
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
                minWidth: 100,
                '&.Mui-selected': {
                  color: '#007aff',
                  fontWeight: 600
                }
              }
            }}
          >
            <Tab 
              icon={<KanbanIcon />} 
              iconPosition="start" 
              label="Kanban" 
            />
            <Tab 
              icon={<ListIcon />} 
              iconPosition="start" 
              label="Liste" 
            />
            <Tab 
              icon={<TimelineIcon />} 
              iconPosition="start" 
              label="Zaman Çizelgesi" 
            />
            <Tab 
              icon={<ChartIcon />} 
              iconPosition="start" 
              label="Raporlar" 
            />
            <Tab 
              icon={<DocumentIcon />} 
              iconPosition="start" 
              label="Dokümanlar" 
            />
          </Tabs>
          
          <Box sx={{ display: 'flex', pr: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {}}
              sx={{
                backgroundColor: '#007aff',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#0062cc',
                  boxShadow: '0 4px 12px rgba(0, 122, 255, 0.35)'
                },
                transition: 'all 0.2s ease',
                px: 2,
                py: 1
              }}
            >
              {viewMode === 'board' ? 'Yeni Görev' : 
               viewMode === 'timeline' ? 'Yeni Etkinlik' : 
               viewMode === 'reports' ? 'Yeni Rapor' : 
               viewMode === 'list' ? 'Yeni Görev' : 'Yeni Doküman'}
            </Button>
          </Box>
        </Paper>
      </motion.div>
      
      {/* İçerik */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          {viewMode === 'board' && (
            <Box sx={{ minHeight: 500 }}>
              <TaskBoard project={project} />
            </Box>
          )}
          
          {viewMode === 'list' && (
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                minHeight: 500
              }}
            >
              <Typography variant="h6" gutterBottom>Görev Listesi</Typography>
              <Typography color="text.secondary">
                Bu özellik yakında kullanıma sunulacaktır.
              </Typography>
            </Paper>
          )}
          
          {viewMode === 'timeline' && (
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                minHeight: 500
              }}
            >
              <Typography variant="h6" gutterBottom>Zaman Çizelgesi</Typography>
              <Typography color="text.secondary">
                Bu özellik yakında kullanıma sunulacaktır.
              </Typography>
            </Paper>
          )}
          
          {viewMode === 'reports' && (
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                minHeight: 500
              }}
            >
              <Typography variant="h6" gutterBottom>Raporlar</Typography>
              <Typography color="text.secondary">
                Bu özellik yakında kullanıma sunulacaktır.
              </Typography>
            </Paper>
          )}
          
          {tabValue === 4 && (
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                minHeight: 500
              }}
            >
              <Typography variant="h6" gutterBottom>Dokümanlar</Typography>
              <Typography color="text.secondary">
                Bu özellik yakında kullanıma sunulacaktır.
              </Typography>
            </Paper>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Proje Formu */}
      <ProjectForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleUpdateProject}
        project={project}
        title="Projeyi Düzenle"
      />
      
      {/* Proje Menüsü */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden',
            mt: 1,
            minWidth: 180
          }
        }}
      >
        <MenuItem 
          onClick={() => {
            setIsFormOpen(true);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: '#007aff' }} />
          </ListItemIcon>
          <ListItemText primary="Düzenle" />
        </MenuItem>
        <MenuItem onClick={handleArchiveProject}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" sx={{ color: '#ff9f0a' }} />
          </ListItemIcon>
          <ListItemText primary="Arşivle" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: '#ff3b30' }} />
          </ListItemIcon>
          <ListItemText primary="Sil" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProjectDetail;
