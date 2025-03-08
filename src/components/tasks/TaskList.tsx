import React, { useState } from 'react';

import { 

  Box, 

  Table, 

  TableBody, 

  TableCell, 

  TableContainer, 

  TableHead, 

  TableRow, 

  Paper, 

  IconButton, 

  Chip, 

  Typography, 

  Tooltip,

  Menu,

  MenuItem,

  ListItemIcon,

  ListItemText,

  Avatar,

  TablePagination,

  TextField,

  InputAdornment

} from '@mui/material';

import { 

  Edit as EditIcon, 

  Delete as DeleteIcon, 

  MoreVert as MoreVertIcon,

  AccessTime as AccessTimeIcon,

  Flag as FlagIcon,

  Search as SearchIcon,

  FilterList as FilterListIcon,

  ArrowUpward as ArrowUpwardIcon,

  ArrowDownward as ArrowDownwardIcon,

  CheckCircle as CheckCircleIcon,

  ErrorOutline as ErrorOutlineIcon,

  ViewModule as ViewModuleIcon

} from '@mui/icons-material';

import { Task } from '@/types/taskManagement';

import TaskCard from './TaskCard';



interface TaskListProps {

  tasks: Task[];

  onUpdateTask: (taskId: string, taskData: Partial<Task>) => Promise<void>;

  onDeleteTask: (taskId: string) => Promise<void>;

}



