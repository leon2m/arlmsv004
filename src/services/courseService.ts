import { supabase } from './api';

export interface Lesson {
  id: number;
  title: string;
  duration_minutes: number;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor_id: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
  progress?: number;
  duration?: number;
  last_accessed?: string;
  completed_at?: string;
}

export const courseService = {
  async getUserCourses(userId: string): Promise<Course[]> {
    if (!userId) {
      console.error('getUserCourses: userId is undefined or null');
      throw new Error('Kullanıcı kimliği bulunamadı');
    }
    
    console.log('Getting courses for user:', userId);
    
    try {
      // Önce kullanıcının var olup olmadığını kontrol et
      const { data: userExists, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (userError) {
        console.error('Error checking user existence:', userError);
        // Kullanıcı kontrolünde hata olursa devam et, kritik değil
      } else if (!userExists) {
        console.warn('User not found in profiles table:', userId);
        // Kullanıcı bulunamadı, ancak yine de devam edebiliriz
      }
      
      // Kullanıcının kayıtlı olduğu kursları getir
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id, progress, last_accessed, completed_at')
        .eq('user_id', userId);
      
      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        
        // Enrollments tablosu yoksa veya erişim hatası varsa boş dizi döndür
        if (enrollmentsError.code === '42P01' || enrollmentsError.code === 'PGRST301') {
          console.warn('Enrollments table may not exist or access denied');
          return [];
        }
        
        throw new Error('Kayıt bilgileri alınamadı: ' + enrollmentsError.message);
      }
      
      if (!enrollments || enrollments.length === 0) {
        console.log('No enrollments found for user');
        return [];
      }
      
      // Kayıtlı kursların ID'lerini al
      const courseIds = enrollments.map((e: { course_id: string | number }) => e.course_id);
      
      if (courseIds.length === 0) {
        console.log('No course IDs found in enrollments');
        return [];
      }
      
      // Kursları getir
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          lessons (
            id,
            title,
            duration_minutes
          )
        `)
        .in('id', courseIds);
      
      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        
        // Courses tablosu yoksa veya erişim hatası varsa boş dizi döndür
        if (coursesError.code === '42P01' || coursesError.code === 'PGRST301') {
          console.warn('Courses table may not exist or access denied');
          return [];
        }
        
        throw new Error('Kurs bilgileri alınamadı: ' + coursesError.message);
      }
      
      if (!courses || courses.length === 0) {
        console.log('No courses found with the given IDs');
        return [];
      }
      
      // Kursları ve kayıt bilgilerini birleştir
      const coursesWithProgress = courses.map((course: Course) => {
        const enrollment = enrollments.find((e: { course_id: string | number }) => e.course_id === course.id);
        
        // Kurs süresini hesapla
        let totalDuration = 0;
        if (course.lessons && course.lessons.length > 0) {
          totalDuration = course.lessons.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0) / 60; // Saat cinsinden
        }
        
        return {
          ...course,
          progress: enrollment?.progress || 0,
          last_accessed: enrollment?.last_accessed,
          completed_at: enrollment?.completed_at,
          duration: parseFloat(totalDuration.toFixed(1)) // Bir ondalık basamağa yuvarla
        };
      });
      
      console.log(`Retrieved ${coursesWithProgress.length} courses for user`);
      return coursesWithProgress;
    } catch (error: any) {
      console.error('Failed to get user courses:', error);
      
      // Daha açıklayıcı hata mesajı
      if (error.message && error.message.includes('JWT')) {
        throw new Error('Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.');
      }
      
      throw error;
    }
  },

  async getCourseDetails(courseId: number): Promise<Course> {
    try {
      if (!courseId) {
        throw new Error('Kurs ID\'si gereklidir');
      }
      
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons (
            id,
            title,
            duration_minutes,
            content
          )
        `)
        .eq('id', courseId)
        .single();

      if (error) {
        console.error('Error fetching course details:', error);
        throw new Error('Kurs detayları alınamadı: ' + error.message);
      }
      
      if (!data) {
        throw new Error('Kurs bulunamadı');
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get course details:', error);
      throw error;
    }
  }
};
