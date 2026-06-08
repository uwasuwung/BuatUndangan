/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { db } from '../store';
import { Mail, User, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';

interface AuthPageProps {
  onNavigate: (route: string) => void;
  initialTab?: 'login' | 'register';
}

export default function AuthPage({ onNavigate, initialTab = 'login' }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (activeTab === 'login') {
      if (!email.trim()) {
        setErrorMsg('Email atau User ID wajib diisi.');
        return;
      }
      const res = db.signIn(email);
      if (res.success) {
        onNavigate('/dashboard/events');
      } else {
        setErrorMsg(res.error || 'Terjadi kesalahan saat masuk.');
      }
    } else {
      if (!email.trim() || !fullName.trim()) {
        setErrorMsg('Harap lengkapi semua kolom.');
        return;
      }
      const res = db.signUp(email, fullName);
      if (res.success) {
        setSuccessMsg('Pendaftaran berhasil! Mengalihkan ke dashboard...');
        setTimeout(() => {
          onNavigate('/dashboard/events');
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Terjadi kesalahan saat pendaftaran.');
      }
    }
  };

  const handleDemoLogin = () => {
    setErrorMsg('');
    setSuccessMsg('');
    db.forceSetSession('user-richard-123'); // Demo logged in
    onNavigate('/dashboard/events');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm relative">
        {/* Title logo block */}
        <div className="text-center">
          <div className="flex items-center gap-2.5 justify-center mb-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rotate-45"></div>
            </div>
            <span className="font-bold text-xl tracking-tight italic text-zinc-800">Invitely.</span>
          </div>
          <p className="mt-2 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            Supabase Auth & Plan Limitation Ecosystem
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="flex bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`w-1/2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-black text-white shadow-xs'
                : 'text-zinc-650 hover:text-black'
            }`}
          >
            Masuk Akun
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            className={`w-1/2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-black text-white shadow-xs'
                : 'text-zinc-650 hover:text-black'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-150 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed font-semibold">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Forms */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5" htmlFor="fullName">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-zinc-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-zinc-800 transition-colors bg-zinc-50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5" htmlFor="emailAddress">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <input
                id="emailAddress"
                name="email"
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-zinc-250 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-zinc-800 transition-colors bg-zinc-50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-black hover:opacity-90 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {activeTab === 'login' ? 'Masuk Sekarang' : 'Daftar Akun Gratis'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative border-t border-zinc-200 my-6">
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] text-zinc-400 font-bold uppercase tracking-widest whitespace-nowrap">
            Atau Gunakan Akun Demo
          </span>
        </div>

        {/* Demo Fast Login Shortcut */}
        <div className="bg-[#F2F1ED] rounded-2xl p-4 border border-zinc-200 text-center">
          <div className="flex items-center gap-1.5 justify-center mb-2">
            <Sparkles className="h-4 w-4 text-zinc-800" />
            <span className="text-xs font-bold text-zinc-950">Pre-populated Demo Account</span>
          </div>
          <p className="text-[11px] text-zinc-650 mb-3 leading-relaxed font-semibold">
            Gunakan profil <strong>Richard Philips</strong> untuk langsung menguji dashboard, me-manage data tamu yang sudah di-seed, mengimpor CSV, dan melihat visual RSVP instan!
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 bg-white hover:bg-zinc-50 text-zinc-950 font-bold text-xs rounded-xl border border-zinc-300 shadow-xs transition-colors cursor-pointer"
          >
            Satu-Klik Masuk Demo
          </button>
        </div>

        {/* Navigation back */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="text-xs font-semibold text-zinc-500 hover:text-black hover:underline cursor-pointer inline-block"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
