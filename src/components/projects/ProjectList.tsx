import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  alpha,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Business as BusinessIcon,
  Dashboard as DashboardIcon,
  BugReport as BugIcon,
  Palette as PaletteIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types/taskManagement';
import { ProjectService } from '@/services/ProjectService';
import ProjectForm from './ProjectForm';

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

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const projectService = new ProjectService();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Projeleri yükle
  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error('Projeler yüklenirken hata:', err);
      setError('Projeler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde projeleri getir
  useEffect(() => {
    loadProjects();
  }, []);

  // Proje oluştur
  const handleCreateProject = async (projectData: Partial<Project>) => {
    try {
      const newProject = await projectService.createProject(projectData as any);
      setProjects(prev => [newProject, ...prev]);
      return Promise.resolve();
    } catch (error) {
      console.error('Proje oluşturulurken hata:', error);
      return Promise.reject(error);
    }
  };

  // Proje güncelle
  const handleUpdateProject = async (projectData: Partial<Project>) => {
    if (!selectedProject) return Promise.reject('Proje seçilmedi');
    
    try {
      const updatedProject = await projectService.updateProject(selectedProject.id, projectData);
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      return Promise.resolve();
    } catch (error) {
      console.error('Proje güncellenirken hata:', error);
      return Promise.reject(error);
    }
  };

  // Proje arşivle
  const handleArchiveProject = async () => {
    if (!activeProjectId) return;
    
    try {
      await projectService.archiveProject(activeProjectId);
      setProjects(prev => prev.filter(p => p.id !== activeProjectId));
      handleMenuClose();
    } catch (error) {
      console.error('Proje arşivlenirken hata:', error);
    }
  };

  // Proje detaylarına git
  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  // Proje düzenleme formunu aç
  const handleEditClick = (event: React.MouseEvent, project: Project) => {
    event.stopPropagation();
    setSelectedProject(project);
    setIsFormOpen(true);
    handleMenuClose();
  };

  // Menü işlemleri
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, projectId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActiveProjectId(projectId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveProjectId(null);
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

  if (error) {
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
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600, 
            color: '#1d1d1f',
            fontSize: { xs: '1.5rem', md: '1.75rem' }
          }}
        >
          Projeler
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedProject(null);
            setIsFormOpen(true);
          }}
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
            px: 3,
            py: 1
          }}
        >
          Yeni Proje
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            borderRadius: '16px',
            backgroundColor: alpha('#f5f5f7', 0.5),
            border: '1px dashed',
            borderColor: 'rgba(0,0,0,0.1)',
            maxWidth: 700,
            mx: 'auto'
          }}
        >
          <DashboardIcon 
            sx={{ 
              fontSize: 60, 
              color: alpha('#007aff', 0.2),
              mb: 2
            }} 
          />
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{
              fontWeight: 600,
              color: '#1d1d1f',
              fontSize: '1.5rem'
            }}
          >
            Henüz proje yok
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            paragraph
            sx={{
              mb: 4,
              maxWidth: '500px',
              mx: 'auto',
              opacity: 0.7
            }}
          >
            Yeni bir proje oluşturarak görevlerinizi organize etmeye başlayın.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedProject(null);
              setIsFormOpen(true);
            }}
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
              px: 4,
              py: 1.2
            }}
          >
            İlk Projeyi Oluştur
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Card 
                    onClick={() => handleProjectClick(project.id)}
                    sx={{ 
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        borderColor: alpha('#007aff', 0.3)
                      },
                      border: '1px solid',
                      borderColor: alpha('#000', 0.05)
                    }}
                  >
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: '#007aff', 
                            width: 48, 
                            height: 48,
                            boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)'
                          }}
                        >
                          {getIconComponent(project.icon)}
                        </Avatar>
                        <IconButton 
                          onClick={(e) => handleMenuOpen(e, project.id)}
                          size="small"
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
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            mb: 0.5,
                            color: '#1d1d1f'
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
                            fontSize: '0.7rem',
                            height: 20,
                            mr: 1
                          }}
                        />
                        <Chip
                          label={getProjectTypeLabel(project.project_type)}
                          size="small"
                          sx={{
                            backgroundColor: alpha('#8e8e93', 0.1),
                            color: '#8e8e93',
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                      </Box>
                      
                      {project.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mb: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: 40
                          }}
                        >
                          {project.description}
                        </Typography>
                      )}
                    </CardContent>
                    
                    <Divider sx={{ opacity: 0.6 }} />
                    
                    <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Oluşturulma Tarihi">
                          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                            <CalendarIcon 
                              fontSize="small" 
                              sx={{ 
                                fontSize: '0.9rem', 
                                color: 'text.secondary',
                                mr: 0.5
                              }} 
                            />
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ fontSize: '0.75rem' }}
                            >
                              {formatDate(project.created_at)}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                      
                      <Tooltip title="Proje Sahibi">
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24,
                            fontSize: '0.75rem',
                            bgcolor: alpha('#000', 0.1),
                            color: 'text.secondary'
                          }}
                        >
                          <PersonIcon fontSize="small" />
                        </Avatar>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {/* Proje Formu */}
      <ProjectForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={selectedProject ? handleUpdateProject : handleCreateProject}
        project={selectedProject || undefined}
        title={selectedProject ? 'Projeyi Düzenle' : 'Yeni Proje'}
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
          onClick={(e) => {
            const project = projects.find(p => p.id === activeProjectId);
            if (project) {
              handleEditClick(e, project);
            }
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

export default ProjectList; 