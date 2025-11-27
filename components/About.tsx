'use client';

import { useMemo } from 'react';
interface AboutProps {
    content: any;
    portfolioItems: any[];
}

export default function About({ content, portfolioItems }: AboutProps) {
    const words = useMemo(() => {
        if (!portfolioItems) return [];

        const wordMap = new Map<string, number>();

        portfolioItems.forEach(item => {
            // 태그 기준으로 워드클라우드 데이터 생성
            item.tags.forEach((tag: string) => {
                const cleanTag = tag.trim();
                if (cleanTag) {
                    wordMap.set(cleanTag, (wordMap.get(cleanTag) || 0) + 10);
                }
            });
        });

        // value 값으로 크기를 다르게 쓰기 위해 남겨둠
        return Array.from(wordMap.entries()).map(([text, value]) => ({ text, value }));
    }, [portfolioItems]);

    if (!content) return null;

    return (
        <section id="about" className="section bg-[#0a0a0a]">
            <div className="container">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    {/* 텍스트 영역 */}
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

                        {/* 숫자 통계 */}
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

                    {/* 비주얼 영역 (커스텀 워드클라우드) */}
                    <div className="relative h-[500px] w-full rounded-2xl overflow-hidden bg-gray-900/50 border border-gray-800 group flex items-center justify-center">
                        {/* 배경 효과 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-80" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--primary-yellow)] rounded-full blur-[100px] opacity-10" />

                        {/* 단어 그리드 */}
                        <div className="absolute inset-0 flex items-center justify-center p-8">
                            <div className="w-[80%] h-[80%] max-w-[260px] max-h-[260px] mx-auto grid grid-cols-3 sm:grid-cols-4 gap-2 place-items-center text-center">
                                {words.map((word: any, index: number) => {
                                    // value에 따라 크기 살짝 차이 주기
                                    const weight = word.value || 10;
                                    const sizeClass =
                                        weight > 40 ? 'text-xl' :
                                        weight > 30 ? 'text-lg' :
                                        weight > 20 ? 'text-base' :
                                        weight > 10 ? 'text-sm' : 'text-xs';

                                    const colors = ['text-[#FFD700]', 'text-[#FFAA00]', 'text-white', 'text-gray-200', 'text-gray-400'];
                                    const colorClass = colors[index % colors.length];

                                    return (
                                        <span
                                            key={word.text + index}
                                            className={`${sizeClass} ${colorClass} font-bold leading-tight`}
                                        >
                                            {word.text}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
