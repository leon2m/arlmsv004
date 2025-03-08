import React, { useState, useEffect } from 'react';

import { 

  Dialog, 

  DialogTitle, 

  DialogContent, 

  DialogActions, 

  Button, 

  TextField, 

  MenuItem, 

  Grid, 

  Box,

  Typography,

  IconButton,

  FormControl,

  InputLabel,

  Select,

  Chip,

  Autocomplete,

  FormHelperText

} from '@mui/material';

import { 

  Close as CloseIcon,

  AccessTime as AccessTimeIcon,

  Flag as FlagIcon,

  Person as PersonIcon,

  Description as DescriptionIcon

} from '@mui/icons-material';

import { Task } from '@/types/taskManagement';

import { TaskService } from '@/services/taskService';



interface TaskFormProps {

  open: boolean;

  onClose: () => void;

  onSubmit: (task: Partial<Task>) => Promise<void>;

  task?: Task;

  statuses: any[];

}



const TaskForm: React.FC<TaskFormProps> = ({ 

  open, 

  onClose, 

  onSubmit, 

  task, 

  statuses 

}) => {

  const [formData, setFormData] = useState<Partial<Task>>({

    title: '',

    description: '',

    status_id: '',

    priority_id: '',

    assignee_id: '',

    due_date: '',

    estimated_hours: 0

  });

  const [priorities, setPriorities] = useState<any[]>([]);

  const [types, setTypes] = useState<any[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);



  // Form verilerini başlat

  useEffect(() => {

    if (task) {

      setFormData({

        title: task.title || '',

        description: task.description || '',

        status_id: task.status_id || '',

        priority_id: task.priority_id || '',

        assignee_id: task.assignee_id || '',

        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',

        estimated_hours: task.estimated_hours || 0

      });

    } else {

      // Yeni görev için varsayılan değerler

      setFormData({

        title: '',

        description: '',

        status_id: statuses.length > 0 ? statuses[0].id : '',

        priority_id: '',

        assignee_id: '',

        due_date: '',

        estimated_hours: 0

      });

    }

  }, [task, statuses]);



  // Öncelikleri ve tipleri yükle

  useEffect(() => {

    const loadFormData = async () => {

      try {

        const taskService = new TaskService();

        

        // Öncelikleri yükle

        const fetchedPriorities = await taskService.getTaskPriorities();

        setPriorities(fetchedPriorities);

        

        // Tipleri yükle

        const fetchedTypes = await taskService.getTaskTypes();

        setTypes(fetchedTypes);

      } catch (error) {

        console.error('Form verileri yüklenirken hata:', error);

      }

    };

    

    loadFormData();

  }, []);



  // Form alanı değişikliklerini işle

  const handleChange = (field: string, value: any) => {

    setFormData(prev => ({ ...prev, [field]: value }));

    

    // Hata varsa temizle

    if (errors[field]) {

      setErrors(prev => ({ ...prev, [field]: '' }));

    }

  };



  // Formu doğrula

  const validateForm = (): boolean => {

    const newErrors: Record<string, string> = {};

    

    if (!formData.title?.trim()) {

      newErrors.title = 'Başlık gereklidir';

    }

    

    if (!formData.status_id) {

      newErrors.status_id = 'Durum seçilmelidir';

    }

    

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };



  // Formu gönder

  const handleSubmit = async () => {

    if (!validateForm()) return;

    

    setLoading(true);

    try {

      await onSubmit(formData);

      onClose();

    } catch (error) {

      console.error('Görev kaydedilirken hata:', error);

    } finally {

      setLoading(false);

    }

  };



  return (

    <Dialog 

      open={open} 

      onClose={onClose} 

      maxWidth="md" 

      fullWidth

      PaperProps={{

        sx: {

          borderRadius: 2,

          boxShadow: 10

        }

      }}

    >

      <DialogTitle sx={{ 
        fontSize: '1.25rem', 
        fontWeight: 500,
        pb: 2,
        pt: 2
      }}>
        {task ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
      </DialogTitle>
      
      <DialogContent dividers>

        <Grid container spacing={3}>

          <Grid item xs={12}>

            <TextField

              label="Başlık"

              value={formData.title}

              onChange={(e) => handleChange('title', e.target.value)}

              fullWidth

              required

              error={!!errors.title}

              helperText={errors.title}

              autoFocus

              InputProps={{

                startAdornment: (

                  <DescriptionIcon color="action" sx={{ mr: 1 }} />

                )

              }}

            />

          </Grid>

          

          <Grid item xs={12}>

            <TextField

              label="Açıklama"

              value={formData.description}

              onChange={(e) => handleChange('description', e.target.value)}

              fullWidth

              multiline

              rows={4}

              placeholder="Görev detaylarını buraya yazın..."

            />

          </Grid>

          

          <Grid item xs={12} sm={6}>

            <FormControl fullWidth error={!!errors.status_id}>

              <InputLabel>Durum</InputLabel>

              <Select

                value={formData.status_id}

                onChange={(e) => handleChange('status_id', e.target.value)}

                label="Durum"

                required

              >

                {statuses.map((status) => (

                  <MenuItem key={status.id} value={status.id}>

                    {status.name}

                  </MenuItem>

                ))}

              </Select>

              {errors.status_id && <FormHelperText>{errors.status_id}</FormHelperText>}

            </FormControl>

          </Grid>

          

          <Grid item xs={12} sm={6}>

            <FormControl fullWidth>

              <InputLabel>Öncelik</InputLabel>

              <Select

                value={formData.priority_id}

                onChange={(e) => handleChange('priority_id', e.target.value)}

                label="Öncelik"

                startAdornment={<FlagIcon color="action" sx={{ ml: 1, mr: 1 }} />}

              >

                <MenuItem value="">Seçiniz</MenuItem>

                {priorities.map((priority) => (

                  <MenuItem key={priority.id} value={priority.id}>

                    {priority.name}

                  </MenuItem>

                ))}

              </Select>

            </FormControl>

          </Grid>

          

          <Grid item xs={12} sm={6}>

            <TextField

              label="Görevli"

              value={formData.assignee_id}

              onChange={(e) => handleChange('assignee_id', e.target.value)}

              fullWidth

              placeholder="Kullanıcı ID'si girin"

              InputProps={{

                startAdornment: (

                  <PersonIcon color="action" sx={{ mr: 1 }} />

                )

              }}

            />

          </Grid>

          

          <Grid item xs={12} sm={6}>

            <TextField

              label="Son Tarih"

              type="date"

              value={formData.due_date}

              onChange={(e) => handleChange('due_date', e.target.value)}

              fullWidth

              InputLabelProps={{

                shrink: true,

              }}

              InputProps={{

                startAdornment: (

                  <AccessTimeIcon color="action" sx={{ mr: 1 }} />

                )

              }}

            />

          </Grid>

          

          <Grid item xs={12} sm={6}>

            <TextField

              label="Tahmini Süre (Saat)"

              type="number"

              value={formData.estimated_hours}

              onChange={(e) => handleChange('estimated_hours', parseFloat(e.target.value))}

              fullWidth

              inputProps={{ min: 0, step: 0.5 }}

            />

          </Grid>

          

          <Grid item xs={12} sm={6}>

            <FormControl fullWidth>

              <InputLabel>Görev Tipi</InputLabel>

              <Select

                value={formData.type_id || ''}

                onChange={(e) => handleChange('type_id', e.target.value)}

                label="Görev Tipi"

              >

                <MenuItem value="">Seçiniz</MenuItem>

                {types.map((type) => (

                  <MenuItem key={type.id} value={type.id}>

                    {type.name}

                  </MenuItem>

                ))}

              </Select>

            </FormControl>

          </Grid>

        </Grid>

      </DialogContent>

      

      <DialogActions sx={{ px: 3, py: 2 }}>

        <Button onClick={onClose} color="inherit">

          İptal

        </Button>

        <Button 

          onClick={handleSubmit} 

          variant="contained" 

          color="primary"

          disabled={loading}

        >

          {loading ? 'Kaydediliyor...' : (task ? 'Güncelle' : 'Oluştur')}

        </Button>

      </DialogActions>

    </Dialog>

  );

};



export default TaskForm;


