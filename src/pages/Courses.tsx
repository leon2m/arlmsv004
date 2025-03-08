import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, courseService } from '@/services/courseService';
import { useAuth } from '@/hooks/useAuth';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { badgeVariants } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Auth yükleniyorsa bekle
    if (authLoading) {
      return;
    }

    const fetchCourses = async () => {
      try {
        if (!user) {
          console.log('Kullanıcı oturumu bulunamadı, giriş sayfasına yönlendiriliyor');
          setError('Oturum açmanız gerekiyor. Lütfen giriş yapın.');
          // Kullanıcı oturumu yoksa giriş sayfasına yönlendir
          setTimeout(() => navigate('/auth/login'), 2000);
          return;
        }

        if (!user.id) {
          console.error('Kullanıcı kimliği bulunamadı:', user);
          setError('Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.');
          return;
        }
        
        console.log('Kurslar getiriliyor, kullanıcı ID:', user.id);
        const userCourses = await courseService.getUserCourses(user.id);
        setCourses(userCourses);
        setError(null);
      } catch (err: any) {
        console.error('Kurslar yüklenirken hata:', err);
        setError(err.message || 'Kurslar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <Button 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kurslarım</h1>
        <Button onClick={() => navigate('/courses/browse')}>
          Yeni Kurs Keşfet
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl mb-4">Henüz kayıtlı kursunuz bulunmuyor.</h2>
          <Button onClick={() => navigate('/courses/browse')}>
            Kursları Keşfedin
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    course.level === 'beginner' 
                      ? 'bg-blue-100 text-blue-800 border-blue-200' 
                      : course.level === 'intermediate' 
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {course.level === 'beginner' ? 'Başlangıç' : course.level === 'intermediate' ? 'Orta Seviye' : 'İleri Seviye'}
                  </div>
                  <div className={badgeVariants({ variant: "outline" })}>{course.category}</div>
                </div>
                <CardTitle className="mt-2">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <span className="mr-2">📚</span>
                      <span>{course.lessons?.length || 0} Ders</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">⏱️</span>
                      <span>{course.duration || 0} Saat</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">🏆</span>
                      <span>Sertifika</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>İlerleme</span>
                      <span>%{Math.round(course.progress || 0)}</span>
                    </div>
                    <Progress value={course.progress || 0} />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    Kursa Devam Et
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};