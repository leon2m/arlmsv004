import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip, 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Tooltip,
  alpha,
  useTheme,
  Zoom
} from '@mui/material';
import { 
  MoreVert as MoreIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  Flag as FlagIcon,
  Label as LabelIcon,
  Person as PersonIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Bookmark as BookmarkIcon,
  Attachment as AttachmentIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format, isValid } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Task } from '@/types/taskManagement';

/**
 * Görev kartı bileşeni
 * Kanban panosunda görevleri gösterir
 */
interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete,
  isDragging = false
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  
  // Menü açma/kapama
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Düzenleme işlemi
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    }
    handleMenuClose();
  };
  
  // Silme işlemi
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(task.id);
    }
    handleMenuClose();
  };
  
  // Yıldız işlemi
  const handleToggleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsStarred(!isStarred);
  };
  
  // Görev güncelleme işlemi
  const handleTaskUpdate = (updatedTask: Partial<Task>) => {
    // Bu fonksiyon ileride TaskBoardContext'e eklenebilir
    console.log('Görev güncelleniyor:', updatedTask);
  };
  
  // Tarih formatı
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return '';
      
      return format(date, 'd MMM', { locale: tr });
    } catch (error) {
      console.error('Tarih formatlanırken hata:', error);
      return '';
    }
  };
  
  // Öncelik rengini belirle
  const getPriorityColor = (priorityId: string = 'medium') => {
    switch (priorityId) {
      case 'high':
      case 'urgent':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.info.main;
    }
  };
  
  // Öncelik adını belirle
  const getPriorityName = (priorityId: string = 'medium') => {
    switch (priorityId) {
      case 'high':
        return 'Yüksek';
      case 'urgent':
        return 'Acil';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
      default:
        return 'Normal';
    }
  };
  
  // Rastgele bir renk oluştur (demo amaçlı)
  const getRandomColor = () => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Görev için arka plan rengi
  const getCardBackground = () => {
    if (isDragging) {
      return alpha(theme.palette.primary.main, 0.05);
    }
    
    // Önceliğe göre hafif bir renk tonu
    return alpha(getPriorityColor(task.priority_id), 0.02);
  };
  
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      style={{ position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
    >
      <Paper
        elevation={isDragging ? 4 : 0}
        sx={{
          p: 1.5,
          borderRadius: 2,
          backgroundColor: getCardBackground(),
          border: '0px solid',
          borderColor: isDragging 
            ? alpha(theme.palette.primary.main, 0.3) 
            : alpha(getPriorityColor(task.priority_id), 0.15),
          boxShadow: isDragging 
            ? `0 8px 16px ${alpha(theme.palette.primary.main, 0.15)}` 
            : isHovered 
              ? `0 4px 12px ${alpha(getPriorityColor(task.priority_id), 0.2)}` 
              : 'none',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          position: 'relative',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing'
          }
        }}
      >
        {/* Öncelik göstergesi */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: `linear-gradient(to bottom, ${getPriorityColor(task.priority_id)} 0%, ${alpha(getPriorityColor(task.priority_id), 0.7)} 100%)`,
          }}
        />
        
        <Box sx={{ pl: 0.5 }}>
          {/* Görev Başlığı */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                fontSize: '0.9rem',
                lineHeight: 1.3,
                mb: 0.5,
                color: theme.palette.text.primary,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {isStarred && (
                <StarIcon 
                  fontSize="small" 
                  sx={{ 
                    color: theme.palette.warning.main, 
                    mr: 0.5, 
                    fontSize: '0.9rem' 
                  }} 
                />
              )}
              {task.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title={isStarred ? "Yıldızı Kaldır" : "Yıldızla"}>
                <IconButton
                  size="small"
                  onClick={handleToggleStar}
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    mr: 0.5,
                    color: isStarred ? theme.palette.warning.main : theme.palette.text.secondary,
                    opacity: isStarred ? 1 : (isHovered ? 0.7 : 0),
                    transition: 'opacity 0.2s ease, color 0.2s ease',
                  }}
                >
                  {isStarred ? (
                    <StarIcon fontSize="small" />
                  ) : (
                    <StarBorderIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{ 
                  width: 24, 
                  height: 24, 
                  opacity: isHovered ? 0.7 : 0,
                  transition: 'opacity 0.2s ease',
                  color: theme.palette.text.secondary
                }}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
              PaperProps={{
                elevation: 3,
                sx: {
                  minWidth: 180,
                  borderRadius: 2,
                  overflow: 'hidden',
                  mt: 1,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1.5,
                    borderRadius: 1,
                    mx: 0.5,
                    my: 0.25,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  },
                },
              }}
            >
              <MenuItem onClick={handleEdit}>
                <ListItemIcon>
                  <EditIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Düzenle" />
              </MenuItem>
              
              <MenuItem onClick={handleDelete}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary="Sil" />
              </MenuItem>
            </Menu>
          </Box>
          
          {/* Görev Açıklaması (varsa) */}
          {task.description && (
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '0.8rem',
                color: theme.palette.text.secondary,
                mb: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {task.description}
            </Typography>
          )}
          
          {/* Görev Etiketleri (Demo) */}
          {Math.random() > 0.5 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              <Chip
                icon={<BookmarkIcon style={{ fontSize: 14 }} />}
                label="Önemli"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  backgroundColor: alpha(getRandomColor(), 0.1),
                  color: getRandomColor(),
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  }
                }}
              />
            </Box>
          )}
          
          {/* Alt Bilgiler */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {/* Öncelik */}
              <Tooltip title={`Öncelik: ${getPriorityName(task.priority_id)}`}>
                <Chip
                  icon={<FlagIcon style={{ fontSize: 14 }} />}
                  label={getPriorityName(task.priority_id)}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    backgroundColor: alpha(getPriorityColor(task.priority_id), 0.1),
                    color: getPriorityColor(task.priority_id),
                    '& .MuiChip-icon': {
                      color: getPriorityColor(task.priority_id)
                    }
                  }}
                />
              </Tooltip>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {/* Ekler (Demo) */}
              {Math.random() > 0.7 && (
                <Tooltip title="2 Ek">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachmentIcon 
                      fontSize="small" 
                      sx={{ 
                        fontSize: 14, 
                        color: theme.palette.text.secondary 
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.7rem',
                        color: theme.palette.text.secondary,
                        ml: 0.25
                      }}
                    >
                      2
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              
              {/* Yorumlar (Demo) */}
              {Math.random() > 0.6 && (
                <Tooltip title="3 Yorum">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CommentIcon 
                      fontSize="small" 
                      sx={{ 
                        fontSize: 14, 
                        color: theme.palette.text.secondary 
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.7rem',
                        color: theme.palette.text.secondary,
                        ml: 0.25
                      }}
                    >
                      3
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              
              {/* Bitiş Tarihi (varsa) */}
              {task.due_date && (
                <Tooltip title="Bitiş Tarihi">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon 
                      fontSize="small" 
                      sx={{ 
                        fontSize: 14, 
                        color: theme.palette.text.secondary 
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.7rem',
                        color: theme.palette.text.secondary,
                        ml: 0.25
                      }}
                    >
                      {formatDate(task.due_date)}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              
              {/* Atanan Kişi (varsa) */}
              {task.assignee_id && (
                <Tooltip title="Atanan Kişi">
                  <Avatar 
                    sx={{ 
                      width: 22, 
                      height: 22, 
                      fontSize: '0.7rem',
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      color: theme.palette.primary.main
                    }}
                  >
                    <PersonIcon fontSize="small" sx={{ fontSize: 14 }} />
                  </Avatar>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
        
        {/* Görev Tamamlanma İndikatörü (Demo) */}
        {task.status_id && task.status_id.includes('done') && (
          <Zoom in={true}>
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: theme.palette.success.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 14,
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 2
              }}
            >
              ✓
            </Box>
          </Zoom>
        )}
      </Paper>
    </motion.div>
  );
};

export default TaskCard; 
