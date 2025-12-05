'use client';

import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeroProps {
    content: any;
}

export default function Hero({ content }: HeroProps) {
    const [offset, setOffset] = useState(0);
    const [visitorStats, setVisitorStats] = useState<{ todayCount: number; totalCount: number } | null>(null);

    useEffect(() => {
        const handleScroll = () => setOffset(window.scrollY);
        window.addEventListener('scroll', handleScroll);

        const fetchVisitors = async () => {
            try {
                const res = await fetch('/api/visitors');
                if (res.ok) {
                    const data = await res.json();
                    console.log('Visitor data fetched:', data);
                    setVisitorStats(data);
                } else {
                    console.error('Visitor fetch failed:', res.status);
                }
            } catch (error) {
                console.error('Failed to fetch visitor stats:', error);
            }
        };

        fetchVisitors();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!content) return null;

    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
            {/* Abstract Background */}
            <div className="absolute inset-0 opacity-60">
                <div
                    className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[var(--primary-yellow)] blur-[120px] opacity-20 animate-pulse"
                    style={{ transform: `translateY(${offset * 0.2}px)` }}
                />
                <div
                    className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[var(--primary-yellow)] blur-[100px] opacity-10"
                    style={{ transform: `translateY(${-offset * 0.1}px)` }}
                />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
            </div>

            <div className="container relative z-10 px-4 text-center">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 animate-fade-in-up">
                    INSIGHT<span className="text-gradient">BUILD</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 font-light leading-relaxed animate-fade-in-up delay-100">
                    {content.subtitle}
                </p>
                <p className="text-gray-400 max-w-2xl mx-auto mb-12 animate-fade-in-up delay-200 hidden md:block whitespace-pre-line">
                    {content.description}
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
                    <a href="#services" className="btn-primary group">
                        {content.buttonPrimary}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a href="#portfolio" className="btn-outline">
                        {content.buttonSecondary}
                    </a>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-500">
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-[var(--primary-yellow)] to-transparent"></div>
            </div>

            {/* Visitor Counter */}
            <div className="absolute bottom-24 left-10 z-20 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-sm text-gray-400 animate-fade-in-up delay-500 min-w-[180px]">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between gap-6 items-center">
                        <span className="text-base font-medium">Today:</span>
                        <span className="text-[var(--primary-yellow)] font-mono text-xl font-bold">
                            {visitorStats?.todayCount !== undefined ? visitorStats.todayCount.toLocaleString() : '-'}
                        </span>
                    </div>
                    <div className="flex justify-between gap-6 items-center">
                        <span className="text-base font-medium">Total:</span>
                        <span className="text-[var(--primary-yellow)] font-mono text-xl font-bold">
                            {visitorStats?.totalCount !== undefined ? visitorStats.totalCount.toLocaleString() : '-'}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
