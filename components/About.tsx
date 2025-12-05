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
        return Array.from(wordMap.entries()).map(([text, value]) => ({
            text,
            value
        }));
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
                            <div className="w-[90%] h-[90%] max-w-[400px] max-h-[400px] mx-auto flex flex-wrap justify-center items-center gap-4 content-center">
                                {words.map((word: any, index: number) => {
                                    // Hydration Error 방지를 위해 Math.random() 대신 결정론적 난수 생성 사용
                                    // 단어 텍스트와 인덱스를 기반으로 항상 같은 값을 생성하도록 함
                                    const seed = word.text.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) + index;
                                    const pseudoRandom = (Math.sin(seed) + 1) / 2; // 0 ~ 1 사이 값

                                    // Tailwind class 대신 inline style로 확실하게 크기 제어
                                    // 박스 밖으로 나가지 않도록 크기 범위 축소 (0.8rem ~ 2.0rem)
                                    const randomSize = 0.8 + pseudoRandom * 1.2;

                                    const colors = ['text-[#FFD700]', 'text-[#FFAA00]', 'text-white', 'text-gray-200', 'text-gray-400'];
                                    const colorClass = colors[index % colors.length];

                                    return (
                                        <span
                                            key={word.text + index}
                                            className={`${colorClass} font-bold leading-tight transition-all duration-300 hover:scale-110 cursor-default`}
                                            style={{
                                                fontSize: `${randomSize}rem`
                                            }}
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
