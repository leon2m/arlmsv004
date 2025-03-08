import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  Avatar, 
  Button, 
  IconButton, 
  Divider, 
  TextField, 
  CircularProgress,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  Flag as FlagIcon,
  Comment as CommentIcon,
  AttachFile as AttachmentIcon,
  Label as LabelIcon,
  Link as LinkIcon,
  MoreVert as MoreIcon,
  Send as SendIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { TaskService } from '@/services/taskService';
import { Task, TaskComment, TaskAttachment } from '@/types/taskManagement';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';

const taskService = new TaskService();

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TaskDetail: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { projectId, taskId } = router.query;
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (taskId && typeof taskId === 'string') {
      loadTaskData(taskId);
    }
  }, [taskId]);

  const loadTaskData = async (id: string) => {
    try {
      setLoading(true);
      const taskData = await taskService.getTask(id);
      setTask(taskData);
      
      // Yorumları ve ekleri yükle
      const [taskComments, taskAttachments] = await Promise.all([
        taskService.getTaskComments(id),
        taskService.getTaskAttachments(id)
      ]);
      
      setComments(taskComments);
      setAttachments(taskAttachments);
      setError(null);
    } catch (err) {
      console.error('Görev detayları yüklenirken hata oluştu:', err);
      setError('Görev detayları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !taskId) return;
    
    try {
      setSubmittingComment(true);
      const comment = await taskService.addTaskComment(taskId as string, newComment);
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      console.error('Yorum eklenirken hata oluştu:', err);
      alert('Yorum eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !taskId) return;
    
    try {
      const file = files[0];
      const attachment = await taskService.uploadTaskAttachment(taskId as string, file);
      setAttachments(prev => [...prev, attachment]);
    } catch (err) {
      console.error('Dosya yüklenirken hata oluştu:', err);
      alert('Dosya yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditTask = () => {
    handleMenuClose();
    if (projectId && taskId) {
      router.push(`/projects/${projectId}/tasks/${taskId}/edit`);
    }
  };

  const handleDeleteTask = () => {
    handleMenuClose();
    setConfirmDeleteOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskId) return;
    
    try {
      await taskService.deleteTask(taskId as string);
      setConfirmDeleteOpen(false);
      router.push(`/projects/${projectId}`);
    } catch (err) {
      console.error('Görev silinirken hata oluştu:', err);
      alert('Görev silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !task) {
    return (
      <Layout>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ mb: 3 }}
          >
            Geri Dön
          </Button>
          
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="error" gutterBottom>
              {error || 'Görev bulunamadı'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push(`/projects/${projectId}`)}
              sx={{ mt: 2 }}
            >
              Proje Sayfasına Dön
            </Button>
          </Paper>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        {/* Üst Kısım: Navigasyon ve Eylemler */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.back()}
              sx={{ mb: 1 }}
            >
              Geri Dön
            </Button>
            
            <Breadcrumbs aria-label="breadcrumb">
              <Link href="/projects" color="inherit" underline="hover">
                Projeler
              </Link>
              <Link 
                href={`/projects/${task.project_id}`} 
                color="inherit" 
                underline="hover"
              >
                {task.project?.name || 'Proje'}
              </Link>
              <Typography color="text.primary">
                {task.title}
              </Typography>
            </Breadcrumbs>
          </Box>
          
          <Box>
            <IconButton onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEditTask}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Düzenle</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleDeleteTask}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Sil</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {/* Görev Başlığı ve Kimliği */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" mb={1}>
            <Chip 
              label={`${task.project?.key || 'PROJE'}-${task.id.substring(0, 5)}`} 
              size="small" 
              color="primary" 
              sx={{ mr: 2 }} 
            />
            {task.type && (
              <Chip 
                label={task.type.name} 
                size="small" 
                sx={{ 
                  backgroundColor: task.type.color,
                  color: '#fff',
                  mr: 2
                }} 
              />
            )}
            {task.status && (
              <Chip 
                label={task.status.name} 
                size="small" 
                sx={{ 
                  backgroundColor: task.status.color,
                  color: '#fff'
                }} 
              />
            )}
          </Box>
          
          <Typography variant="h4" component="h1" gutterBottom>
            {task.title}
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {/* Sol Sütun: Görev Detayları */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="task tabs">
                  <Tab label="Detaylar" id="task-tab-0" aria-controls="task-tabpanel-0" />
                  <Tab label="Yorumlar" id="task-tab-1" aria-controls="task-tabpanel-1" />
                  <Tab label="Ekler" id="task-tab-2" aria-controls="task-tabpanel-2" />
                  <Tab label="Geçmiş" id="task-tab-3" aria-controls="task-tabpanel-3" />
                </Tabs>
              </Box>
              
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" gutterBottom>
                  Açıklama
                </Typography>
                <Typography variant="body1" paragraph>
                  {task.description || 'Bu görev için açıklama bulunmuyor.'}
                </Typography>
                
                {task.parent_task && (
                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom>
                      Üst Görev
                    </Typography>
                    <Link 
                      href={`/projects/${task.project_id}/tasks/${task.parent_task.id}`}
                      underline="hover"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <LinkIcon sx={{ mr: 1, fontSize: 16 }} />
                      {task.parent_task.title}
                    </Link>
                  </Box>
                )}
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Box>
                  {comments.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                      Henüz yorum yapılmamış. İlk yorumu siz yapın!
                    </Typography>
                  ) : (
                    comments.map((comment) => (
                      <Box key={comment.id} sx={{ mb: 3, pb: 3, borderBottom: '1px solid #eee' }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Avatar
                            src={comment.user?.user_metadata?.avatar_url}
                            alt={comment.user?.user_metadata?.full_name || comment.user?.email}
                            sx={{ width: 32, height: 32, mr: 1 }}
                          >
                            {(comment.user?.user_metadata?.full_name || comment.user?.email)?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {comment.user?.user_metadata?.full_name || comment.user?.email}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {formatDateTime(comment.created_at)}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body1">
                          {comment.content}
                        </Typography>
                      </Box>
                    ))
                  )}
                  
                  <Box mt={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Yorum Ekle
                    </Typography>
                    <Box display="flex">
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Yorumunuzu yazın..."
                        value={newComment}
                        onChange={handleCommentChange}
                        variant="outlined"
                        sx={{ mr: 2 }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        endIcon={<SendIcon />}
                        onClick={handleSubmitComment}
                        disabled={submittingComment || !newComment.trim()}
                      >
                        {submittingComment ? <CircularProgress size={24} /> : 'Gönder'}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">
                      Ekler
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<AttachmentIcon />}
                    >
                      Dosya Ekle
                      <input
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                      />
                    </Button>
                  </Box>
                  
                  {attachments.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                      Henüz dosya eklenmemiş.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {attachments.map((attachment) => (
                        <Grid item xs={12} key={attachment.id}>
                          <Paper
                            sx={{
                              p: 2,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <Box display="flex" alignItems="center">
                              <AttachmentIcon sx={{ mr: 2, color: 'text.secondary' }} />
                              <Box>
                                <Typography variant="subtitle2">
                                  {attachment.file_name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {(attachment.file_size / 1024).toFixed(2)} KB • 
                                  {formatDateTime(attachment.created_at)} • 
                                  {attachment.user?.user_metadata?.full_name || attachment.user?.email}
                                </Typography>
                              </Box>
                            </Box>
                            <Button
                              variant="text"
                              color="primary"
                              // Burada dosya indirme işlemi yapılabilir
                            >
                              İndir
                            </Button>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </TabPanel>
              
              <TabPanel value={tabValue} index={3}>
                <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                  Görev geçmişi burada görüntülenecek.
                </Typography>
              </TabPanel>
            </Paper>
          </Grid>
          
          {/* Sağ Sütun: Görev Bilgileri */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Görev Bilgileri
              </Typography>
              
              <Box sx={{ '& > div': { py: 1.5, borderBottom: '1px solid #eee' } }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Durum
                  </Typography>
                  {task.status && (
                    <Chip 
                      label={task.status.name} 
                      size="small" 
                      sx={{ 
                        backgroundColor: task.status.color,
                        color: '#fff',
                        mt: 0.5
                      }} 
                    />
                  )}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Öncelik
                  </Typography>
                  {task.priority ? (
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <FlagIcon sx={{ color: task.priority.color, mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">
                        {task.priority.name}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2">
                      Belirtilmemiş
                    </Typography>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Atanan Kişi
                  </Typography>
                  {task.assignee ? (
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <Avatar
                        src={task.assignee.user_metadata?.avatar_url}
                        alt={task.assignee.user_metadata?.full_name || task.assignee.email}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      >
                        {(task.assignee.user_metadata?.full_name || task.assignee.email).charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">
                        {task.assignee.user_metadata?.full_name || task.assignee.email}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2">
                      Atanmamış
                    </Typography>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Raporlayan
                  </Typography>
                  {task.reporter ? (
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <Avatar
                        src={task.reporter.user_metadata?.avatar_url}
                        alt={task.reporter.user_metadata?.full_name || task.reporter.email}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      >
                        {(task.reporter.user_metadata?.full_name || task.reporter.email).charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">
                        {task.reporter.user_metadata?.full_name || task.reporter.email}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2">
                      Belirtilmemiş
                    </Typography>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Son Tarih
                  </Typography>
                  {task.due_date ? (
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <TimeIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">
                        {formatDate(task.due_date)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2">
                      Belirtilmemiş
                    </Typography>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tahmini Süre
                  </Typography>
                  <Typography variant="body2">
                    {task.estimated_hours ? `${task.estimated_hours} saat` : 'Belirtilmemiş'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Harcanan Süre
                  </Typography>
                  <Typography variant="body2">
                    {task.logged_hours ? `${task.logged_hours} saat` : '0 saat'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Oluşturulma Tarihi
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(task.created_at)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Son Güncelleme
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(task.updated_at)}
                  </Typography>
                </Box>
              </Box>
              
              <Box mt={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={handleEditTask}
                >
                  Görevi Düzenle
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Silme Onay Dialog */}
        <Dialog
          open={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
        >
          <DialogTitle>
            Görevi Sil
          </DialogTitle>
          <DialogContent>
            <Typography>
              "{task.title}" görevini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteOpen(false)} color="inherit">
              İptal
            </Button>
            <Button onClick={confirmDeleteTask} color="error" variant="contained">
              Sil
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default TaskDetail; 