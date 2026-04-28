-- ============================================================
-- BURN GT PRO — Neon Database Schema
-- Ejecuta esto en neon.tech > SQL Editor
-- ============================================================

-- USUARIOS
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  password    TEXT NOT NULL,  -- bcrypt hash
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- PERFIL FÍSICO (TDEE y macros)
CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  sex         CHAR(1) CHECK (sex IN ('m','f')),
  age         INT,
  weight_kg   NUMERIC(5,2),
  height_cm   INT,
  activity    TEXT CHECK (activity IN ('sed','med','hi')),
  goal        TEXT CHECK (goal IN ('def','mant','vol','agr')),
  tdee        INT,
  goal_kcal   INT,
  goal_prot   INT,
  goal_carb   INT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- REGISTRO DE PESO CORPORAL
CREATE TABLE IF NOT EXISTS weight_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  weight_kg   NUMERIC(5,2) NOT NULL,
  logged_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_weight_user_date ON weight_logs(user_id, logged_at DESC);

-- SESIONES DE ENTRENAMIENTO
CREATE TABLE IF NOT EXISTS workout_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  day_key      TEXT NOT NULL,        -- 'LUN', 'MAR', etc.
  split_type   TEXT NOT NULL,        -- 'push1','pull1','legs1','push2','pull2','arms'
  mode         TEXT NOT NULL DEFAULT 'gym',  -- 'gym' | 'casa'
  completed    BOOLEAN DEFAULT FALSE,
  duration_min INT,
  notes        TEXT,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_session_user_date ON workout_sessions(user_id, session_date DESC);

-- SERIES POR EJERCICIO (progreso de cargas)
CREATE TABLE IF NOT EXISTS exercise_sets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  set_number   INT NOT NULL,
  weight_kg    NUMERIC(6,2),        -- NULL si es bodyweight
  reps         INT,
  rir          INT,                 -- Reps In Reserve (0-4)
  rpe          NUMERIC(3,1),        -- 6.0-10.0
  duration_sec INT,                 -- Para ejercicios de tiempo
  is_pr        BOOLEAN DEFAULT FALSE, -- Personal Record automático
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sets_user_exercise ON exercise_sets(user_id, exercise_name, created_at DESC);

-- REGISTRO DE COMIDAS (tracking nutricional)
CREATE TABLE IF NOT EXISTS food_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  food_name    TEXT NOT NULL,
  kcal         INT NOT NULL,
  protein_g    NUMERIC(6,2) DEFAULT 0,
  carbs_g      NUMERIC(6,2) DEFAULT 0,
  fat_g        NUMERIC(6,2) DEFAULT 0,
  meal_type    TEXT CHECK (meal_type IN ('desayuno','almuerzo','cena','snack')),
  logged_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_food_user_date ON food_logs(user_id, logged_at DESC);

-- FOTOS DE PROGRESO (solo metadata, no binarios)
CREATE TABLE IF NOT EXISTS progress_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  photo_url    TEXT NOT NULL,        -- URL de Cloudinary/Supabase Storage
  weight_kg    NUMERIC(5,2),
  notes        TEXT,
  taken_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- VISTA: progreso semanal por usuario
CREATE OR REPLACE VIEW weekly_summary AS
SELECT
  ws.user_id,
  DATE_TRUNC('week', ws.session_date) AS week_start,
  COUNT(DISTINCT ws.id) FILTER (WHERE ws.completed = TRUE) AS sessions_completed,
  COUNT(DISTINCT ws.id) AS sessions_started,
  AVG(ws.duration_min) AS avg_duration_min,
  COALESCE(SUM(fl.kcal), 0) AS total_kcal,
  COALESCE(AVG(fl.protein_g), 0) AS avg_protein_g,
  COUNT(DISTINCT fl.logged_at) AS food_log_days
FROM workout_sessions ws
LEFT JOIN food_logs fl ON fl.user_id = ws.user_id
  AND DATE_TRUNC('week', fl.logged_at) = DATE_TRUNC('week', ws.session_date)
GROUP BY ws.user_id, DATE_TRUNC('week', ws.session_date);

-- FUNCIÓN: calcular PR automático
CREATE OR REPLACE FUNCTION check_pr() RETURNS TRIGGER AS $$
DECLARE
  max_weight NUMERIC;
BEGIN
  SELECT MAX(weight_kg) INTO max_weight
  FROM exercise_sets
  WHERE user_id = NEW.user_id
    AND exercise_name = NEW.exercise_name
    AND reps = NEW.reps
    AND id != NEW.id;

  IF max_weight IS NULL OR NEW.weight_kg > max_weight THEN
    NEW.is_pr := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_pr
  BEFORE INSERT ON exercise_sets
  FOR EACH ROW EXECUTE FUNCTION check_pr();

-- Unique constraints needed for ON CONFLICT
ALTER TABLE weight_logs ADD CONSTRAINT IF NOT EXISTS uq_weight_user_date UNIQUE (user_id, logged_at);
ALTER TABLE user_profiles ADD CONSTRAINT IF NOT EXISTS uq_profile_user UNIQUE (user_id);
