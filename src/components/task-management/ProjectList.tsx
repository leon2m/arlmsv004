import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Divider,
  alpha
} from '@mui/material';
import { 
  Add as AddIcon, 
  FolderOpen as FolderIcon, 
  Archive as ArchiveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { TaskService } from '@/services/taskService';
import { Project } from '@/types/taskManagement';
import { useAuth } from '@/hooks/useAuth';

const taskService = new TaskService();

interface ProjectListProps {
  onSelectProject?: (project: Project) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    key: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    key: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectList = await taskService.getProjects();
      setProjects(projectList);
      setError(null);
    } catch (err) {
      console.error('Projeler yüklenirken hata oluştu:', err);
      setError('Projeler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setNewProject({
      name: '',
      key: '',
      description: ''
    });
    setFormErrors({
      name: '',
      key: ''
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Proje anahtarı için otomatik büyük harf dönüşümü
    if (name === 'key') {
      setNewProject({
        ...newProject,
        [name]: value.toUpperCase().replace(/[^A-Z0-9]/g, '')
      });
    } else {
      setNewProject({
        ...newProject,
        [name]: value
      });
    }
    
    // Hata mesajlarını temizle
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    const errors = {
      name: '',
      key: ''
    };
    let isValid = true;

    if (!newProject.name.trim()) {
      errors.name = 'Proje adı gereklidir';
      isValid = false;
    }

    if (!newProject.key.trim()) {
      errors.key = 'Proje anahtarı gereklidir';
      isValid = false;
    } else if (newProject.key.length < 2 || newProject.key.length > 10) {
      errors.key = 'Proje anahtarı 2-10 karakter uzunluğunda olmalıdır';
      isValid = false;
    } else if (projects.some(p => p.key === newProject.key)) {
      errors.key = 'Bu proje anahtarı zaten kullanılıyor';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleCreateProject = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await taskService.createProject(newProject);
      await loadProjects();
      handleCloseDialog();
    } catch (err) {
      console.error('Proje oluşturulurken hata oluştu:', err);
      setError('Proje oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    if (onSelectProject) {
      // Proje seçim fonksiyonu varsa onu çağır
      onSelectProject(project);
    } else {
      // Yoksa yönlendirme yap
      navigate(`/projects/${project.id}`);
    }
  };

  const handleArchiveProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm('Bu projeyi arşivlemek istediğinizden emin misiniz?')) {
      try {
        await taskService.archiveProject(projectId);
        await loadProjects();
      } catch (err) {
        console.error('Proje arşivlenirken hata oluştu:', err);
        setError('Proje arşivlenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    }
  };

  if (loading && projects.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress sx={{ color: '#007aff' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Projeler
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            backgroundColor: '#007aff',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#0062cc',
              boxShadow: '0 4px 12px rgba(0, 122, 255, 0.35)'
            }
          }}
        >
          Yeni Proje
        </Button>
      </Box>

      {error && (
        <Box mb={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {projects.length === 0 ? (
        <Card sx={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <CardContent>
            <Box textAlign="center" py={4}>
              <FolderIcon sx={{ fontSize: 60, color: alpha('#007aff', 0.3), marginBottom: 2 }} />
              <Typography variant="h6" gutterBottom>
                Henüz hiç projeniz yok
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Yeni bir proje oluşturarak başlayın
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{
                  backgroundColor: '#007aff',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#0062cc',
                    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.35)'
                  }
                }}
              >
                Yeni Proje Oluştur
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                  }
                }}
                onClick={() => handleProjectClick(project)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Chip 
                        label={project.key} 
                        size="small" 
                        sx={{ 
                          mb: 1,
                          backgroundColor: alpha('#007aff', 0.1),
                          color: '#007aff',
                          fontWeight: 600
                        }} 
                      />
                      <Typography variant="h6" component="h2" gutterBottom>
                        {project.name}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleArchiveProject(project.id, e)}
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': {
                          backgroundColor: alpha('#000', 0.05)
                        }
                      }}
                    >
                      <Tooltip title="Arşivle">
                        <ArchiveIcon fontSize="small" />
                      </Tooltip>
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 2,
                    height: '40px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {project.description || 'Açıklama yok'}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(project.created_at).toLocaleDateString('tr-TR')}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Tooltip title="Ekip Üyeleri">
                        <IconButton size="small" sx={{ color: '#007aff' }}>
                          <PeopleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Yeni Proje Oluştur</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Proje Adı"
            type="text"
            fullWidth
            variant="outlined"
            value={newProject.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="key"
            label="Proje Anahtarı"
            type="text"
            fullWidth
            variant="outlined"
            value={newProject.key}
            onChange={handleInputChange}
            error={!!formErrors.key}
            helperText={formErrors.key || 'Benzersiz bir proje kodu (örn. PROJ, ABC, vb.)'}
            inputProps={{ maxLength: 10 }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Açıklama"
            type="text"
            fullWidth
            variant="outlined"
            value={newProject.description}
            onChange={handleInputChange}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha('#000', 0.05)
              }
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#007aff',
              '&:hover': {
                backgroundColor: '#0062cc'
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectList; 