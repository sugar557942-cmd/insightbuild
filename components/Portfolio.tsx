'use client';

import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface PortfolioProps {
    content: any;
}

export default function Portfolio({ content }: PortfolioProps) {
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [visibleCount, setVisibleCount] = useState(9);

    if (!content) return null;

    const visibleItems = content.items.slice(0, visibleCount);

    return (
        <section id="portfolio" className="section bg-[#0a0a0a]">
            <div className="container">
                <div className="mb-16 text-center">
                    <h2 className="text-[var(--primary-yellow)] font-bold tracking-widest text-sm mb-2">
                        PORTFOLIO
                    </h2>
                    <h3 className="text-4xl font-bold text-white">
                        주요 프로젝트
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {visibleItems.map((item: any) => (
                        <div
                            key={item.id}
                            className="group bg-[#111] rounded-2xl overflow-hidden border border-[#222] hover:border-[var(--primary-yellow)] transition-all duration-300 cursor-hover"
                        >
                            <div className="h-48 bg-gray-800 relative overflow-hidden">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-bold text-4xl opacity-20 group-hover:scale-110 transition-transform duration-500">
                                            PROJECT {item.id}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    {item.tags.map((tag: string, i: number) => (
                                        <span key={i} className="text-xs font-medium px-2 py-1 rounded bg-[#222] text-gray-400">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--primary-yellow)] transition-colors">
                                    {item.title}
                                </h4>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                                    {item.desc}
                                </p>

                                <button
                                    onClick={() => setSelectedProject(item)}
                                    className="w-full py-3 rounded border border-gray-700 text-sm font-bold text-gray-300 hover:bg-[var(--primary-yellow)] hover:text-black hover:border-[var(--primary-yellow)] transition-all"
                                >
                                    요약 보기
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {visibleCount < content.items.length && (
                    <div className="text-center">
                        <button
                            onClick={() => setVisibleCount(content.items.length)}
                            className="px-8 py-3 rounded-full border border-gray-700 text-white font-bold hover:bg-[var(--primary-yellow)] hover:text-black hover:border-[var(--primary-yellow)] transition-all"
                        >
                            더보기
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedProject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#111] border border-gray-800 rounded-2xl max-w-2xl w-full p-8 relative animate-scale-up max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setSelectedProject(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
                        >
                            <X size={24} />
                        </button>

                        {selectedProject.image && (
                            <div className="w-full h-64 mb-6 rounded-xl overflow-hidden">
                                <img
                                    src={selectedProject.image}
                                    alt={selectedProject.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <h3 className="text-2xl font-bold text-[var(--primary-yellow)] mb-2">
                            {selectedProject.title}
                        </h3>
                        <p className="text-gray-400 mb-6">{selectedProject.desc}</p>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Project Detail</h4>
                                <p className="text-gray-300 leading-relaxed">
                                    {selectedProject.detail}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                {selectedProject.tags.map((tag: string, i: number) => (
                                    <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--primary-yellow)] text-black">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
