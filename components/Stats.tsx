'use client';

import { TrendingUp, Users, Briefcase } from 'lucide-react';

interface StatsProps {
    content: any;
}

export default function Stats({ content }: StatsProps) {
    if (!content) return null;

    return (
        <section className="py-20 bg-black border-y border-[#111]">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-[var(--primary-yellow)] rounded-2xl p-6 md:p-8 text-black flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
                        <TrendingUp size={48} className="mb-4 opacity-80" />
                        <div className="text-4xl md:text-5xl font-bold mb-2">{content.yearlyValue}</div>
                        <div className="font-bold opacity-70 text-sm md:text-base">{content.yearlyLabel}</div>
                    </div>

                    <div className="bg-[#111] border border-[#333] rounded-2xl p-6 md:p-8 text-white flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300 group hover:border-[var(--primary-yellow)]">
                        <Briefcase size={48} className="mb-4 text-gray-600 group-hover:text-[var(--primary-yellow)] transition-colors" />
                        <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:text-[var(--primary-yellow)] transition-colors">{content.totalValue}</div>
                        <div className="text-gray-500 text-sm md:text-base">{content.totalLabel}</div>
                    </div>

                    <div className="bg-[#111] border border-[#333] rounded-2xl p-6 md:p-8 text-white flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300 group hover:border-[var(--primary-yellow)]">
                        <Users size={48} className="mb-4 text-gray-600 group-hover:text-[var(--primary-yellow)] transition-colors" />
                        <div className="text-xl md:text-2xl font-bold mb-2 mt-2 group-hover:text-[var(--primary-yellow)] transition-colors">{content.areasValue}</div>
                        <div className="text-gray-500 mt-1 text-sm md:text-base">{content.areasLabel}</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
