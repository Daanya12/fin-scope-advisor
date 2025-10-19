-- Create enum for portfolio type
CREATE TYPE public.portfolio_type AS ENUM ('short-term', 'long-term');

-- Add portfolio_type column to user_portfolios
ALTER TABLE public.user_portfolios 
ADD COLUMN portfolio_type public.portfolio_type NOT NULL DEFAULT 'long-term',
ADD COLUMN name TEXT;

-- Remove the old investment_goal column
ALTER TABLE public.user_portfolios 
DROP COLUMN investment_goal;

-- Add portfolio_id to user_holdings to link holdings to specific portfolios
ALTER TABLE public.user_holdings
ADD COLUMN portfolio_id UUID REFERENCES public.user_portfolios(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_user_holdings_portfolio_id ON public.user_holdings(portfolio_id);
CREATE INDEX idx_user_portfolios_user_type ON public.user_portfolios(user_id, portfolio_type);

-- Migrate existing data: Create a short-term portfolio for each existing portfolio
INSERT INTO public.user_portfolios (user_id, risk_appetite, portfolio_type, name, created_at, updated_at)
SELECT 
  user_id, 
  risk_appetite, 
  'short-term'::public.portfolio_type,
  'Short-term Portfolio',
  NOW(),
  NOW()
FROM public.user_portfolios
WHERE portfolio_type = 'long-term'
ON CONFLICT DO NOTHING;

-- Update existing portfolios to set name
UPDATE public.user_portfolios
SET name = CASE 
  WHEN portfolio_type = 'long-term' THEN 'Long-term Portfolio'
  WHEN portfolio_type = 'short-term' THEN 'Short-term Portfolio'
  ELSE name
END
WHERE name IS NULL;