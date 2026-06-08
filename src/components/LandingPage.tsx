/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, Calendar, Users, ShieldCheck, Heart, Sparkles, ArrowRight, Layers, FileSpreadsheet, Lock } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rotate-45"></div>
            </div>
            <span className="font-bold text-xl tracking-tight italic text-zinc-805 text-zinc-800">Invitely.</span>
          </div>
          <nav className="hidden sm:flex items-center gap-8 text-sm font-semibold text-zinc-500">
            <a href="#fitur" className="hover:text-black transition-colors">Fitur Utama</a>
            <a href="#tema" className="hover:text-black transition-colors">Pilihan Tema</a>
            <a href="#harga" className="hover:text-black transition-colors">Sistem Kuota</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/login')}
              className="text-sm font-bold text-zinc-600 hover:text-black transition-colors cursor-pointer"
            >
              Masuk
            </button>
            <button
              onClick={() => onNavigate('/register')}
              className="text-sm font-bold bg-black hover:opacity-90 active:scale-95 text-white px-5 py-2.5 rounded-2xl transition-all shadow-xs cursor-pointer"
            >
              Daftar Gratis
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-zinc-100 border border-zinc-200 text-zinc-800 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6">
                <Sparkles className="h-3.5 w-3.5 text-zinc-650" />
                <span>Pilihan Tema Premium & Manajemen RSVP Real-Time</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight mb-6">
                Buat Undangan Digital Cantik <span className="font-serif-elegant italic text-zinc-900 block sm:inline">Hanya dalam 5 Menit</span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 mb-8 max-w-xl leading-relaxed font-medium">
                Undang seluruh teman dan keluarga tercinta tanpa batasan cetak kertas. Kelola daftar tamu dengan praktis, bagikan tautan khusus, dan lacak konfirmasi kehadiran instan kapan saja.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={() => onNavigate('/register')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black hover:opacity-90 active:scale-95 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all shadow-xs cursor-pointer group"
                >
                  Mulai Buat Sekarang
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#tema"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 border-2 border-black bg-white hover:bg-black hover:text-white text-[#1A1A1A] font-bold text-base px-8 py-4 rounded-2xl transition-all cursor-pointer"
                >
                  Lihat Pilihan Tema
                </a>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-8 border-t border-zinc-200 pt-8 w-full">
                <div>
                  <h3 className="text-3xl font-bold text-[#1A1A1A]">25</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Batas Gratis</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-[#1A1A1A]">3+</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Tema Desain</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-[#1A1A1A]">100%</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Responsive</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-zinc-300/40 rounded-3xl rotate-2 scale-98 opacity-50 blur-xs -z-10" />
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 relative">
                <div className="flex items-center justify-between mb-4.5 border-b border-zinc-150 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-zinc-900" />
                    <span className="h-3 w-3 rounded-full bg-zinc-400" />
                    <span className="h-3 w-3 rounded-full bg-zinc-200" />
                  </div>
                  <span className="text-[11px] bg-zinc-100 text-zinc-850 font-bold px-2.5 py-0.5 rounded-full border border-zinc-250">Classic Theme Live</span>
                </div>
                
                {/* Mock Phone Preview */}
                <div className="bg-white rounded-2xl p-5 border border-zinc-200 text-center relative overflow-hidden font-serif-elegant">
                  <div className="absolute top-2 left-2 right-2 flex justify-between text-[10px] text-zinc-600 font-mono tracking-wider">
                    <span>THE WEDDING OF</span>
                    <span>18.08.2026</span>
                  </div>
                  <div className="my-10">
                    <Heart className="h-6 w-6 text-zinc-800 mx-auto mb-2 animate-pulse" />
                    <h2 className="text-2xl font-bold text-zinc-900 font-serif-elegant">Richard & Lisa</h2>
                    <p className="text-xs text-zinc-650 italic mt-1 bg-zinc-50 inline-block px-3 py-0.5 rounded-full border border-zinc-100">
                      Menyambut Hari yang Berbahagia
                    </p>
                  </div>
                  <div className="text-[11px] text-zinc-500 space-y-1 block mt-4 border-t border-zinc-200/60 pt-3 font-sans">
                    <p className="font-bold text-zinc-950">Gedung Kriya Asri</p>
                    <p className="text-[10px] text-zinc-500">Jakarta Selatan</p>
                  </div>
                  
                  <div className="mt-5 bg-zinc-50 rounded-xl p-3 shadow-xs text-left font-sans text-xs border border-zinc-150">
                    <p className="font-bold text-zinc-900 mb-1">Kirim RSVP Hadir</p>
                    <div className="flex gap-2">
                      <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold">Hadir (2 Orang)</span>
                      <span className="text-zinc-500 self-center">"Selamat ya kak!"</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="fitur" className="py-20 bg-white border-t border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3">FITUR UNGGULAN</h2>
            <p className="text-3xl font-black text-[#1A1A1A] tracking-tight sm:text-4xl">
              Platform Pembuat Undangan Modern
            </p>
            <p className="mt-4 text-zinc-500 font-medium">
              Dilengkapi semua modul fungsional yang Anda cari untuk menunjang kelancaran publikasi resepsi Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-zinc-200 hover:shadow-md transition-shadow group">
              <div className="bg-[#F2F1ED] text-black w-12 h-12 rounded-2xl flex items-center justify-center font-bold mb-6 group-hover:bg-black group-hover:text-white transition-colors border border-zinc-200">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Form Acara Lengkap</h3>
              <p className="text-zinc-600 text-sm leading-relaxed font-semibold">
                Tulis nama acara, kustomisasi tanggal dan jam mulai, sematkan peta lokasi, serta pilih foto sampul elegan pilihan Anda secara instan.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-zinc-200 hover:shadow-md transition-shadow group">
              <div className="bg-[#F2F1ED] text-black w-12 h-12 rounded-2xl flex items-center justify-center font-bold mb-6 group-hover:bg-black group-hover:text-white transition-colors border border-zinc-200">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Import Tamu CSV</h3>
              <p className="text-zinc-600 text-sm leading-relaxed font-semibold">
                Masukkan nama tamu satu per satu atau import ratusan baris sekaligus dari Microsoft Excel via file CSV. Sistem akan menggenerasikan link unik secara otomatis.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-zinc-200 hover:shadow-md transition-shadow group">
              <div className="bg-[#F2F1ED] text-black w-12 h-12 rounded-2xl flex items-center justify-center font-bold mb-6 group-hover:bg-black group-hover:text-white transition-colors border border-zinc-200">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Real-Time RSVP & Wishboard</h3>
              <p className="text-zinc-600 text-sm leading-relaxed font-semibold">
                Terima konfirmasi kehadiran tamu ("Hadir" / "Tidak Hadir"), jumlah rombongan, serta kado ucapan selamat yang tampil langsung pada visual undangan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="tema" className="py-20 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3">GALLERY TEMPLATE</h2>
            <p className="text-3xl font-black text-[#1A1A1A] tracking-tight sm:text-4xl">
              Pilihan Tema Sesuai Kebutuhan Acara Anda
            </p>
            <p className="mt-4 text-zinc-500 font-medium">
              Setiap tema dirancang secara spesifik dengan perpaduan warna, ornamen dekoratif, dan tipografi khusus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Classic Theme */}
            <div className="bg-white rounded-3xl overflow-hidden border border-zinc-200 hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="h-48 bg-amber-50/50 flex items-center justify-center p-6 border-b border-amber-100">
                <div className="text-center font-serif-elegant">
                  <span className="text-[10px] tracking-wide text-amber-800 uppercase block mb-1 font-bold">Premium Gold</span>
                  <p className="text-2xl font-bold text-amber-900">Classic Serenade</p>
                  <p className="text-xs text-zinc-500 font-sans mt-2">Gaya mewah ornamen klasik & font serif romantis</p>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A]">Tema Classic</h3>
                  <p className="text-zinc-500 text-sm mt-1 mb-4 leading-relaxed font-semibold">
                    Sempurna untuk acara pernikahan formal, jamuan makan malam elegan, atau resepsi bergaya adat tradisional yang penuh kesakralan.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/register')}
                  className="w-full py-2.5 bg-black hover:opacity-90 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
                >
                  Gunakan Tema Classic
                </button>
              </div>
            </div>

            {/* Bunga Theme */}
            <div className="bg-white rounded-3xl overflow-hidden border border-zinc-200 hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="h-48 bg-rose-50/50 flex items-center justify-center p-6 border-b border-rose-100 relative overflow-hidden">
                <div className="text-center">
                  <span className="text-[10px] tracking-wide text-rose-700 uppercase block mb-1 font-bold">Florals Spring</span>
                  <p className="text-2xl font-serif-elegant font-bold text-rose-900 italic">Bloom Garden</p>
                  <p className="text-xs text-zinc-500 mt-2">Kelembutan bunga mekar & visual romantis estetik</p>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A]">Tema Bunga</h3>
                  <p className="text-zinc-500 text-sm mt-1 mb-4 leading-relaxed font-semibold">
                    Dihiasi dengan ilustrasi mawar indah, warna pastel lembut yang menenangkan mata, serta ornamen daun bergaya vintage.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/register')}
                  className="w-full py-2.5 bg-black hover:opacity-90 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
                >
                  Gunakan Tema Bunga
                </button>
              </div>
            </div>

            {/* Modern Theme */}
            <div className="bg-white rounded-3xl overflow-hidden border border-zinc-200 hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="h-48 bg-zinc-950 flex items-center justify-center p-6 border-b border-zinc-900 relative">
                <div className="text-center font-modern-display">
                  <span className="text-[10px] tracking-widest text-[#a855f7] uppercase block mb-1 font-bold">MINIMALIST CHIC</span>
                  <p className="text-xl font-bold text-white tracking-tight">Modern Slate</p>
                  <p className="text-xs text-zinc-400 font-sans mt-2">Sleek, gelap, neon violet, efisien dan kontemporer</p>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A]">Tema Modern</h3>
                  <p className="text-zinc-500 text-sm mt-1 mb-4 leading-relaxed font-semibold">
                    Cocok untuk event korporat, ulang tahun bergaya modern, peluncuran produk komersial, atau resepsi bertema minimalis futuristik.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/register')}
                  className="w-full py-2.5 bg-black hover:opacity-90 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
                >
                  Gunakan Tema Modern
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Quota Limits Section */}
      <section id="harga" className="py-20 bg-white border-t border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3">SISTEM BATASAN & HARGA</h2>
            <p className="text-3xl font-black text-[#1A1A1A] tracking-tight sm:text-4xl">
              Pilihan Skema Sesuai Skala Acara
            </p>
            <p className="mt-4 text-zinc-500 font-medium">
              Mulailah secara cuma-cuma dengan lisensi gratis, atau tingkatkan lisensi ke paket tak terbatas jika memerlukan kapasitas besar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch border-none">
            {/* Free Tier */}
            <div className="bg-[#F2F1ED] rounded-3xl p-8 border border-zinc-200 flex flex-col justify-between relative shadow-xs">
              <div>
                <span className="inline-block bg-white text-zinc-800 text-xs font-bold px-3 py-1 rounded-full uppercase mb-4 border border-zinc-200 shadow-2xs">
                  Free Plan
                </span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-[#1A1A1A]">Rp 0</span>
                  <span className="text-zinc-500 text-sm">/selamanya</span>
                </div>
                <p className="text-zinc-600 text-sm mb-6 font-semibold">Sangat cocok untuk belajar membuat undangan digital skala kecil.</p>
                <ul className="space-y-3.5 text-sm text-zinc-700 font-semibold mb-8">
                  <li className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
                    <span>Maksimum <strong>25 undangan (events)</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-black" />
                    <span>Akses 3 tema (Classic, Bunga, Modern)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-black" />
                    <span>Unggah foto Cover & RSVP tamu</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-black" />
                    <span>Import Tamu via CSV</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('/register')}
                className="w-full py-3.5 bg-black hover:opacity-90 text-white font-bold rounded-2xl text-sm transition-all text-center cursor-pointer"
              >
                Mulai Registrasi Gratis
              </button>
            </div>

            {/* Premium Tier */}
            <div className="bg-zinc-950 rounded-3xl p-8 border border-zinc-900 text-white flex flex-col justify-between relative shadow-lg">
              <div className="absolute -top-3 right-8 bg-white text-zinc-950 border border-zinc-200 text-[10px] font-extrabold px-3.5 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
                Rekomendasi
              </div>
              <div>
                <span className="inline-block bg-zinc-900 text-zinc-350 text-xs font-bold px-3 py-1 rounded-full uppercase mb-4 border border-zinc-800">
                  Premium Unlimited
                </span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-white">Rp 149.000</span>
                  <span className="text-zinc-400 text-sm">/selamanya</span>
                </div>
                <p className="text-zinc-400 text-sm mb-6">Cocok untuk vendor WO, agen percetakan, atau pengguna dengan event masif.</p>
                <ul className="space-y-3.5 text-sm text-zinc-200 mb-8">
                  <li className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    <span>Membuat undangan <strong>Tanpa batas</strong> (Unlimited)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    <span>Bebas dari limit kuota 25 event gratis</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    <span>Prioritas pengiriman tautan broadcast</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    <span>Gunakan kode rahasia: <strong className="text-slate-200 underline">UPGRADE2025</strong></span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('/register')}
                className="w-full py-3.5 bg-white hover:bg-zinc-100 text-zinc-950 font-extrabold rounded-2xl text-sm transition-all text-center cursor-pointer"
              >
                Langganan Sekarang
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 py-12 border-t border-zinc-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-zinc-900 pb-8 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-zinc-950 rotate-45 bg-zinc-950"></div>
              </div>
              <span className="font-bold text-lg text-white tracking-tight italic">Invitely.</span>
            </div>
            <p className="text-xs text-zinc-500 font-semibold">
              © {new Date().getFullYear()} Invitely. Dibuat menggunakan React, Supabase & Tailwind.
            </p>
          </div>
          <div className="text-center text-[11px] text-zinc-650 max-w-lg mx-auto leading-relaxed font-medium">
            Halaman ini merupakan implementasi demonstrasi platform undangan online interaktif dengan pembatasan kuota dan kustomisasi template dinamis. Gunakan kode upgrade secara gratis di panel subscription untuk mencoba fitur Premium penuh.
          </div>
        </div>
      </footer>
    </div>
  );
}
