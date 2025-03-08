import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  IconButton, 
  Badge,
  Tooltip,
  alpha,
  Divider,
  useTheme,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  MoreVert as MoreIcon,
  DragIndicator as DragIcon,
  FormatListBulleted as ListIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import { useTaskBoard } from './TaskBoardContext';
import StatusMenu from './StatusMenu';
import { TaskStatus } from '@/types/taskManagement';
import { Draggable } from 'react-beautiful-dnd';

interface StatusColumnProps {
  status: TaskStatus;
  index: number;
}

/**
 * Durum sütunu bileşeni
 * Kanban panosunda her bir durumu ve ilgili görevleri gösterir
 */
const StatusColumn: React.FC<StatusColumnProps> = ({ status, index }) => {
  const { 
    tasks, 
    handleStatusMenuOpen,
    handleTaskClick
  } = useTaskBoard();
  const theme = useTheme();
  
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Bu duruma ait görevleri filtrele
  const filteredTasks = tasks.filter(task => task.status_id === status.id);
  
  // Yeni görev ekleme işlemi
  const handleAddTask = () => {
    console.log('Yeni görev ekle:', status.id);
    // İleride TaskBoardContext'e handleOpenNewTaskDialog eklendiğinde kullanılabilir
  };

  // Durum genişletme/daraltma
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Durum kategorisine göre renk belirle
  const getCategoryColor = () => {
    switch (status.status_category) {
      case 'to-do':
        return theme.palette.info.main;
      case 'in-progress':
        return theme.palette.warning.main;
      case 'done':
        return theme.palette.success.main;
      default:
        return status.color || theme.palette.primary.main;
    }
  };
  
  // Durum kategorisine göre etiket adı belirle
  const getCategoryName = () => {
    switch (status.status_category) {
      case 'to-do':
        return 'Yapılacak';
      case 'in-progress':
        return 'Devam Ediyor';
      case 'done':
        return 'Tamamlandı';
      default:
        return 'Durum';
    }
  };

  return (
    <Draggable draggableId={status.id} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{ 
            minWidth: 280,
            width: 280,
            mx: 1,
            opacity: snapshot.isDragging ? 0.8 : 1,
            transition: 'opacity 0.2s ease'
          }}
        >
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha(getCategoryColor(), 0.1),
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: alpha(getCategoryColor(), 0.2),
                boxShadow: `0 4px 12px ${alpha(getCategoryColor(), 0.1)}`
              }
            }}
          >
            {/* Başlık Alanı */}
            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
                backgroundColor: alpha(getCategoryColor(), 0.02)
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box {...provided.dragHandleProps}>
                  <IconButton 
                    size="small"
                    sx={{ 
                      mr: 1,
                      opacity: isHovered ? 0.5 : 0,
                      transition: 'opacity 0.2s ease',
                      cursor: 'grab',
                      '&:hover': {
                        opacity: 0.8,
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    <DragIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: status.color || getCategoryColor(),
                        mr: 1.5,
                        boxShadow: `0 0 0 3px ${alpha(status.color || getCategoryColor(), 0.15)}`
                      }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {status.name}
                      <Badge
                        badgeContent={filteredTasks.length}
                        color="primary"
                        sx={{ 
                          ml: 1,
                          '& .MuiBadge-badge': {
                            backgroundColor: status.color || getCategoryColor(),
                            color: theme.palette.getContrastText(status.color || getCategoryColor())
                          }
                        }}
                        max={99}
                      />
                    </Typography>
                  </Box>
                  <Chip
                    label={getCategoryName()}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      mt: 0.5,
                      backgroundColor: alpha(status.color || getCategoryColor(), 0.1),
                      color: status.color || getCategoryColor(),
                      fontWeight: 500
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  size="small"
                  onClick={toggleExpand}
                  sx={{ 
                    mr: 0.5,
                    opacity: isHovered ? 0.5 : 0,
                    transition: 'opacity 0.2s ease',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                >
                  <ListIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => handleStatusMenuOpen(e, status.id)}
                  sx={{ 
                    opacity: isHovered ? 0.5 : 0,
                    transition: 'opacity 0.2s ease',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                >
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Görevler Alanı */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      overflowY: 'auto',
                      px: 0.5,
                      py: 1,
                      borderRadius: 1,
                      transition: 'background-color 0.2s ease',
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha(theme.palette.common.black, 0.08),
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: alpha(theme.palette.common.black, 0.15),
                      },
                    }}
                  >
                    <AnimatePresence>
                      {filteredTasks.map((task, taskIndex) => (
                        <motion.div 
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2, delay: taskIndex * 0.03 }}
                          style={{ marginBottom: 8 }}
                          onClick={() => handleTaskClick(task.id)}
                          whileHover={{ y: -2 }}
                        >
                          <TaskCard 
                            task={task} 
                            isDragging={false}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Yeni Görev Ekleme Butonu */}
                    <Button
                      fullWidth
                      startIcon={<AddIcon />}
                      onClick={handleAddTask}
                      sx={{
                        mt: 1,
                        py: 1,
                        color: alpha(theme.palette.text.primary, 0.7),
                        backgroundColor: alpha(theme.palette.background.default, 0.4),
                        borderRadius: 1.5,
                        border: '1px dashed',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.background.default, 0.6),
                          borderColor: alpha(theme.palette.divider, 0.2)
                        }
                      }}
                    >
                      Yeni Görev Ekle
                    </Button>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </Box>
      )}
    </Draggable>
  );
};

export default StatusColumn; 