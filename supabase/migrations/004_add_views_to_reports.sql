-- Add views column to reports table
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Create function to increment views
CREATE OR REPLACE FUNCTION public.increment_report_views(report_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.reports
  SET views = views + 1
  WHERE id = report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
