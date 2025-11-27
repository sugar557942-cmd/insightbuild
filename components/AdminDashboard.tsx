'use client';

import { useState } from 'react';
import { Save, X, RefreshCw, Plus, Trash2, Image as ImageIcon, Upload, Loader } from 'lucide-react';

interface AdminDashboardProps {
    content: any;
    onSave: (newContent: any) => void;
    onClose: () => void;
}

export default function AdminDashboard({ content, onSave, onClose }: AdminDashboardProps) {
    const [editedContent, setEditedContent] = useState(content);
    const [activeTab, setActiveTab] = useState('hero');
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingId, setUploadingId] = useState<number | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedContent),
            });

            if (res.ok) {
                onSave(editedContent);
                alert('저장되었습니다.');
            } else {
                alert('저장 실패');
            }
        } catch (e) {
            alert('에러 발생');
        }
        setIsSaving(false);
    };

    const handleChange = (section: string, field: string, value: any) => {
        setEditedContent((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // Portfolio Specific Handlers
    const handlePortfolioChange = (index: number, field: string, value: any) => {
        const newItems = [...editedContent.portfolio.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value
        };

        setEditedContent((prev: any) => ({
            ...prev,
            portfolio: {
                ...prev.portfolio,
                items: newItems
            }
        }));
    };

    const handlePortfolioTagsChange = (index: number, value: string) => {
        const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        handlePortfolioChange(index, 'tags', tags);
    };

    const handleAddPortfolio = () => {
        const newId = Math.max(...editedContent.portfolio.items.map((item: any) => item.id), 0) + 1;
        const newItem = {
            id: newId,
            title: '새 프로젝트',
            desc: '프로젝트 설명',
            tags: ['태그1', '태그2'],
            detail: '상세 내용',
            image: ''
        };

        setEditedContent((prev: any) => ({
            ...prev,
            portfolio: {
                ...prev.portfolio,
                items: [...prev.portfolio.items, newItem]
            }
        }));
    };

    const handleDeletePortfolio = (index: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        const newItems = editedContent.portfolio.items.filter((_: any, i: number) => i !== index);
        setEditedContent((prev: any) => ({
            ...prev,
            portfolio: {
                ...prev.portfolio,
                items: newItems
            }
        }));
    };

    const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingId(index);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                handlePortfolioChange(index, 'image', data.url);
            } else {
                alert('이미지 업로드 실패');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('이미지 업로드 중 오류가 발생했습니다.');
        } finally {
            setUploadingId(null);
        }
    };

    const tabs = [
        { id: 'hero', label: 'Hero' },
        { id: 'about', label: 'About' },
        { id: 'portfolio', label: 'Portfolio' },
        { id: 'contact', label: 'Contact' },
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#111]">
                <div className="font-bold text-[var(--primary-yellow)]">ADMIN DASHBOARD</div>
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-yellow)] text-black rounded font-bold hover:bg-[#e6c200] disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        저장 및 반영
                    </button>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 rounded hover:bg-gray-800"
                    >
                        <X size={16} />
                        닫기
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-gray-800 bg-[#0a0a0a] p-4 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-4 py-3 rounded transition-colors ${activeTab === tab.id
                                ? 'bg-[var(--primary-yellow)] text-black font-bold'
                                : 'text-gray-400 hover:bg-gray-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <div className="mt-8 p-4 bg-gray-900 rounded text-xs text-gray-500">
                        * 현재 버전에서는 텍스트 수정만 지원합니다. 이미지나 복잡한 구조 변경은 개발자에게 문의하세요.
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-black">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <h2 className="text-2xl font-bold text-white capitalize mb-6">{activeTab} Section Edit</h2>

                        {activeTab === 'hero' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Main Title</label>
                                    <input
                                        type="text"
                                        value={editedContent.hero.title}
                                        onChange={(e) => handleChange('hero', 'title', e.target.value)}
                                        className="w-full bg-[#111] border border-[#333] rounded p-3 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Subtitle</label>
                                    <input
                                        type="text"
                                        value={editedContent.hero.subtitle}
                                        onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
                                        className="w-full bg-[#111] border border-[#333] rounded p-3 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Description</label>
                                    <textarea
                                        rows={4}
                                        value={editedContent.hero.description}
                                        onChange={(e) => handleChange('hero', 'description', e.target.value)}
                                        className="w-full bg-[#111] border border-[#333] rounded p-3 text-white"
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'about' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Section Title</label>
                                    <input
                                        type="text"
                                        value={editedContent.about.title}
                                        onChange={(e) => handleChange('about', 'title', e.target.value)}
                                        className="w-full bg-[#111] border border-[#333] rounded p-3 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Subtitle</label>
                                    <input
                                        type="text"
                                        value={editedContent.about.subtitle}
                                        onChange={(e) => handleChange('about', 'subtitle', e.target.value)}
                                        className="w-full bg-[#111] border border-[#333] rounded p-3 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Description</label>
                                    <textarea
                                        rows={6}
                                        value={editedContent.about.description}
                                        onChange={(e) => handleChange('about', 'description', e.target.value)}
                                        className="w-full bg-[#111] border border-[#333] rounded p-3 text-white"
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'portfolio' && (
                            <div className="space-y-6">
                                {editedContent.portfolio.items.map((item: any, index: number) => (
                                    <div key={item.id} className="p-6 bg-[#111] border border-[#222] rounded-lg space-y-4 relative group">
                                        <button
                                            onClick={() => handleDeletePortfolio(index)}
                                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 size={20} />
                                        </button>

                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Project Title</label>
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => handlePortfolioChange(index, 'title', e.target.value)}
                                                className="w-full bg-[#0a0a0a] border border-[#333] rounded p-3 text-white"
                                            />
                                        </div>

                                        {/* Image Upload */}
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Representative Image</label>
                                            <div className="flex items-start gap-4">
                                                <div className="w-32 h-20 bg-[#0a0a0a] border border-[#333] rounded flex items-center justify-center overflow-hidden relative">
                                                    {item.image ? (
                                                        <img src={item.image} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="text-gray-600" size={24} />
                                                    )}
                                                    {uploadingId === index && (
                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                            <Loader className="animate-spin text-[var(--primary-yellow)]" size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#222] text-gray-300 rounded cursor-pointer hover:bg-[#333] transition-colors text-sm">
                                                        <Upload size={16} />
                                                        이미지 업로드
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handleImageUpload(index, e)}
                                                            disabled={uploadingId === index}
                                                        />
                                                    </label>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        권장 사이즈: 600x400px (JPG, PNG)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Description</label>
                                            <input
                                                type="text"
                                                value={item.desc}
                                                onChange={(e) => handlePortfolioChange(index, 'desc', e.target.value)}
                                                className="w-full bg-[#0a0a0a] border border-[#333] rounded p-3 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Detail</label>
                                            <textarea
                                                rows={2}
                                                value={item.detail}
                                                onChange={(e) => handlePortfolioChange(index, 'detail', e.target.value)}
                                                className="w-full bg-[#0a0a0a] border border-[#333] rounded p-3 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Tags (쉼표로 구분)</label>
                                            <input
                                                type="text"
                                                value={item.tags.join(', ')}
                                                onChange={(e) => handlePortfolioTagsChange(index, e.target.value)}
                                                className="w-full bg-[#0a0a0a] border border-[#333] rounded p-3 text-white"
                                                placeholder="예: AI, 헬스케어, 플랫폼"
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={handleAddPortfolio}
                                    className="w-full py-4 border-2 border-dashed border-[#333] rounded-lg text-gray-400 hover:border-[var(--primary-yellow)] hover:text-[var(--primary-yellow)] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} />
                                    새 프로젝트 추가
                                </button>
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Title</label>
                                    <input
                                        type="text"
                                        value={editedContent.contact.title}
                                        onChange={(e) => handleChange('contact', 'title', e.target.value)}
                                        className="w-full bg-[#111] border border-[#333] rounded p-3 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Subtitle</label>
                                    <input
                                        type="text"
                                        value={editedContent.contact.subtitle}
                                        onChange={(e) => handleChange('contact', 'subtitle', e.target.value)}
                                        className="w-full bg-[#111] border border-[#333] rounded p-3 text-white"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
