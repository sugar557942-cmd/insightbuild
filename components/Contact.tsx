'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ContactProps {
    content: any;
}

export default function Contact({ content }: ContactProps) {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        phone: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', company: '', phone: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    if (!content) return null;

    return (
        <section id="contact" className="section bg-[#050505]">
            <div className="container max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-[var(--primary-yellow)] font-bold tracking-widest text-sm mb-2">
                        CONTACT
                    </h2>
                    <h3 className="text-4xl font-bold text-white">
                        {content.title}
                    </h3>
                    <p className="text-gray-400 mt-4">
                        {content.subtitle}
                    </p>
                </div>

                <div className="bg-[#111] border border-[#222] rounded-2xl p-8 md:p-12 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400">이름</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[var(--primary-yellow)] focus:outline-none transition-colors"
                                    placeholder="홍길동"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-400">기업 / 기관명</label>
                                <input
                                    type="text"
                                    name="company"
                                    required
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[var(--primary-yellow)] focus:outline-none transition-colors"
                                    placeholder="기업 / 기관명"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400">연락처</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[var(--primary-yellow)] focus:outline-none transition-colors"
                                placeholder="010-1234-5678"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400">문의 내용</label>
                            <textarea
                                name="message"
                                required
                                rows={5}
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[var(--primary-yellow)] focus:outline-none transition-colors resize-none"
                                placeholder="프로젝트 의뢰 내용이나 궁금한 점을 적어주세요."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className={`w-full py-4 rounded-lg font-bold text-black transition-all flex items-center justify-center gap-2 ${status === 'success'
                                ? 'bg-green-500 cursor-default'
                                : 'bg-[var(--primary-yellow)] hover:bg-[#e6c200] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                                }`}
                        >
                            {status === 'loading' ? (
                                <Loader2 className="animate-spin" />
                            ) : status === 'success' ? (
                                '문의가 접수되었습니다'
                            ) : (
                                <>
                                    {content.buttonText} <Send size={18} />
                                </>
                            )}
                        </button>

                        {status === 'success' && (
                            <p className="text-green-500 text-center text-sm mt-4 animate-fade-in">
                                확인 후 빠르게 연락드리겠습니다.
                            </p>
                        )}
                        {status === 'error' && (
                            <p className="text-red-500 text-center text-sm mt-4 animate-fade-in">
                                전송에 실패했습니다. 다시 시도해주세요.
                            </p>
                        )}

                        <p className="text-gray-500 text-center text-sm mt-6 pt-6 border-t border-[#222]">
                            별도의 이메일로 문의하고자 하시는 경우, <a href="mailto:insightbuild@daum.net" className="text-[var(--primary-yellow)] hover:underline">insightbuild@daum.net</a> 으로 문의주시기 바랍니다.
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
}
