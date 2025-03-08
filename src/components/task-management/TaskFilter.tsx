import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  MenuItem, 
  Button, 
  Grid, 
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Typography
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { TaskService } from '@/services/taskService';

interface TaskFilterProps {
  onFilter: (filters: any) => void;
  statuses: any[];
}

const TaskFilter: React.FC<TaskFilterProps> = ({ onFilter, statuses }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assignee: '',
    dueDate: '',
    project: ''
  });
  const [priorities, setPriorities] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Öncelikleri yükle
  useEffect(() => {
    const loadPriorities = async () => {
      try {
        const taskService = new TaskService();
        const fetchedPriorities = await taskService.getTaskPriorities();
        setPriorities(fetchedPriorities);
      } catch (error) {
        console.error('Öncelikler yüklenirken hata:', error);
      }
    };
    
    loadPriorities();
  }, []);

  // Filtre değişikliklerini işle
  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    
    // Aktif filtreleri güncelle
    updateActiveFilters(newFilters);
    
    // Üst bileşene bildir
    onFilter(newFilters);
  };

  // Aktif filtreleri güncelle
  const updateActiveFilters = (currentFilters: any) => {
    const active: string[] = [];
    
    if (currentFilters.search) active.push(`Arama: ${currentFilters.search}`);
    if (currentFilters.status) {
      const statusName = statuses.find(s => s.id === currentFilters.status)?.name || currentFilters.status;
      active.push(`Durum: ${statusName}`);
    }
    if (currentFilters.priority) {
      const priorityName = priorities.find(p => p.id === currentFilters.priority)?.name || currentFilters.priority;
      active.push(`Öncelik: ${priorityName}`);
    }
    if (currentFilters.assignee) active.push(`Görevli: ${currentFilters.assignee}`);
    if (currentFilters.dueDate) active.push(`Son Tarih: ${currentFilters.dueDate}`);
    if (currentFilters.project) active.push(`Proje: ${currentFilters.project}`);
    
    setActiveFilters(active);
  };

  // Filtreleri temizle
  const handleClearFilters = () => {
    const emptyFilters = {
      search: '',
      status: '',
      priority: '',
      assignee: '',
      dueDate: '',
      project: ''
    };
    
    setFilters(emptyFilters);
    setActiveFilters([]);
    onFilter(emptyFilters);
  };

  // Belirli bir filtreyi kaldır
  const handleRemoveFilter = (filterToRemove: string) => {
    const field = filterToRemove.split(':')[0].trim().toLowerCase();
    let fieldName = '';
    
    switch (field) {
      case 'arama':
        fieldName = 'search';
        break;
      case 'durum':
        fieldName = 'status';
        break;
      case 'öncelik':
        fieldName = 'priority';
        break;
      case 'görevli':
        fieldName = 'assignee';
        break;
      case 'son tarih':
        fieldName = 'dueDate';
        break;
      case 'proje':
        fieldName = 'project';
        break;
      default:
        return;
    }
    
    handleFilterChange(fieldName, '');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          placeholder="Görevlerde ara..."
          variant="outlined"
          size="small"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          sx={{ width: { xs: '100%', sm: 300 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: filters.search ? (
              <InputAdornment position="end">
                <IconButton 
                  size="small" 
                  onClick={() => handleFilterChange('search', '')}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />
        
        <Box>
          <Button 
            startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setExpanded(!expanded)}
            color="inherit"
            sx={{ mr: 1 }}
          >
            Gelişmiş Filtreler
          </Button>
          
          <Button 
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            disabled={activeFilters.length === 0}
            color="inherit"
          >
            Temizle
          </Button>
        </Box>
      </Box>
      
      <Collapse in={expanded}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Durum"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">Tümü</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Öncelik"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">Tümü</MenuItem>
              {priorities.map((priority) => (
                <MenuItem key={priority.id} value={priority.id}>
                  {priority.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Görevli"
              value={filters.assignee}
              onChange={(e) => handleFilterChange('assignee', e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Son Tarih"
              type="date"
              value={filters.dueDate}
              onChange={(e) => handleFilterChange('dueDate', e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </Collapse>
      
      {activeFilters.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
            Aktif Filtreler:
          </Typography>
          {activeFilters.map((filter) => (
            <Chip
              key={filter}
              label={filter}
              onDelete={() => handleRemoveFilter(filter)}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TaskFilter;