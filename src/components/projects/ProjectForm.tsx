import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Grid,
  Chip,
  Avatar,
  FormHelperText,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Business as BusinessIcon,
  Dashboard as DashboardIcon,
  BugReport as BugIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Project } from '@/types/taskManagement';
import { ProjectService } from '@/services/ProjectService';

// Proje tipleri
const projectTypes = [
  { value: 'classic', label: 'Klasik', description: 'Geleneksel proje yönetimi' },
  { value: 'scrum', label: 'Scrum', description: 'Çevik proje yönetimi' },
  { value: 'kanban', label: 'Kanban', description: 'Görsel iş akışı yönetimi' }
];

// Proje ikonları
const projectIcons = [
  { value: 'school', label: 'Eğitim', icon: <SchoolIcon /> },
  { value: 'code', label: 'Yazılım', icon: <CodeIcon /> },
  { value: 'business', label: 'İş', icon: <BusinessIcon /> },
  { value: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { value: 'bug', label: 'Hata Takibi', icon: <BugIcon /> },
  { value: 'palette', label: 'Tasarım', icon: <PaletteIcon /> }
];

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (project: Partial<Project>) => Promise<void>;
  project?: Project;
  title?: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  onClose,
  onSubmit,
  project,
  title = 'Yeni Proje'
}) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    key: '',
    description: '',
    project_type: 'kanban',
    icon: 'dashboard'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyTouched, setKeyTouched] = useState(false);

  // Eğer düzenleme modundaysa, mevcut proje verilerini form'a doldur
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        key: project.key || '',
        description: project.description || '',
        project_type: project.project_type || 'kanban',
        icon: project.icon || 'dashboard'
      });
    }
  }, [project]);

  // Form alanlarını güncelle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (!name) return;

    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Proje adı değiştiğinde ve key henüz değiştirilmediyse, otomatik key oluştur
    if (name === 'name' && !keyTouched && typeof value === 'string') {
      const generatedKey = value
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 5)
        .toUpperCase();
      
      setFormData(prev => ({ ...prev, key: generatedKey }));
    }
  };

  // Key alanı manuel olarak değiştirildiğinde
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyTouched(true);
    handleChange(e);
  };

  // İkon seçimi
  const handleIconSelect = (icon: string) => {
    setFormData(prev => ({ ...prev, icon }));
  };

  // Form doğrulama
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Proje adı gereklidir';
    }
    
    if (!formData.key?.trim()) {
      newErrors.key = 'Proje anahtarı gereklidir';
    } else if (!/^[A-Z0-9]{2,10}$/.test(formData.key)) {
      newErrors.key = 'Proje anahtarı 2-10 karakter uzunluğunda ve sadece büyük harf ve rakamlardan oluşmalıdır';
    }
    
    if (!formData.project_type) {
      newErrors.project_type = 'Proje tipi seçilmelidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Proje kaydedilirken hata:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: alpha('#000', 0.1),
        pb: 2
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1d1d1f' }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                name="name"
                label="Proje Adı"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name}
                sx={{ mb: 3 }}
                InputProps={{
                  sx: {
                    borderRadius: '10px'
                  }
                }}
              />
              
              <TextField
                name="key"
                label="Proje Anahtarı"
                value={formData.key}
                onChange={handleKeyChange}
                fullWidth
                required
                error={!!errors.key}
                helperText={errors.key || 'Örn: LMS, PROJE, HR (2-10 karakter, sadece büyük harf ve rakam)'}
                sx={{ mb: 3 }}
                InputProps={{
                  sx: {
                    borderRadius: '10px',
                    textTransform: 'uppercase'
                  }
                }}
              />
              
              <TextField
                name="description"
                label="Proje Açıklaması"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                sx={{ mb: 3 }}
                InputProps={{
                  sx: {
                    borderRadius: '10px'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="project-type-label">Proje Tipi</InputLabel>
                <Select
                  labelId="project-type-label"
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleChange}
                  error={!!errors.project_type}
                  sx={{ borderRadius: '10px' }}
                >
                  {projectTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1">{type.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.project_type && (
                  <FormHelperText error>{errors.project_type}</FormHelperText>
                )}
              </FormControl>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Proje İkonu
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {projectIcons.map(iconItem => (
                    <Chip
                      key={iconItem.value}
                      icon={iconItem.icon}
                      label={iconItem.label}
                      onClick={() => handleIconSelect(iconItem.value)}
                      sx={{
                        borderRadius: '8px',
                        backgroundColor: formData.icon === iconItem.value 
                          ? alpha('#007aff', 0.1) 
                          : alpha('#000', 0.05),
                        color: formData.icon === iconItem.value 
                          ? '#007aff' 
                          : 'text.primary',
                        border: '1px solid',
                        borderColor: formData.icon === iconItem.value 
                          ? alpha('#007aff', 0.3) 
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: formData.icon === iconItem.value 
                            ? alpha('#007aff', 0.15) 
                            : alpha('#000', 0.1)
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
              
              <Box sx={{ mt: 3, p: 2, backgroundColor: alpha('#f5f5f7', 0.5), borderRadius: '12px' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Proje Önizleme
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: '#007aff', 
                      width: 40, 
                      height: 40, 
                      mr: 2,
                      boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)'
                    }}
                  >
                    {formData.icon && React.cloneElement(
                      projectIcons.find(i => i.value === formData.icon)?.icon || <DashboardIcon />,
                      { fontSize: 'small' }
                    )}
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.95rem'
                      }}
                    >
                      {formData.name || 'Proje Adı'}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'inline-block',
                        backgroundColor: alpha('#007aff', 0.1),
                        color: '#007aff',
                        px: 1,
                        py: 0.2,
                        borderRadius: '4px',
                        fontWeight: 500
                      }}
                    >
                      {formData.key || 'KEY'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ 
          px: 3, 
          py: 2,
          borderTop: '1px solid',
          borderColor: alpha('#000', 0.1)
        }}>
          <Button 
            onClick={onClose}
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
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
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
              px: 3
            }}
          >
            {isSubmitting ? 'Kaydediliyor...' : project ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProjectForm; 