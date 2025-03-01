-- Örnek Kullanıcı Verisi
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

-- Örnek Kullanıcı İstatistikleri
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

-- Örnek Aktiviteler
INSERT INTO activities (user_id, title, timestamp, icon_type, icon_bg)
SELECT 
  id,
  unnest(ARRAY[
    'React.js Kursunu Tamamladı',
    'Yeni Rozet Kazandı: TypeScript Master',
    'Node.js Projesine Başladı'
  ]),
  CURRENT_TIMESTAMP - interval '1 hour' * unnest(ARRAY[2, 4, 24]),
  unnest(ARRAY['Trophy', 'Medal', 'Rocket']),
  unnest(ARRAY['bg-yellow-100', 'bg-purple-100', 'bg-blue-100'])
FROM user_profiles
WHERE full_name = 'Ramazan Çakıcı';

-- Örnek Etkinlikler
INSERT INTO events (title, event_date, icon_type, icon_bg)
VALUES 
  ('React Workshop', CURRENT_TIMESTAMP + interval '2 days', 'BookOpen', 'bg-blue-100'),
  ('TypeScript Webinar', CURRENT_TIMESTAMP + interval '4 days', 'GraduationCap', 'bg-purple-100'),
  ('Team Code Review', CURRENT_TIMESTAMP + interval '6 days', 'Users', 'bg-green-100');

-- Örnek Kurslar
INSERT INTO courses (title, instructor_id, duration, rating, students, image_url, price, level, language, last_updated, topics, includes) 
SELECT 
  unnest(ARRAY[
    'React Performance Optimization',
    'TypeScript Advanced Types',
    'Node.js Microservices',
    'Advanced Level Python'
  ]),
  id,
  unnest(ARRAY['4 saat', '3.5 saat', '6 saat', '6 saat']),
  unnest(ARRAY[4.9, 4.8, 4.7, 4.7]),
  unnest(ARRAY[1250, 980, 850, 1250]),
  unnest(ARRAY[
    'https://www.svgrepo.com/show/521303/react-16.svg',
    'https://www.svgrepo.com/show/342317/typescript.svg',
    'https://www.svgrepo.com/show/369459/nodejs.svg',
    'https://www.svgrepo.com/show/512738/python-127.svg'
  ]),
  unnest(ARRAY[299, 249, 399, 399]),
  'İleri Seviye',
  'Türkçe',
  CURRENT_TIMESTAMP,
  ARRAY['React.memo', 'useMemo', 'useCallback', 'Code Splitting'],
  ARRAY['4 saat video', '15 alıştırma', '5 proje', 'Sertifika']
FROM user_profiles 
WHERE full_name = 'Ramazan Çakıcı'
LIMIT 1;
