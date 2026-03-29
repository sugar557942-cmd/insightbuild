import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Info } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server-client';
import TrendBarChart from '@/components/trends/TrendBarChart';
import RestrictedDetailView from '@/components/trends/RestrictedDetailView';

export const revalidate = 3600;

export async function generateStaticParams() {
  const { data: reports } = await supabaseAdmin.from('reports').select('id');
  return reports?.map((report) => ({
    reportId: report.id,
  })) || [];
}

interface MarketChart {
  title: string;
  unit: string;
  source: string;
  labels: string[];
  values: number[];
}

interface NewsItem {
  title: string;
  url: string;
}

interface FormattedReport {
  id: string;
  title: string;
  summary: string;
  category: string;
  week_label: string;
  tags: string[];
  image_url: string;
  steep: {
    s: string;
    t: string;
    e: string;
    e2: string;
    p: string;
  };
  insights: string[];
  market_charts: MarketChart[];
  news: NewsItem[];
}

export default async function ReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  const { data: report, error } = await supabaseAdmin
    .from('reports')
    .select('*, industries(market_charts)')
    .eq('id', reportId)
    .single();

  if (error || !report) {
    notFound();
  }

  if (!isLoggedIn) {
    return (
      <RestrictedDetailView 
        category={report.category} 
        weekLabel={report.week_label} 
      />
    );
  }

  // Map DB fields to UI-friendly structure
  const formattedReport: FormattedReport = {
    ...report,
    tags: (report.tags as string[] | null) || [],
    steep: {
      s: report.steep_s || '',
      t: report.steep_t || '',
      e: report.steep_e || '',
      e2: report.steep_e2 || '',
      p: report.steep_p || '',
    },
    insights: [report.insight_1, report.insight_2].filter((i: string | null): i is string => Boolean(i)),
    image_url: report.image_url || '',
    market_charts: (report.industries?.market_charts as MarketChart[] | null) || [],
    news: (report.news_refs as NewsItem[] | null) || [],
  };

  const CHART_COLORS = ['#FFD700', '#22D3EE', '#A78BFA'];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* [A] Header with potential Image Background */}
        <div className="relative mb-10">
          {formattedReport.image_url && (
            <div className="absolute -inset-x-4 -top-24 h-[400px] z-0 opacity-40">
              <img 
                src={formattedReport.image_url} 
                className="w-full h-full object-cover" 
                alt="Background"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/20 via-[#0a0a0a]/80 to-[#0a0a0a]"></div>
            </div>
          )}
          
          <div className="relative z-10 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <Link 
                href="/trends" 
                className="flex items-center gap-2 text-[#999999] hover:text-white transition-colors text-sm"
              >
                <ChevronLeft size={18} />
                Industry Trends Report
              </Link>
              <div className="flex items-center gap-3">
                <span className="border border-[#FFD700] text-[#FFD700] rounded-full px-3 py-1 text-sm font-medium">
                  {formattedReport.week_label}
                </span>
                <span className="bg-[#FFD700] text-black text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  AUTO GENERATED
                </span>
              </div>
            </div>
            
            <div className="text-[#FFD700] text-sm font-bold mb-3 tracking-wide">
              {formattedReport.category}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight leading-tight">
              {formattedReport.title}
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formattedReport.tags.map((tag: string) => (
              <span 
                key={tag} 
                className="bg-[#1a1a1a] text-[#999999] border border-[#2a2a2a] rounded-full px-4 py-1.5 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>


        {/* [C] Main 2-Col Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          
          {/* [C-1] STEEP Analysis */}
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6">
            <div className="text-[#FFD700] text-xs font-bold tracking-[0.2em] mb-8 uppercase">
              STEEP ANALYSIS
            </div>
            
            <div className="space-y-8">
              <SteepRow 
                label="S · 사회" 
                content={formattedReport.steep.s} 
                variant="blue" 
              />
              <SteepRow 
                label="T · 기술" 
                content={formattedReport.steep.t} 
                variant="purple" 
              />
              <SteepRow 
                label="E · 경제" 
                content={formattedReport.steep.e} 
                variant="yellow" 
              />
              <SteepRow 
                label="E · 환경" 
                content={formattedReport.steep.e2} 
                variant="green" 
              />
              <SteepRow 
                label="P · 정책" 
                content={formattedReport.steep.p} 
                variant="red" 
                isLast
              />
            </div>
          </div>

          {/* [C-2] Charts & Insights */}
          <div className="flex flex-col gap-8">
            {/* Market Charts Section */}
            {formattedReport.market_charts.map((chart, idx) => (
              <div key={idx} className="bg-[#111111] border border-[#222222] rounded-2xl p-8 flex flex-col hover:border-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-xs font-bold tracking-[0.2em] uppercase mb-1" style={{ color: CHART_COLORS[idx % CHART_COLORS.length] }}>
                      {chart.title || 'Market Size Data'}
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium">
                      Unit: {chart.unit}
                    </div>
                  </div>
                  <Info size={14} className="text-gray-600 cursor-help" />
                </div>
                
                <div className="h-[200px] mb-4">
                  <TrendBarChart 
                    labels={chart.labels} 
                    values={chart.values} 
                    color={CHART_COLORS[idx % CHART_COLORS.length]}
                  />
                </div>
                
                <div className="text-[#666666] text-[10px] text-right">
                  Source: {chart.source}
                </div>
              </div>
            ))}

            {/* Insights Card */}
              {formattedReport.insights.length > 0 && (
                <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8">
                  <div className="text-[#FFD700] text-xs font-bold tracking-[0.2em] mb-6 uppercase">
                    KEY INSIGHTS
                  </div>
                  <div className="space-y-4">
                    {formattedReport.insights.map((insight: string, i: number) => (
                      <div key={i} className={`bg-[#1a1a1a] rounded-lg p-4 border-l-4 ${i === 0 ? 'border-[#FFD700]' : 'border-[#4ade80]'} text-[#cccccc] text-sm leading-relaxed shadow-lg`}>
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* [D] Bottom: News Card */}
        <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[#FFD700] text-xs font-bold tracking-widest uppercase">
              THIS WEEK'S KEY NEWS
            </div>
          </div>
          
          <div className="flex flex-col">
            {formattedReport.news.map((item: any, idx: number) => {
              const hasUrl = item.url && item.url !== '#';
              const content = (
                <>
                  <span className="text-white text-sm leading-relaxed">
                    {item.title}
                  </span>
                </>
              );

              return hasUrl ? (
                <a 
                  key={idx} 
                  href={item.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 py-4 border-b border-[#1a1a1a] last:border-0 rounded px-2 -mx-2 hover:bg-[#1a1a1a] transition-all hover:opacity-80 cursor-pointer"
                >
                  {content}
                </a>
              ) : (
                <div 
                  key={idx} 
                  className="flex items-start gap-3 py-4 border-b border-[#1a1a1a] last:border-0 rounded px-2 -mx-2 cursor-default"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

function SteepRow({ 
  label, 
  content, 
  variant, 
  isLast 
}: { 
  label: string; 
  content: string; 
  variant: 'blue' | 'purple' | 'yellow' | 'green' | 'red';
  isLast?: boolean;
}) {
  const styles = {
    blue: "bg-[#1a2a3a] text-[#60a5fa]",
    purple: "bg-[#2a1a3a] text-[#a78bfa]",
    yellow: "bg-[#2a1a00] text-[#FFD700]",
    green: "bg-[#0a2a0a] text-[#4ade80]",
    red: "bg-[#2a0a0a] text-[#f87171]",
  };

  return (
    <div className={`${isLast ? '' : 'border-b border-[#1a1a1a] pb-5 mb-5'}`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className={`${styles[variant]} px-3 py-1 rounded text-xs font-bold min-w-[70px] text-center h-fit w-fit`}>
          {label}
        </div>
        <div className="text-[#cccccc] text-sm leading-relaxed flex-grow">
          {content}
        </div>
      </div>
    </div>
  );
}
