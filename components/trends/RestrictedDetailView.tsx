'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '../auth/AuthProvider';
import AuthModal from '../auth/AuthModal';
import RestrictedAccess from '../auth/RestrictedAccess';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface RestrictedDetailViewProps {
  category: string;
  weekLabel: string;
}

export default function RestrictedDetailView({ category, weekLabel }: RestrictedDetailViewProps) {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState<'login' | 'signup'>('login');

  const openLogin = () => {
    setAuthInitialView('login');
    setIsAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthInitialView('signup');
    setIsAuthModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <Header onAdminClick={() => {}} />
      
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <Link 
            href="/trends" 
            className="flex items-center gap-2 text-[#999999] hover:text-white transition-colors text-sm mb-6"
          >
            <ChevronLeft size={18} />
            Industry Trends Report
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="border border-[#FFD700] text-[#FFD700] rounded-full px-3 py-1 text-sm font-medium">
              {weekLabel}
            </span>
          </div>
          
          <div className="text-[#FFD700] text-sm font-bold mb-3 tracking-wide uppercase">
            {category}
          </div>
          
          <div className="h-10 w-2/3 bg-gray-800/20 rounded animate-pulse mb-6"></div>
          <div className="h-4 w-full bg-gray-800/10 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-5/6 bg-gray-800/10 rounded animate-pulse mb-12"></div>
        </div>

        <div className="relative py-20 px-6 bg-[#111111]/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-[var(--primary-yellow)]/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            {user ? (
              <div className="py-12 flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-[var(--primary-yellow)] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium animate-pulse">Checking authentication...</p>
              </div>
            ) : (
              <RestrictedAccess 
                onLogin={openLogin}
                onSignup={openSignup}
                title="Deep analysis reports are for members only"
                description="Please log in to access STEEP analysis, weekly trend charts, and core business insights for this industry."
              />
            )}
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authInitialView}
      />
    </main>
  );
}
