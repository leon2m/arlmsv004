import React from 'react';
import { Box, Paper, Typography, alpha } from '@mui/material';
import { useTaskBoard } from './TaskBoardContext';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

interface ErrorMessageProps {
  message?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const { error } = useTaskBoard();
  
  // Eğer mesaj prop'u verilmişse onu kullan, yoksa context'ten al
  const errorMessage = message || error;

  if (!errorMessage) return null;

  return (
    <Box mb={3}>
      <Paper
        sx={{
          p: 3,
          backgroundColor: alpha('#ff3b30', 0.05), // Apple kırmızı
          borderRadius: '12px',
          border: '1px solid',
          borderColor: alpha('#ff3b30', 0.2),
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <ErrorIcon 
          sx={{ 
            color: '#ff3b30', 
            mr: 2,
            fontSize: '1.5rem'
          }} 
        />
        <Typography 
          color="#ff3b30" 
          sx={{ 
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {errorMessage}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ErrorMessage; 