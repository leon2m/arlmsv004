import React from 'react';
import {
  Paper,
  Typography,
  Button,
  alpha,
  Box
} from '@mui/material';
import { Add as AddIcon, ViewKanban as KanbanIcon } from '@mui/icons-material';
import { useTaskBoard } from './TaskBoardContext';
import { motion } from 'framer-motion';

interface EmptyBoardProps {
  onCreateStatus?: () => void;
}

/**
 * Boş görev panosu bileşeni
 * Kullanıcıya yeni durum ekleme seçeneği sunar
 */
const EmptyBoard: React.FC<EmptyBoardProps> = ({ onCreateStatus }) => {
  const { handleOpenNewStatusDialog } = useTaskBoard();
  
  // Eğer onCreateStatus prop'u verilmişse onu kullan, yoksa context'ten al
  const handleAddStatus = onCreateStatus || handleOpenNewStatusDialog;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Box sx={{ p: 3 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, md: 6 }, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: theme => alpha(theme.palette.background.paper, 0.7),
            border: '1px dashed',
            borderColor: 'divider',
            maxWidth: 700,
            mx: 'auto',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: theme => `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`,
              zIndex: 0
            }}
          />
          
          <Box position="relative" zIndex={1}>
            <KanbanIcon 
              sx={{ 
                fontSize: 60, 
                color: theme => alpha(theme.palette.primary.main, 0.2),
                mb: 3
              }} 
            />
            
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                letterSpacing: '-0.01em'
              }}
            >
              Görev panonuz boş
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary" 
              paragraph
              sx={{
                mb: 4,
                maxWidth: '500px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Görev panosu oluşturmak için bir durum ekleyin. Durumlar, görevlerinizi organize etmenize 
              ve iş akışınızı yönetmenize yardımcı olur.
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddStatus}
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1,
                fontSize: '0.95rem',
                boxShadow: theme => `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                '&:hover': {
                  boxShadow: theme => `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`
                },
                transition: 'all 0.2s ease'
              }}
            >
              Durum Ekle
            </Button>
          </Box>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default EmptyBoard; 