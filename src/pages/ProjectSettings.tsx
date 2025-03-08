import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  TextField,
  CircularProgress,
  Divider,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  alpha,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon,
  Link as LinkIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Business as BusinessIcon,
  Dashboard as DashboardIcon,
  BugReport as BugIcon
} from '@mui/icons-material';
import { ProjectService } from '@/services/ProjectService';
import { Project, ProjectMember, ProjectRole } from '@/types/taskManagement';
import { useAuth } from '@/hooks/useAuth';

// Sekme paneli bileşeni
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-settings-tabpanel-${index}`}
      aria-labelledby={`project-settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Sekme özellikleri
const a11yProps = (index: number) => {
  return {
    id: `project-settings-tab-${index}`,
    'aria-controls': `project-settings-tabpanel-${index}`,
  };
};

// İkon seçenekleri
const iconOptions = [
  { value: 'school', label: 'Eğitim', icon: <SchoolIcon /> },
  { value: 'code', label: 'Yazılım', icon: <CodeIcon /> },
  { value: 'business', label: 'İş', icon: <BusinessIcon /> },
  { value: 'dashboard', label: 'Gösterge Paneli', icon: <DashboardIcon /> },
  { value: 'bug', label: 'Hata Takibi', icon: <BugIcon /> },
  { value: 'palette', label: 'Tasarım', icon: <PaletteIcon /> }
];

// Proje tipi seçenekleri
const projectTypeOptions = [
  { value: 'classic', label: 'Klasik' },
  { value: 'kanban', label: 'Kanban' },
  { value: 'scrum', label: 'Scrum' }
];

