-- RLS Politikaları
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Politikalarını Tanımla
CREATE POLICY "Kullanıcılar kendi profillerini görebilir"
  ON user_profiles FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Kullanıcılar kendi istatistiklerini görebilir"
  ON user_stats FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Kullanıcılar kendi aktivitelerini görebilir"
  ON activities FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Herkes etkinlikleri görebilir"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Herkes kursları görebilir"
  ON courses FOR SELECT
  USING (true);

CREATE POLICY "Herkes yetkinlik setlerini görebilir"
  ON competency_sets FOR SELECT
  USING (true);

CREATE POLICY "Herkes yetkinlikleri görebilir"
  ON competencies FOR SELECT
  USING (true);

CREATE POLICY "Kullanıcılar kendi yetkinliklerini görebilir"
  ON user_competencies FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Kullanıcılar kendilerine atanan görevleri görebilir"
  ON tasks FOR SELECT
  USING (auth.uid()::text = assigned_to::text);
