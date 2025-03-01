import React, { useState } from 'react';
import { Plus, Check, X, Trash2, Edit, MoreHorizontal, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from './types';

interface TaskListProps {
  tasks: Task[];
  onAddTask?: (task: Partial<Task>) => void;
  onUpdateTask?: (taskId: string, updatedTask: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
  isLoading?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({ 
  tasks = [],
  onAddTask, 
  onUpdateTask, 
  onDeleteTask,
  isLoading = false
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  // Ensure tasks is always an array
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  
  // Yeni görev için form state'i
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: new Date().toISOString().slice(0, 10),
    tags: []
  });

  // Düzenleme için form state'i
  const [editTask, setEditTask] = useState<Partial<Task>>({});
  
  // Yeni etiket girişi için state
  const [newTag, setNewTag] = useState('');
  const [editTag, setEditTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !newTask.tags?.includes(newTag.trim().toLowerCase())) {
      setNewTask({
        ...newTask,
        tags: [...(newTask.tags || []), newTag.trim().toLowerCase()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewTask({
      ...newTask,
      tags: newTask.tags?.filter(t => t !== tag)
    });
  };

  const handleEditTag = () => {
    if (editTag.trim() && !editTask.tags?.includes(editTag.trim().toLowerCase())) {
      setEditTask({
        ...editTask,
        tags: [...(editTask.tags || []), editTag.trim().toLowerCase()]
      });
      setEditTag('');
    }
  };

  const handleRemoveEditTag = (tag: string) => {
    setEditTask({
      ...editTask,
      tags: editTask.tags?.filter(t => t !== tag)
    });
  };

  const handleAddTask = () => {
    if (newTask.title && onAddTask) {
      onAddTask(newTask);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date().toISOString().slice(0, 10),
        tags: []
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditTask = () => {
    if (currentTask && editTask.title && onUpdateTask) {
      onUpdateTask(currentTask.id, editTask);
      setCurrentTask(null);
      setEditTask({});
      setIsEditDialogOpen(false);
    }
  };

  const openEditDialog = (task: Task) => {
    setCurrentTask(task);
    setEditTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      tags: [...task.tags]
    });
    setIsEditDialogOpen(true);
  };

  const updateTaskStatus = (taskId: string, status: 'in-progress' | 'todo' | 'completed') => {
    if (onUpdateTask) {
      onUpdateTask(taskId, { status });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Görevlerim</CardTitle>
          <Button variant="outline" size="icon" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : safeTasks.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>Henüz görev bulunmuyor</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                İlk görevi ekle
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {safeTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col space-y-2 bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.priority === 'high'
                            ? 'bg-red-500'
                            : task.priority === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <span className="font-medium text-sm">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          task.status === 'in-progress' 
                            ? 'default' 
                            : task.status === 'completed' 
                            ? 'success' 
                            : 'secondary'
                        }
                        className="text-xs font-medium py-1 px-2.5"
                      >
                        {task.status === 'in-progress' 
                          ? 'Devam Ediyor' 
                          : task.status === 'completed' 
                          ? 'Tamamlandı' 
                          : 'Bekliyor'
                        }
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-slate-200 rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(task)} className="cursor-pointer hover:bg-slate-100">
                            <Edit className="h-4 w-4 mr-2 text-blue-600" /> Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Durum Değiştir</DropdownMenuLabel>
                          {task.status !== 'todo' && (
                            <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'todo')} className="cursor-pointer hover:bg-slate-100">
                              <Calendar className="h-4 w-4 mr-2 text-gray-600" /> Bekliyor
                            </DropdownMenuItem>
                          )}
                          {task.status !== 'in-progress' && (
                            <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'in-progress')} className="cursor-pointer hover:bg-slate-100">
                              <Calendar className="h-4 w-4 mr-2 text-indigo-600" /> Devam Ediyor
                            </DropdownMenuItem>
                          )}
                          {task.status !== 'completed' && (
                            <DropdownMenuItem onClick={() => updateTaskStatus(task.id, 'completed')} className="cursor-pointer hover:bg-slate-100">
                              <Check className="h-4 w-4 mr-2 text-green-600" /> Tamamlandı
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 cursor-pointer hover:bg-red-50"
                            onClick={() => onDeleteTask && onDeleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{task.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">Son: {new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Yeni Görev Ekleme Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Görev Ekle</DialogTitle>
            <DialogDescription>
              Yeni bir görev oluşturmak için aşağıdaki formu doldurun.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right">
                Başlık
              </label>
              <Input
                id="title"
                className="col-span-3"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right">
                Açıklama
              </label>
              <Textarea
                id="description"
                className="col-span-3"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="priority" className="text-right">
                Öncelik
              </label>
              <Select
                value={newTask.priority}
                onValueChange={(value: 'high' | 'medium' | 'low') => 
                  setNewTask({ ...newTask, priority: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Öncelik Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="low">Düşük</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="dueDate" className="text-right">
                Son Tarih
              </label>
              <Input
                id="dueDate"
                type="date"
                className="col-span-3"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="tags" className="text-right">
                Etiketler
              </label>
              <div className="col-span-3 flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Yeni etiket (Enter ile ekleyin)"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddTag}
                  >
                    Ekle
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {newTask.tags?.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1 bg-slate-200 text-slate-800 px-2 py-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              İptal
            </Button>
            <Button type="button" onClick={handleAddTask} disabled={!newTask.title}>
              Görev Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Görev Düzenleme Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Görevi Düzenle</DialogTitle>
            <DialogDescription>
              Görevi düzenlemek için aşağıdaki formu kullanın.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-title" className="text-right">
                Başlık
              </label>
              <Input
                id="edit-title"
                className="col-span-3"
                value={editTask.title}
                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-description" className="text-right">
                Açıklama
              </label>
              <Textarea
                id="edit-description"
                className="col-span-3"
                value={editTask.description}
                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-priority" className="text-right">
                Öncelik
              </label>
              <Select
                value={editTask.priority}
                onValueChange={(value: 'high' | 'medium' | 'low') => 
                  setEditTask({ ...editTask, priority: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Öncelik Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="low">Düşük</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-status" className="text-right">
                Durum
              </label>
              <Select
                value={editTask.status}
                onValueChange={(value: 'in-progress' | 'todo' | 'completed') => 
                  setEditTask({ ...editTask, status: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Durum Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Bekliyor</SelectItem>
                  <SelectItem value="in-progress">Devam Ediyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-dueDate" className="text-right">
                Son Tarih
              </label>
              <Input
                id="edit-dueDate"
                type="date"
                className="col-span-3"
                value={editTask.dueDate}
                onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-tags" className="text-right">
                Etiketler
              </label>
              <div className="col-span-3 flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    id="edit-tags"
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    placeholder="Yeni etiket (Enter ile ekleyin)"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleEditTag();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleEditTag}
                  >
                    Ekle
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {editTask.tags?.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1 bg-slate-200 text-slate-800 px-2 py-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
                        onClick={() => handleRemoveEditTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              İptal
            </Button>
            <Button type="button" onClick={handleEditTask} disabled={!editTask.title}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 