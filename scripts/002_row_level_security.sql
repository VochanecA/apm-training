-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins and instructors can view all profiles
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor', 'inspector')
    )
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update all profiles
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert profiles
CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- AIRPORTS POLICIES
-- ============================================

-- Everyone can view airports
CREATE POLICY "airports_select_all" ON airports
  FOR SELECT USING (true);

-- Only admins can manage airports
CREATE POLICY "airports_manage_admin" ON airports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- EMPLOYEE_AIRPORTS POLICIES
-- ============================================

-- Users can view their own airport assignments
CREATE POLICY "employee_airports_select_own" ON employee_airports
  FOR SELECT USING (employee_id = auth.uid());

-- Admins can view all assignments
CREATE POLICY "employee_airports_select_admin" ON employee_airports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

-- Only admins can manage assignments
CREATE POLICY "employee_airports_manage_admin" ON employee_airports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- JOB CATEGORIES POLICIES
-- ============================================

-- Everyone can view job categories
CREATE POLICY "job_categories_select_all" ON job_categories
  FOR SELECT USING (true);

-- Only admins can manage job categories
CREATE POLICY "job_categories_manage_admin" ON job_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- TRAINING PROGRAMS POLICIES
-- ============================================

-- Everyone can view training programs
CREATE POLICY "training_programs_select_all" ON training_programs
  FOR SELECT USING (true);

-- Admins and instructors can manage programs
CREATE POLICY "training_programs_manage" ON training_programs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

-- ============================================
-- TRAINING MODULES POLICIES
-- ============================================

-- Everyone can view modules
CREATE POLICY "training_modules_select_all" ON training_modules
  FOR SELECT USING (true);

-- Admins and instructors can manage modules
CREATE POLICY "training_modules_manage" ON training_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

-- ============================================
-- TRAININGS POLICIES
-- ============================================

-- Users can view their own trainings
CREATE POLICY "trainings_select_own" ON trainings
  FOR SELECT USING (trainee_id = auth.uid());

-- Instructors can view trainings they're assigned to
CREATE POLICY "trainings_select_instructor" ON trainings
  FOR SELECT USING (
    instructor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'inspector')
    )
  );

-- Instructors and admins can manage trainings
CREATE POLICY "trainings_manage" ON trainings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

-- ============================================
-- TRAINING SESSIONS POLICIES
-- ============================================

-- Trainees can view their sessions
CREATE POLICY "training_sessions_select_trainee" ON training_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trainings WHERE trainings.id = training_sessions.training_id AND trainings.trainee_id = auth.uid()
    )
  );

-- Instructors and admins can view all sessions
CREATE POLICY "training_sessions_select_staff" ON training_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor', 'inspector')
    )
  );

-- Instructors and admins can manage sessions
CREATE POLICY "training_sessions_manage" ON training_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

-- ============================================
-- CERTIFICATES POLICIES
-- ============================================

-- Users can view their own certificates
CREATE POLICY "certificates_select_own" ON certificates
  FOR SELECT USING (trainee_id = auth.uid());

-- Staff can view all certificates
CREATE POLICY "certificates_select_staff" ON certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor', 'inspector')
    )
  );

-- Only admins can manage certificates
CREATE POLICY "certificates_manage_admin" ON certificates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- EXAMINATIONS POLICIES
-- ============================================

-- Trainees can view their own exams
CREATE POLICY "examinations_select_own" ON examinations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trainings WHERE trainings.id = examinations.training_id AND trainings.trainee_id = auth.uid()
    )
  );

-- Staff can view all exams
CREATE POLICY "examinations_select_staff" ON examinations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor', 'inspector')
    )
  );

-- Admins and commission members can manage exams
CREATE POLICY "examinations_manage" ON examinations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

-- Only admins and inspectors can view audit logs
CREATE POLICY "audit_logs_select_admin" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'inspector')
    )
  );

-- System can insert audit logs
CREATE POLICY "audit_logs_insert_system" ON audit_logs
  FOR INSERT WITH CHECK (true);
