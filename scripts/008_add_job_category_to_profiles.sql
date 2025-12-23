-- Add job_category_id to profiles table to track employee's current job
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS job_category_id UUID REFERENCES job_categories(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_job_category ON profiles(job_category_id);
