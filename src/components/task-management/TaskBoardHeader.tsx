import React from 'react';
import {
  Box,
  Typography,
  Button,
  alpha
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTaskBoard } from './TaskBoardContext';

const TaskBoardHeader: React.FC = () => {
  const { handleOpenNewStatusDialog } = useTaskBoard();

  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      mb={3}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'rgba(0,0,0,0.05)',
        pb: 2
      }}
    >
      <Typography 
        variant="h5" 
        component="h2"
        sx={{
          fontWeight: 600,
          fontSize: '1.5rem',
          letterSpacing: '-0.02em',
          color: '#1d1d1f' // Apple koyu gri
        }}
      >
        Görev Panosu
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpenNewStatusDialog}
        sx={{
          backgroundColor: '#007aff', // Apple mavi
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
          textTransform: 'none',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: '#0062cc', // Koyu mavi
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.35)'
          },
          transition: 'all 0.2s ease'
        }}
      >
        Yeni Durum
      </Button>
    </Box>
  );
};

export default TaskBoardHeader; 