import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useTaskBoard } from './TaskBoardContext';

/**
 * Durum menüsü bileşeni
 * Durum sütunlarındaki üç nokta menüsünü gösterir
 */
const StatusMenu: React.FC = () => {
  const {
    anchorEl,
    handleStatusMenuClose,
    handleEditStatus,
    handleDeleteStatus
  } = useTaskBoard();
  
  const open = Boolean(anchorEl);
  
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleStatusMenuClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        elevation: 3,
        sx: {
          minWidth: 180,
          borderRadius: 2,
          mt: 1,
          '& .MuiMenuItem-root': {
            px: 2,
            py: 1.5,
            borderRadius: 1,
            mx: 0.5,
            my: 0.25,
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
            },
          },
        },
      }}
    >
      <MenuItem onClick={handleEditStatus}>
        <ListItemIcon>
          <EditIcon fontSize="small" color="primary" />
        </ListItemIcon>
        <ListItemText primary="Düzenle" />
      </MenuItem>
      
      <MenuItem onClick={handleDeleteStatus}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText primary="Sil" />
      </MenuItem>
    </Menu>
  );
};

export default StatusMenu; 