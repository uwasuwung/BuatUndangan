/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from '../store';
import { ChevronLeft, Crown, ShieldAlert, Sparkles, Check, CheckCircle2, RefreshCw } from 'lucide-react';

interface SubscriptionPageProps {
  onNavigate: (route: string) => void;
}

export default function SubscriptionPage({ onNavigate }: SubscriptionPageProps) {
  const [plan, setPlan] = useState<any>(null);
  const [secCode, setSecCode] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setPlan(db.getCurrentPlan());
  }, []);

  const handleUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess(false);

    if (!secCode.trim()) {
      setErrorMsg('Masukkan kode promo rahasia terlebih dahulu.');
      return;
    }

    const userId = db.getSessionUserId();
    if (!userId) {
      setErrorMsg('User id tidak dalam keadaan login.');
      return;
    }

    const result = db.upgradePlan(userId, secCode);
    if (result.success) {
      setSuccess(true);
      setPlan(db.getCurrentPlan());
      setSecCode('');
    } else {
      setErrorMsg(result.error || 'Kode salah. Coba gunakan: UPGRADE2025');
    }
  };

  const handleDowngradeForTesting = () => {
    const userId = db.getSessionUserId();
    if (userId) {
      db.downgradePlan(userId);
      setPlan(db.getCurrentPlan());
      setErrorMsg('');
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] font-sans pb-40">
      
      {/* Top sticky navbar */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            type="button"
            onClick={() => onNavigate('/dashboard/events')}
            className="flex items-center gap-1 text-xs font-bold text-zinc-550 hover:text-black cursor-pointer transition-all"
          >
            <ChevronLeft className="h-4.5 w-4.5" /> Kembali Ke Dashboard
          </button>
          <span className="font-extrabold text-sm text-zinc-950 tracking-tight">Sistem Keanggotaan & Berlangganan</span>
          <div className="w-12" /> {/* aligned spacer */}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-12">
        <div className="text-center mb-8">
          <Crown className="h-10 w-10 text-zinc-950 mx-auto mb-3" />
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">Pilih Tingkat Keanggotaan</h1>
          <p className="text-sm text-zinc-550 mt-1 pb-4 border-b border-zinc-200 font-semibold">
            Dukung pembuatan undangan digital Anda tanpa limit dan bagikan ke audiens tanpa batas.
          </p>
        </div>

        {/* Upgrade Success Notification */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-250 text-emerald-950 p-6 rounded-3xl mb-8 text-center text-xs space-y-2 shadow-2xs font-semibold">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h4 className="font-extrabold text-sm text-emerald-900">Upgrade Berhasil! 🎉</h4>
            <p className="text-emerald-800 leading-normal font-semibold">
              Selamat, akun Anda telah dideklarasikan sebagai <strong>Premium Partnership Unlimited</strong>! 
              Sistem limitasi 25 undangan telah dilepas sepenuhnya. Anda sekarang bisa membuat undangan hingga 999.999 event secara aman.
            </p>
          </div>
        )}

        {/* Current status display card */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-zinc-450 uppercase">Paket Keanggotaan Aktif Anda</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border tracking-wider uppercase ${
              plan?.plan === 'premium' ? 'bg-zinc-950 text-white border-zinc-800' : 'bg-zinc-150 text-zinc-850 border-zinc-250'
            }`}>
              {plan?.plan === 'premium' ? '👑 Premium' : 'Free Trial'}
            </span>
          </div>

          <div className="flex gap-4 items-center">
            <p className="text-4xl font-black text-zinc-950">
              {plan?.plan === 'premium' ? 'Rp 149.000' : 'Rp 0'}
            </p>
            <div className="text-xs text-zinc-500 leading-relaxed font-bold">
              <p>Jumlah Event Dibuat: <strong className="text-zinc-850">{plan?.events_created}</strong> dari <strong className="text-zinc-850">{plan?.plan === 'premium' ? 'Tanpa Batas (~1JT)' : '25'}</strong></p>
              <p>Berlaku Sampai: <strong className="text-zinc-850">{plan?.subscription_expires_at ? new Date(plan.subscription_expires_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Selamanya'}</strong></p>
            </div>
          </div>
        </div>

        {/* Promo Upgrade Module */}
        {plan?.plan === 'free' ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-black" />
              <h2 className="text-sm font-extrabold text-zinc-950">Masukkan Kode Upgrade Lisensi</h2>
            </div>
            
            <p className="text-xs text-zinc-500 leading-relaxed font-bold">
              Sesuai dengan instruksi spesifikasi, masukkan kode kupon promosi di bawah untuk beralih gratis ke paket Premium Unlimited!
            </p>

            <div className="p-3 bg-[#FAF9F6] border border-zinc-200 rounded-xl text-[11px] text-zinc-850 font-bold mb-2 text-center">
              💡 Gunakan Kode Promo: <strong className="text-black underline select-all">UPGRADE2025</strong>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-700 bg-rose-50 px-3.5 py-2.5 rounded-xl text-center border border-rose-100">
                ❌ {errorMsg}
              </p>
            )}

            <form onSubmit={handleUpgrade} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="CONTOH: UPGRADE2025"
                value={secCode}
                onChange={(e) => setSecCode(e.target.value)}
                className="grow border border-zinc-250 rounded-xl px-4 py-3 text-xs font-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-zinc-800 placeholder-zinc-450 uppercase bg-[#FAF9F6]"
              />
              <button
                type="submit"
                className="bg-black hover:opacity-90 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                Terapkan Kode
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-4 shadow-2xs text-center">
            <p className="text-xs text-zinc-650 font-bold">🛠️ MENU PENGUJIAN AKUN DEVELOPER</p>
            <p className="text-[11px] text-zinc-500 leading-normal font-semibold">
              Apakah Anda ingin menguji kembali alur validasi pembatasan pembuatan event gratis maksimal 25? 
              Klik tombol di bawah ini untuk menurunkan status lisensi Anda kembali ke Gratis secara instan.
            </p>
            <button
              type="button"
              onClick={handleDowngradeForTesting}
              className="px-5 py-2.5 bg-rose-50 hover:bg-[#FFF5F5] hover:text-rose-850 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
            >
              Downgrade Plan Kembali ke Free (Untuk Demo)
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
