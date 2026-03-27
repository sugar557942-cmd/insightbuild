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

interface ReportStat {
  value: string;
  label: string;
  delta: string;
  trend: string;
}

interface NewsItem {
  title: string;
  source: string;
  url: string;
}

interface FormattedReport {
  id: string;
  title: string;
  summary: string;
  category: string;
  week_label: string;
  tags: string[];
  stats: ReportStat[];
  steep: {
    s: string;
    t: string;
    e: string;
    e2: string;
    p: string;
  };
  insights: string[];
  chartData: {
    labels: string[];
    values: number[];
  };
  news: NewsItem[];
}

export default async function ReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  const { data: report } = await supabaseAdmin
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (!report) {
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
    stats: [
      { value: report.stat_1_value || '', label: report.stat_1_label || '', delta: report.stat_1_delta || '', trend: report.stat_1_trend || '' },
      { value: report.stat_2_value || '', label: report.stat_2_label || '', delta: report.stat_2_delta || '', trend: report.stat_2_trend || '' },
      { value: report.stat_3_value || '', label: report.stat_3_label || '', delta: report.stat_3_delta || '', trend: report.stat_3_trend || '' },
    ].filter((s: ReportStat): s is ReportStat => !!s.value),
    steep: {
      s: report.steep_s || '',
      t: report.steep_t || '',
      e: report.steep_e || '',
      e2: report.steep_e2 || '',
      p: report.steep_p || '',
    },
    insights: [report.insight_1, report.insight_2].filter((i: string | null): i is string => Boolean(i)),
    chartData: {
      labels: (report.chart_labels as string[] | null) || [],
      values: (report.chart_values as number[] | null) || [],
    },
    news: (report.news_refs as NewsItem[] | null) || [],
  };

  const cleanDelta = (delta: string) => {
    return delta ? delta.replace(/^[▲▼▷↑↓→\s]+/, '').trim() : '';
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* [A] Header */}
        <div className="mb-10">
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
          <p className="text-[#999999] text-lg leading-relaxed max-w-3xl mb-8">
            {formattedReport.summary}
          </p>
          
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {formattedReport.stats.map((stat: ReportStat, idx: number) => (
            <div 
              key={idx} 
              className="bg-[#111111] border border-[#222222] rounded-2xl p-6 hover:border-[#333333] transition-all"
            >
              <div className="text-[#FFD700] text-4xl font-bold mb-2 tabular-nums">
                {stat.value}
              </div>
              <div className="text-[#999999] text-sm font-medium mb-4">
                {stat.label}
              </div>
              <div className={`flex items-center gap-1.5 text-sm font-bold
                ${stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-[#FFD700]'}
              `}>
                {stat.trend === 'up' ? '↑ ' : stat.trend === 'down' ? '↓ ' : '→ '}
                {cleanDelta(stat.delta || '')}
              </div>
            </div>
          ))}
        </div>

        {/* [C] Main 2-Col Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* [C-1] STEEP Analysis */}
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8">
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
            {/* Chart Card */}
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 flex flex-col h-full">
              <div className="text-[#FFD700] text-xs font-bold tracking-[0.2em] mb-6 uppercase flex justify-between items-center">
                WEEKLY TREND
                <Info size={14} className="text-gray-600 cursor-help" />
              </div>
              <div className="flex-grow flex items-center justify-center">
                <div className="w-full">
                  <TrendBarChart labels={formattedReport.chartData.labels} values={formattedReport.chartData.values} />
                </div>
              </div>
              <div className="text-[#666666] text-xs text-center mt-6">
                최근 8주간 관련 키워드 도출 빈도 및 관심도 추이 ({formattedReport.chartData.labels[0]} - {formattedReport.chartData.labels[formattedReport.chartData.labels.length - 1]})
              </div>
            </div>

            {/* Insights Card */}
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8">
              <div className="text-[#FFD700] text-xs font-bold tracking-[0.2em] mb-6 uppercase">
                KEY INSIGHTS
              </div>
              <div className="space-y-4">
                {formattedReport.insights.map((insight: string, i: number) => (
                  <div key={i} className={`bg-[#1a1a1a] rounded-xl p-5 border-l-4 ${i === 0 ? 'border-[#FFD700]' : 'border-green-500'} text-[#cccccc] text-sm leading-relaxed shadow-lg`}>
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* [D] Bottom: News Card */}
        <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[#FFD700] text-xs font-bold tracking-widest uppercase">
              THIS WEEK'S KEY NEWS
            </div>
          </div>
          
          <div className="flex flex-col">
            {formattedReport.news.map((item: any, idx: number) => (
              <Link 
                key={idx} 
                href={item.url}
                className={`flex items-start gap-3 py-4 border-b border-[#1a1a1a] last:border-0 hover:bg-[#1a1a1a] transition-colors rounded px-2 -mx-2`}
              >
                <span className="bg-[#222222] text-[#FFD700] text-xs font-medium px-2 py-0.5 rounded flex-shrink-0 mt-0.5">
                  {item.source}
                </span>
                <span className="text-white text-sm leading-relaxed">
                  {item.title}
                </span>
              </Link>
            ))}
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
    <div className={`${isLast ? '' : 'border-b border-[#1a1a1a] pb-8 mb-0'}`}>
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
