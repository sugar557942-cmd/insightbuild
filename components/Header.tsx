'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Lock, LogOut } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import AuthModal from './auth/AuthModal';

export default function Header({ onAdminClick }: { onAdminClick: () => void }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authInitialView, setAuthInitialView] = useState<'login' | 'signup'>('login');
    
    const { user, signOut } = useAuth();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const openLogin = () => {
        setAuthInitialView('login');
        setIsAuthModalOpen(true);
    };

    const openSignup = () => {
        setAuthInitialView('signup');
        setIsAuthModalOpen(true);
    };

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    }, [isMobileMenuOpen]);

    const navItems = [
        { name: 'About', href: '#about' },
        { name: 'Services', href: '#services' },
        { name: 'Portfolio', href: '#portfolio' },
        { name: 'Industry Trends Report', href: '/trends' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
                ${isScrolled ? 'bg-black/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}
            `}
        >
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-white z-50">
                    INSIGHT<span className="text-[var(--primary-yellow)]">BUILD</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map(item => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`text-sm font-medium transition-colors ${
                                item.name === 'Industry Trends Report' 
                                ? 'text-[var(--primary-yellow)]' 
                                : 'text-gray-300 hover:text-[var(--primary-yellow)]'
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                    
                    {user ? (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onAdminClick}
                                className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 border border-gray-700 rounded-full hover:border-[var(--primary-yellow)] hover:text-[var(--primary-yellow)] transition-all"
                            >
                                <Lock size={12} />
                                ADMIN
                            </button>
                            <button
                                onClick={() => signOut()}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="로그아웃"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={openLogin}
                                className="text-sm font-bold text-gray-300 hover:text-white transition-colors"
                            >
                                로그인
                            </button>
                            <button
                                onClick={openSignup}
                                className="bg-[var(--primary-yellow)] text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-yellow-400 transition-all"
                            >
                                회원가입
                            </button>
                        </div>
                    )}
                </nav>

                {/* Menu Toggle (mobile) */}
                <button
                    className="md:hidden text-white z-50"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={`fixed top-0 left-0 w-full h-screen bg-black
                            flex flex-col items-center justify-center gap-8 
                            z-[9999] transition-transform duration-300 md:hidden 
                            ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {navItems.map(item => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`text-3xl font-bold transition-colors ${
                            item.name === 'Industry Trends Report' 
                            ? 'text-[var(--primary-yellow)]' 
                            : 'text-white hover:text-[var(--primary-yellow)]'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {item.name}
                    </Link>
                ))}

                {user ? (
                    <div className="flex flex-col items-center gap-4 mt-4">
                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                onAdminClick();
                            }}
                            className="flex items-center gap-2 text-sm font-bold px-6 py-3 border border-gray-700 rounded-full text-gray-300"
                        >
                            <Lock size={16} />
                            관리자 모드
                        </button>
                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                signOut();
                            }}
                            className="text-gray-500 font-medium hover:text-white transition-colors"
                        >
                            로그아웃
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 mt-4 w-full px-12">
                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                openLogin();
                            }}
                            className="w-full py-4 text-xl font-bold text-white border border-gray-800 rounded-2xl"
                        >
                            로그인
                        </button>
                        <button
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                openSignup();
                            }}
                            className="w-full py-4 text-xl font-bold bg-[var(--primary-yellow)] text-black rounded-2xl"
                        >
                            회원가입
                        </button>
                    </div>
                )}
            </div>

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                initialView={authInitialView}
            />
        </header>
    );
}
