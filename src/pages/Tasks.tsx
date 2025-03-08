import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  useMediaQuery,
  Divider,
  Tooltip,
  Badge,
  Avatar,
  Chip,
  alpha
} from '@mui/material';
import { 
  Add as AddIcon,
  ViewKanban as KanbanIcon,
  ViewList as ListIcon,
  Timeline as TimelineIcon,
  BarChart as ChartIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  MoreVert as MoreIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { taskService } from '../services/taskService';
import { taskStatusService } from '@/services/TaskStatusService';

// Bileşenleri import edelim
import TaskBoard from '@/components/task-management/TaskBoard';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import TaskFilter from '@/components/tasks/TaskFilter';
import ProjectList from '@/components/task-management/ProjectList';

import { Task, Project } from '@/types/taskManagement';
import { useAuth } from '@/hooks/useAuth';

// Görünüm modları
type ViewMode = 'list' | 'board' | 'timeline' | 'reports';

// Seçilen projeyi localStorage'da saklayacak anahtar
const SELECTED_PROJECT_KEY = 'selected_project';

const Tasks: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount, setNotificationCount] = useState(3);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [showProjectSelection, setShowProjectSelection] = useState(true);

  // Animasyon referansları
  const headerRef = useRef(null);

  // Görevleri yükle
  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
      setFilteredTasks(fetchedTasks);
    } catch (err: any) {
      console.error('Görevler yüklenirken hata:', err);
      setError('Görevler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Görev durumlarını yükle
  const loadStatuses = async () => {
    try {
      if (!project || !project.id) {
        console.log('loadStatuses: No project selected');
        setStatuses([]);
        return;
      }

      console.log('Loading statuses for project:', project.id);
      const fetchedStatuses = await taskStatusService.getTaskStatuses(project.id);
      setStatuses(fetchedStatuses || []);
    } catch (err) {
      console.error('Görev durumları yüklenirken hata:', err);
      setStatuses([]);
    }
  };

  // Aktif projeyi yükle
  const loadActiveProject = async () => {
    try {
      // Önce localStorage'dan kayıtlı projeyi kontrol et
      const savedProjectJson = localStorage.getItem(SELECTED_PROJECT_KEY);
      if (savedProjectJson) {
        try {
          const savedProject = JSON.parse(savedProjectJson);
          setProject(savedProject);
          setShowProjectSelection(false); // Kayıtlı proje varsa doğrudan Kanban'ı göster
          return;
        } catch (e) {
          console.error('Kaydedilmiş proje yüklenemedi:', e);
        }
      }

      // Kayıtlı proje yoksa veya yüklenemezse, projeleri getir
      const projects = await taskService.getProjects();
      if (projects && projects.length > 0) {
        // Varsayılan olarak ilk projeyi seç
        setProject(projects[0]);
        setShowProjectSelection(false); // Otomatik seçilen proje ile Kanban'ı göster
      } else {
        // Proje yoksa proje seçim ekranını göster
        setShowProjectSelection(true);
      }
    } catch (err) {
      console.error('Proje yüklenirken hata:', err);
      setShowProjectSelection(true); // Hata durumunda proje seçim ekranını göster
    }
  };

  // Sayfa yüklendiğinde görevleri, durumları ve projeyi getir
  useEffect(() => {
    if (user) {
      loadTasks();
      loadStatuses();
      loadActiveProject();
    }
  }, [user]);

  // Proje değiştiğinde durumları yeniden yükle
  useEffect(() => {
    if (project) {
      loadStatuses();
    }
  }, [project]);

  // Proje seç
  const handleSelectProject = (selectedProject: Project) => {
    setProject(selectedProject);
    setShowProjectSelection(false);
    
    // Seçilen projeyi localStorage'a kaydet
    try {
      localStorage.setItem(SELECTED_PROJECT_KEY, JSON.stringify(selectedProject));
    } catch (error) {
      console.error('Proje localStorage\'a kaydedilemedi:', error);
    }
  };

  // Proje seçimine geri dön
  const handleBackToProjects = () => {
    setShowProjectSelection(true);
  };

  // Yeni görev oluştur
  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      setIsLoading(true);
      
      // Eksik alanları kontrol et ve varsayılan değerler ekle
      const newTask = {
        ...taskData,
        status_id: taskData.status_id || 'todo',
        priority_id: taskData.priority_id || 'medium',
        assignee_id: taskData.assignee_id || user?.id || null,
        title: taskData.title || '' // title'ın undefined olmamasını sağla
      };
      
      // Type assertion ile Task tipine dönüştürelim
      const createdTask = await taskService.createTask(newTask as any);
      
      if (createdTask) {
        // Görev listesini güncelle
        setTasks([createdTask, ...tasks]);
        setSnackbar({
          open: true,
          message: 'Görev başarıyla oluşturuldu',
          severity: 'success'
        });
      } else {
        throw new Error('Görev oluşturulamadı');
      }
    } catch (error) {
      console.error('Görev oluşturulurken hata:', error);
      setSnackbar({
        open: true,
        message: 'Görev oluşturulurken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
      setIsFormOpen(false);
    }
  };

  // Görev güncelle
  const handleUpdateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      await taskService.updateTask(taskId, taskData);
      loadTasks();
    } catch (err) {
      console.error('Görev güncellenirken hata:', err);
      setError('Görev güncellenirken bir hata oluştu.');
    }
  };

  // Görev sil
  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      loadTasks();
    } catch (err) {
      console.error('Görev silinirken hata:', err);
      setError('Görev silinirken bir hata oluştu.');
    }
  };

  // Görevleri filtrele
  const handleFilterTasks = (filters: any) => {
    let result = [...tasks];

    if (filters.status) {
      result = result.filter(task => task.status_id === filters.status);
    }

    if (filters.priority) {
      result = result.filter(task => task.priority_id === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchLower) || 
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    setFilteredTasks(result);
  };

  // Menü işlemleri
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Tema değiştirme
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Filtre panelini aç/kapat
  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Proje ayarları sayfasına yönlendir
  const handleProjectSettings = () => {
    if (project) {
      window.location.href = `/projects/${project.id}/settings`;
    }
    handleMenuClose();
  };

  // Gösterge paneline yönlendir
  const handleDashboard = () => {
    if (project) {
      window.location.href = `/projects/${project.id}/dashboard`;
    }
    handleMenuClose();
  };

  // Gelişmiş arama sayfasına yönlendir
  const handleAdvancedSearch = () => {
    if (project) {
      window.location.href = `/projects/${project.id}/search`;
    }
    handleMenuClose();
  };

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Görevleri görüntülemek için giriş yapmalısınız.</Typography>
      </Box>
    );
  }

  // Proje seçim ekranını göster
  if (showProjectSelection) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ p: 3 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 3, 
              fontWeight: 600,
              letterSpacing: '-0.02em'
            }}
          >
            Proje Seçin
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4,
              color: alpha('#000', 0.7)
            }}
          >
            Kanban panosunu görüntülemek için bir proje seçin. Seçtiğiniz proje hatırlanacak ve bir sonraki girişinizde otomatik olarak yüklenecektir.
          </Typography>
          
          <ProjectList onSelectProject={handleSelectProject} />
        </Box>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box 
        sx={{ 
          p: { xs: 2, md: 3 },
          backgroundColor: theme => theme.palette.background.default,
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {/* Üst Başlık ve Kontroller */}
        <motion.div
          ref={headerRef}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', md: 'center' }, 
              mb: 3,
              pb: 2,
              borderBottom: '1px solid',
              borderColor: alpha('#000', 0.05)
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
              <Avatar 
                sx={{ 
                  bgcolor: '#007aff', 
                  width: 40, 
                  height: 40, 
                  mr: 2,
                  boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)'
                }}
              >
                {project?.key?.substring(0, 1) || 'P'}
              </Avatar>
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: { xs: '1.5rem', md: '1.75rem' },
                    letterSpacing: '-0.02em',
                    color: '#1d1d1f'
                  }}
                >
                  {project?.name || 'Görevler'}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    mt: 0.5,
                    fontSize: '0.875rem',
                    opacity: 0.8
                  }}
                >
                  {project?.description || 'Tüm görevlerinizi yönetin'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Tooltip title="Proje Değiştir">
                <Button
                  variant="outlined"
                  onClick={handleBackToProjects}
                  sx={{
                    borderColor: alpha('#007aff', 0.3),
                    color: '#007aff',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: '#007aff',
                      backgroundColor: alpha('#007aff', 0.05)
                    },
                    mr: 1
                  }}
                >
                  Proje Değiştir
                </Button>
              </Tooltip>

              <Tooltip title="Bildirimler">
                <IconButton 
                  sx={{ 
                    color: '#007aff',
                    backgroundColor: alpha('#007aff', 0.05),
                    '&:hover': {
                      backgroundColor: alpha('#007aff', 0.1)
                    },
                    mr: 1
                  }}
                >
                  <Badge badgeContent={notificationCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title={isDarkMode ? 'Açık Tema' : 'Koyu Tema'}>
                <IconButton 
                  onClick={toggleDarkMode}
                  sx={{ 
                    color: isDarkMode ? '#f5f5f7' : '#1d1d1f',
                    backgroundColor: alpha(isDarkMode ? '#f5f5f7' : '#1d1d1f', 0.05),
                    '&:hover': {
                      backgroundColor: alpha(isDarkMode ? '#f5f5f7' : '#1d1d1f', 0.1)
                    },
                    mr: 1
                  }}
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Filtrele">
                <IconButton 
                  onClick={toggleFilterPanel}
                  sx={{ 
                    color: isFilterOpen ? '#007aff' : 'text.secondary',
                    backgroundColor: isFilterOpen ? alpha('#007aff', 0.1) : 'transparent',
                    '&:hover': {
                      backgroundColor: isFilterOpen ? alpha('#007aff', 0.15) : alpha('#000', 0.05)
                    },
                    mr: 1
                  }}
                >
                  <FilterIcon />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsFormOpen(true)}
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
                Yeni Görev
              </Button>

              <IconButton 
                onClick={handleMenuOpen}
                sx={{ 
                  ml: 1,
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: alpha('#000', 0.05)
                  }
                }}
              >
                <MoreIcon />
              </IconButton>

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
                    mt: 1.5
                  }
                }}
              >
                <MenuItem onClick={handleDashboard}>
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" sx={{ color: '#007aff' }} />
                  </ListItemIcon>
                  <ListItemText primary="Gösterge Paneli" />
                </MenuItem>
                <MenuItem onClick={handleProjectSettings}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" sx={{ color: '#007aff' }} />
                  </ListItemIcon>
                  <ListItemText primary="Proje Ayarları" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleAdvancedSearch}>
                  <ListItemIcon>
                    <SearchIcon fontSize="small" sx={{ color: '#007aff' }} />
                  </ListItemIcon>
                  <ListItemText primary="Gelişmiş Arama" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </motion.div>

        {/* Görünüm Seçenekleri */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Paper 
            sx={{ 
              p: 1, 
              mb: 3, 
              display: 'flex', 
              justifyContent: 'center',
              borderRadius: '16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              backgroundColor: alpha('#fff', 0.8),
              backdropFilter: 'blur(10px)'
            }}
          >
            <Tabs 
              value={viewMode} 
              onChange={(_, newValue) => setViewMode(newValue)}
              variant={isMobile ? "scrollable" : "standard"}
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
                icon={<ListIcon />} 
                iconPosition="start" 
                label="Liste" 
                value="list" 
              />
              <Tab 
                icon={<KanbanIcon />} 
                iconPosition="start" 
                label="Kanban" 
                value="board" 
              />
              <Tab 
                icon={<TimelineIcon />} 
                iconPosition="start" 
                label="Zaman Çizelgesi" 
                value="timeline" 
              />
              <Tab 
                icon={<ChartIcon />} 
                iconPosition="start" 
                label="Raporlar" 
                value="reports" 
              />
            </Tabs>
          </Paper>
        </motion.div>

        {/* Filtre Paneli */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}
              >
                <TaskFilter onFilter={handleFilterTasks} statuses={statuses} />
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hata Mesajı */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)'
              }}
            >
              {error}
            </Alert>
          </motion.div>
        )}

        {/* İçerik */}
        {loading ? (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              p: 5,
              minHeight: 300
            }}
          >
            <CircularProgress sx={{ color: '#007aff' }} />
          </Box>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ width: '100%' }}
            >
              {viewMode === 'list' && (
                <Paper 
                  sx={{ 
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                  }}
                >
                  <TaskList 
                    tasks={filteredTasks} 
                    onUpdateTask={handleUpdateTask} 
                    onDeleteTask={handleDeleteTask} 
                  />
                </Paper>
              )}
              
              {viewMode === 'board' && (
                project ? (
                  <Box sx={{ height: 'calc(100vh - 250px)' }}>
                    <TaskBoard project={project} />
                  </Box>
                ) : <CircularProgress />
              )}
              
              {viewMode === 'timeline' && (
                <Paper 
                  sx={{ 
                    p: 4, 
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 400,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                  }}
                >
                  <Box textAlign="center">
                    <TimelineIcon sx={{ fontSize: 60, color: alpha('#007aff', 0.3), mb: 2 }} />
                    <Typography variant="h6" gutterBottom>Zaman Çizelgesi Görünümü</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bu özellik yakında kullanıma sunulacaktır.
                    </Typography>
                  </Box>
                </Paper>
              )}
              
              {viewMode === 'reports' && (
                <Paper 
                  sx={{ 
                    p: 4, 
                    borderRadius: '16px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 400,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                  }}
                >
                  <Box textAlign="center">
                    <ChartIcon sx={{ fontSize: 60, color: alpha('#007aff', 0.3), mb: 2 }} />
                    <Typography variant="h6" gutterBottom>Raporlar Görünümü</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bu özellik yakında kullanıma sunulacaktır.
                    </Typography>
                  </Box>
                </Paper>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Görev Formu */}
        {isFormOpen && (
          <TaskForm 
            open={isFormOpen} 
            onClose={() => setIsFormOpen(false)} 
            onSubmit={handleCreateTask} 
            statuses={statuses}
          />
        )}
      </Box>
    </motion.div>
  );
};

export default Tasks; 






























