-- Create trades table for logging user trades
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  portfolio_id UUID REFERENCES public.user_portfolios(id),
  symbol TEXT NOT NULL,
  asset_name TEXT,
  trade_type TEXT NOT NULL CHECK (trade_type IN ('buy', 'sell')),
  quantity NUMERIC NOT NULL,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC,
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_date TIMESTAMP WITH TIME ZONE,
  pnl NUMERIC,
  pnl_percent NUMERIC,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create policies for trades
CREATE POLICY "Users can view own trades" 
ON public.trades 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" 
ON public.trades 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" 
ON public.trades 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades" 
ON public.trades 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_trades_updated_at
BEFORE UPDATE ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();