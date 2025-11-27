'use client';

import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeroProps {
    content: any;
}

export default function Hero({ content }: HeroProps) {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => setOffset(window.scrollY);
        window.addEventListener('scroll', handleScroll);
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
                <p className="text-gray-400 max-w-2xl mx-auto mb-12 animate-fade-in-up delay-200 hidden md:block">
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
        </section>
    );
}
