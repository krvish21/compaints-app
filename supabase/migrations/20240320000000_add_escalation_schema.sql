-- Create enum for complaint status
CREATE TYPE complaint_status AS ENUM ('pending', 'upheld', 'resolved', 'ok');
CREATE TYPE plea_status AS ENUM ('pending', 'accepted', 'rejected');

-- Update complaints table
ALTER TABLE complaints 
  ADD COLUMN status complaint_status DEFAULT 'pending',
  ADD COLUMN escalated_at TIMESTAMPTZ,
  ADD COLUMN escalated_by UUID REFERENCES user_profiles(user_id);

-- Create pleas table
CREATE TABLE pleas (
  plea_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES complaints(complaint_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  status plea_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL
);

-- No need for these constraints as they were already defined in the initial schema
-- with the correct column names and relationships 