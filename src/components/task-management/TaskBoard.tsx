import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Button, 
  Typography, 
  alpha, 
  IconButton, 
  Menu, 
  MenuItem, 
  Tooltip, 
  Divider, 
  useTheme,
  Chip,
  Zoom,
  Fade
} from '@mui/material';
import { 
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  SwapHoriz as SwapHorizIcon,
  ViewKanban as KanbanIcon,
  Bolt as BoltIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/types/taskManagement';
import StatusColumn from './StatusColumn';
import { TaskBoardProvider, useTaskBoard } from './TaskBoardContext';
import EmptyBoard from './EmptyBoard';
import LoadingIndicator from './LoadingIndicator';
import ErrorMessage from './ErrorMessage';
import { taskService } from '@/services/taskService';
import confetti from 'canvas-confetti';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { StrictModeDroppable } from './StrictModeDroppable';

interface TaskBoardProps {
  project: Project;
}

/**
 * Görev panosu içerik bileşeni
 * TaskBoardProvider içinde kullanılır
 */
const TaskBoardContent: React.FC = () => {
  const { 
    statuses, 
    tasks, 
    loading, 
    error, 
    handleTaskMove, 
    handleOpenNewStatusDialog,
    project,
    setProject,
    handleBackToProjects,
    handleReorderStatus
  } = useTaskBoard();
  const theme = useTheme();
  const boardRef = useRef<HTMLDivElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMenuAnchorEl, setProjectMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Kullanıcının erişebileceği projeleri yükle
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setProjectsLoading(true);
        const projectList = await taskService.getProjects();
        setProjects(projectList);
      } catch (err) {
        console.error('Projeler yüklenirken hata oluştu:', err);
      } finally {
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Konfeti efekti
  const triggerConfetti = () => {
    if (confettiCanvasRef.current) {
      const myConfetti = confetti.create(confettiCanvasRef.current, {
        resize: true,
        useWorker: true
      });
      
      myConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722']
      });
      
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  // Sürükle-bırak işlemi tamamlandığında
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    handleReorderStatus(sourceIndex, destinationIndex);
  };

  // Proje menüsünü aç
  const handleProjectMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProjectMenuAnchorEl(event.currentTarget);
  };

  // Proje menüsünü kapat
  const handleProjectMenuClose = () => {
    setProjectMenuAnchorEl(null);
  };

  // Proje değiştir
  const handleProjectChange = (newProject: Project) => {
    setProject(newProject);
    handleProjectMenuClose();
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Durumlar yüklendiyse ancak görevler yüklenmediyse
  if (statuses.length === 0) {
    return <EmptyBoard onCreateStatus={handleOpenNewStatusDialog} />;
  }

  // Proje null ise boş bir içerik göster
  if (!project) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Proje bulunamadı</Typography>
        <Button 
          variant="outlined" 
          onClick={handleBackToProjects}
          sx={{ mt: 2 }}
        >
          Projeler Listesine Dön
        </Button>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}
    >
      {/* Konfeti Canvas */}
      <canvas 
        ref={confettiCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 100
        }}
      />
      
      {/* Kutlama Animasyonu */}
      <Zoom in={showCelebration} timeout={500}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 101,
            pointerEvents: 'none',
            textAlign: 'center'
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CelebrationIcon 
              sx={{ 
                fontSize: 80, 
                color: theme.palette.primary.main,
                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.2))'
              }} 
            />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.primary.main,
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                mt: 1
              }}
            >
              Harika İş!
            </Typography>
          </motion.div>
        </Box>
      </Zoom>

      {/* Proje Başlığı ve Kontroller */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.6)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Projeler Listesine Dön">
            <IconButton 
              onClick={handleBackToProjects}
              sx={{ 
                mr: 1.5,
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                mb: 0.5,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {project.name}
              <Tooltip title="Proje Değiştir">
                <IconButton 
                  size="small" 
                  onClick={handleProjectMenuOpen}
                  sx={{ 
                    ml: 1,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'rotate(15deg)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <SwapHorizIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                icon={<KanbanIcon fontSize="small" />}
                label={`${statuses.length} Durum`}
                size="small"
                sx={{ 
                  mr: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  '& .MuiChip-icon': {
                    color: theme.palette.primary.main
                  },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    transform: 'translateY(-1px)'
                  }
                }}
              />
              <Chip 
                icon={<BoltIcon fontSize="small" />}
                label={`${tasks.length} Görev`}
                size="small"
                sx={{ 
                  backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                  color: theme.palette.secondary.main,
                  fontWeight: 500,
                  '& .MuiChip-icon': {
                    color: theme.palette.secondary.main
                  },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.15),
                    transform: 'translateY(-1px)'
                  }
                }}
              />
            </Box>
          </Box>
          
          <Menu
            anchorEl={projectMenuAnchorEl}
            open={Boolean(projectMenuAnchorEl)}
            onClose={handleProjectMenuClose}
            TransitionComponent={Fade}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                overflow: 'hidden',
                mt: 1.5,
                minWidth: 200,
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(10px)'
              }
            }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ 
                px: 2, 
                py: 1, 
                fontWeight: 600,
                color: theme.palette.text.secondary
              }}
            >
              Projeler
            </Typography>
            <Divider />
            {projectsLoading ? (
              <MenuItem disabled>
                <Typography variant="body2">Yükleniyor...</Typography>
              </MenuItem>
            ) : (
              projects.map((p) => (
                <MenuItem 
                  key={p.id} 
                  onClick={() => handleProjectChange(p)}
                  selected={p.id === project.id}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12)
                      }
                    },
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Typography variant="body2">{p.name}</Typography>
                </MenuItem>
              ))
            )}
          </Menu>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenNewStatusDialog}
          sx={{
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            py: 1,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
            '&:hover': {
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Yeni Durum Ekle
        </Button>
      </Box>

      {/* Kanban Panosu */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <StrictModeDroppable droppableId="board" direction="horizontal" type="COLUMN">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                display: 'flex',
                overflowX: 'auto',
                flex: 1,
                pb: 2,
                pt: 1,
                px: 1,
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha(theme.palette.common.black, 0.08),
                  borderRadius: '8px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: alpha(theme.palette.common.black, 0.15),
                },
              }}
            >
              <AnimatePresence>
                {statuses.map((status, index) => (
                  <StatusColumn 
                    key={status.id} 
                    status={status} 
                    index={index} 
                  />
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </Box>
          )}
        </StrictModeDroppable>
      </DragDropContext>
    </motion.div>
  );
};

/**
 * Görev panosu ana bileşeni
 */
const TaskBoard: React.FC<TaskBoardProps> = ({ project }) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        height: '100%', 
        p: 2,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.7)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1)
      }}
    >
      <TaskBoardProvider project={project}>
        <TaskBoardContent />
      </TaskBoardProvider>
    </Box>
  );
};

export { TaskBoard };
export default TaskBoard; 