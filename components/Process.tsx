'use client';

interface ProcessProps {
    content: any;
}

export default function Process({ content }: ProcessProps) {
    if (!content) return null;

    return (
        <section className="section bg-[#050505] border-y border-[#111]">
            <div className="container">
                <div className="mb-16 text-center">
                    <h2 className="text-[var(--primary-yellow)] font-bold tracking-widest text-sm mb-2">
                        PROCESS
                    </h2>
                    <h3 className="text-4xl font-bold text-white">
                        컨설팅 프로세스
                    </h3>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-[#222] -translate-y-1/2 z-0"></div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
                        {content.steps.map((step: string, index: number) => (
                            <div key={index} className="flex flex-col items-center text-center group">
                                <div className="w-10 h-10 rounded-full bg-[#111] border border-[#333] flex items-center justify-center text-[var(--primary-yellow)] font-bold mb-4 group-hover:bg-[var(--primary-yellow)] group-hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                                    {index + 1}
                                </div>
                                <div className="px-4 py-3 rounded-full bg-[#111] border border-[#222] text-sm text-gray-300 group-hover:border-[var(--primary-yellow)] transition-colors w-full md:w-auto">
                                    {step}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
