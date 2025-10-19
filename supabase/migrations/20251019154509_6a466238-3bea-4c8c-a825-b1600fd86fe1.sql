-- Add month and year columns for historical tracking (nullable first)
ALTER TABLE financial_analyses 
ADD COLUMN IF NOT EXISTS month INTEGER CHECK (month >= 1 AND month <= 12),
ADD COLUMN IF NOT EXISTS year INTEGER CHECK (year >= 2000 AND year <= 2100);

-- Update existing records to their created_at month/year
UPDATE financial_analyses 
SET month = EXTRACT(MONTH FROM created_at)::INTEGER,
    year = EXTRACT(YEAR FROM created_at)::INTEGER
WHERE month IS NULL OR year IS NULL;

-- Delete duplicate entries, keeping only the most recent one per user/month/year
DELETE FROM financial_analyses a
USING financial_analyses b
WHERE a.id < b.id 
  AND a.user_id = b.user_id 
  AND EXTRACT(MONTH FROM a.created_at) = EXTRACT(MONTH FROM b.created_at)
  AND EXTRACT(YEAR FROM a.created_at) = EXTRACT(YEAR FROM b.created_at);

-- Make columns NOT NULL after cleaning data
ALTER TABLE financial_analyses 
ALTER COLUMN month SET NOT NULL,
ALTER COLUMN year SET NOT NULL;

-- Create unique constraint to prevent duplicate monthly entries per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_month ON financial_analyses(user_id, month, year);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_financial_analyses_month ON financial_analyses(month);
CREATE INDEX IF NOT EXISTS idx_financial_analyses_year ON financial_analyses(year);
CREATE INDEX IF NOT EXISTS idx_financial_analyses_user_date ON financial_analyses(user_id, year DESC, month DESC);