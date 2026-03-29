'use client';

import { useState, useEffect } from 'react';
import { Save, X, RefreshCw, Plus, Trash2, Image as ImageIcon, Upload, Loader, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    const [visitorStats, setVisitorStats] = useState<{ date: string, count: number }[]>([]);
    const [originalStats, setOriginalStats] = useState<{ date: string, count: number }[]>([]); // Store raw daily data
    const [totalVisitors, setTotalVisitors] = useState(0);
    const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [reports, setReports] = useState<any[]>([]);
    const [isFetchingReports, setIsFetchingReports] = useState(false);
    const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(new Set());
    const [reportView, setReportView] = useState<'list' | 'editor'>('list');
    const [editingReport, setEditingReport] = useState<any | null>(null);
    const [isSavingReport, setIsSavingReport] = useState(false);
    const [industries, setIndustries] = useState<any[]>([]);
    const [bulkNewsText, setBulkNewsText] = useState('');

    const getWeek = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };

    const emptyReport = {
        id: '',
        title: '',
        industry_id: 1,
        category: 'AI · 테크 플랫폼',
        summary: '',
        week: `2026-W${getWeek()}`,
        week_label: '',
        image_url: '',
        is_featured: false,
        steep_s: '', steep_t: '', steep_e: '', steep_e2: '', steep_p: '',
        insight_1: '', insight_2: '',
        market_charts: [
            { title: '', unit: '', source: '', labels: ['2023', '2024', '2025', '2026', '2027', '2028'], values: [0, 0, 0, 0, 0, 0] }
        ],
        news_refs: [
            { title: '', url: '' }, { title: '', url: '' }, { title: '', url: '' }, { title: '', url: '' }, { title: '', url: '' },
            { title: '', url: '' }, { title: '', url: '' }, { title: '', url: '' }, { title: '', url: '' }, { title: '', url: '' }
        ]
    };

    useEffect(() => {
        if (activeTab === 'stats') {
            fetch('/api/visitors/stats')
                .then(res => res.json())
                .then(data => {
                    setTotalVisitors(data.totalCount);
                    if (data.history) {
                        const chartData = Object.entries(data.history).map(([date, count]) => ({
                            date,
                            count: count as number
                        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        setOriginalStats(chartData); // Save raw data
                        setVisitorStats(chartData); // Initialize with daily data
                    }
                })
                .catch(err => console.error(err));
        } else if (activeTab === 'trends') {
            fetchReports();
            fetchIndustries();
        }
    }, [activeTab]);

    const fetchIndustries = async () => {
        try {
            const res = await fetch('/api/industries');
            const result = await res.json();
            if (result.success) {
                setIndustries(result.data);
            }
        } catch (error) {
            console.error('Fetch industries error:', error);
        }
    };

    // Auto-generate ID (Slug)
    useEffect(() => {
        if (editingReport && reportView === 'editor') {
            const industry = industries.find(i => i.id === editingReport.industry_id);
            if (industry && editingReport.week) {
                const slug = `${industry.name_en.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${editingReport.week.toLowerCase()}`;
                if (editingReport.id !== slug) {
                    setEditingReport((prev: any) => ({ ...prev, id: slug }));
                }
            }
        }
    }, [editingReport?.industry_id, editingReport?.week, industries, reportView]);

    const fetchReports = async () => {
        setIsFetchingReports(true);
        try {
            // Using a simple bearer token for now as per current structure
            // In a real app, this should be a proper session or a more secure method
            const res = await fetch('/api/reports', {
                headers: {
                    'Authorization': 'Bearer 58a370b5e0c06be8b7a80d9b504f532bf00a46287feecc23c909b98217ebfdc8' // Correct full secret
                }
            });
            const result = await res.json();
            if (result.success) {
                setReports(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setIsFetchingReports(false);
        }
    };

    const handleDeleteReport = async (id: string, title: string) => {
        if (!confirm(`'${title}' 보고서를 정말 삭제하시겠습니까?`)) return;

        try {
            const res = await fetch(`/api/reports?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer 58a370b5e0c06be8b7a80d9b504f532bf00a46287feecc23c909b98217ebfdc8'
                }
            });
            const result = await res.json();
            if (result.success) {
                alert('삭제되었습니다.');
                setSelectedReportIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
                fetchReports();
            } else {
                alert(`삭제 실패: ${result.error}`);
            }
        } catch (error) {
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const handleToggleSelectAll = () => {
        if (selectedReportIds.size === reports.length) {
            setSelectedReportIds(new Set());
        } else {
            setSelectedReportIds(new Set(reports.map(r => r.id)));
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedReportIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleDeleteSelected = async () => {
        const count = selectedReportIds.size;
        if (count === 0) return;
        if (!confirm(`선택한 ${count}개의 보고서를 정말 삭제하시겠습니까?`)) return;

        const ids = Array.from(selectedReportIds).join(',');
        try {
            const res = await fetch(`/api/reports?id=${ids}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer 58a370b5e0c06be8b7a80d9b504f532bf00a46287feecc23c909b98217ebfdc8'
                }
            });
            const result = await res.json();
            if (result.success) {
                alert('삭제되었습니다.');
                setSelectedReportIds(new Set());
                fetchReports();
            } else {
                alert(`삭제 실패: ${result.error}`);
            }
        } catch (error) {
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const handleSaveReport = async () => {
        if (!editingReport.id || !editingReport.title) {
            alert('ID(슬러그)와 제목은 필수 입력 항목입니다.');
            return;
        }

        // Ensure required fields like category and summary are present
        const reportToSave = { ...editingReport };
        
        if (!reportToSave.category && industries.length > 0) {
            const currentInd = industries.find(ind => ind.id === reportToSave.industry_id);
            if (currentInd) {
                reportToSave.category = currentInd.category;
            }
        }
        
        // If summary is missing, fallback to insight_1 or empty string
        if (!reportToSave.summary) {
            reportToSave.summary = reportToSave.insight_1 || '';
        }
    
        setIsSavingReport(true);
        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 58a370b5e0c06be8b7a80d9b504f532bf00a46287feecc23c909b98217ebfdc8'
                },
                body: JSON.stringify(reportToSave)
            });
            const result = await res.json();
            if (result.success) {
                alert('보고서가 저장되었습니다.');
                setReportView('list');
                fetchReports();
            } else {
                alert(`저장 실패: ${result.error}`);
            }
        } catch (error) {
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsSavingReport(false);
        }
    };

    const handleReportChange = (field: string, value: any) => {
        setEditingReport((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleStatChange = (statNum: number, field: string, value: any) => {
        handleReportChange(`stat_${statNum}_${field}`, value);
    };

    const handleNewsChange = (index: number, field: string, value: any) => {
        const newNews = [...editingReport.news_refs];
        newNews[index] = { ...newNews[index], [field]: value };
        handleReportChange('news_refs', newNews);
    };

    const handleBulkNewsPaste = () => {
        if (!bulkNewsText.trim()) return;

        // Non-empty lines
        const lines = bulkNewsText.split('\n').map(l => l.trim()).filter(l => l !== '');
        const newNews = [...emptyReport.news_refs]; // Start with clean slots

        let newsIdx = 0;
        for (let i = 0; i < lines.length; i += 2) {
            if (newsIdx >= 10) break;
            const title = lines[i];
            const url = lines[i + 1] || '#';
            newNews[newsIdx] = { title, url };
            newsIdx++;
        }

        handleReportChange('news_refs', newNews);
        setBulkNewsText('');
        alert(`${newsIdx}개의 뉴스가 자동으로 채워졌습니다.`);
    };

    const handleReportImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingId(-1); // Use -1 to indicate report image
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                handleReportChange('image_url', data.url);
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

    // Data Aggregation Logic
    useEffect(() => {
        if (originalStats.length === 0) return;

        let aggregatedData: { date: string, count: number }[] = [];

        if (timeRange === 'daily') {
            aggregatedData = [...originalStats];
        } else if (timeRange === 'weekly') {
            const weeks: Record<string, number> = {};
            originalStats.forEach(item => {
                const date = new Date(item.date);
                const firstDay = new Date(date.setDate(date.getDate() - date.getDay())); // Sunday
                const weekLabel = `${firstDay.getMonth() + 1}/${firstDay.getDate()} 주`;
                weeks[weekLabel] = (weeks[weekLabel] || 0) + item.count;
            });
            aggregatedData = Object.entries(weeks).map(([date, count]) => ({ date, count }));
        } else if (timeRange === 'monthly') {
            const months: Record<string, number> = {};
            originalStats.forEach(item => {
                const monthLabel = item.date.substring(0, 7); // YYYY-MM
                months[monthLabel] = (months[monthLabel] || 0) + item.count;
            });
            aggregatedData = Object.entries(months).map(([date, count]) => ({ date, count }));
        } else if (timeRange === 'yearly') {
            const years: Record<string, number> = {};
            originalStats.forEach(item => {
                const yearLabel = item.date.substring(0, 4); // YYYY
                years[yearLabel] = (years[yearLabel] || 0) + item.count;
            });
            aggregatedData = Object.entries(years).map(([date, count]) => ({ date, count }));
        }

        setVisitorStats(aggregatedData);
    }, [timeRange, originalStats]);

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
                const data = await res.json();
                alert(`저장 실패: ${data.details || '알 수 없는 오류'}`);
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
        { id: 'trends', label: 'Trends' },
        { id: 'contact', label: 'Contact' },
        { id: 'stats', label: 'Visitor' },
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

                        {activeTab === 'stats' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-[#111] p-6 rounded-lg border border-[#333]">
                                        <h3 className="text-gray-400 text-sm mb-2">총 방문자 수</h3>
                                        <div className="text-3xl font-bold text-white">{totalVisitors.toLocaleString()}명</div>
                                    </div>

                                    <div className="col-span-2 bg-[#111] p-6 rounded-lg border border-[#333]">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-gray-400 text-sm">방문자 추이</h3>
                                            <div className="flex bg-[#222] rounded p-1 gap-1">
                                                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((range) => (
                                                    <button
                                                        key={range}
                                                        onClick={() => setTimeRange(range)}
                                                        className={`px-3 py-1 text-xs rounded transition-colors ${timeRange === range
                                                            ? 'bg-[var(--primary-yellow)] text-black font-bold'
                                                            : 'text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        {range === 'daily' && '일별'}
                                                        {range === 'weekly' && '주별'}
                                                        {range === 'monthly' && '월별'}
                                                        {range === 'yearly' && '연별'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={visitorStats}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                    <XAxis
                                                        dataKey="date"
                                                        stroke="#888"
                                                        tickFormatter={(value: string) => {
                                                            if (timeRange === 'daily') return value.slice(5);
                                                            return value;
                                                        }}
                                                        tick={{ fontSize: 12 }}
                                                    />
                                                    <YAxis stroke="#888" tick={{ fontSize: 12 }} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#222', borderColor: '#444', color: '#fff' }}
                                                        itemStyle={{ color: '#fff' }}
                                                        formatter={(value: number) => [`${value}명`, '방문자']}
                                                        labelFormatter={(label) => `${label}`}
                                                    />
                                                    <Bar dataKey="count" fill="var(--primary-yellow)" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'trends' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-gray-400 text-sm">보고서 관리</h3>
                                        {selectedReportIds.size > 0 && reportView === 'list' && (
                                            <button
                                                onClick={handleDeleteSelected}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-xs font-bold hover:bg-red-500/20 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                                {selectedReportIds.size}개 삭제
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {reportView === 'list' ? (
                                            <>
                                                <button 
                                                    onClick={() => { setEditingReport(emptyReport); setReportView('editor'); }}
                                                    className="px-3 py-1.5 bg-[var(--primary-yellow)] text-black rounded text-xs font-bold flex items-center gap-1.5 hover:bg-[#e6c200]"
                                                >
                                                    <Plus size={14} />
                                                    새 보고서 작성
                                                </button>
                                                <button 
                                                    onClick={fetchReports}
                                                    className="text-[var(--primary-yellow)] text-xs font-bold hover:underline flex items-center gap-1"
                                                >
                                                    <RefreshCw size={12} className={isFetchingReports ? 'animate-spin' : ''} />
                                                    새로고침
                                                </button>
                                            </>
                                        ) : (
                                            <button 
                                                onClick={() => setReportView('list')}
                                                className="px-3 py-1.5 border border-gray-700 text-gray-400 rounded text-xs hover:bg-gray-800"
                                            >
                                                목록으로 돌아가기
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {reportView === 'list' ? (
                                    isFetchingReports && reports.length === 0 ? (
                                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-500">
                                            <RefreshCw className="animate-spin" size={32} />
                                            <p>보고서 목록을 불러오는 중...</p>
                                        </div>
                                    ) : reports.length === 0 ? (
                                        <div className="py-20 text-center border-2 border-dashed border-gray-800 rounded-xl text-gray-500">
                                            등록된 보고서가 없습니다.
                                        </div>
                                    ) : (
                                        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-gray-900/50 border-b border-gray-800">
                                                        <th className="px-6 py-4 w-12 text-center align-middle">
                                                            <input 
                                                                type="checkbox" 
                                                                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-[var(--primary-yellow)] focus:ring-[var(--primary-yellow)] focus:ring-offset-0 cursor-pointer"
                                                                checked={reports.length > 0 && selectedReportIds.size === reports.length}
                                                                onChange={handleToggleSelectAll}
                                                            />
                                                        </th>
                                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">주차 / 제목</th>
                                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">작업</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-800/50">
                                                    {reports.map((report) => (
                                                        <tr key={report.id} className={`hover:bg-white/5 transition-colors group ${selectedReportIds.has(report.id) ? 'bg-white/5' : ''}`}>
                                                            <td className="px-6 py-4 text-center align-middle">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-[var(--primary-yellow)] focus:ring-[var(--primary-yellow)] focus:ring-offset-0 cursor-pointer"
                                                                    checked={selectedReportIds.has(report.id)}
                                                                    onChange={() => handleToggleSelect(report.id)}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-xs text-[var(--primary-yellow)] font-bold mb-1">{report.week}</div>
                                                                <div className="text-sm font-medium text-white line-clamp-1">{report.title}</div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex justify-end gap-1">
                                                                    <button
                                                                        onClick={() => {
                                                                            // Setup full report object for editing
                                                                            const fullReport = { ...emptyReport, ...report };
                                                                            // Fetch full detail for editing
                                                                            fetch(`/api/reports/detail?id=${report.id}`, {
                                                                                headers: {
                                                                                    'Authorization': 'Bearer 58a370b5e0c06be8b7a80d9b504f532bf00a46287feecc23c909b98217ebfdc8'
                                                                                }
                                                                            })
                                                                                .then(res => res.json())
                                                                                .then(result => {
                                                                                    if (result.success) {
                                                                                        setEditingReport(result.data);
                                                                                        setReportView('editor');
                                                                                    } else {
                                                                                        alert('보고서 상세 정보를 불러오지 못했습니다.');
                                                                                    }
                                                                                });
                                                                        }}
                                                                        className="p-2 text-gray-500 hover:text-[var(--primary-yellow)] transition-colors"
                                                                        title="수정"
                                                                    >
                                                                        <ImageIcon size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteReport(report.id, report.title)}
                                                                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                                                        title="삭제"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-8 bg-[#111] p-8 rounded-xl border border-gray-800">
                                        {/* Editor Form */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase">산업 분야 선택</label>
                                                <select 
                                                    value={editingReport.industry_id}
                                                    onChange={(e) => {
                                                        const id = parseInt(e.target.value);
                                                        const ind = industries.find(i => i.id === id);
                                                        handleReportChange('industry_id', id);
                                                        if (ind) handleReportChange('category', ind.category);
                                                    }}
                                                    className="w-full bg-black border border-gray-800 rounded p-3 text-sm focus:border-[var(--primary-yellow)] outline-none"
                                                >
                                                    {industries.map(ind => (
                                                        <option key={ind.id} value={ind.id}>{ind.name_ko} ({ind.category})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase">발행 주차 (Week)</label>
                                                <select 
                                                    value={editingReport.week}
                                                    onChange={(e) => handleReportChange('week', e.target.value)}
                                                    className="w-full bg-black border border-gray-800 rounded p-3 text-sm focus:border-[var(--primary-yellow)] outline-none"
                                                >
                                                    {Array.from({ length: 52 }, (_, i) => {
                                                        const w = `2026-W${String(i + 1).padStart(2, '0')}`;
                                                        return <option key={w} value={w}>{w}</option>;
                                                    })}
                                                </select>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">자동 생성된 ID: <span className="text-[var(--primary-yellow)] ml-2">{editingReport.id || '(분야/주차 선택 시 자동 생성)'}</span></label>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase">보고서 제목</label>
                                                <input 
                                                    type="text"
                                                    value={editingReport.title}
                                                    onChange={(e) => handleReportChange('title', e.target.value)}
                                                    placeholder="핵심 키워드를 포함한 제목 입력"
                                                    className="w-full bg-black border border-gray-800 rounded p-3 text-sm focus:border-[var(--primary-yellow)] outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase">주차 라벨 (전시용)</label>
                                                <input 
                                                    type="text"
                                                    value={editingReport.week_label}
                                                    onChange={(e) => handleReportChange('week_label', e.target.value)}
                                                    placeholder="예: 2026년 13주차 · 3월 24~30일"
                                                    className="w-full bg-black border border-gray-800 rounded p-3 text-sm focus:border-[var(--primary-yellow)] outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase">대표 이미지 (Featured Image)</label>
                                                <div className="flex items-start gap-4 p-4 bg-black border border-gray-800 rounded">
                                                    <div className="w-40 h-24 bg-[#0a0a0a] border border-gray-800 rounded flex items-center justify-center overflow-hidden relative">
                                                        {editingReport.image_url ? (
                                                            <img src={editingReport.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="text-gray-700" size={32} />
                                                        )}
                                                        {uploadingId === -1 && (
                                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                                <Loader className="animate-spin text-[var(--primary-yellow)]" size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary-yellow)] text-black rounded font-bold cursor-pointer hover:bg-[#e6c200] transition-colors text-xs">
                                                                <Upload size={14} />
                                                                이미지 선택
                                                                <input 
                                                                    type="file" 
                                                                    accept="image/*" 
                                                                    className="hidden" 
                                                                    onChange={handleReportImageUpload}
                                                                    disabled={uploadingId === -1}
                                                                />
                                                            </label>
                                                            {editingReport.image_url && (
                                                                <button 
                                                                    onClick={() => handleReportChange('image_url', '')}
                                                                    className="text-xs text-red-500 hover:underline font-bold"
                                                                >
                                                                    이미지 삭제
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 leading-relaxed">
                                                            보고서 상단에 배경으로 활용될 대표 이미지를 업로드해 주세요.<br/>
                                                            권장 사이즈: 1200x600px 이상 (JPG, PNG)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">시장 규모 차트 (최대 3개)</label>
                                                {editingReport.market_charts.length < 3 && (
                                                    <button 
                                                        onClick={() => {
                                                            handleReportChange('market_charts', [
                                                                ...editingReport.market_charts, 
                                                                { title: '', unit: '', source: '', labels: ['2023', '2024', '2025', '2026', '2027', '2028'], values: [0, 0, 0, 0, 0, 0] }
                                                            ]);
                                                        }}
                                                        className="text-[var(--primary-yellow)] text-xs font-bold hover:underline"
                                                    >
                                                        + 차트 추가
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-8">
                                                {editingReport.market_charts.map((chart: any, cidx: number) => (
                                                    <div key={cidx} className="p-6 bg-black border border-gray-800 rounded-xl relative group/chart">
                                                        <button 
                                                            onClick={() => {
                                                                const newCharts = editingReport.market_charts.filter((_: any, i: number) => i !== cidx);
                                                                handleReportChange('market_charts', newCharts);
                                                            }}
                                                            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] text-gray-500 uppercase">차트 제목</label>
                                                                <input 
                                                                    placeholder="예: 글로벌 AI 반도체 시장 규모" 
                                                                    value={chart.title} 
                                                                    onChange={(e) => {
                                                                        const newCharts = [...editingReport.market_charts];
                                                                        newCharts[cidx].title = e.target.value;
                                                                        handleReportChange('market_charts', newCharts);
                                                                    }}
                                                                    className="w-full bg-[#111] border-none rounded p-2 text-xs"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] text-gray-500 uppercase">단위</label>
                                                                <input 
                                                                    placeholder="예: 십억 달러 ($B)" 
                                                                    value={chart.unit} 
                                                                    onChange={(e) => {
                                                                        const newCharts = [...editingReport.market_charts];
                                                                        newCharts[cidx].unit = e.target.value;
                                                                        handleReportChange('market_charts', newCharts);
                                                                    }}
                                                                    className="w-full bg-[#111] border-none rounded p-2 text-xs"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] text-gray-500 uppercase">출처</label>
                                                                <input 
                                                                    placeholder="예: Gartner, 2024" 
                                                                    value={chart.source} 
                                                                    onChange={(e) => {
                                                                        const newCharts = [...editingReport.market_charts];
                                                                        newCharts[cidx].source = e.target.value;
                                                                        handleReportChange('market_charts', newCharts);
                                                                    }}
                                                                    className="w-full bg-[#111] border-none rounded p-2 text-xs"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
                                                            {chart.labels.map((label: string, lidx: number) => (
                                                                <div key={lidx} className="space-y-1">
                                                                    <input 
                                                                        value={label} 
                                                                        onChange={(e) => {
                                                                            const newCharts = [...editingReport.market_charts];
                                                                            newCharts[cidx].labels[lidx] = e.target.value;
                                                                            handleReportChange('market_charts', newCharts);
                                                                        }}
                                                                        className="w-full bg-[#0a0a0a] border border-gray-900 rounded p-2 text-[10px] text-center"
                                                                    />
                                                                    <input 
                                                                        type="number"
                                                                        value={chart.values[lidx]} 
                                                                        onChange={(e) => {
                                                                            const newCharts = [...editingReport.market_charts];
                                                                            newCharts[cidx].values[lidx] = parseInt(e.target.value) || 0;
                                                                            handleReportChange('market_charts', newCharts);
                                                                        }}
                                                                        className="w-full bg-[#111] border-none rounded p-2 text-[10px] text-center font-bold"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* STEEP */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">S · 사회</label>
                                                <textarea rows={2} value={editingReport.steep_s} onChange={(e) => handleReportChange('steep_s', e.target.value)} className="w-full bg-black border border-gray-800 rounded p-2 text-xs" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">T · 기술</label>
                                                <textarea rows={2} value={editingReport.steep_t} onChange={(e) => handleReportChange('steep_t', e.target.value)} className="w-full bg-black border border-gray-800 rounded p-2 text-xs" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">E · 경제</label>
                                                <textarea rows={2} value={editingReport.steep_e} onChange={(e) => handleReportChange('steep_e', e.target.value)} className="w-full bg-black border border-gray-800 rounded p-2 text-xs" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">E · 환경</label>
                                                <textarea rows={2} value={editingReport.steep_e2} onChange={(e) => handleReportChange('steep_e2', e.target.value)} className="w-full bg-black border border-gray-800 rounded p-2 text-xs" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">P · 정책</label>
                                                <textarea rows={2} value={editingReport.steep_p} onChange={(e) => handleReportChange('steep_p', e.target.value)} className="w-full bg-black border border-gray-800 rounded p-2 text-xs" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">핵심 인사이트 1 (Key Insight 1)</label>
                                                <textarea rows={3} value={editingReport.insight_1} onChange={(e) => handleReportChange('insight_1', e.target.value)} className="w-full bg-black border border-gray-800 rounded p-2 text-xs" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">핵심 인사이트 2 (Key Insight 2)</label>
                                                <textarea rows={3} value={editingReport.insight_2} onChange={(e) => handleReportChange('insight_2', e.target.value)} className="w-full bg-black border border-gray-800 rounded p-2 text-xs" />
                                            </div>
                                        </div>


                                        {/* News Slots */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">뉴스 슬롯 (최대 10개)</label>
                                                <div className="text-[10px] text-gray-600">제목 한 줄, URL 한 줄 순서로 붙여넣으세요</div>
                                            </div>
                                            
                                            {/* Bulk Paste Area */}
                                            <div className="p-4 bg-[#0a0a0a] border border-gray-800 rounded-lg space-y-3">
                                                <textarea 
                                                    placeholder="여기에 뉴스 리스트를 붙여넣으세요 (제목, URL 순서)"
                                                    value={bulkNewsText}
                                                    onChange={(e) => setBulkNewsText(e.target.value)}
                                                    rows={3}
                                                    className="w-full bg-black border border-gray-800 rounded p-2 text-xs text-gray-400 outline-none focus:border-gray-600"
                                                />
                                                <button 
                                                    onClick={handleBulkNewsPaste}
                                                    className="w-full py-2 bg-gray-900 text-gray-300 rounded text-xs font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={14} />
                                                    뉴스 자동 채우기 (Bulk Parse)
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {editingReport.news_refs.map((news: any, idx: number) => (
                                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        <input 
                                                            placeholder="제목" 
                                                            value={news.title} 
                                                            onChange={(e) => handleNewsChange(idx, 'title', e.target.value)} 
                                                            className="bg-black border border-gray-800 rounded p-2 text-xs" 
                                                        />
                                                        <input 
                                                            placeholder="URL (#이면 클릭불가)" 
                                                            value={news.url} 
                                                            onChange={(e) => handleNewsChange(idx, 'url', e.target.value)} 
                                                            className="bg-black border border-gray-800 rounded p-2 text-xs" 
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bottom Actions */}
                                        <div className="pt-6 flex justify-between items-center border-t border-gray-800">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={editingReport.is_featured}
                                                    onChange={(e) => handleReportChange('is_featured', e.target.checked)}
                                                    className="w-4 h-4 rounded text-[var(--primary-yellow)] bg-black border-gray-700"
                                                />
                                                <span className="text-sm text-gray-300">이주의 주목 산업(Featured)으로 설정</span>
                                            </label>
                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={() => setReportView('list')}
                                                    className="px-6 py-2 border border-gray-700 text-gray-400 rounded font-bold hover:bg-gray-800"
                                                >
                                                    취소
                                                </button>
                                                <button 
                                                    onClick={handleSaveReport}
                                                    disabled={isSavingReport}
                                                    className="px-8 py-2 bg-[var(--primary-yellow)] text-black rounded font-bold hover:bg-[#e6c200] flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {isSavingReport ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                                    보고서 저장
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
