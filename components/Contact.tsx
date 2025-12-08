// components/Contact.tsx

'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ContactProps {
    content: any;
}

// 용량 제한 상수 (개별 1GB, 총합 1GB)
const MAX_FILE_SIZE = 1024 * 1024 * 1024;   // 1GB
const MAX_TOTAL_SIZE = 1024 * 1024 * 1024;  // 1GB

export default function Contact({ content }: ContactProps) {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        phone: '',
        field: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [files, setFiles] = useState<(File | null)[]>([null]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files && e.target.files[0] ? e.target.files[0] : null;
        const newFiles = [...files];

        // 파일 제거
        if (!selectedFile) {
            newFiles[index] = null;
            setFiles(newFiles);
            return;
        }

        // 1) 개별 파일 1GB 검사
        if (selectedFile.size > MAX_FILE_SIZE) {
            alert(`각 첨부파일은 최대 1GB까지만 업로드할 수 있습니다.\n(${selectedFile.name})`);
            e.target.value = '';
            return;
        }

        // 임시로 대입 후 총합 계산
        newFiles[index] = selectedFile;
        const totalSize = newFiles.reduce(
            (sum, f) => sum + (f ? f.size : 0),
            0
        );

        // 2) 전체 합 1GB 검사
        if (totalSize > MAX_TOTAL_SIZE) {
            alert('첨부파일 전체 용량은 최대 1GB까지 업로드할 수 있습니다.');
            e.target.value = '';
            return;
        }

        // 마지막 슬롯이 채워졌고, 슬롯 수가 3개 미만이면 빈 슬롯 추가
        if (index === newFiles.length - 1 && newFiles.length < 3) {
            newFiles.push(null);
        }

        setFiles(newFiles);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const attachments: { name: string; url: string }[] = [];
            const validFiles = files.filter((f) => f !== null) as File[];

            // 업로드 전에 한 번 더 용량 검사 (우회 방지용)
            let totalSize = 0;
            for (const file of validFiles) {
                if (file.size > MAX_FILE_SIZE) {
                    alert(`각 첨부파일은 최대 1GB까지만 업로드할 수 있습니다.\n(${file.name})`);
                    setStatus('error');
                    return;
                }
                totalSize += file.size;
            }
            if (totalSize > MAX_TOTAL_SIZE) {
                alert('첨부파일 전체 용량은 최대 1GB까지 업로드할 수 있습니다.');
                setStatus('error');
                return;
            }

            const uploadErrors: string[] = [];

            if (validFiles.length > 0) {
                await Promise.all(
                    validFiles.map(async (file) => {
                        const uploadFormData = new FormData();
                        uploadFormData.append('file', file);

                        try {
                            const uploadRes = await fetch('/api/upload', {
                                method: 'POST',
                                body: uploadFormData,
                            });

                            if (uploadRes.ok) {
                                const uploadData = await uploadRes.json();
                                attachments.push({
                                    name: file.name,
                                    url: uploadData.url
                                });
                            } else {
                                const errorText = await uploadRes.text();
                                console.error(
                                    'File upload failed for',
                                    file.name,
                                    uploadRes.status,
                                    errorText
                                );
                                let cleanError = errorText;
                                try {
                                    const jsonError = JSON.parse(errorText);
                                    if (jsonError.error) cleanError = jsonError.error;
                                } catch (e) { /* ignore */ }

                                uploadErrors.push(
                                    `${file.name} (Error ${uploadRes.status}: ${cleanError})`
                                );
                            }
                        } catch (err: any) {
                            console.error('Upload exception for', file.name, err);
                            uploadErrors.push(`${file.name} (${err.message})`);
                        }
                    })
                );
            }

            if (uploadErrors.length > 0) {
                alert(
                    `다음 파일 업로드에 실패했습니다: ${uploadErrors.join(
                        ', '
                    )}\n파일 크기나 네트워크 상태를 확인해주세요.`
                );
                setStatus('error');
                return;
            }

            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, attachments }),
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', company: '', phone: '', field: '', message: '' });
                setFiles([null]);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Submission error:', error);
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

                <div className="bg-[#111] border border-[#222] rounded-2xl p-5 md:p-12 shadow-2xl">
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
                            <label className="text-sm font-bold text-gray-400">문의 분야</label>
                            <select
                                name="field"
                                required
                                value={formData.field}
                                onChange={handleChange}
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[var(--primary-yellow)] focus:outline-none transition-colors appearance-none cursor-pointer"
                            >
                                <option value="" disabled>분야를 선택해주세요</option>
                                <option value="R&D기획">R&D기획</option>
                                <option value="시장조사 및 분석">시장조사 및 분석</option>
                                <option value="BM 수립">BM 수립</option>
                                <option value="기타 외주용역">기타 외주용역</option>
                            </select>
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

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-gray-400">
                                첨부 파일 (선택사항, 최대 3개)
                            </label>
                            {files.map((fileItem, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(index, e)}
                                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[var(--primary-yellow)] focus:outline-none transition-colors text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#222] file:text-[var(--primary-yellow)] hover:file:bg-[#333]"
                                    />
                                    {index < files.length - 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newFiles = files.filter((_, i) => i !== index);
                                                setFiles(newFiles);
                                            }}
                                            className="text-red-500 hover:text-red-400 text-sm px-2"
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className={`w-full py-4 rounded-lg font-bold text.black transition-all flex items-center justify-center gap-2 ${status === 'success'
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
                            별도의 이메일로 문의하고자 하시는 경우,{' '}
                            <a
                                href="mailto:insightbuild@daum.net"
                                className="text-[var(--primary-yellow)] hover:underline"
                            >
                                insightbuild@daum.net
                            </a>{' '}
                            으로 문의주시기 바랍니다.
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
}
