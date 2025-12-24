-- ============================================
-- FINAL FIX FOR INFINITE RECURSION IN RLS POLICIES
-- Use SECURITY DEFINER function that bypasses RLS
-- ============================================

-- Drop the problematic function
DROP FUNCTION IF EXISTS auth.user_role();

-- Create a function that bypasses RLS to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- This function runs with SECURITY DEFINER which bypasses RLS
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;

-- ============================================
-- DROP ALL EXISTING POLICIES
-- ============================================

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON profiles;

DROP POLICY IF EXISTS "airports_manage_admin" ON airports;
DROP POLICY IF EXISTS "employee_airports_select_admin" ON employee_airports;
DROP POLICY IF EXISTS "employee_airports_manage_admin" ON employee_airports;
DROP POLICY IF EXISTS "job_categories_manage_admin" ON job_categories;
DROP POLICY IF EXISTS "training_programs_manage" ON training_programs;
DROP POLICY IF EXISTS "training_modules_manage" ON training_modules;
DROP POLICY IF EXISTS "trainings_select_instructor" ON trainings;
DROP POLICY IF EXISTS "trainings_manage" ON trainings;
DROP POLICY IF EXISTS "training_sessions_select_staff" ON training_sessions;
DROP POLICY IF EXISTS "training_sessions_manage" ON training_sessions;
DROP POLICY IF EXISTS "certificates_select_staff" ON certificates;
DROP POLICY IF EXISTS "certificates_manage_admin" ON certificates;
DROP POLICY IF EXISTS "examinations_select_staff" ON examinations;
DROP POLICY IF EXISTS "examinations_manage" ON examinations;
DROP POLICY IF EXISTS "audit_logs_select_admin" ON audit_logs;
DROP POLICY IF EXISTS "module_completions_select_trainee" ON module_completions;
DROP POLICY IF EXISTS "module_completions_select_staff" ON module_completions;
DROP POLICY IF EXISTS "module_completions_manage" ON module_completions;
DROP POLICY IF EXISTS "exam_commissions_select_all" ON exam_commissions;
DROP POLICY IF EXISTS "exam_commissions_manage" ON exam_commissions;
DROP POLICY IF EXISTS "commission_members_select_all" ON commission_members;
DROP POLICY IF EXISTS "commission_members_manage" ON commission_members;
DROP POLICY IF EXISTS "skill_checks_select_own" ON skill_checks;
DROP POLICY IF EXISTS "skill_checks_select_staff" ON skill_checks;
DROP POLICY IF EXISTS "skill_checks_manage" ON skill_checks;

-- ============================================
-- PROFILES POLICIES (No recursion)
-- ============================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'instructor', 'inspector')
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update all profiles
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) = 'admin'
  );

-- Admins can insert profiles
CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) = 'admin'
  );

-- ============================================
-- AIRPORTS POLICIES
-- ============================================

CREATE POLICY "airports_manage_admin" ON airports
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================
-- EMPLOYEE_AIRPORTS POLICIES
-- ============================================

CREATE POLICY "employee_airports_select_admin" ON employee_airports
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'instructor'));

CREATE POLICY "employee_airports_manage_admin" ON employee_airports
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================
-- JOB CATEGORIES POLICIES
-- ============================================

CREATE POLICY "job_categories_manage_admin" ON job_categories
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================
-- TRAINING PROGRAMS POLICIES
-- ============================================

CREATE POLICY "training_programs_manage" ON training_programs
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================
-- TRAINING MODULES POLICIES
-- ============================================

CREATE POLICY "training_modules_manage" ON training_modules
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================
-- TRAININGS POLICIES
-- ============================================

CREATE POLICY "trainings_select_instructor" ON trainings
  FOR SELECT USING (
    instructor_id = auth.uid() OR 
    public.get_user_role(auth.uid()) IN ('admin', 'inspector')
  );

CREATE POLICY "trainings_manage" ON trainings
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================
-- TRAINING SESSIONS POLICIES
-- ============================================

CREATE POLICY "training_sessions_select_staff" ON training_sessions
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'instructor', 'inspector'));

CREATE POLICY "training_sessions_manage" ON training_sessions
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================
-- MODULE COMPLETIONS POLICIES
-- ============================================

CREATE POLICY "module_completions_select_trainee" ON module_completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trainings 
      WHERE trainings.id = module_completions.training_id 
      AND trainings.trainee_id = auth.uid()
    )
  );

CREATE POLICY "module_completions_select_staff" ON module_completions
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'instructor', 'inspector'));

CREATE POLICY "module_completions_manage" ON module_completions
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================
-- EXAM COMMISSIONS POLICIES
-- ============================================

CREATE POLICY "exam_commissions_select_all" ON exam_commissions
  FOR SELECT USING (true);

CREATE POLICY "exam_commissions_manage" ON exam_commissions
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================
-- COMMISSION MEMBERS POLICIES
-- ============================================

CREATE POLICY "commission_members_select_all" ON commission_members
  FOR SELECT USING (true);

CREATE POLICY "commission_members_manage" ON commission_members
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================
-- EXAMINATIONS POLICIES
-- ============================================

CREATE POLICY "examinations_select_staff" ON examinations
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'instructor', 'inspector'));

CREATE POLICY "examinations_manage" ON examinations
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================
-- CERTIFICATES POLICIES
-- ============================================

CREATE POLICY "certificates_select_staff" ON certificates
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'instructor', 'inspector'));

CREATE POLICY "certificates_manage_admin" ON certificates
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================
-- SKILL CHECKS POLICIES
-- ============================================

CREATE POLICY "skill_checks_select_own" ON skill_checks
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "skill_checks_select_staff" ON skill_checks
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'instructor', 'inspector'));

CREATE POLICY "skill_checks_manage" ON skill_checks
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'instructor'));

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

CREATE POLICY "audit_logs_select_admin" ON audit_logs
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'inspector'));
