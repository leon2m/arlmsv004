-- Örnek veriler
-- Kullanıcı profili
INSERT INTO user_profiles (
  id,
  full_name,
  avatar_url,
  email,
  role,
  department,
  location,
  bio
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d481',
  'Ramazan Çakıcı',
  'https://github.com/shadcn.png',
  'ramazan@example.com',
  'Senior Developer',
  'Engineering',
  'İstanbul',
  'Full-stack developer with focus on React and Node.js'
);

-- Örnek öğretmenler
INSERT INTO user_profiles (id, full_name, email, role, department, location, bio) VALUES
('11111111-1111-1111-1111-111111111111', 'Prof. Dr. Ahmet Yılmaz', 'ahmet.yilmaz@example.com', 'teacher', 'Bilgisayar Mühendisliği', 'Ankara', 'Bilgisayar mühendisliği profesörü'),
('22222222-2222-2222-2222-222222222222', 'Doç. Dr. Ayşe Kaya', 'ayse.kaya@example.com', 'teacher', 'Matematik', 'İstanbul', 'Matematik doçenti');

-- Örnek öğrenciler
INSERT INTO user_profiles (id, full_name, email, role, department, location, bio) VALUES
('33333333-3333-3333-3333-333333333333', 'Mehmet Demir', 'mehmet.demir@example.com', 'student', 'Bilgisayar Mühendisliği', 'Ankara', 'Bilgisayar mühendisliği öğrencisi'),
('44444444-4444-4444-4444-444444444444', 'Zeynep Yıldız', 'zeynep.yildiz@example.com', 'student', 'Matematik', 'İstanbul', 'Matematik öğrencisi'),
('55555555-5555-5555-5555-555555555555', 'Can Özkan', 'can.ozkan@example.com', 'student', 'Bilgisayar Mühendisliği', 'Ankara', 'Bilgisayar mühendisliği öğrencisi');

-- Örnek kurslar
INSERT INTO courses (title, instructor_id, duration, rating, students, image_url, price, level, language, last_updated, topics, includes) VALUES
('İleri Python Programlama', '11111111-1111-1111-1111-111111111111', '4 saat', 4.9, 1250, 'https://www.svgrepo.com/show/512738/python-127.svg', 299, 'İleri Seviye', 'Türkçe', CURRENT_TIMESTAMP, ARRAY['Python Decorators', 'Generator Functions'], ARRAY['4 saat video', '15 alıştırma', '5 proje', 'Sertifika']),
('Temel Matematik', '22222222-2222-2222-2222-222222222222', '3.5 saat', 4.8, 980, 'https://www.svgrepo.com/show/342317/typescript.svg', 249, 'Temel Seviye', 'Türkçe', CURRENT_TIMESTAMP, ARRAY['Temel Cebir', 'Fonksiyonlar'], ARRAY['3.5 saat video', '10 alıştırma', '3 proje', 'Sertifika']),
('Web Geliştirme Temelleri', '11111111-1111-1111-1111-111111111111', '6 saat', 4.7, 850, 'https://www.svgrepo.com/show/369459/nodejs.svg', 399, 'İleri Seviye', 'Türkçe', CURRENT_TIMESTAMP, ARRAY['HTML Temelleri', 'CSS Styling'], ARRAY['6 saat video', '20 alıştırma', '10 proje', 'Sertifika']);

-- Örnek aktiviteler
INSERT INTO activities (user_id, title, timestamp, icon_type, icon_bg)
SELECT 
  'f47ac10b-58cc-4372-a567-0e02b2c3d481'::uuid,
  unnest(ARRAY[
    'React.js Kursunu Tamamladı',
    'Yeni Rozet Kazandı: TypeScript Master',
    'Node.js Projesine Başladı'
  ]),
  CURRENT_TIMESTAMP - (interval '1 hour' * unnest(ARRAY[2, 4, 24])),
  unnest(ARRAY['Trophy', 'Medal', 'Rocket']),
  unnest(ARRAY['bg-yellow-100', 'bg-purple-100', 'bg-blue-100']);

-- Örnek etkinlikler
INSERT INTO events (title, event_date, icon_type, icon_bg) VALUES 
('React Workshop', CURRENT_TIMESTAMP + interval '2 days', 'BookOpen', 'bg-blue-100'),
('TypeScript Webinar', CURRENT_TIMESTAMP + interval '4 days', 'GraduationCap', 'bg-purple-100'),
('Team Code Review', CURRENT_TIMESTAMP + interval '6 days', 'Users', 'bg-green-100');

-- Örnek kullanıcı istatistikleri
INSERT INTO user_stats (
  user_id,
  xp,
  level,
  completed_trainings,
  monthly_completions,
  streak,
  longest_streak,
  badges,
  total_hours,
  courses_in_progress,
  certificates_earned,
  contributions
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d481',
  3750,
  8,
  24,
  6,
  12,
  21,
  15,
  156,
  3,
  8,
  45
);

-- Örnek görevler
INSERT INTO tasks (title, description, priority, due_date, status, tags, assigned_to) VALUES
('React Hooks Öğrenimi', 'useState ve useEffect hooklarını öğren', 'Yüksek', CURRENT_TIMESTAMP + interval '3 days', 'Devam Ediyor', ARRAY['react', 'frontend'], 'f47ac10b-58cc-4372-a567-0e02b2c3d481'),
('TypeScript Projesi', 'Örnek bir TypeScript projesi geliştir', 'Orta', CURRENT_TIMESTAMP + interval '5 days', 'Beklemede', ARRAY['typescript', 'project'], 'f47ac10b-58cc-4372-a567-0e02b2c3d481'),
('API Dokümantasyonu', 'REST API dokümantasyonunu güncelle', 'Düşük', CURRENT_TIMESTAMP + interval '7 days', 'Başlanmadı', ARRAY['documentation', 'api'], 'f47ac10b-58cc-4372-a567-0e02b2c3d481');
