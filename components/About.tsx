'use client';

import { useMemo } from 'react';
import WordCloud from 'react-d3-cloud';

interface AboutProps {
    content: any;
    portfolioItems: any[];
}

export default function About({ content, portfolioItems }: AboutProps) {
    const words = useMemo(() => {
        if (!portfolioItems) return [];

        const wordMap = new Map<string, number>();

        portfolioItems.forEach(item => {
            // Process tags only (Industry & Consulting Type)
            item.tags.forEach((tag: string) => {
                const cleanTag = tag.trim();
                if (cleanTag) {
                    // Increase weight for better visibility since we have fewer words now
                    wordMap.set(cleanTag, (wordMap.get(cleanTag) || 0) + 10);
                }
            });
        });

        return Array.from(wordMap.entries()).map(([text, value]) => ({ text, value: value * 100 }));
    }, [portfolioItems]);

    if (!content) return null;

    return (
        <section id="about" className="section bg-[#0a0a0a]">
            <div className="container">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    {/* Text Content */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-[var(--primary-yellow)] font-bold tracking-widest text-sm mb-2">
                                {content.title}
                            </h2>
                            <h3 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                                {content.subtitle}
                            </h3>
                            <p className="text-gray-400 leading-relaxed text-lg whitespace-pre-line">
                                {content.description}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-8 border-t border-gray-800 pt-8">
                            <div>
                                <div className="text-4xl font-bold text-white mb-1">
                                    {content.stats.yearly}
                                </div>
                                <div className="text-sm text-gray-500">연간 프로젝트</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-white mb-1">
                                    {content.stats.total}
                                </div>
                                <div className="text-sm text-gray-500">누적 프로젝트</div>
                            </div>
                        </div>
                    </div>

                    {/* Visual/Word Cloud Area */}
                    <div className="relative h-[500px] w-full rounded-2xl overflow-hidden bg-gray-900/50 border border-gray-800 group flex items-center justify-center">
                        {/* Background Effects */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-80"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--primary-yellow)] rounded-full blur-[100px] opacity-10"></div>

                        <div className="absolute inset-0 flex items-center justify-center p-8">
                            {/* 워드클라우드가 카드 안쪽으로 더 들어가도록 최대 크기를 제한 */}
                            <div className="w-[80%] h-[80%] max-w-[260px] max-h-[260px] mx-auto">
                                <WordCloud
                                    data={words}
                                    width={220}              // 실제 클라우드 캔버스 크기 더 축소
                                    height={220}
                                    font="Outfit"
                                    fontStyle="normal"
                                    fontWeight="bold"
                                    fontSize={(word) => Math.log2(word.value) * 1.6} // 글자 크기도 추가 축소
                                    spiral="rectangular"
                                    rotate={() => 0}         // 세로 글자 제거, 더 정돈된 느낌
                                    padding={5}              // 단어 사이 여백을 늘려서 덜 꽉 차보이게
                                    fill={(d: any) => {
                                        const colors = ['#FFD700', '#FFAA00', '#FFFFFF', '#CCCCCC', '#999999'];
                                        return colors[Math.floor(Math.random() * colors.length)];
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
