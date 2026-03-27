'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { ChevronRight, FileText, Search } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import AuthModal from '../auth/AuthModal';
import RestrictedAccess from '../auth/RestrictedAccess';

interface TrendsClientProps {
    initialIndustries: any[];
    initialReports: any[];
    isLoggedIn: boolean;
}

interface NewsItem {
    title: string;
    source: string;
    url: string;
}

export default function TrendsClient({ initialIndustries, initialReports, isLoggedIn }: TrendsClientProps) {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState(initialIndustries[0]?.name_ko || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authInitialView, setAuthInitialView] = useState<'login' | 'signup'>('login');

    const isUserLoggedIn = isLoggedIn || !!user;

    const openLogin = () => {
        setAuthInitialView('login');
        setIsAuthModalOpen(true);
    };

    const openSignup = () => {
        setAuthInitialView('signup');
        setIsAuthModalOpen(true);
    };

    const categories = initialIndustries.map((i: any) => i.name_ko);
    
    const formattedReports = initialReports.map((report: any) => ({
        ...report,
        weekLabel: report.week_label,
        summary: report.summary,
        title: report.title,
        isFeatured: report.is_featured,
        steep: {
            s: report.steep_s,
            t: report.steep_t,
            e: report.steep_e,
            p: report.steep_p
        },
        news: (report.news_refs as NewsItem[] | null) || []
    }));

    const filteredReports = formattedReports.filter((report: any) => 
        (report.industry_id === initialIndustries.find((i: any) => i.name_ko === selectedCategory)?.id || report.category === selectedCategory) &&
        (report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
         report.summary.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const featuredReports = formattedReports.filter((r: any) => r.isFeatured);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
            <Header onAdminClick={() => {}} />
            
            <div className="container mx-auto px-4">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Industry Trends Report</h1>
                    <p className="text-gray-400">최신 기술 트렌드와 산업별 심층 분석 보고서를 확인하세요.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar: Categories */}
                    <aside className="lg:w-1/4">
                        <div className="bg-[#111] rounded-2xl border border-gray-800 overflow-hidden sticky top-28">
                            <div className="p-4 border-b border-gray-800">
                                <h2 className="font-bold text-lg mb-4">산업 분류</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="분류 검색..." 
                                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--primary-yellow)] transition-colors"
                                    />
                                </div>
                            </div>
                            <nav className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`w-full text-left px-6 py-3 text-sm transition-all flex justify-between items-center group
                                            ${selectedCategory === category 
                                                ? 'bg-[var(--primary-yellow)] text-black font-bold' 
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                                        `}
                                    >
                                        {category}
                                        <ChevronRight size={14} className={selectedCategory === category ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'} />
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content: Reports */}
                    <section className="lg:w-3/4 overflow-hidden relative">
                        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-2xl font-bold border-l-4 border-[var(--primary-yellow)] pl-4">
                                {selectedCategory} <span className="text-gray-500 text-lg font-normal ml-2">({filteredReports.filter(r => !r.isFeatured).length})</span>
                            </h2>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="보고서 제목 검색" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#111] border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--primary-yellow)] transition-colors"
                                />
                            </div>
                        </div>

                        <div className={`relative ${!isUserLoggedIn ? 'min-h-[600px]' : ''}`}>
                            {/* Blurrable Content */}
                            <div className={!isUserLoggedIn ? 'blur-md pointer-events-none select-none grayscale' : ''}>
                                {/* Featured Report Card */}
                                {featuredReports.map(featured => (
                                    <div key={`featured-${featured.id}`} className="mb-8 bg-[#111111] border-l-4 border-[#FFD700] border-y border-r border-[#222222] rounded-lg p-6 shadow-xl">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Left: Info & STEEP */}
                                            <div>
                                                <span className="bg-[#FFD700] text-black text-xs font-bold px-3 py-1 rounded">
                                                    이주의 주목 산업
                                                </span>
                                                <h3 className="text-white text-xl font-bold mt-3">
                                                    {featured.title}
                                                </h3>
                                                <p className="text-[#999999] text-sm mt-2 line-clamp-3 leading-relaxed">
                                                    {featured.summary}
                                                </p>
                                                
                                                <div className="grid grid-cols-2 gap-3 mt-6">
                                                    <div className="bg-[#1a1a1a] rounded p-3">
                                                        <div className="text-[#60a5fa] text-[10px] font-bold mb-1">S · 사회</div>
                                                        <div className="text-white/80 text-[11px] line-clamp-1">{featured.steep.s}</div>
                                                    </div>
                                                    <div className="bg-[#1a1a1a] rounded p-3">
                                                        <div className="text-[#a78bfa] text-[10px] font-bold mb-1">T · 기술</div>
                                                        <div className="text-white/80 text-[11px] line-clamp-1">{featured.steep.t}</div>
                                                    </div>
                                                    <div className="bg-[#1a1a1a] rounded p-3">
                                                        <div className="text-[#FFD700] text-[10px] font-bold mb-1">E · 경제</div>
                                                        <div className="text-white/80 text-[11px] line-clamp-1">{featured.steep.e}</div>
                                                    </div>
                                                    <div className="bg-[#1a1a1a] rounded p-3">
                                                        <div className="text-[#f87171] text-[10px] font-bold mb-1">P · 정책</div>
                                                        <div className="text-white/80 text-[11px] line-clamp-1">{featured.steep.p}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Key News */}
                                            <div className="flex flex-col h-full">
                                                <div className="text-[#FFD700] text-xs font-bold tracking-widest mb-4 uppercase">
                                                    핵심 뉴스
                                                </div>
                                                <div className="space-y-0 flex-grow">
                                                    {featured.news.slice(0, 4).map((item: any, nidx: number) => (
                                                        <div key={nidx} className="border-b border-[#1a1a1a] py-3 flex items-start gap-3 last:border-0 hover:bg-white/5 transition-colors px-2 -mx-2 rounded">
                                                            <span className="bg-[#222222] text-[#FFD700] text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap mt-0.5">
                                                                {item.source}
                                                            </span>
                                                            <span className="text-white text-xs line-clamp-1">
                                                                {item.title}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-auto pt-6 flex justify-end">
                                                    <Link 
                                                        href={`/trends/${featured.id}`} 
                                                        className="text-[#FFD700] text-sm font-medium hover:underline flex items-center gap-1 group"
                                                    >
                                                        전체 보고서 보기 
                                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="grid gap-4">
                                    {filteredReports.filter(r => !r.isFeatured).length > 0 ? (
                                        filteredReports.filter(r => !r.isFeatured).map((report) => (
                                            <Link 
                                                key={report.id}
                                                href={`/trends/${report.id}`}
                                                className="bg-[#111] border border-gray-800 rounded-2xl p-6 hover:border-[#FFD700] transition-all group block shadow-md"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3 text-[var(--primary-yellow)] text-xs font-bold uppercase tracking-wider">
                                                        <FileText size={14} />
                                                        INDUSTRY REPORT
                                                    </div>
                                                    <span className="text-gray-500 text-xs">{report.weekLabel}</span>
                                                </div>
                                                <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--primary-yellow)] transition-colors">
                                                    {report.title}
                                                </h3>
                                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                                    {report.summary}
                                                </p>
                                                <div className="text-sm font-bold flex items-center gap-2 group/btn text-[#FFD700]">
                                                    상세 보기 
                                                    <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="bg-[#111] border border-dashed border-gray-800 rounded-2xl p-20 text-center">
                                            <FileText size={48} className="mx-auto text-gray-700 mb-4" />
                                            <p className="text-gray-500">
                                                {searchTerm ? '검색 결과가 없습니다.' : '해당 카테고리에 등록된 보고서가 없습니다.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Restricted Access Overlay */}
                            {!isUserLoggedIn && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
                                    <RestrictedAccess 
                                        onLogin={openLogin}
                                        onSignup={openSignup}
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                initialView={authInitialView}
            />

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </main>
    );
}
