-- UniTime Scheduler — Schéma PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('director', 'teacher')),
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  must_change_password boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  level text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS teacher_subjects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE (teacher_id, subject_id, class_id)
);

CREATE TABLE IF NOT EXISTS slots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('cours', 'td', 'tp', 'devoir')),
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  creator_teacher_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS slot_professors (
  slot_id uuid NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (slot_id, teacher_id)
);

CREATE TABLE IF NOT EXISTS swap_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id uuid NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  requesting_teacher_id uuid NOT NULL REFERENCES users(id),
  message text NOT NULL,
  proposed_subject_id uuid NOT NULL REFERENCES subjects(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_slots_class_day ON slots (class_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher ON teacher_subjects (teacher_id);
CREATE INDEX IF NOT EXISTS idx_slot_professors_teacher ON slot_professors (teacher_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_slot ON swap_requests (slot_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON swap_requests (status);
