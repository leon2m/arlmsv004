import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Avatar,
  IconButton,
  Divider,
  alpha,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Add as AddIcon,
  AccessTime as TimeIcon,
  Flag as FlagIcon,
  Person as PersonIcon,
  Label as LabelIcon
} from '@mui/icons-material';
import { TaskService } from '@/services/taskService';
import { ProjectService } from '@/services/ProjectService';
import { Task, TaskStatus, Project } from '@/types/taskManagement';
import { useAuth } from '@/hooks/useAuth';

const TaskEdit: React.FC = () => {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const taskService = new TaskService();
  const projectService = new ProjectService();
  const isNewTask = taskId === 'new';
  
  // URL'den durum parametresini al
  const queryParams = new URLSearchParams(location.search);
  const statusFromUrl = queryParams.get('status');
  
  // State
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    status_id: '',
    priority_id: 'medium',
    assignee_id: '',
    due_date: '',
    estimated_hours: 0,
    project_id: projectId
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  // Verileri yükle
  const loadData = async () => {
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
      
      // Görev durumlarını getir
      const statusesData = await taskService.getTaskStatuses(projectId);
      setStatuses(statusesData);
      
      // Kullanıcıları getir (örnek veri)
      setUsers([
        { id: user?.id || 'user-1', name: 'Mevcut Kullanıcı' },
        { id: 'user-2', name: 'Ahmet Yılmaz' },
        { id: 'user-3', name: 'Ayşe Demir' }
      ]);
      
      // Eğer yeni görev ise ve URL'den durum parametresi geldiyse
      if (isNewTask && statusFromUrl) {
        setFormData(prev => ({ ...prev, status_id: statusFromUrl }));
      }
      // Eğer mevcut bir görevi düzenliyorsak
      else if (!isNewTask && taskId) {
        const taskData = await taskService.getTaskById(taskId);
        if (!taskData) {
          setError('Görev bulunamadı');
          return;
        }
        setTask(taskData);
        setFormData({
          title: taskData.title || '',
          description: taskData.description || '',
          status_id: taskData.status_id || '',
          priority_id: taskData.priority_id || 'medium',
          assignee_id: taskData.assignee_id || '',
          due_date: taskData.due_date || '',
          estimated_hours: taskData.estimated_hours || 0,
          project_id: projectId
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Veriler yüklenirken hata:', err);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    loadData();
  }, [projectId, taskId]);
  
  // Form alanı değişimi
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Hata mesajını temizle
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Select değişimi
  const handleSelectChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Hata mesajını temizle
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Tarih değişimi
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value;
    setFormData(prev => ({ ...prev, due_date: dateString }));
    
    // Hata mesajını temizle
    if (formErrors['due_date']) {
      setFormErrors(prev => ({ ...prev, due_date: '' }));
    }
  };
  
  // Form doğrulama
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title) {
      errors.title = 'Görev başlığı gereklidir';
    }
    
    if (!formData.status_id) {
      errors.status_id = 'Görev durumu seçilmelidir';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Görev kaydet
  const handleSaveTask = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Lütfen gerekli alanları doldurun',
        severity: 'error'
      });
      return;
    }
    
    try {
      setSaving(true);
      
      if (isNewTask) {
        // Yeni görev oluştur
        await taskService.createTask(formData as Task);
        setSnackbar({
          open: true,
          message: 'Görev başarıyla oluşturuldu',
          severity: 'success'
        });
      } else {
        // Mevcut görevi güncelle
        await taskService.updateTask(taskId!, formData);
        setSnackbar({
          open: true,
          message: 'Görev başarıyla güncellendi',
          severity: 'success'
        });
      }
      
      // Başarılı kayıttan sonra proje sayfasına yönlendir
      setTimeout(() => {
        navigate(`/projects/${projectId}`);
      }, 1500);
    } catch (error) {
      console.error('Görev kaydedilirken hata:', error);
      setSnackbar({
        open: true,
        message: 'Görev kaydedilirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Görevi sil
  const handleDeleteTask = async () => {
    if (!taskId || isNewTask) return;
    
    try {
      setSaving(true);
      await taskService.deleteTask(taskId);
      setSnackbar({
        open: true,
        message: 'Görev başarıyla silindi',
        severity: 'success'
      });
      
      // Başarılı silme işleminden sonra proje sayfasına yönlendir
      setTimeout(() => {
        navigate(`/projects/${projectId}`);
      }, 1500);
    } catch (error) {
      console.error('Görev silinirken hata:', error);
      setSnackbar({
        open: true,
        message: 'Görev silinirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Snackbar kapat
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Öncelik rengini belirle
  const getPriorityColor = (priority: string | null | undefined) => {
    if (!priority) return '#9e9e9e'; // Gri (varsayılan)
    
    switch (priority.toLowerCase()) {
      case 'high':
      case 'yüksek':
        return '#f44336'; // Kırmızı
      case 'medium':
      case 'orta':
        return '#ff9800'; // Turuncu
      case 'low':
      case 'düşük':
        return '#4caf50'; // Yeşil
      default:
        return '#9e9e9e'; // Gri
    }
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
          onClick={() => navigate(`/projects/${projectId}`)}
          sx={{ mt: 2 }}
        >
          Projeye Dön
        </Button>
      </Paper>
    );
  }
  
  return (
    <Box>
      {/* Üst Kısım */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/projects/${projectId}`)}
            sx={{ mr: 2 }}
          >
            Projeye Dön
          </Button>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600, 
              color: '#1d1d1f',
              fontSize: { xs: '1.5rem', md: '1.75rem' }
            }}
          >
            {isNewTask ? 'Yeni Görev' : 'Görevi Düzenle'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isNewTask && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteTask}
              disabled={saving}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Sil
            </Button>
          )}
          
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveTask}
            disabled={saving}
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
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </Box>
      </Box>
      
      {/* Form */}
      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          mb: 3
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Görev Başlığı"
              name="title"
              value={formData.title || ''}
              onChange={handleFormChange}
              required
              error={!!formErrors.title}
              helperText={formErrors.title}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Açıklama"
              name="description"
              value={formData.description || ''}
              onChange={handleFormChange}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!formErrors.status_id} sx={{ mb: 2 }}>
              <InputLabel>Durum</InputLabel>
              <Select
                value={formData.status_id || ''}
                onChange={(e) => handleSelectChange('status_id', e.target.value)}
                label="Durum"
              >
                {statuses.map((status) => (
                  <MenuItem key={status.id} value={status.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: status.color || '#9e9e9e',
                          mr: 1
                        }} 
                      />
                      {status.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {formErrors.status_id && <FormHelperText>{formErrors.status_id}</FormHelperText>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Öncelik</InputLabel>
              <Select
                value={formData.priority_id || 'medium'}
                onChange={(e) => handleSelectChange('priority_id', e.target.value)}
                label="Öncelik"
              >
                <MenuItem value="high">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlagIcon sx={{ color: getPriorityColor('high'), mr: 1 }} fontSize="small" />
                    Yüksek
                  </Box>
                </MenuItem>
                <MenuItem value="medium">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlagIcon sx={{ color: getPriorityColor('medium'), mr: 1 }} fontSize="small" />
                    Orta
                  </Box>
                </MenuItem>
                <MenuItem value="low">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlagIcon sx={{ color: getPriorityColor('low'), mr: 1 }} fontSize="small" />
                    Düşük
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Atanan Kişi</InputLabel>
              <Select
                value={formData.assignee_id || ''}
                onChange={(e) => handleSelectChange('assignee_id', e.target.value)}
                label="Atanan Kişi"
              >
                <MenuItem value="">
                  <em>Atanmamış</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          fontSize: '0.75rem',
                          mr: 1
                        }}
                      >
                        {user.name.substring(0, 2).toUpperCase()}
                      </Avatar>
                      {user.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Son Tarih"
              name="due_date"
              type="date"
              value={formData.due_date || ''}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
              error={!!formErrors.due_date}
              helperText={formErrors.due_date}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tahmini Süre (Saat)"
              name="estimated_hours"
              type="number"
              value={formData.estimated_hours || 0}
              onChange={handleFormChange}
              InputProps={{
                inputProps: { min: 0, step: 0.5 }
              }}
              sx={{ mb: 2 }}
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Proje Bilgisi */}
      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          backgroundColor: alpha('#007aff', 0.05)
        }}
      >
        <Typography variant="subtitle1" gutterBottom>Proje Bilgisi</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              bgcolor: '#007aff', 
              width: 32, 
              height: 32, 
              mr: 1,
              boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)'
            }}
          >
            {project.key?.substring(0, 1) || 'P'}
          </Avatar>
          <Typography variant="body1">
            {project.name} ({project.key})
          </Typography>
        </Box>
      </Paper>
      
      {/* Bildirim */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskEdit; 