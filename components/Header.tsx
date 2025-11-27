'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Lock } from 'lucide-react';

export default function Header({ onAdminClick }: { onAdminClick: () => void }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'About', href: '#about' },
        { name: 'Services', href: '#services' },
        { name: 'Portfolio', href: '#portfolio' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-white z-50">
                    INSIGHT<span className="text-[var(--primary-yellow)]">BUILD</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm font-medium text-gray-300 hover:text-[var(--primary-yellow)] transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <button
                        onClick={onAdminClick}
                        className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 border border-gray-700 rounded-full hover:border-[var(--primary-yellow)] hover:text-[var(--primary-yellow)] transition-all"
                    >
                        <Lock size={12} />
                        ADMIN
                    </button>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white z-50"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>

                {/* Mobile Nav */}
                <div
                    className={`fixed inset-0 bg-black flex flex-col items-center justify-center gap-8 transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-2xl font-bold text-white hover:text-[var(--primary-yellow)]"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <button
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            onAdminClick();
                        }}
                        className="mt-4 flex items-center gap-2 text-sm font-bold px-4 py-2 border border-gray-700 rounded-full text-gray-400"
                    >
                        <Lock size={14} />
                        관리자 모드
                    </button>
                </div>
            </div>
        </header>
    );
}
