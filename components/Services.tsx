'use client';

import { ArrowUpRight } from 'lucide-react';

interface ServicesProps {
    content: any;
}

export default function Services({ content }: ServicesProps) {
    if (!content) return null;

    return (
        <section id="services" className="section bg-black">
            <div className="container">
                <div className="mb-16 text-center">
                    <h2 className="text-[var(--primary-yellow)] font-bold tracking-widest text-sm mb-2">
                        OUR SERVICES
                    </h2>
                    <h3 className="text-4xl font-bold text-white">
                        전문적인 컨설팅 서비스
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {content.items.map((item: any, index: number) => (
                        <div
                            key={item.id}
                            className="group relative p-6 md:p-8 rounded-2xl bg-[#111] border border-[#222] hover:border-[var(--primary-yellow)] transition-all duration-300 hover:-translate-y-2 cursor-hover"
                        >
                            <div className="absolute top-8 right-8 text-[#333] group-hover:text-[var(--primary-yellow)] transition-colors">
                                <ArrowUpRight size={24} />
                            </div>

                            <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center mb-6 group-hover:bg-[var(--primary-yellow)] transition-colors">
                                <span className="font-bold text-lg text-white group-hover:text-black">
                                    {index + 1}
                                </span>
                            </div>

                            <h4 className="text-xl font-bold text-white mb-3 group-hover:text-[var(--primary-yellow)] transition-colors">
                                {item.title}
                            </h4>
                            <p className="text-gray-400 text-sm mb-6">
                                {item.desc}
                            </p>

                            <div className="space-y-2">
                                {item.steps.map((step: string, i: number) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                                        <div className="w-1 h-1 rounded-full bg-[var(--primary-yellow)]"></div>
                                        {step}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
