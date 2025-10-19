-- Create user portfolio preferences table
CREATE TABLE IF NOT EXISTS user_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_appetite TEXT NOT NULL CHECK (risk_appetite IN ('low', 'medium', 'high')),
  investment_goal TEXT NOT NULL CHECK (investment_goal IN ('short-term', 'long-term')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user holdings table
CREATE TABLE IF NOT EXISTS user_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'etf', 'commodity', 'bond')),
  quantity DECIMAL(18, 8) NOT NULL DEFAULT 0,
  average_price DECIMAL(18, 2),
  current_price DECIMAL(18, 2),
  total_value DECIMAL(18, 2),
  profit_loss DECIMAL(18, 2),
  profit_loss_percent DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Enable RLS
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_holdings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_portfolios
CREATE POLICY "Users can view own portfolio"
  ON user_portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio"
  ON user_portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio"
  ON user_portfolios FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_holdings
CREATE POLICY "Users can view own holdings"
  ON user_holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own holdings"
  ON user_holdings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holdings"
  ON user_holdings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own holdings"
  ON user_holdings FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_portfolios_updated_at
  BEFORE UPDATE ON user_portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_holdings_updated_at
  BEFORE UPDATE ON user_holdings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();