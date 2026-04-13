-- Enable Row Level Security (RLS) for industries
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security (RLS) for reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access on industries
CREATE POLICY "Allow public read access on industries" 
ON public.industries FOR SELECT USING (true);

-- Create policy to allow public read access on reports
CREATE POLICY "Allow public read access on reports" 
ON public.reports FOR SELECT USING (true);
