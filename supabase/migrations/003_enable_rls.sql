-- 1. industries 테이블에 RLS를 활성화하고 누구나 조회 가능하도록 정책 생성
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on industries" 
ON public.industries FOR SELECT USING (true);

-- 2. reports 테이블에 RLS를 활성화하고 누구나 조회 가능하도록 정책 생성
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on reports" 
ON public.reports FOR SELECT USING (true);
