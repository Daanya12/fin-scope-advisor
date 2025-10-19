-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false);

-- Policy: Users can upload their own receipts
CREATE POLICY "Users can upload own receipts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own receipts
CREATE POLICY "Users can view own receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own receipts
CREATE POLICY "Users can delete own receipts"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table to track uploaded receipts
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  amount NUMERIC,
  description TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on receipts table
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Policies for receipts table
CREATE POLICY "Users can view own receipts"
ON public.receipts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts"
ON public.receipts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts"
ON public.receipts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts"
ON public.receipts
FOR DELETE
USING (auth.uid() = user_id);