CREATE TABLE IF NOT EXISTS industries (
  id SMALLINT PRIMARY KEY,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  industry_id SMALLINT REFERENCES industries(id),
  week TEXT NOT NULL,
  week_label TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  stat_1_value TEXT, stat_1_label TEXT, stat_1_delta TEXT, stat_1_trend TEXT,
  stat_2_value TEXT, stat_2_label TEXT, stat_2_delta TEXT, stat_2_trend TEXT,
  stat_3_value TEXT, stat_3_label TEXT, stat_3_delta TEXT, stat_3_trend TEXT,
  steep_s TEXT,
  steep_t TEXT,
  steep_e TEXT,
  steep_e2 TEXT,
  steep_p TEXT,
  insight_1 TEXT,
  insight_2 TEXT,
  chart_labels TEXT[],
  chart_values INTEGER[],
  image_url TEXT,
  market_charts JSONB,
  news_count INTEGER DEFAULT 0,
  news_refs JSONB,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(industry_id, week)
);

-- Insert Category/Industry mapping
INSERT INTO industries (id, name_ko, name_en, category) VALUES
(1, '에이전틱 AI', 'Agentic AI', 'AI·테크 플랫폼'),
(2, '물리 AI·로보틱스', 'Physical AI/Robotics', 'AI·테크 플랫폼'),
(3, '공간 컴퓨팅', 'Spatial Computing', 'AI·테크 플랫폼'),
(4, 'AI 사이버보안', 'AI Security', 'AI·테크 플랫폼'),
(5, '반도체·AI칩', 'Semiconductor', '하드웨어·인프라'),
(6, '데이터센터·에너지', 'Data Center', '하드웨어·인프라'),
(7, '양자 컴퓨팅', 'Quantum Computing', '하드웨어·인프라'),
(8, '자율주행·모빌리티', 'Autonomous Vehicle', '하드웨어·인프라'),
(9, '핵융합·소형원전', 'Nuclear/Fusion', '에너지·기후'),
(10, '재생에너지·그리드', 'Renewables', '에너지·기후'),
(11, '기후테크·탄소시장', 'Climate Tech', '에너지·기후'),
(12, 'AI 신약개발', 'AI Drug Discovery', '바이오·헬스'),
(13, '디지털 헬스케어', 'Digital Health', '바이오·헬스'),
(14, '바이오테크·유전체', 'Biotech', '바이오·헬스'),
(15, '방위산업·드론', 'Defense/Drone', '방산·우주·안보'),
(16, '우주 산업', 'Space Tech', '방산·우주·안보'),
(17, '공급망·지정학 리스크', 'Supply Chain', '방산·우주·안보'),
(18, '핀테크·디지털금융', 'Fintech', '금융·소비·미디어'),
(19, 'AI 미디어·크리에이터', 'AI Media', '금융·소비·미디어'),
(20, '이커머스·리테일테크', 'Retail Tech', '금융·소비·미디어')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Report
INSERT INTO reports (
  id, industry_id, week, week_label, category, title, summary, tags, is_featured,
  stat_1_value, stat_1_label, stat_1_delta, stat_1_trend,
  stat_2_value, stat_2_label, stat_2_delta, stat_2_trend,
  stat_3_value, stat_3_label, stat_3_delta, stat_3_trend,
  steep_s, steep_t, steep_e, steep_e2, steep_p,
  insight_1, insight_2,
  chart_labels, chart_values,
  image_url, market_charts,
  news_count, news_refs
) VALUES (
  'agentic-ai-2026-w13',
  1,
  '2026-W13',
  '2026년 13주차 · 3월 24~30일',
  'AI · 테크 플랫폼',
  '에이전틱 AI — 기업 자동화의 원년 선언',
  '구글·MS·Anthropic의 대형 업데이트가 동시에 발표되며 B2B 에이전트 시장이 본격 개화하는 신호가 포착됐다. 국내에서도 네이버·카카오가 에이전트 API 공개를 예고하며 국내 생태계 경쟁이 시작됐다.',
  ARRAY['에이전트 프레임워크', 'MCP 표준화', 'AI 거버넌스', 'B2B 자동화'],
  true,
  '+920%', '에이전트 프레임워크 채택률 (YoY)', '↑ 전주 대비 +12%p', 'up',
  '$37B', '2025 기업 GenAI 지출 규모', '↑ 2023 대비 16배', 'up',
  '1,500+', '글로벌 에이전트 AI 스타트업 수', '→ 전주와 동일', 'neutral',
  '화이트칼라 업무 자동화 불안 증가. 미국 내 지식 노동자의 41%가 에이전트 도입으로 업무가 변화할 것이라 응답 (Pew Research, 3월).',
  '멀티에이전트 오케스트레이션 표준 경쟁 본격화. Anthropic MCP vs. OpenAI Swarm vs. Google A2A 프로토콜 3파전 양상.',
  '에이전트 API 지출 전년 대비 4배 급증. SaaS 라이선스 절감 효과로 ROI 조기 실현 사례 증가. 코딩 AI만 $4B 시장 형성.',
  '에이전트 기반 에너지 소비 최적화 사례 등장. 데이터센터 냉각 자동화에 에이전트 적용 파일럿 3건 공개.',
  'EU AI Act 고위험 에이전트 분류 논의 시작. 한국 AI 기본법 시행령 초안에 에이전트 책임 귀속 조항 삽입 검토.',
  '에이전트 = 도구에서 에이전트 = 직원으로의 인식 전환이 B2B 계약 구조를 바꾸고 있다. 시트당 라이선스 모델이 아닌 작업 수행 건당 과금(task-based pricing)이 주류로 부상할 가능성이 높다.',
  '국내 기업은 에이전트 도입 초기 단계이나, 네이버·카카오의 API 공개 예고는 국내 에이전트 생태계 경쟁을 6~12개월 앞당길 수 있다.',
  ARRAY['W06', 'W07', 'W08', 'W09', 'W10', 'W11', 'W12', 'W13'],
  ARRAY[120, 150, 180, 210, 240, 310, 380, 420],
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2000',
  '[{"title": "글로벌 AI 반도체 시장 규모", "unit": "$B", "source": "Gartner, 2024", "labels": ["2023", "2024", "2025", "2026", "2027", "2028"], "values": [120, 150, 210, 310, 450, 600]}]'::jsonb,
  5,
  '[
    {"title": "Google unveils 10 new Gemini agents for enterprise automation, targets $10B ARR by 2027", "url": "#"},
    {"title": "네이버 클로바, 에이전트 API 베타 공개 예고 — 개발자 신청 접수 시작", "url": "#"},
    {"title": "Anthropic Claude hits $3B ARR milestone, driven by enterprise agent workloads", "url": "#"},
    {"title": "국내 대기업 AI 에이전트 파일럿 도입 사례 급증 — 제조·금융·유통 3개 섹터 선도", "url": "#"},
    {"title": "OpenAI Operator revenue surpasses GPT-4 API in 6 months, reshaping enterprise AI spend", "url": "#"}
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;
