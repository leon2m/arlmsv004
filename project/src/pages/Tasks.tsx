import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { taskService } from '@/services/taskService';
import { TaskList } from '@/components/dashboard/TaskList';
import { Task } from '@/components/dashboard/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Görevleri yükle
  const fetchTasks = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await taskService.getUserTasks(user.id);
      
      if (error) {
        console.error('Görevler yüklenirken hata:', error);
        toast({
          title: 'Hata',
          description: 'Görevler yüklenirken bir sorun oluştu.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      // Artık format dönüşümü service katmanında yapılıyor
      setTasks(data || []);
    } catch (error) {
      console.error('Görevler yüklenirken beklenmeyen hata:', error);
      toast({
        title: 'Hata',
        description: 'Görevler yüklenirken bir sorun oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Yeni görev ekle
  const handleAddTask = async (taskData: Partial<Task>) => {
    if (!user) return;
    
    try {
      const newTaskData = {
        title: taskData.title || '',
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || new Date().toISOString().slice(0, 10),
        status: taskData.status || 'todo',
        tags: taskData.tags || [],
        user_id: user.id
      };
      
      console.log('Gönderilecek görev verileri:', newTaskData);
      
      const { data, error } = await taskService.createTask(newTaskData);
      
      if (error) {
        console.error('Görev eklenirken hata:', error);
        toast({
          title: 'Hata',
          description: 'Görev eklenirken bir sorun oluştu.',
          variant: 'destructive',
        });
        return;
      }
      
      if (data) {
        // Servis katmanı artık doğru formatta Task nesnesi döndürüyor
        setTasks(prevTasks => [data, ...prevTasks]);
        
        toast({
          title: 'Başarılı',
          description: 'Yeni görev başarıyla eklendi.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Görev eklenirken beklenmeyen hata:', error);
      toast({
        title: 'Hata',
        description: 'Görev eklenirken bir sorun oluştu.',
        variant: 'destructive',
      });
    }
  };

  // Görev güncelle
  const handleUpdateTask = async (taskId: string, updatedData: Partial<Task>) => {
    try {
      // API'nin beklediği alan adı dönüşümü
      const apiData = {
        ...updatedData,
        due_date: updatedData.dueDate
      };
      
      delete (apiData as any).dueDate; // API'ye gönderilmemesi gereken alanı kaldır
      
      const { data, error } = await taskService.updateTask(taskId, apiData as any);
      
      if (error) {
        console.error('Görev güncellenirken hata:', error);
        toast({
          title: 'Hata',
          description: 'Görev güncellenirken bir sorun oluştu.',
          variant: 'destructive',
        });
        return;
      }
      
      if (data) {
        // Güncellenen görevi UI formatına dönüştür
        const updatedTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description,
          priority: data.priority,
          dueDate: data.due_date,
          status: data.status,
          tags: data.tags || [],
          user_id: data.user_id,
          created_at: data.created_at
        };
        
        setTasks(prevTasks => 
          prevTasks.map(task => task.id === taskId ? updatedTask : task)
        );
        
        toast({
          title: 'Başarılı',
          description: 'Görev başarıyla güncellendi.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Görev güncellenirken beklenmeyen hata:', error);
      toast({
        title: 'Hata',
        description: 'Görev güncellenirken bir sorun oluştu.',
        variant: 'destructive',
      });
    }
  };

  // Görev sil
  const handleDeleteTask = async (taskId: string) => {
    try {
      const { success, error } = await taskService.deleteTask(taskId);
      
      if (error) {
        console.error('Görev silinirken hata:', error);
        toast({
          title: 'Hata',
          description: 'Görev silinirken bir sorun oluştu.',
          variant: 'destructive',
        });
        return;
      }
      
      if (success) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        
        toast({
          title: 'Başarılı',
          description: 'Görev başarıyla silindi.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Görev silinirken beklenmeyen hata:', error);
      toast({
        title: 'Hata',
        description: 'Görev silinirken bir sorun oluştu.',
        variant: 'destructive',
      });
    }
  };

  // Kullanıcı değiştiğinde görevleri yükle
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
      setIsLoading(false);
    }
  }, [user]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Görevlerim</h1>
        <Button onClick={() => fetchTasks()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <TaskList 
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tasks; 