const ProjectSettings: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const projectService = new ProjectService();
  
  // State
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [roles, setRoles] = useState<ProjectRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
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
      setFormData({
        name: projectData.name,
        key: projectData.key,
        description: projectData.description,
        icon: projectData.icon,
        project_type: projectData.project_type,
        default_assignee_id: projectData.default_assignee_id
      });
      
      // Proje üyelerini getir
      const membersData = await projectService.getProjectMembers(projectId);
      setMembers(membersData);
      
      // Proje rollerini getir
      const rolesData = await projectService.getProjectRoles(projectId);
      setRoles(rolesData);
      
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
  
  // Sekme değişimi
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Form alanı değişimi
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Select değişimi
  const handleSelectChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Proje güncelle
  const handleUpdateProject = async () => {
    if (!project || !formData.name || !formData.key) {
      setSnackbar({
        open: true,
        message: 'Lütfen gerekli alanları doldurun',
        severity: 'error'
      });
      return;
    }
    
    try {
      setSaving(true);
      const updatedProject = await projectService.updateProject(project.id, formData);
      setProject(updatedProject);
      setSnackbar({
        open: true,
        message: 'Proje başarıyla güncellendi',
        severity: 'success'
      });
    } catch (error) {
      console.error('Proje güncellenirken hata:', error);
      setSnackbar({
        open: true,
        message: 'Proje güncellenirken bir hata oluştu',
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
            Proje Ayarları
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleUpdateProject}
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
          {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </Box>
      
      {/* Sekmeler */}
      <Paper 
        sx={{ 
          borderRadius: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
                minWidth: 120,
                '&.Mui-selected': {
                  color: '#007aff',
                  fontWeight: 600
                }
              }
            }}
          >
            <Tab 
              label="Genel" 
              icon={<EditIcon />} 
              iconPosition="start" 
              {...a11yProps(0)} 
            />
            <Tab 
              label="Üyeler" 
              icon={<PersonIcon />} 
              iconPosition="start" 
              {...a11yProps(1)} 
            />
            <Tab 
              label="Roller ve İzinler" 
              icon={<SecurityIcon />} 
              iconPosition="start" 
              {...a11yProps(2)} 
            />
            <Tab 
              label="Bildirimler" 
              icon={<NotificationsIcon />} 
              iconPosition="start" 
              {...a11yProps(3)} 
            />
            <Tab 
              label="Görünüm" 
              icon={<PaletteIcon />} 
              iconPosition="start" 
              {...a11yProps(4)} 
            />
            <Tab 
              label="Entegrasyonlar" 
              icon={<LinkIcon />} 
              iconPosition="start" 
              {...a11yProps(5)} 
            />
          </Tabs>
        </Box>
        
        {/* Genel Ayarlar */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Proje Adı"
                name="name"
                value={formData.name || ''}
                onChange={handleFormChange}
                required
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Proje Anahtarı"
                name="key"
                value={formData.key || ''}
                onChange={handleFormChange}
                required
                helperText="Proje için benzersiz bir kısaltma (örn. LMS, WEB)"
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Açıklama"
                name="description"
                value={formData.description || ''}
                onChange={handleFormChange}
                multiline
                rows={4}
                sx={{ mb: 3 }}
              />
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Proje İkonu</InputLabel>
                <Select
                  value={formData.icon || 'dashboard'}
                  onChange={(e) => handleSelectChange('icon', e.target.value)}
                  label="Proje İkonu"
                  renderValue={(selected) => {
                    const option = iconOptions.find(opt => opt.value === selected);
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {option?.icon}
                        <Typography sx={{ ml: 1 }}>{option?.label}</Typography>
                      </Box>
                    );
                  }}
                >
                  {iconOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {option.icon}
                        <Typography sx={{ ml: 1 }}>{option.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Proje Tipi</InputLabel>
                <Select
                  value={formData.project_type || 'kanban'}
                  onChange={(e) => handleSelectChange('project_type', e.target.value)}
                  label="Proje Tipi"
                >
                  {projectTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 3, 
                  backgroundColor: alpha('#007aff', 0.05),
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: alpha('#007aff', 0.2),
                  mb: 3
                }}
              >
                <Typography variant="h6" gutterBottom>Proje Bilgileri</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Oluşturulma Tarihi</Typography>
                  <Typography variant="body1">
                    {new Date(project.created_at).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Son Güncelleme</Typography>
                  <Typography variant="body1">
                    {new Date(project.updated_at).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Proje Sahibi</Typography>
                  <Typography variant="body1">
                    {project.owner_id}
                  </Typography>
                </Box>
              </Paper>
              
              <Paper 
                sx={{ 
                  p: 3, 
                  backgroundColor: alpha('#ff3b30', 0.05),
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: alpha('#ff3b30', 0.2)
                }}
              >
                <Typography variant="h6" gutterBottom>Tehlikeli Bölge</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Bu işlemler geri alınamaz ve veri kaybına neden olabilir.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Projeyi Arşivle
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 500
                    }}
                  >
                    Projeyi Sil
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Üyeler */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Proje Üyeleri</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: '#007aff',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Üye Ekle
            </Button>
          </Box>
          
          <Paper 
            sx={{ 
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <List>
              {members.length > 0 ? (
                members.map((member, index) => (
                  <React.Fragment key={member.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.user_id}
                        secondary={
                          roles.find(r => r.id === member.role_id)?.name || 'Rol Atanmamış'
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end">
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" sx={{ ml: 1 }}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < members.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="Henüz üye bulunmuyor"
                    secondary="Projeye üye eklemek için 'Üye Ekle' butonunu kullanın"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </TabPanel>
        
        {/* Roller ve İzinler */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Roller ve İzinler</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: '#007aff',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Rol Ekle
            </Button>
          </Box>
          
          <Paper 
            sx={{ 
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <List>
              {roles.length > 0 ? (
                roles.map((role, index) => (
                  <React.Fragment key={role.id}>
                    <ListItem>
                      <ListItemText
                        primary={role.name}
                        secondary={role.description || 'Açıklama yok'}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end">
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" sx={{ ml: 1 }}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < roles.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="Henüz rol bulunmuyor"
                    secondary="Projeye rol eklemek için 'Rol Ekle' butonunu kullanın"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </TabPanel>
        
        {/* Bildirimler */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Bildirim Ayarları</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Proje ile ilgili hangi bildirimler alacağınızı yapılandırın.
          </Typography>
          
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: '12px',
              mb: 3
            }}
          >
            <Typography variant="subtitle1" gutterBottom>E-posta Bildirimleri</Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Görev Atamaları"
                  secondary="Size bir görev atandığında e-posta alın"
                />
                <Switch defaultChecked />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Görev Yorumları"
                  secondary="Görevlerinize yorum yapıldığında e-posta alın"
                />
                <Switch defaultChecked />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Durum Değişiklikleri"
                  secondary="Görevlerin durumu değiştiğinde e-posta alın"
                />
                <Switch />
              </ListItem>
            </List>
          </Paper>
          
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: '12px'
            }}
          >
            <Typography variant="subtitle1" gutterBottom>Uygulama İçi Bildirimler</Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Görev Atamaları"
                  secondary="Size bir görev atandığında bildirim alın"
                />
                <Switch defaultChecked />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Görev Yorumları"
                  secondary="Görevlerinize yorum yapıldığında bildirim alın"
                />
                <Switch defaultChecked />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Durum Değişiklikleri"
                  secondary="Görevlerin durumu değiştiğinde bildirim alın"
                />
                <Switch defaultChecked />
              </ListItem>
            </List>
          </Paper>
        </TabPanel>
        
        {/* Görünüm */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>Görünüm Ayarları</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Projenin görünümünü özelleştirin.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Bu özellik yakında kullanıma sunulacaktır.
          </Alert>
        </TabPanel>
        
        {/* Entegrasyonlar */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>Entegrasyonlar</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Projenizi diğer servislerle entegre edin.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Bu özellik yakında kullanıma sunulacaktır.
          </Alert>
        </TabPanel>
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

export default ProjectSettings; 