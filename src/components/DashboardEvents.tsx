/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { db } from '../store';
import { Mail, Calendar, Users, Eye, Plus, Crown, Trash2, ChevronRight, CheckCircle, XCircle, HelpCircle, LogOut, Heart } from 'lucide-react';
import { Event } from '../types';

interface DashboardEventsProps {
  onNavigate: (route: string) => void;
  onSelectEvent: (eventId: string) => void;
}

export default function DashboardEvents({ onNavigate, onSelectEvent }: DashboardEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [, setTick] = useState(0);

  // Sync state with db updates
  useEffect(() => {
    const updateState = () => {
      setEvents(db.getUserEvents());
      setProfile(db.getCurrentProfile());
      setPlan(db.getCurrentPlan());
    };

    updateState();
    const unsubscribe = db.subscribe(updateState);
    return unsubscribe;
  }, []);

  const handleSignOut = () => {
    db.signOut();
    onNavigate('/');
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the event detail card
    if (confirm('Apakah Anda yakin ingin menghapus undangan ini beserta seluruh data daftar tamu & log RSVP di dalamnya?')) {
      db.deleteEvent(id);
      setTick((t) => t + 1);
    }
  };

  // Compile aggregate metrics for all of this user's events combined
  const totalGuestsTable = db.getGuestsTable();
  const userEventIds = events.map((e) => e.id);
  const userGuests = totalGuestsTable.filter((g) => userEventIds.includes(g.event_id));
  
  const totalGuests = userGuests.length;
  const confirmedAbsence = userGuests.filter((g) => g.rsvp_status === 'tidak_hadir').length;
  const confirmedAttendance = userGuests.filter((g) => g.rsvp_status === 'hadir').length;
  const pendingResponse = userGuests.filter((g) => g.rsvp_status === 'pending').length;

  // Viewed count
  const allViews = db.getInvitationViewsTable();
  const userUniqueGuestsViewed = userGuests.filter((g) => {
    return allViews.some((v) => v.guest_id === g.id);
  }).length;

  const attendanceRatio = totalGuests > 0 ? Math.round((confirmedAttendance / totalGuests) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] font-sans pb-40">
      {/* Top Header Panel */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('/dashboard/events')}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rotate-45"></div>
            </div>
            <span className="font-bold text-lg text-zinc-900 tracking-tight italic">Invitely.</span>
          </div>
          
          <div className="flex items-center gap-4">
            {profile && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-zinc-900 leading-none">{profile.full_name}</p>
                <p className="text-[10px] text-zinc-500 font-extrabold mt-1 uppercase tracking-wider">
                  {plan?.plan === 'premium' ? '👑 Premium Account' : 'Free Trial Space'}
                </p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Welcome and Plan Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-8">
          <div className="md:col-span-8 bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between border border-zinc-900 shadow-sm">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-zinc-800/15 blur-2xl" />
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-zinc-400 fill-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">BENTO INVITATION MANAGEMENT SYSTEM</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                Halo, {profile?.full_name || 'Pelanggan'}! 🙌
              </h1>
              <p className="text-zinc-400 text-sm max-w-xl leading-relaxed font-medium">
                Selamat datang kembali di panel manajemen. Mulai buat undangan baru, kelola daftar korespondensi tamu, dan nikmati penyajian RSVP termonitor dalam satu tempat praktis.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-6 border-t border-zinc-900 pt-4">
              <button
                onClick={() => onNavigate('/dashboard/events/create')}
                className="bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs px-4.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                Buat Undangan Baru
              </button>
              <button
                onClick={() => onNavigate('/dashboard/subscription')}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs px-4.5 py-2.5 rounded-xl flex items-center gap-1.5 border border-zinc-800 transition-colors cursor-pointer"
              >
                <Crown className="h-4 w-4 text-zinc-350" />
                Sistem Langganan Anda
              </button>
            </div>
          </div>

          {/* Quota Progress Block */}
          <div className="md:col-span-4 bg-[#F2F1ED] rounded-3xl p-6 border border-zinc-250 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4.5">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status Kuota</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${plan?.plan === 'premium' ? 'bg-black text-white border-zinc-950' : 'bg-white text-zinc-800 border-zinc-200'} border`}>
                  {plan?.plan === 'premium' ? '👑 Premium' : 'Free (Gratis)'}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-black text-zinc-950 leading-none">
                  {plan?.events_created} <span className="text-zinc-400 font-normal text-sm">/ {plan?.plan === 'premium' ? '∞' : '25'}</span>
                </p>
                <p className="text-xs text-zinc-500 font-bold mt-1">Undangan (Events) dibuat</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-200 h-2.5 rounded-full mb-3.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${plan?.plan === 'premium' ? 'bg-black' : 'bg-zinc-800'}`}
                  style={{ width: `${Math.min(((plan?.events_created || 0) / (plan?.plan === 'premium' ? 100 : 25)) * 100, 100)}%` }}
                />
              </div>

              {plan?.plan === 'free' ? (
                <p className="text-[11px] text-zinc-500 leading-normal font-semibold">
                  Anda menggunakan akun gratis dengan batas maksimal <strong>25 undangan</strong>. 
                  Jika mencapai batas, Anda harus upgrade ke premium untuk menambahkan event baru.
                </p>
              ) : (
                <p className="text-[11px] text-zinc-700 font-bold leading-normal">
                  Selamat! Akun Anda aktif dengan paket Premium. Nikmati batas pembuatan undangan tanpa limit secara bebas.
                </p>
              )}
            </div>

            {plan?.plan === 'free' && (
              <button
                onClick={() => onNavigate('/dashboard/subscription')}
                className="w-full mt-4 py-2.5 bg-black hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Crown className="h-3.5 w-3.5 text-zinc-200" />
                Upgrade ke Premium Unlimited
              </button>
            )}
          </div>
        </div>

        {/* Aggregate statistics */}
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Metrik Akumulatif Seluruh Acara</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-2xs">
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Total Undangan</span>
            <p className="text-2xl font-extrabold text-zinc-950">{events.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-2xs">
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Total Tamu Di-input</span>
            <p className="text-2xl font-extrabold text-zinc-950">{totalGuests}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-2xs">
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Tamu Hadir</span>
            <p className="text-2xl font-extrabold text-emerald-600">{confirmedAttendance}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-2xs">
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Tamu Tidak Hadir</span>
            <p className="text-2xl font-extrabold text-rose-500">{confirmedAbsence}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-2xs col-span-2 md:col-span-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Sudah Buka Tautan</span>
            <p className="text-2xl font-extrabold text-[#1A1A1A] pr-1 inline-block">{userUniqueGuestsViewed}</p>
            <span className="text-[11px] text-zinc-400 font-bold italic">({Math.round(totalGuests > 0 ? (userUniqueGuestsViewed / totalGuests) * 100 : 0)}%)</span>
          </div>
        </div>

        {/* Events list content */}
        <div className="flex items-center justify-between mb-6 pb-2.5 border-b border-zinc-200">
          <h2 className="text-lg font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            <span>Daftar Undangan Anda</span>
            <span className="text-xs bg-zinc-200 px-2 py-0.5 rounded-full text-zinc-700 font-extrabold">{events.length}</span>
          </h2>
          <button
            onClick={() => onNavigate('/dashboard/events/create')}
            className="flex items-center gap-1 bg-black hover:opacity-90 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Undangan
          </button>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-zinc-300 max-w-xl mx-auto my-8">
            <Mail className="h-12 w-12 text-zinc-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-zinc-950 mb-2">Belum ada undangan yang dibuat</h3>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-semibold">
              Anda belum membuat event resepsi pernikahan, khitanan, reuni, atau acara formal lainnya. 
              Mulai buat yang pertama sekarang gratis mumpung kuota tersedia!
            </p>
            <button
              onClick={() => onNavigate('/dashboard/events/create')}
              className="px-6 py-3 bg-black hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Buat Undangan Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => {
              // Calculate single event stats
              const eventGuests = totalGuestsTable.filter((g) => g.event_id === event.id);
              const eventGuestsTotal = eventGuests.length;
              const eventAttendance = eventGuests.filter((g) => g.rsvp_status === 'hadir').length;
              const eventAbsence = eventGuests.filter((g) => g.rsvp_status === 'tidak_hadir').length;
              const eventPending = eventGuests.filter((g) => g.rsvp_status === 'pending').length;

              const eventViewsCount = eventGuests.filter((g) => {
                return allViews.some((v) => v.guest_id === g.id);
              }).length;

              return (
                <div 
                  key={event.id}
                  onClick={() => onSelectEvent(event.id)}
                  className="bg-white rounded-3xl overflow-hidden border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
                >
                  <div className="relative h-32 w-full bg-zinc-100">
                    <img 
                      src={event.cover_image_url} 
                      alt={event.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    <span className={`absolute top-3 right-3 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full z-10 text-white border-white/20 backdrop-blur-md ${
                      event.template_id === 'bunga' ? 'bg-rose-500/80' :
                      event.template_id === 'modern' ? 'bg-zinc-900/80' :
                      'bg-amber-600/80'
                    }`}>
                      {event.template_id} Theme
                    </span>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <p className="text-[10px] text-zinc-350 font-bold tracking-wider font-mono">/{event.slug}</p>
                      <h3 className="font-extrabold text-sm truncate font-sans" title={event.title}>{event.title}</h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-grow">
                    <div className="flex gap-2.5 text-zinc-550 text-xs mb-4">
                      <Calendar className="h-4 w-4 shrink-0 text-zinc-650 text-zinc-700" />
                      <span className="font-bold">{new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>

                    {/* Stats mini board */}
                    <div className="grid grid-cols-4 gap-1 bg-[#FAF9F6] rounded-xl p-2 text-center text-xs border border-zinc-150 font-semibold text-zinc-700">
                      <div>
                        <span className="text-[9px] font-bold text-zinc-400 block uppercase">Tamu</span>
                        <span className="font-extrabold text-zinc-900">{eventGuestsTotal}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-zinc-400 block uppercase">Hadir</span>
                        <span className="font-bold text-emerald-600">{eventAttendance}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-zinc-400 block uppercase">Absen</span>
                        <span className="font-bold text-rose-500">{eventAbsence}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-zinc-400 block uppercase">Dibuka</span>
                        <span className="font-bold text-amber-500">{eventViewsCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Detail Arrow Footer */}
                  <div className="px-5 py-3 border-t border-zinc-100 bg-[#FAF9F6] flex items-center justify-between text-xs font-bold">
                    <button 
                      type="button"
                      onClick={(e) => handleDeleteEvent(event.id, e)}
                      className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors"
                      title="Hapus Undangan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
                    <span className="text-zinc-900 group-hover:translate-x-1.5 transition-transform flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider">
                      Detail & Tamu <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
