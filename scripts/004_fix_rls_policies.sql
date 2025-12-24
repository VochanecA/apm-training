-- ============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- Drop existing policies and recreate them properly
-- ============================================

-- Drop all existing policies
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

-- ============================================
-- PROFILES POLICIES (Fixed - no recursion)
-- ============================================

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles (using direct column check)
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'instructor', 'inspector')
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update all profiles
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admins can insert profiles
CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- SIMPLIFIED POLICIES - Using auth.jwt()
-- ============================================

-- Create a function to get user role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Recreate policies using the function
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON profiles;

-- Admin policies using function
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (auth.user_role() IN ('admin', 'instructor', 'inspector'));

CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (auth.user_role() = 'admin');

CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT WITH CHECK (auth.user_role() = 'admin');

-- Update other admin policies
DROP POLICY IF EXISTS "airports_manage_admin" ON airports;
CREATE POLICY "airports_manage_admin" ON airports
  FOR ALL USING (auth.user_role() = 'admin');

DROP POLICY IF EXISTS "employee_airports_select_admin" ON employee_airports;
CREATE POLICY "employee_airports_select_admin" ON employee_airports
  FOR SELECT USING (auth.user_role() IN ('admin', 'instructor'));

DROP POLICY IF EXISTS "employee_airports_manage_admin" ON employee_airports;
CREATE POLICY "employee_airports_manage_admin" ON employee_airports
  FOR ALL USING (auth.user_role() = 'admin');

DROP POLICY IF EXISTS "job_categories_manage_admin" ON job_categories;
CREATE POLICY "job_categories_manage_admin" ON job_categories
  FOR ALL USING (auth.user_role() = 'admin');

DROP POLICY IF EXISTS "training_programs_manage" ON training_programs;
CREATE POLICY "training_programs_manage" ON training_programs
  FOR ALL USING (auth.user_role() IN ('admin', 'instructor'));

DROP POLICY IF EXISTS "training_modules_manage" ON training_modules;
CREATE POLICY "training_modules_manage" ON training_modules
  FOR ALL USING (auth.user_role() IN ('admin', 'instructor'));

DROP POLICY IF EXISTS "trainings_select_instructor" ON trainings;
CREATE POLICY "trainings_select_instructor" ON trainings
  FOR SELECT USING (
    instructor_id = auth.uid() OR auth.user_role() IN ('admin', 'inspector')
  );

DROP POLICY IF EXISTS "trainings_manage" ON trainings;
CREATE POLICY "trainings_manage" ON trainings
  FOR ALL USING (auth.user_role() IN ('admin', 'instructor'));

DROP POLICY IF EXISTS "training_sessions_select_staff" ON training_sessions;
CREATE POLICY "training_sessions_select_staff" ON training_sessions
  FOR SELECT USING (auth.user_role() IN ('admin', 'instructor', 'inspector'));

DROP POLICY IF EXISTS "training_sessions_manage" ON training_sessions;
CREATE POLICY "training_sessions_manage" ON training_sessions
  FOR ALL USING (auth.user_role() IN ('admin', 'instructor'));

DROP POLICY IF EXISTS "certificates_select_staff" ON certificates;
CREATE POLICY "certificates_select_staff" ON certificates
  FOR SELECT USING (auth.user_role() IN ('admin', 'instructor', 'inspector'));

DROP POLICY IF EXISTS "certificates_manage_admin" ON certificates;
CREATE POLICY "certificates_manage_admin" ON certificates
  FOR ALL USING (auth.user_role() = 'admin');

DROP POLICY IF EXISTS "examinations_select_staff" ON examinations;
CREATE POLICY "examinations_select_staff" ON examinations
  FOR SELECT USING (auth.user_role() IN ('admin', 'instructor', 'inspector'));

DROP POLICY IF EXISTS "examinations_manage" ON examinations;
CREATE POLICY "examinations_manage" ON examinations
  FOR ALL USING (auth.user_role() IN ('admin', 'instructor'));

DROP POLICY IF EXISTS "audit_logs_select_admin" ON audit_logs;
CREATE POLICY "audit_logs_select_admin" ON audit_logs
  FOR SELECT USING (auth.user_role() IN ('admin', 'inspector'));
