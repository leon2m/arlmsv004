-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  course_id UUID REFERENCES courses(id),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- Add RLS policies for enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own enrollments
CREATE POLICY "Users can view their own enrollments"
  ON enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to enroll in courses
CREATE POLICY "Users can enroll in courses"
  ON enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own enrollments
CREATE POLICY "Users can update their own enrollments"
  ON enrollments
  FOR UPDATE
  USING (auth.uid() = user_id);