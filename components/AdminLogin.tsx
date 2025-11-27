'use client';

import { useState } from 'react';
import { X, Lock } from 'lucide-react';

interface AdminLoginProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
}

export default function AdminLogin({ isOpen, onClose, onLogin }: AdminLoginProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'dlstkdlxmqlfem123!') {
            onLogin();
            onClose();
            setPassword('');
            setError('');
        } else {
            setError('비밀번호가 올바르지 않습니다.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-md p-8 relative animate-scale-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-[var(--primary-yellow)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-black" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">관리자 모드 진입</h2>
                    <p className="text-gray-400 mt-2 text-sm">
                        관리자 비밀번호를 입력해주세요.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[var(--primary-yellow)] focus:outline-none transition-colors text-center tracking-widest"
                            placeholder="Password"
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg font-bold bg-[var(--primary-yellow)] text-black hover:bg-[#e6c200] transition-colors"
                    >
                        로그인
                    </button>
                </form>
            </div>
        </div>
    );
}
