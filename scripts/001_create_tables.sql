-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AIRPORTS & LOCATIONS
-- ============================================
CREATE TABLE airports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('airport', 'heliodrome', 'training_facility')),
  location TEXT NOT NULL,
  country VARCHAR(2) DEFAULT 'ME',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PROFILES & ROLES
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  employee_id VARCHAR(50) UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'instructor', 'trainee', 'inspector')),
  date_of_birth DATE,
  place_of_birth TEXT,
  nationality VARCHAR(2) DEFAULT 'ME',
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMPLOYEE-AIRPORT ASSIGNMENTS (Multi-airport support)
-- ============================================
CREATE TABLE employee_airports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  airport_id UUID NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, airport_id)
);

-- ============================================
-- JOB CATEGORIES (Article 22)
-- ============================================
CREATE TABLE job_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_me TEXT NOT NULL,
  requires_certificate BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRAINING PROGRAMS
-- ============================================
CREATE TABLE training_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  job_category_id UUID REFERENCES job_categories(id),
  description TEXT,
  theoretical_hours INTEGER DEFAULT 0,
  practical_hours INTEGER DEFAULT 0,
  ojt_hours INTEGER DEFAULT 0,
  total_hours INTEGER GENERATED ALWAYS AS (theoretical_hours + practical_hours + ojt_hours) STORED,
  approval_number TEXT,
  approval_date DATE,
  approved_by TEXT,
  version VARCHAR(20) DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRAINING MODULES
-- ============================================
CREATE TABLE training_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN ('theoretical', 'practical', 'ojt')),
  duration_hours INTEGER NOT NULL,
  sequence_number INTEGER NOT NULL,
  content TEXT,
  learning_objectives TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRAININGS (Individual training records)
-- ============================================
CREATE TABLE trainings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainee_id UUID NOT NULL REFERENCES profiles(id),
  program_id UUID NOT NULL REFERENCES training_programs(id),
  airport_id UUID NOT NULL REFERENCES airports(id),
  instructor_id UUID REFERENCES profiles(id),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'cancelled')),
  completion_percentage INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRAINING SESSIONS
-- ============================================
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES training_modules(id),
  session_date DATE NOT NULL,
  duration_hours DECIMAL(4,2) NOT NULL,
  instructor_id UUID REFERENCES profiles(id),
  location TEXT,
  topics_covered TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MODULE COMPLETION RECORDS
-- ============================================
CREATE TABLE module_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES training_modules(id),
  completed_date DATE NOT NULL,
  score DECIMAL(5,2),
  passed BOOLEAN DEFAULT false,
  instructor_id UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(training_id, module_id)
);

-- ============================================
-- EXAMINATION COMMISSIONS
-- ============================================
CREATE TABLE exam_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  airport_id UUID REFERENCES airports(id),
  chairman_id UUID NOT NULL REFERENCES profiles(id),
  approval_number TEXT,
  approval_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMMISSION MEMBERS
-- ============================================
CREATE TABLE commission_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commission_id UUID NOT NULL REFERENCES exam_commissions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id),
  role TEXT CHECK (role IN ('chairman', 'member', 'secretary')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(commission_id, member_id)
);

-- ============================================
-- EXAMINATIONS
-- ============================================
CREATE TABLE examinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_id UUID NOT NULL REFERENCES trainings(id),
  commission_id UUID NOT NULL REFERENCES exam_commissions(id),
  exam_type TEXT NOT NULL CHECK (exam_type IN ('theoretical', 'practical', 'skill_check')),
  exam_date DATE NOT NULL,
  airport_id UUID NOT NULL REFERENCES airports(id),
  score DECIMAL(5,2),
  max_score DECIMAL(5,2) DEFAULT 100,
  pass_threshold DECIMAL(5,2) DEFAULT 80,
  passed BOOLEAN GENERATED ALWAYS AS (score >= pass_threshold) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CERTIFICATES
-- ============================================
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  trainee_id UUID NOT NULL REFERENCES profiles(id),
  job_category_id UUID NOT NULL REFERENCES job_categories(id),
  training_id UUID REFERENCES trainings(id),
  airport_id UUID NOT NULL REFERENCES airports(id),
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'revoked', 'suspended')),
  issued_by UUID REFERENCES profiles(id),
  theoretical_exam_id UUID REFERENCES examinations(id),
  practical_exam_id UUID REFERENCES examinations(id),
  qr_code TEXT,
  pdf_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANNUAL SKILL CHECKS
-- ============================================
CREATE TABLE skill_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id UUID NOT NULL REFERENCES certificates(id),
  trainee_id UUID NOT NULL REFERENCES profiles(id),
  check_date DATE NOT NULL,
  due_date DATE NOT NULL,
  examiner_id UUID NOT NULL REFERENCES profiles(id),
  airport_id UUID NOT NULL REFERENCES airports(id),
  passed BOOLEAN DEFAULT false,
  score DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_employee_id ON profiles(employee_id);
CREATE INDEX idx_employee_airports_employee ON employee_airports(employee_id);
CREATE INDEX idx_employee_airports_airport ON employee_airports(airport_id);
CREATE INDEX idx_trainings_trainee ON trainings(trainee_id);
CREATE INDEX idx_trainings_airport ON trainings(airport_id);
CREATE INDEX idx_trainings_status ON trainings(status);
CREATE INDEX idx_certificates_trainee ON certificates(trainee_id);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_expiry ON certificates(expiry_date);
CREATE INDEX idx_examinations_training ON examinations(training_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_programs_updated_at BEFORE UPDATE ON training_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON trainings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
