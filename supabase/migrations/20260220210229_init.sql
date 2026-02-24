-- ============================================================
-- BetPlay Database Schema
-- ============================================================

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  phone_number TEXT UNIQUE,
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  balance NUMERIC DEFAULT 50000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number, role)
  VALUES (new.id, new.phone, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Create Markets Table
CREATE TABLE IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT false,
  today_winning_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Seed default markets (only if table is empty)
INSERT INTO markets (name, open_time, close_time, is_active)
SELECT * FROM (VALUES
  ('Laxmi Morning', '09:00:00'::TIME, '12:00:00'::TIME, true),
  ('Shridevi Morning', '13:00:00'::TIME, '15:00:00'::TIME, true),
  ('Karnatak Day', '16:00:00'::TIME, '19:00:00'::TIME, true)
) AS v(name, open_time, close_time, is_active)
WHERE NOT EXISTS (SELECT 1 FROM markets LIMIT 1);

-- 3. Create Bets Table
CREATE TABLE IF NOT EXISTS bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  game_type TEXT CHECK (game_type IN ('single_digit', 'jodi', 'single_panna', 'double_panna', 'triple_panna')),
  number TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT CHECK (status IN ('pending', 'won', 'lost')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Markets: Everyone can read markets
CREATE POLICY "Everyone can view markets" ON markets
  FOR SELECT USING (true);

-- Markets: Admins can do everything with markets
CREATE POLICY "Admins can manage markets" ON markets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Bets: Users can view their own bets
CREATE POLICY "Users can view own bets" ON bets
  FOR SELECT USING (auth.uid() = user_id);

-- Bets: Users can insert their own bets
CREATE POLICY "Users can insert own bets" ON bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bets: Admins can view all bets
CREATE POLICY "Admins can view all bets" ON bets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Bets: Admins can update bets (for result declaration)
CREATE POLICY "Admins can update bets" ON bets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- Atomic Bet Placement Function (prevents double-deduction)
-- ============================================================

CREATE OR REPLACE FUNCTION place_bet(
  p_user_id UUID,
  p_market_id UUID,
  p_game_type TEXT,
  p_number TEXT,
  p_amount NUMERIC
)
RETURNS JSON AS $$
DECLARE
  v_balance NUMERIC;
  v_bet_id UUID;
  v_market markets%ROWTYPE;
BEGIN
  -- 1. Check if market exists and is active
  SELECT * INTO v_market FROM markets WHERE id = p_market_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Market not found';
  END IF;
  IF v_market.is_active = false THEN
    RAISE EXCEPTION 'Market is inactive';
  END IF;

  -- 2. Lock the user's profile row to prevent concurrent deductions
  SELECT balance INTO v_balance FROM profiles WHERE id = p_user_id FOR UPDATE;

  -- 3. Check sufficient balance
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- 4. Deduct balance
  UPDATE profiles SET balance = balance - p_amount WHERE id = p_user_id;

  -- 5. Insert the bet record
  INSERT INTO bets (user_id, market_id, game_type, number, amount, status)
  VALUES (p_user_id, p_market_id, p_game_type, p_number, p_amount, 'pending')
  RETURNING id INTO v_bet_id;

  -- 6. Return result
  RETURN json_build_object(
    'success', true,
    'bet_id', v_bet_id,
    'new_balance', v_balance - p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
