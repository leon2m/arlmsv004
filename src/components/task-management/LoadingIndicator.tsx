import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useTaskBoard } from './TaskBoardContext';

const LoadingIndicator: React.FC = () => {
  const { loading, statuses } = useTaskBoard();

  if (!loading || statuses.length > 0) return null;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress sx={{ color: '#007aff' }} /> {/* Apple mavi */}
    </Box>
  );
};

export default LoadingIndicator; 