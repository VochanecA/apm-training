-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "employees_select" ON employees;
DROP POLICY IF EXISTS "employees_insert" ON employees;
DROP POLICY IF EXISTS "employees_update" ON employees;
DROP POLICY IF EXISTS "airports_select" ON airports;
DROP POLICY IF EXISTS "airports_insert" ON airports;
DROP POLICY IF EXISTS "airports_update" ON airports;
DROP POLICY IF EXISTS "training_types_select" ON training_types;
DROP POLICY IF EXISTS "training_types_insert" ON training_types;
DROP POLICY IF EXISTS "training_types_update" ON training_types;
DROP POLICY IF EXISTS "trainings_select" ON trainings;
DROP POLICY IF EXISTS "trainings_insert" ON trainings;
DROP POLICY IF EXISTS "trainings_update" ON trainings;
DROP POLICY IF EXISTS "certificates_select" ON certificates;
DROP POLICY IF EXISTS "certificates_insert" ON certificates;
DROP POLICY IF EXISTS "certificates_update" ON certificates;
DROP POLICY IF EXISTS "employee_airports_select" ON employee_airports;
DROP POLICY IF EXISTS "employee_airports_insert" ON employee_airports;
DROP POLICY IF EXISTS "employee_airports_update" ON employee_airports;

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS auth.user_role();

-- ============================================
-- SIMPLE RLS STRATEGY: Use auth.uid() directly
-- No recursive queries to profiles table
-- ============================================

-- PROFILES: Users can read and update their own profile only
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- EMPLOYEES: All authenticated users can read employees
-- Only service role can insert/update (via admin interface)
CREATE POLICY "employees_select_authenticated" ON employees
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "employees_insert_service" ON employees
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() IN (SELECT id FROM profiles WHERE user_role = 'admin'));

CREATE POLICY "employees_update_service" ON employees
    FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() IN (SELECT id FROM profiles WHERE user_role = 'admin'));

-- AIRPORTS: All authenticated users can read airports
CREATE POLICY "airports_select_authenticated" ON airports
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "airports_insert_service" ON airports
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "airports_update_service" ON airports
    FOR UPDATE USING (auth.role() = 'service_role');

-- TRAINING TYPES: All authenticated users can read
CREATE POLICY "training_types_select_authenticated" ON training_types
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "training_types_insert_service" ON training_types
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "training_types_update_service" ON training_types
    FOR UPDATE USING (auth.role() = 'service_role');

-- TRAININGS: All authenticated users can read
CREATE POLICY "trainings_select_authenticated" ON trainings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "trainings_insert_service" ON trainings
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "trainings_update_service" ON trainings
    FOR UPDATE USING (auth.role() = 'service_role');

-- CERTIFICATES: All authenticated users can read
CREATE POLICY "certificates_select_authenticated" ON certificates
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "certificates_insert_service" ON certificates
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "certificates_update_service" ON certificates
    FOR UPDATE USING (auth.role() = 'service_role');

-- EMPLOYEE AIRPORTS: All authenticated users can read
CREATE POLICY "employee_airports_select_authenticated" ON employee_airports
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "employee_airports_insert_service" ON employee_airports
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "employee_airports_update_service" ON employee_airports
    FOR UPDATE USING (auth.role() = 'service_role');
