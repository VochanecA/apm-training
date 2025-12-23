-- ============================================
-- SEED AIRPORTS
-- ============================================
INSERT INTO airports (code, name, type, location, country) VALUES
('TIV', 'Tivat Airport', 'airport', 'Tivat', 'ME'),
('TGD', 'Podgorica Airport', 'airport', 'Podgorica', 'ME'),
('TIV-H1', 'Tivat Heliodrome 1', 'heliodrome', 'Tivat Bay', 'ME'),
('KOT-H1', 'Kotor Heliport', 'heliodrome', 'Kotor', 'ME');

-- ============================================
-- SEED JOB CATEGORIES (Article 22)
-- ============================================
INSERT INTO job_categories (code, name_en, name_me, requires_certificate, description) VALUES
('ATC', 'Air Traffic Controller', 'Kontrolor letenja', true, 'Air traffic control services'),
('OPS', 'Operations Officer', 'Operativni službenik', true, 'Airport operations management'),
('FIRE', 'Firefighter / Rescue', 'Vatrogasac / Spasilac', true, 'Aircraft rescue and firefighting'),
('SEC', 'Security Officer', 'Bezbjednosni službenik', true, 'Aviation security screening'),
('MNT', 'Maintenance Technician', 'Tehničar održavanja', true, 'Airport facilities maintenance'),
('GSE', 'Ground Service Equipment Operator', 'Operater zemaljskog servisa', true, 'GSE operations'),
('BIRD', 'Bird Control Officer', 'Službenik za kontrolu ptica', true, 'Wildlife hazard management'),
('MET', 'Meteorological Observer', 'Meteorološki posmatrač', true, 'Weather observation and reporting'),
('AIS', 'Aeronautical Information Services', 'Aeronautičke informacione službe', true, 'NOTAM and aeronautical data'),
('COM', 'Communications Specialist', 'Specijalista komunikacija', true, 'Radio and telecommunications'),
('NAV', 'Navigation Systems Technician', 'Tehničar navigacionih sistema', true, 'NAVAIDS maintenance'),
('FUEL', 'Fueling Operator', 'Operater goriva', true, 'Aircraft refueling operations'),
('RAMP', 'Ramp Agent / Marshaller', 'Rampni agent / Marshal', true, 'Aircraft marshalling and ground handling'),
('LOAD', 'Load Master', 'Menadžer tereta', true, 'Cargo and baggage loading'),
('PUSH', 'Pushback / Tow Operator', 'Operater vučenja', true, 'Aircraft pushback operations');
