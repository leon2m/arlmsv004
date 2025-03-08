import React from 'react';

import { 

  Card, 

  CardContent, 

  CardActions, 

  Typography, 

  Chip, 

  Box, 

  IconButton, 

  Avatar, 

  Tooltip,

  Badge,

  Divider,

  LinearProgress

} from '@mui/material';

import { 

  AccessTime as AccessTimeIcon,

  Flag as FlagIcon,

  MoreVert as MoreVertIcon,

  Comment as CommentIcon,

  Attachment as AttachmentIcon,

  CheckCircleOutline as CheckCircleOutlineIcon,

  ErrorOutline as ErrorOutlineIcon

} from '@mui/icons-material';

import { Task } from '@/types/taskManagement';



interface TaskCardProps {

  task: Task;

  onEdit: (task: Task) => void;

  onDelete: (taskId: string) => void;

}



const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {

  // Öncelik rengini belirle

  const getPriorityColor = (priority: string | null | undefined) => {

    if (!priority) return '#9e9e9e'; // Gri (varsayılan)

    

    switch (priority.toLowerCase()) {

      case 'high':

      case 'yüksek':

        return '#f44336'; // Kırmızı

      case 'medium':

      case 'orta':

        return '#ff9800'; // Turuncu

      case 'low':

      case 'düşük':

        return '#4caf50'; // Yeşil

      default:

        return '#9e9e9e'; // Gri

    }

  };



  // Durum rengini belirle

  const getStatusColor = (status: string | null | undefined) => {

    if (!status) return '#9e9e9e'; // Gri (varsayılan)

    

    switch (status.toLowerCase()) {

      case 'completed':

      case 'tamamlandı':

        return '#4caf50'; // Yeşil

      case 'in progress':

      case 'devam ediyor':

        return '#2196f3'; // Mavi

      case 'blocked':

      case 'engellendi':

        return '#f44336'; // Kırmızı

      case 'backlog':

      case 'beklemede':

        return '#9e9e9e'; // Gri

      default:

        return '#9e9e9e'; // Gri

    }

  };



  // Tarih formatını düzenle

  const formatDate = (dateString?: string) => {

    if (!dateString) return '';

    const date = new Date(dateString);

    return new Intl.DateTimeFormat('tr-TR', {

      day: '2-digit',

      month: '2-digit',

      year: 'numeric'

    }).format(date);

  };



  // Son teslim tarihi geçti mi kontrol et

  const isOverdue = (dateString?: string | null) => {

    if (!dateString) return false;

    const dueDate = new Date(dateString);

    const today = new Date();

    return dueDate < today;

  };



  // İlerleme durumunu hesapla (örnek)

  const calculateProgress = () => {

    // Gerçek uygulamada bu değer görevin alt görevlerinden veya zaman kayıtlarından hesaplanabilir

    return Math.floor(Math.random() * 100);

  };



  const progress = calculateProgress();



  return (

    <Card 

      sx={{ 

        mb: 2, 

        transition: 'all 0.2s ease',

        '&:hover': { 

          boxShadow: 3,

          transform: 'translateY(-2px)'

        }

      }}

    >

      <CardContent sx={{ p: 2, pb: 1 }}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>

          <Chip 

            label={task.type_id || 'Görev'} 

            size="small" 

            sx={{ height: 20, fontSize: '0.7rem' }} 

          />

          <Box>
            {isOverdue(task.due_date) && (
              <Tooltip title="Gecikmiş">
                <ErrorOutlineIcon fontSize="small" color="error" sx={{ mr: 1 }} />
              </Tooltip>
            )}
            {task.status_id?.toLowerCase() === 'completed' && (
              <Tooltip title="Tamamlandı">
                <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
              </Tooltip>
            )}
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

        </Box>

        

        <Typography 

          variant="subtitle1" 

          sx={{ 

            fontWeight: 'bold', 

            mb: 1,

            overflow: 'hidden',

            textOverflow: 'ellipsis',

            display: '-webkit-box',

            WebkitLineClamp: 2,

            WebkitBoxOrient: 'vertical'

          }}

        >

          {task.title}

        </Typography>

        

        {task.description && (

          <Typography 

            variant="body2" 

            color="text.secondary" 

            sx={{ 

              mb: 1,

              overflow: 'hidden',

              textOverflow: 'ellipsis',

              display: '-webkit-box',

              WebkitLineClamp: 2,

              WebkitBoxOrient: 'vertical'

            }}

          >

            {task.description}

          </Typography>

        )}

        

        <Box sx={{ mt: 2, mb: 1 }}>

          <LinearProgress 

            variant="determinate" 

            value={progress} 

            sx={{ 

              height: 6, 

              borderRadius: 3,

              backgroundColor: 'rgba(0,0,0,0.05)'

            }} 

          />

          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>

            {progress}% Tamamlandı

          </Typography>

        </Box>

        

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>

            <FlagIcon 

              fontSize="small" 

              sx={{ 

                mr: 0.5, 

                color: getPriorityColor(task.priority_id) 

              }} 

            />

            <Typography variant="caption">

              {task.priority_id || 'Normal'}

            </Typography>

          </Box>

          

          {task.due_date && (

            <Box sx={{ display: 'flex', alignItems: 'center' }}>

              <AccessTimeIcon 

                fontSize="small" 

                sx={{ 

                  mr: 0.5,

                  color: isOverdue(task.due_date) ? 'error.main' : 'inherit'

                }} 

              />

              <Typography 

                variant="caption"

                color={isOverdue(task.due_date) ? 'error' : 'inherit'}

              >

                {formatDate(task.due_date)}

              </Typography>

            </Box>

          )}

        </Box>

      </CardContent>

      

      <Divider />

      

      <CardActions sx={{ p: 1, justifyContent: 'space-between' }}>

        <Box>

          <Tooltip title="Yorumlar">

            <IconButton size="small">

              <Badge badgeContent={2} color="primary">

                <CommentIcon fontSize="small" />

              </Badge>

            </IconButton>

          </Tooltip>

          <Tooltip title="Ekler">

            <IconButton size="small">

              <Badge badgeContent={1} color="primary">

                <AttachmentIcon fontSize="small" />

              </Badge>

            </IconButton>

          </Tooltip>

        </Box>

        

        <Tooltip title={task.assignee_id || 'Atanmamış'}>

          <Avatar 

            sx={{ width: 24, height: 24, fontSize: '0.75rem' }}

            alt="Görevli"

          >

            {task.assignee_id ? task.assignee_id.substring(0, 2).toUpperCase() : '?'}

          </Avatar>

        </Tooltip>

      </CardActions>

    </Card>

  );

};



export default TaskCard;
