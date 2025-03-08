-- Yetkinlik setleri verileri
INSERT INTO competency_sets (id, name, description, category) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'İletişim Yetkinlikleri', 'Etkili iletişim ve işbirliği becerileri', 'Soft Skills'),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Teknik Yetkinlikler', 'Teknik ve mesleki beceriler', 'Hard Skills'),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Liderlik Yetkinlikleri', 'Liderlik ve yönetim becerileri', 'Leadership');

-- Yetkinlikler verileri
INSERT INTO competencies (set_id, name, description, min_score, max_score) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Ekip İçi İletişim', 'Ekip üyeleriyle etkili iletişim kurabilme', 1, 5),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Sunum Becerileri', 'Etkili sunum yapabilme ve bilgi aktarımı', 1, 5),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Problem Çözme', 'Analitik düşünme ve problem çözme', 1, 5),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Teknik Dokümantasyon', 'Teknik belgeleme ve raporlama', 1, 5),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Stratejik Düşünme', 'Stratejik planlama ve karar verme', 1, 5),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Ekip Yönetimi', 'Ekip koordinasyonu ve motivasyonu', 1, 5);

-- Kullanıcı yetkinlikleri verileri
INSERT INTO user_competencies (user_id, competency_id, current_score, target_score)
SELECT 
  'f47ac10b-58cc-4372-a567-0e02b2c3d481'::uuid as user_id,
  c.id as competency_id,
  ROUND(CAST(random() * 3 + 2 AS numeric), 1) as current_score,
  5.0 as target_score
FROM competencies c;
