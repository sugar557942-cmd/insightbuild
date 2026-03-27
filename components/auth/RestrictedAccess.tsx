'use client';

import { Lock, LogIn, UserPlus } from 'lucide-react';

interface RestrictedAccessProps {
  onLogin: () => void;
  onSignup: () => void;
  title?: string;
  description?: string;
}

export default function RestrictedAccess({ 
  onLogin, 
  onSignup,
  title = "Login Required",
  description = "Industry Trends Report is member-exclusive content.\nPlease log in to access all reports and analysis.",
}: RestrictedAccessProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#111111]/50 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="w-16 h-16 bg-[var(--primary-yellow)]/10 rounded-full flex items-center justify-center text-[var(--primary-yellow)] mb-6 ring-4 ring-[var(--primary-yellow)]/5">
        <Lock size={32} />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">
        {title}
      </h2>
      
      <p className="text-gray-400 text-sm leading-relaxed mb-8 whitespace-pre-line max-w-sm">
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <button 
          onClick={onLogin}
          className="flex-1 bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <LogIn size={18} />
          Log In
        </button>
        <button 
          onClick={onSignup}
          className="flex-1 bg-[var(--primary-yellow)] text-black font-bold py-3 px-6 rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus size={18} />
          Sign Up
        </button>
      </div>
      
      <p className="mt-8 text-xs text-gray-600 font-medium">
        인사이트빌드 회원만이 누릴 수 있는 특별한 비즈니스 인사이트를 만나보세요.
      </p>
    </div>
  );
}
