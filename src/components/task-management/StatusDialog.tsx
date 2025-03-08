import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { ColorLens as ColorIcon, Close as CloseIcon } from '@mui/icons-material';
import { SketchPicker } from 'react-color';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskBoard } from './TaskBoardContext';

/**
 * Durum ekleme/düzenleme diyaloğu
 */
const StatusDialog: React.FC = () => {
  const {
    openStatusDialog,
    editingStatusId,
    newStatus,
    showColorPicker,
    handleCloseStatusDialog,
    handleStatusFormChange,
    handleColorChange,
    handleStatusSubmit,
    setShowColorPicker
  } = useTaskBoard();

  // Durum kategorileri
  const statusCategories = [
    { value: 'to-do', label: 'Yapılacak' },
    { value: 'in-progress', label: 'Devam Ediyor' },
    { value: 'done', label: 'Tamamlandı' },
    { value: 'blocked', label: 'Engellendi' },
    { value: 'review', label: 'İncelemede' }
  ];

  // Durum simgeleri
  const statusIcons = [
    { value: 'task_alt', label: 'Görev' },
    { value: 'assignment', label: 'Atama' },
    { value: 'check_circle', label: 'Tamamlandı' },
    { value: 'hourglass_empty', label: 'Beklemede' },
    { value: 'priority_high', label: 'Öncelikli' },
    { value: 'error', label: 'Hata' },
    { value: 'bug_report', label: 'Hata Raporu' },
    { value: 'build', label: 'Geliştirme' },
    { value: 'code', label: 'Kod' },
    { value: 'design_services', label: 'Tasarım' },
    { value: 'article', label: 'Belge' }
  ];

  return (
    <Dialog 
      open={openStatusDialog} 
      onClose={handleCloseStatusDialog} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: '1.2rem',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          pb: 2,
          pt: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {editingStatusId ? 'Durumu Düzenle' : 'Yeni Durum Ekle'}
        <IconButton 
          onClick={handleCloseStatusDialog}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Durum Adı"
          type="text"
          fullWidth
          variant="outlined"
          value={newStatus.name || ''}
          onChange={handleStatusFormChange}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="description"
          label="Açıklama"
          type="text"
          fullWidth
          variant="outlined"
          value={newStatus.description || ''}
          onChange={handleStatusFormChange}
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="status-category-label">Kategori</InputLabel>
            <Select
              labelId="status-category-label"
              name="status_category"
              value={newStatus.status_category || 'to-do'}
              label="Kategori"
              onChange={handleStatusFormChange}
            >
              {statusCategories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel id="status-icon-label">Simge</InputLabel>
            <Select
              labelId="status-icon-label"
              name="icon"
              value={newStatus.icon || 'task_alt'}
              label="Simge"
              onChange={handleStatusFormChange}
            >
              {statusIcons.map((icon) => (
                <MenuItem key={icon.value} value={icon.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span className="material-icons" style={{ marginRight: 8 }}>
                      {icon.value}
                    </span>
                    {icon.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Box mb={2}>
          <Typography 
            variant="subtitle2" 
            gutterBottom
            sx={{
              fontWeight: 600,
              fontSize: '0.9rem',
              mb: 1.5
            }}
          >
            Renk
          </Typography>
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                backgroundColor: newStatus.color || '#3498db',
                cursor: 'pointer',
                border: '2px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                mr: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            <Button
              startIcon={<ColorIcon />}
              onClick={() => setShowColorPicker(!showColorPicker)}
              sx={{
                color: newStatus.color || '#3498db',
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: alpha(newStatus.color || '#3498db', 0.1)
                }
              }}
            >
              {showColorPicker ? 'Renk Seçiciyi Kapat' : 'Renk Seç'}
            </Button>
          </Box>
          
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Box mt={2}>
                  <SketchPicker
                    color={newStatus.color || '#3498db'}
                    onChange={handleColorChange}
                    disableAlpha
                    presetColors={[
                      '#3498db', // Mavi
                      '#2ecc71', // Yeşil
                      '#f39c12', // Turuncu
                      '#e74c3c', // Kırmızı
                      '#9b59b6', // Mor
                      '#1abc9c', // Turkuaz
                      '#34495e', // Lacivert
                      '#7f8c8d', // Gri
                    ]}
                  />
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <Button 
          onClick={handleCloseStatusDialog} 
          color="inherit"
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 1
          }}
        >
          İptal
        </Button>
        <Button 
          onClick={handleStatusSubmit} 
          variant="contained"
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 500,
            px: 3
          }}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusDialog; 