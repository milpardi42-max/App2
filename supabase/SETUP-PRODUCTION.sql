-- Companion English production hardening: cloud progress + daily AI limits.
-- Run once in Supabase SQL Editor after SETUP-ALL-IN-ONE.sql and SETUP-CONVERSATIONS.sql.

CREATE TABLE IF NOT EXISTS learning_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS learning_progress_read_self ON learning_progress;
CREATE POLICY learning_progress_read_self ON learning_progress FOR SELECT TO authenticated
USING (user_id = auth.uid());
DROP POLICY IF EXISTS learning_progress_insert_self ON learning_progress;
CREATE POLICY learning_progress_insert_self ON learning_progress FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS learning_progress_update_self ON learning_progress;
CREATE POLICY learning_progress_update_self ON learning_progress FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
GRANT SELECT, INSERT, UPDATE ON learning_progress TO authenticated;

CREATE TABLE IF NOT EXISTS daily_ai_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT current_date,
  category text NOT NULL CHECK (category IN ('emma', 'human_assist', 'speech')),
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, usage_date, category)
);

ALTER TABLE daily_ai_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS daily_ai_usage_read_self ON daily_ai_usage;
CREATE POLICY daily_ai_usage_read_self ON daily_ai_usage FOR SELECT TO authenticated
USING (user_id = auth.uid());
GRANT SELECT ON daily_ai_usage TO authenticated;

CREATE OR REPLACE FUNCTION consume_daily_ai_usage(p_category text, p_limit integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  new_count integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_category NOT IN ('emma', 'human_assist', 'speech') THEN RAISE EXCEPTION 'Invalid category'; END IF;
  IF p_limit < 1 OR p_limit > 1000 THEN RAISE EXCEPTION 'Invalid limit'; END IF;

  INSERT INTO daily_ai_usage (user_id, usage_date, category, request_count, updated_at)
  VALUES (auth.uid(), current_date, p_category, 1, now())
  ON CONFLICT (user_id, usage_date, category)
  DO UPDATE SET request_count = daily_ai_usage.request_count + 1, updated_at = now()
  WHERE daily_ai_usage.request_count < p_limit
  RETURNING request_count INTO new_count;

  RETURN new_count IS NOT NULL AND new_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION consume_daily_ai_usage(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION consume_daily_ai_usage(text, integer) TO authenticated;
