'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Building, MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

type AuthView = 'login' | 'signup' | 'reset-password' | 'success';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

export default function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<AuthView>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orgType, setOrgType] = useState('개인');
  const [discoverySource, setDiscoverySource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === 'Invalid login credentials' ? '이메일 또는 비밀번호가 일치하지 않습니다.' : error.message);
    } else {
      onClose();
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            org_type: orgType,
            discovery_source: discoverySource,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
            setError('이미 가입된 이메일 주소입니다.');
        } else {
            setError(error.message);
        }
      } else {
        setSuccessMessage('인증 메일이 발송되었습니다. 이메일을 확인해 주세요.');
        setView('success');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccessMessage('비밀번호 재설정 링크가 이메일로 발송되었습니다.');
      setView('success');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#111111] border border-gray-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {view === 'login' && '로그인'}
            {view === 'signup' && '회원가입'}
            {view === 'reset-password' && '비밀번호 찾기'}
            {view === 'success' && '완료'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-500 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[var(--primary-yellow)] transition-colors"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">비밀번호</label>
                  <button 
                    type="button"
                    onClick={() => setView('reset-password')}
                    className="text-xs text-[var(--primary-yellow)] hover:underline"
                  >
                    비밀번호 찾기
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[var(--primary-yellow)] transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[var(--primary-yellow)] text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : '로그인'}
              </button>
              <div className="text-center text-sm text-gray-500 mt-6">
                계정이 없으신가요? 
                <button type="button" onClick={() => setView('signup')} className="text-[var(--primary-yellow)] ml-2 font-bold hover:underline">회원가입</button>
              </div>
            </form>
          )}

          {view === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">이메일 주소</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[var(--primary-yellow)] transition-colors"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">비밀번호</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[var(--primary-yellow)] transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">비밀번호 확인</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="password" 
                        required 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[var(--primary-yellow)] transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">소속 유형</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['기관', '기업', '개인'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setOrgType(type)}
                        className={`py-2 text-sm rounded-lg border transition-all ${
                          orgType === type 
                          ? 'bg-[var(--primary-yellow)]/10 border-[var(--primary-yellow)] text-[var(--primary-yellow)]' 
                          : 'bg-[#1a1a1a] border-gray-800 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">인지 경로 (선택)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text" 
                      value={discoverySource}
                      onChange={(e) => setDiscoverySource(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[var(--primary-yellow)] transition-colors"
                      placeholder="블라인드, 구글 검색, 지인 소개 등"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[var(--primary-yellow)] text-black font-bold py-3 mt-4 rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : '회원가입'}
              </button>
              <div className="text-center text-sm text-gray-500 mt-6">
                이미 계정이 있으신가요? 
                <button type="button" onClick={() => setView('login')} className="text-[var(--primary-yellow)] ml-2 font-bold hover:underline">로그인</button>
              </div>
            </form>
          )}

          {view === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-gray-400 mb-6 font-medium">
                가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
              </p>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">이메일</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[var(--primary-yellow)] transition-colors"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[var(--primary-yellow)] text-black font-bold py-3 mt-4 rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : '리셋 링크 보내기'}
              </button>
              <button 
                type="button" 
                onClick={() => setView('login')}
                className="w-full text-gray-500 text-sm font-medium mt-4 hover:text-white transition-colors"
              >
                로그인으로 돌아가기
              </button>
            </form>
          )}

          {view === 'success' && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full text-green-500">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">처리 완료</h3>
                <p className="text-sm text-gray-400 whitespace-pre-line leading-relaxed">
                  {successMessage}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-full bg-[#1a1a1a] border border-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors"
              >
                닫기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