const TaskList: React.FC<TaskListProps> = ({ tasks, onUpdateTask, onDeleteTask }) => {

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');

  const [sortField, setSortField] = useState<string>('created_at');

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');



  // Menüyü aç

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {

    setAnchorEl(event.currentTarget);

    setSelectedTaskId(taskId);

  };



  // Menüyü kapat

  const handleMenuClose = () => {

    setAnchorEl(null);

    setSelectedTaskId(null);

  };



  // Görev düzenle

  const handleEditTask = () => {

    if (selectedTaskId) {

      const task = tasks.find(t => t.id === selectedTaskId);

      if (task) {

        // Düzenleme işlemi burada yapılacak

        console.log('Düzenlenecek görev:', task);

        

        // Görev düzenleme sayfasına yönlendir

        window.location.href = `/tasks/${task.id}/edit`;

        

        // Alternatif olarak, onUpdateTask callback'ini kullanarak düzenleme yapabilirsiniz

        // Örnek: Modal açma veya form gösterme

        // const updatedTask = { ...task, title: 'Güncellenmiş başlık' };

        // onUpdateTask(task.id, updatedTask);

      }

    }

    handleMenuClose();

  };



  // Görev sil

  const handleDeleteTask = () => {

    if (selectedTaskId) {

      onDeleteTask(selectedTaskId);

    }

    handleMenuClose();

  };



  // Sayfa değiştir

  const handleChangePage = (event: unknown, newPage: number) => {

    setPage(newPage);

  };



  // Sayfa başına satır sayısını değiştir

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {

    setRowsPerPage(parseInt(event.target.value, 10));

    setPage(0);

  };



  // Sıralama alanını değiştir

  const handleSort = (field: string) => {

    if (sortField === field) {

      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');

    } else {

      setSortField(field);

      setSortDirection('asc');

    }

  };



  // Görevleri filtrele ve sırala

  const filteredAndSortedTasks = React.useMemo(() => {

    // Önce filtrele

    let result = tasks.filter(task => 

      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||

      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))

    );

    

    // Sonra sırala

    result.sort((a, b) => {

      let aValue: any = a[sortField as keyof Task];

      let bValue: any = b[sortField as keyof Task];

      

      // null değerleri en sona koy

      if (aValue === null) return sortDirection === 'asc' ? 1 : -1;

      if (bValue === null) return sortDirection === 'asc' ? -1 : 1;

      

      // Tarih alanları için

      if (sortField === 'due_date' || sortField === 'created_at' || sortField === 'updated_at') {

        aValue = aValue ? new Date(aValue).getTime() : 0;

        bValue = bValue ? new Date(bValue).getTime() : 0;

      }

      

      // String alanları için

      if (typeof aValue === 'string') {

        aValue = aValue.toLowerCase();

      }

      if (typeof bValue === 'string') {

        bValue = bValue.toLowerCase();

      }

      

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;

      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;

      return 0;

    });

    

    return result;

  }, [tasks, searchTerm, sortField, sortDirection]);



  // Sayfalanmış görevler

  const paginatedTasks = filteredAndSortedTasks.slice(

    page * rowsPerPage,

    page * rowsPerPage + rowsPerPage

  );



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



  return (

    <Box>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>

        <TextField

          placeholder="Görevlerde ara..."

          variant="outlined"

          size="small"

          value={searchTerm}

          onChange={(e) => setSearchTerm(e.target.value)}

          sx={{ width: 300 }}

          InputProps={{

            startAdornment: (

              <InputAdornment position="start">

                <SearchIcon />

              </InputAdornment>

            ),

          }}

        />

        

        <Box>

          <Tooltip title="Tablo Görünümü">

            <IconButton 

              color={viewMode === 'table' ? 'primary' : 'default'}

              onClick={() => setViewMode('table')}

            >

              <FilterListIcon />

            </IconButton>

          </Tooltip>

          <Tooltip title="Kart Görünümü">

            <IconButton 

              color={viewMode === 'cards' ? 'primary' : 'default'}

              onClick={() => setViewMode('cards')}

            >

              <ViewModuleIcon />

            </IconButton>

          </Tooltip>

        </Box>

      </Box>



      {viewMode === 'table' ? (

        <TableContainer component={Paper}>

          <Table sx={{ minWidth: 650 }} size="medium">

            <TableHead>

              <TableRow>

                <TableCell 

                  onClick={() => handleSort('title')}

                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}

                >

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>

                    Başlık

                    {sortField === 'title' && (

                      sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />

                    )}

                  </Box>

                </TableCell>

                <TableCell 

                  onClick={() => handleSort('status_id')}

                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}

                >

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>

                    Durum

                    {sortField === 'status_id' && (

                      sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />

                    )}

                  </Box>

                </TableCell>

                <TableCell 

                  onClick={() => handleSort('priority_id')}

                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}

                >

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>

                    Öncelik

                    {sortField === 'priority_id' && (

                      sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />

                    )}

                  </Box>

                </TableCell>

                <TableCell 

                  onClick={() => handleSort('due_date')}

                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}

                >

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>

                    Son Tarih

                    {sortField === 'due_date' && (

                      sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />

                    )}

                  </Box>

                </TableCell>

                <TableCell 

                  onClick={() => handleSort('assignee_id')}

                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}

                >

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>

                    Görevli

                    {sortField === 'assignee_id' && (

                      sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />

                    )}

                  </Box>

                </TableCell>

                <TableCell align="right">İşlemler</TableCell>

              </TableRow>

            </TableHead>

            <TableBody>

              {paginatedTasks.map((task) => (

                <TableRow

                  key={task.id}

                  sx={{ 

                    '&:last-child td, &:last-child th': { border: 0 },

                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }

                  }}

                >

                  <TableCell component="th" scope="row">

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>

                      {task.status_id?.toLowerCase() === 'completed' ? (

                        <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1 }} />

                      ) : isOverdue(task.due_date) ? (

                        <ErrorOutlineIcon fontSize="small" color="error" sx={{ mr: 1 }} />

                      ) : null}

                      <Typography>{task.title}</Typography>

                    </Box>

                  </TableCell>

                  <TableCell>

                    <Chip 

                      label={task.status_id || 'Beklemede'} 

                      size="small" 

                      sx={{ 

                        backgroundColor: getStatusColor(task.status_id) + '22',

                        color: getStatusColor(task.status_id),

                        borderColor: getStatusColor(task.status_id),

                        borderWidth: 1,

                        borderStyle: 'solid'

                      }} 

                    />

                  </TableCell>

                  <TableCell>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>

                      <FlagIcon 

                        fontSize="small" 

                        sx={{ 

                          mr: 0.5, 

                          color: getPriorityColor(task.priority_id) 

                        }} 

                      />

                      <Typography variant="body2">

                        {task.priority_id || 'Normal'}

                      </Typography>

                    </Box>

                  </TableCell>

                  <TableCell>

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

                          variant="body2"

                          color={isOverdue(task.due_date) ? 'error' : 'inherit'}

                        >

                          {formatDate(task.due_date)}

                        </Typography>

                      </Box>

                    )}

                  </TableCell>

                  <TableCell>

                    <Tooltip title={task.assignee_id || 'Atanmamış'}>

                      <Avatar 

                        sx={{ width: 24, height: 24, fontSize: '0.75rem' }}

                        alt="Görevli"

                      >

                        {task.assignee_id ? task.assignee_id.substring(0, 2).toUpperCase() : '?'}

                      </Avatar>

                    </Tooltip>

                  </TableCell>

                  <TableCell align="right">

                    <IconButton 

                      size="small" 

                      onClick={(e) => handleMenuOpen(e, task.id)}

                      aria-label="İşlemler"

                    >

                      <MoreVertIcon fontSize="small" />

                    </IconButton>

                  </TableCell>

                </TableRow>

              ))}

              {paginatedTasks.length === 0 && (

                <TableRow>

                  <TableCell colSpan={6} align="center">

                    <Typography variant="body1" sx={{ py: 2 }}>

                      Görev bulunamadı

                    </Typography>

                  </TableCell>

                </TableRow>

              )}

            </TableBody>

          </Table>

          <TablePagination

            rowsPerPageOptions={[5, 10, 25]}

            component="div"

            count={filteredAndSortedTasks.length}

            rowsPerPage={rowsPerPage}

            page={page}

            onPageChange={handleChangePage}

            onRowsPerPageChange={handleChangeRowsPerPage}

            labelRowsPerPage="Sayfa başına satır:"

            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}

          />

        </TableContainer>

      ) : (

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>

          {paginatedTasks.map((task) => (

            <Box key={task.id} sx={{ width: { xs: '100%', sm: '48%', md: '31%', lg: '23%' } }}>

              <TaskCard 

                task={task} 

                onEdit={(task) => {

                  // Düzenleme işlemi burada yapılacak

                  console.log('Düzenlenecek görev:', task);

                }} 

                onDelete={(taskId) => onDeleteTask(taskId)} 

              />

            </Box>

          ))}

          {paginatedTasks.length === 0 && (

            <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>

              <Typography variant="body1">

                Görev bulunamadı

              </Typography>

            </Box>

          )}

        </Box>

      )}



      <Menu

        anchorEl={anchorEl}

        open={Boolean(anchorEl)}

        onClose={handleMenuClose}

      >

        <MenuItem onClick={handleEditTask}>

          <ListItemIcon>

            <EditIcon fontSize="small" />

          </ListItemIcon>

          <ListItemText>Düzenle</ListItemText>

        </MenuItem>

        <MenuItem onClick={handleDeleteTask}>

          <ListItemIcon>

            <DeleteIcon fontSize="small" />

          </ListItemIcon>

          <ListItemText>Sil</ListItemText>

        </MenuItem>

      </Menu>

    </Box>

  );

};



export default TaskList;
