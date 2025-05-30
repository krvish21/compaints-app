-- Drop existing types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS complaint_mood CASCADE;

-- Create enum types
CREATE TYPE user_role AS ENUM ('boyfriend', 'girlfriend');
CREATE TYPE complaint_mood AS ENUM ('angry', 'sad', 'disappointed', 'hurt', 'annoyed');

-- Drop existing tables if they exist
DROP TABLE IF EXISTS fulfilled_compensations CASCADE;
DROP TABLE IF EXISTS offered_compensations CASCADE;
DROP TABLE IF EXISTS compensations CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS replies CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user profiles table
CREATE TABLE user_profiles (
  user_id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_role UNIQUE (role)
);

-- Create complaints table
CREATE TABLE complaints (
  complaint_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  mood complaint_mood NOT NULL,
  created_by UUID REFERENCES user_profiles(user_id) NOT NULL,
  escalated BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create replies table
CREATE TABLE replies (
  reply_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(user_id) NOT NULL,
  parent_reply_id UUID REFERENCES replies(reply_id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reactions table
CREATE TABLE reactions (
  reaction_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID REFERENCES replies(reply_id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(user_id) NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reply_id, user_id, emoji)
);

-- Create compensations table
CREATE TABLE compensations (
  compensation_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES user_profiles(user_id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create offered_compensations table
CREATE TABLE offered_compensations (
  offered_compensation_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE CASCADE,
  compensation_id UUID REFERENCES compensations(compensation_id) NOT NULL,
  offered_by UUID REFERENCES user_profiles(user_id) NOT NULL,
  "order" SMALLINT CHECK ("order" BETWEEN 1 AND 5),
  scratched BOOLEAN DEFAULT false,
  selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(complaint_id, "order")
);

-- Create fulfilled_compensations table
CREATE TABLE fulfilled_compensations (
  fulfilled_compensation_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  offered_compensation_id UUID REFERENCES offered_compensations(offered_compensation_id) NOT NULL,
  fulfilled_by UUID REFERENCES user_profiles(user_id) NOT NULL,
  fulfilled_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compensations ENABLE ROW LEVEL SECURITY;
ALTER TABLE offered_compensations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfilled_compensations ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read all users
CREATE POLICY "Users can read all users" ON user_profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can read all complaints
CREATE POLICY "Users can read all complaints" ON complaints
  FOR SELECT USING (true);

-- Users can create their own complaints
CREATE POLICY "Users can create their own complaints" ON complaints
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Only complaint creator can update their complaints
CREATE POLICY "Only complaint creator can update their complaints" ON complaints
  FOR UPDATE USING (auth.uid() = created_by);

-- Only girlfriend can escalate/de-escalate/resolve complaints
CREATE POLICY "Only girlfriend can escalate or resolve" ON complaints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'girlfriend'
    )
  );

-- Users can read all replies
CREATE POLICY "Users can read all replies" ON replies
  FOR SELECT USING (true);

-- Users can create their own replies
CREATE POLICY "Users can create their own replies" ON replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own replies
CREATE POLICY "Users can update their own replies" ON replies
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own replies
CREATE POLICY "Users can delete their own replies" ON replies
  FOR DELETE USING (auth.uid() = user_id);

-- Users can read all reactions
CREATE POLICY "Users can read all reactions" ON reactions
  FOR SELECT USING (true);

-- Users can create their own reactions
CREATE POLICY "Users can create their own reactions" ON reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions" ON reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Only girlfriend can manage compensations
CREATE POLICY "Only girlfriend can manage compensations" ON compensations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'girlfriend'
    )
  );

-- Users can read all compensations
CREATE POLICY "Users can read all compensations" ON compensations
  FOR SELECT USING (true);

-- Only boyfriend can offer compensations
CREATE POLICY "Only boyfriend can offer compensations" ON offered_compensations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'boyfriend'
    )
  );

-- Users can read all offered compensations
CREATE POLICY "Users can read all offered compensations" ON offered_compensations
  FOR SELECT USING (true);

-- Only boyfriend can fulfill compensations
CREATE POLICY "Only boyfriend can fulfill compensations" ON fulfilled_compensations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'boyfriend'
    )
  );

-- Users can read all fulfilled compensations
CREATE POLICY "Users can read all fulfilled compensations" ON fulfilled_compensations
  FOR SELECT USING (true);

-- Create functions and triggers
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 