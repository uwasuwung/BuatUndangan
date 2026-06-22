/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { db } from '../store';
import { Guest, Event } from '../types';
import { 
  Heart, Calendar, MapPin, Music, Volume2, VolumeX, Mail, 
  Map, Sparkles, CheckSquare, MessageCircle, Clock, Users, ArrowRight,
  Download, Printer, Lock, Landmark, Image as ImageIcon, Camera, Compass,
  Smartphone, Eye, HelpCircle, Laptop, Share2, Youtube, ExternalLink, ChevronLeft
} from 'lucide-react';

interface PublicInvitationProps {
  eventSlug: string;
  guestLink: string;
  onNavigateBackToDashboard?: () => void;
}

export default function PublicInvitation({ eventSlug, guestLink, onNavigateBackToDashboard }: PublicInvitationProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [allEventGuests, setAllEventGuests] = useState<Guest[]>([]);
  const [hasOpenedInvitation, setHasOpenedInvitation] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Synchronize playback state with the actual audio element
  useEffect(() => {
    if (audioRef.current) {
      if (isPlayingMusic && event?.music_enabled !== false) {
        audioRef.current.play().catch(err => {
          console.warn('Playback blocked or failed:', err);
          setIsPlayingMusic(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlayingMusic, event?.music_url, event?.music_enabled]);

  // RSVP Form States
  const [rsvpStatus, setRsvpStatus] = useState<'hadir' | 'tidak_hadir'>('hadir');
  const [willAttend, setWillAttend] = useState(true);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Premium features state
  const [eventPassword, setEventPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [distanceText, setDistanceText] = useState('');
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [ticketQrUrl, setTicketQrUrl] = useState('');
  const [guestPhotoBase64, setGuestPhotoBase64] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<'classic' | 'bunga' | 'modern'>('classic');
  const [limitNotice, setLimitNotice] = useState('');

  // Countdown timer state
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false
  });

  // Track page view once when page loads
  useEffect(() => {
    const foundEvent = db.getEventBySlug(eventSlug);
    setEvent(foundEvent);

    if (foundEvent) {
      // Determine A/B template or standard
      const foundGuest = db.getGuestByLink(guestLink);
      setGuest(foundGuest);

      // Determine A/B selection if enabled (deterministic split using characters hashing)
      const determinedTemplate = foundEvent.ab_test_enabled && foundGuest
        ? (foundGuest.unique_link.charCodeAt(0) % 2 === 0 ? 'modern' : 'bunga')
        : foundEvent.template_id;
      setActiveTemplate(determinedTemplate);

      // Check Password locks
      const savedPassCodeKey = `inv_pwd_unlocked_${foundEvent.id}`;
      if (!foundEvent.event_password || sessionStorage.getItem(savedPassCodeKey) === 'true') {
        setIsUnlocked(true);
      }

      // Track multi-device VIP constraints: one unique link can only be accessed on 3 devices maximum
      if (foundGuest) {
        try {
          const deviceFingerprintStoreKey = `inv_vip_devices_${foundGuest.id}`;
          const currentFingerprint = navigator.userAgent.slice(0, 50);
          const savedDevices = JSON.parse(localStorage.getItem(deviceFingerprintStoreKey) || '[]');
          if (!savedDevices.includes(currentFingerprint)) {
            if (savedDevices.length >= 3) {
              setLimitNotice('Maksimum Perangkat Tercapai: Tautan digital eksklusif ini dibatasi maksimal 3 perangkat unik demi keamanan privasi.');
            } else {
              savedDevices.push(currentFingerprint);
              localStorage.setItem(deviceFingerprintStoreKey, JSON.stringify(savedDevices));
            }
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Fetch all guests
      setAllEventGuests(db.getEventGuests(foundEvent.id));

      if (foundGuest) {
        // Log view tracking inside invitation_views table with determined A/B template
        db.trackView(
          foundGuest.id,
          navigator.userAgent,
          '202.162.24.18', // Mock IP address for realism
          determinedTemplate
        );

        // Pre-populate actual RSVP form inputs if the guest had already filled it!
        if (foundGuest.rsvp_status !== 'pending') {
          setRsvpStatus(foundGuest.rsvp_status === 'hadir' ? 'hadir' : 'tidak_hadir');
          setWillAttend(foundGuest.rsvp_status === 'hadir');
          setNumberOfGuests(foundGuest.number_of_guests || 1);
          setMessage(foundGuest.message || '');
          setIsSubmitted(true);
          if (foundGuest.guest_photo_url) {
            setGuestPhotoBase64(foundGuest.guest_photo_url);
          }
        }

        // Generate E-Ticket QR Code Base64 on-the-fly
        const invitationFullUrl = `${window.location.origin}/inv/${foundEvent.slug}/${foundGuest.unique_link}`;
        QRCode.toDataURL(invitationFullUrl, {
          width: 320,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' }
        }).then(url => {
          setTicketQrUrl(url);
        }).catch(err => {
          console.error('Failed to generate pass QR:', err);
        });
      }
    }
  }, [eventSlug, guestLink]);

  // Handle countdown calculation loop
  useEffect(() => {
    if (!event) return;
    const targetTime = new Date(event.event_date).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds, isOver: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 text-center font-sans">
        <Mail className="h-12 w-12 text-rose-500 mb-4 animate-pulse" />
        <h2 className="text-2xl font-black mb-2">Undangan Tidak Aktif</h2>
        <p className="text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
          Maaf, tautan undangan dengan alamat URL <code className="bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-rose-400">/{eventSlug}</code> tersebut tidak ditemukan atau telah kedaluwarsa.
        </p>
        {onNavigateBackToDashboard && (
          <button
            onClick={onNavigateBackToDashboard}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
          >
            ← Kembali Ke Dashboard
          </button>
        )}
      </div>
    );
  }

  const [passwordError, setPasswordError] = useState('');

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (eventPassword === event.event_password) {
      setIsUnlocked(true);
      const savedPassCodeKey = `inv_pwd_unlocked_${event.id}`;
      sessionStorage.setItem(savedPassCodeKey, 'true');
    } else {
      setPasswordError('Sandi akses salah! Silakan periksa kunci undangan Anda.');
    }
  };

  if (limitNotice) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 text-center font-sans">
        <Lock className="h-12 w-12 text-amber-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-extrabold mb-2 text-rose-500">Akses Terkunci (Security Limit)</h2>
        <p className="text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
          {limitNotice}
        </p>
        <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-650">Invitely Security Shield</span>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 text-center select-none ${
        event.template_id === 'bunga' ? 'bg-[#fff2f2] text-[#4d2d2d]' :
        event.template_id === 'modern' ? 'bg-[#060a13] text-white' :
        'bg-[#fcf8f2] text-[#3d2f1b]'
      }`}>
        <div className="max-w-md w-full py-12 px-6 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 space-y-6 relative z-10 text-left">
          <div className="text-center space-y-2">
            <Lock className="h-10 w-10 text-amber-600 mx-auto animate-pulse" />
            <h2 className="text-xl font-extrabold text-zinc-900">Undangan VIP Terproteksi</h2>
            <p className="text-xs text-slate-500">Silakan masukkan kata sandi eksklusif yang dilampirkan oleh pemilik acara untuk membuka halaman undangan ini.</p>
          </div>
          
          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-505 mb-1.5">Sandi Akses Mandiri (Password)</label>
              <input
                type="password"
                required
                placeholder="Ketik password..."
                value={eventPassword}
                onChange={(e) => {
                  setEventPassword(e.target.value);
                  setPasswordError('');
                }}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
              />
              {passwordError && (
                <p className="text-red-600 text-[10px] font-bold mt-1.5">{passwordError}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-[#09090b] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
            >
              Ubah & Buka Undangan
            </button>
          </form>
          
          {onNavigateBackToDashboard && (
            <button
              onClick={onNavigateBackToDashboard}
              className="text-[10px] font-bold text-center block w-full text-slate-400 hover:underline mt-2"
            >
              Kembali ke dashboard creator
            </button>
          )}
        </div>
      </div>
    );
  }

  // Define fallback guest if visiting raw slug without a valid link
  const activeGuestName = guest ? guest.name : 'Tamu Undangan Istimewa';

  const handleOpenInvitation = () => {
    setHasOpenedInvitation(true);
    setIsPlayingMusic(true); // Simulate autoplay
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file foto terlalu besar! Rekomendasi file di bawah 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setGuestPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCalculateDistance = () => {
    if (!navigator.geolocation) {
      alert('Fitur GPS tidak didukung oleh perangkat Anda.');
      return;
    }
    setDistanceLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const targetLat = event.latitude || -6.2088;
        const targetLng = event.longitude || 106.8456;
        
        const R = 6371; // km
        const dLat = ((targetLat - userLat) * Math.PI) / 180;
        const dLon = ((targetLng - userLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((userLat * Math.PI) / 185) *
            Math.cos((targetLat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = Math.round(R * c * 10) / 10;
        
        setDistanceText(
          `Jarak Anda ke lokasi adalah: ${distance} KM. Estimasi ${Math.round(distance * 1.8)} menit berkendara via Jalan Umum.`
        );
        setDistanceLoading(false);
      },
      (err) => {
        console.error(err);
        setDistanceText('Gagal melokalisasi koordinat Anda. Aktifkan izin GPS/lokasi browser.');
        setDistanceLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) {
      alert('Mode pratinjau demo: Pengunjung umum dapat mencoba mengisi RSVP, namun data login tamu diperlukan untuk pencatatan permanen.');
      setIsSubmitted(true);
      return;
    }

    const cleanStatus = rsvpStatus;
    const finalWillAttend = rsvpStatus === 'hadir';

    db.updateRSVP(
      guest.id,
      cleanStatus,
      finalWillAttend,
      finalWillAttend ? numberOfGuests : 0,
      message || '-',
      guestPhotoBase64 || undefined
    );

    // Refresh guest wishing list board rows
    setAllEventGuests(db.getEventGuests(event.id));
    setIsSubmitted(true);
  };

  // Wishes/Blessing rows only
  const wishGuests = allEventGuests.filter((g) => g.message && g.message.trim() !== '' && g.rsvp_status !== 'pending');

  // Themes Rendering selection
  const template = event.template_id;

  // Render Cover Gate
  if (!hasOpenedInvitation) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center text-center p-4 relative overflow-hidden transition-all duration-700 ${
        template === 'bunga' ? 'bg-gradient-to-b from-[#fff2f2] to-[#ffeded] text-[#4d2d2d]' :
        template === 'modern' ? 'bg-[#060a13] text-white font-modern-display' :
        'bg-[#fcf8f2] text-[#3d2f1b] font-serif-elegant'
      }`}>
        {/* Abstract design elements */}
        {template === 'bunga' && (
          <>
            <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-rose-200/40 blur-xl animate-float" />
            <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-pink-200/50 blur-2xl animate-float" style={{ animationDelay: '3s' }} />
          </>
        )}
        {template === 'classic' && (
          <div className="absolute inset-4 border border-[#dbaf5f]/40 rounded-3xl pointer-events-none" />
        )}

        <div className="max-w-md w-full py-12 px-6 bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 space-y-8 relative z-10">
          
          <div className="space-y-2">
            <span className={`text-[10px] tracking-widest font-extrabold uppercase ${
              template === 'bunga' ? 'text-rose-600' :
              template === 'modern' ? 'text-purple-400' :
              'text-amber-700'
            }`}>
              Kami Mengundang Anda
            </span>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">/ {event.slug}</p>
          </div>

          <div className="space-y-4">
            <Heart className={`h-8 w-8 mx-auto animate-pulse ${
              template === 'bunga' ? 'text-rose-500' :
              template === 'modern' ? 'text-purple-500' :
              'text-amber-600'
            }`} />
            
            <h1 className={`text-3xl font-extrabold tracking-tight ${
              template === 'bunga' ? 'text-rose-950 font-serif-elegant italic' :
              template === 'modern' ? 'text-white font-modern-display text-4xl uppercase' :
              'text-amber-950 text-3xl font-bold'
            }`}>
              {event.title}
            </h1>
          </div>

          {/* Invitation target guest container */}
          <div className="bg-white/90 p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1.5">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Kepada Yth. Bapak/Ibu/Saudara/i</p>
            <p className="text-lg font-extrabold text-slate-900 tracking-tight">{activeGuestName}</p>
            <p className="text-[10px] text-slate-500 italic font-medium leading-relaxed">Tercantum suatu kehormatan luar biasa atas kesediaan Anda memperingati momen istimewa bersama kami.</p>
          </div>

          <button
            onClick={handleOpenInvitation}
            className={`w-full py-4 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              template === 'bunga' ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200' :
              template === 'modern' ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-950/40 font-modern-display' :
              'bg-amber-800 hover:bg-amber-900 text-white shadow-amber-900/10'
            }`}
          >
            <Mail className="h-4 w-4 animate-bounce" />
            Buka Undangan Digital
          </button>

          {onNavigateBackToDashboard && (
            <button
              onClick={onNavigateBackToDashboard}
              className="text-[10px] uppercase font-bold text-slate-400 hover:text-indigo-650 block mx-auto underline"
            >
              Kembali ke dashboard creator
            </button>
          )}
        </div>
      </div>
    );
  }

  // MAIN PUBLIC INVITATION LAYOUT (Classic, Floral, or Modern Theme rendering)
  return (
    <div className={`min-h-screen py-16 scroll-smooth transition-colors duration-500 ${
      template === 'bunga' ? 'bg-[#fff7f7] text-[#422121]' :
      template === 'modern' ? 'bg-[#080c16] text-[#b3bed4] font-modern-display' :
      'bg-[#fdfaf2] text-[#403525] font-serif-elegant'
    }`}>
      
      {/* Background audio widget */}
      {event?.music_enabled !== false && (
        <div className="fixed bottom-6 right-6 z-45 flex items-center gap-2.5 bg-black/80 hover:bg-black/90 backdrop-blur-md pl-3.5 pr-4 py-2 rounded-full border border-zinc-800 shadow-xl transition-all max-w-[280px]">
          <audio 
            ref={audioRef} 
            src={event?.music_url || "https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3"} 
            loop 
          />
          <button
            onClick={() => setIsPlayingMusic(!isPlayingMusic)}
            className={`p-2 rounded-full flex items-center justify-center transition-all shrink-0 ${
              isPlayingMusic ? 'bg-indigo-600 border-indigo-500 animate-[spin_6s_linear_infinite]' : 'bg-zinc-800 border-zinc-700'
            }`}
            title="Toggle background music"
          >
            {isPlayingMusic ? <Volume2 className="h-4 w-4 text-white" /> : <VolumeX className="h-4 w-4 text-white" />}
          </button>
          <div className="flex flex-col overflow-hidden text-left pr-1">
            <span className="text-[7.5px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-0.5">MUSIC {isPlayingMusic ? 'PLAYING' : 'MUTED'}</span>
            <span className="text-[10.5px] text-zinc-100 font-bold truncate leading-tight">
              {event?.music_title || 'Romantic Wedding Piano'}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 space-y-12 pb-40">
        
        {/* Back Link for Testing in Iframe */}
        {onNavigateBackToDashboard && (
          <div className="text-center">
            <button
              onClick={onNavigateBackToDashboard}
              className="px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-full text-[10px] text-slate-300 font-mono font-bold uppercase tracking-widest border border-slate-800"
            >
              ← Kembali Ke Panel Creator
            </button>
          </div>
        )}

        {/* --- HEADER EVENT COVER SECTION --- */}
        <section className={`rounded-3xl shadow-lg border p-8 text-center relative overflow-hidden bg-white ${
          template === 'bunga' ? 'border-rose-100' :
          template === 'modern' ? 'bg-[#0e1628] border-slate-800 text-white' :
          'border-[#dbaf5f]/40'
        }`}>
          {/* Main Cover Banner Picture */}
          {event.cover_image_url && (
            <div className="w-full h-64 rounded-2xl overflow-hidden mb-8 relative border shadow-xs">
              <img 
                src={event.cover_image_url} 
                alt="Cover"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          )}

          <div className="space-y-6">
            <Heart className={`h-10 w-10 mx-auto animate-pulse ${
              template === 'bunga' ? 'text-rose-500' :
              template === 'modern' ? 'text-purple-400' :
              'text-amber-600'
            }`} />
            
            <p className={`text-[10px] tracking-widest uppercase font-bold text-slate-400`}>KAMI MENGUNDANG ANDA DI ACARA</p>
            
            <h1 className={`text-4xl font-extrabold tracking-tight ${
              template === 'bunga' ? 'text-rose-950 font-serif-elegant italic' :
              template === 'modern' ? 'text-white text-5xl uppercase font-bold' :
              'text-amber-950 font-bold'
            }`}>
              {event.title}
            </h1>

            {!countdown.isOver ? (
              <div className="space-y-2 py-4 border-y border-dashed border-slate-100">
                <span className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-400">PENGHITUNG MUNDUR ACARA</span>
                <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                    <span className="block text-lg font-black text-slate-900">{countdown.days}</span>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Hari</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                    <span className="block text-lg font-black text-slate-900">{countdown.hours}</span>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Jam</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                    <span className="block text-lg font-black text-slate-900">{countdown.minutes}</span>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Menit</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                    <span className="block text-lg font-black text-slate-900">{countdown.seconds}</span>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Detik</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-xl py-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-650 text-emerald-800">🎉 ACARA DILAKSANAKAN SEKARANG / SUDAH BERLANGSUNG</span>
              </div>
            )}

            <p className="text-xs text-slate-505 leading-normal max-w-md mx-auto text-slate-500">
              Dengan penuh kesungguhan dan hormat, kami mengharap kehadiran Bapak/Ibu sekalian untuk bersama merayakan kesaksian hari istimewa kami.
            </p>
          </div>
        </section>

        {/* --- TIMELINE DETAILS CARD --- */}
        <section className={`rounded-3xl shadow-lg p-8 border bg-white ${
          template === 'bunga' ? 'border-rose-100' :
          template === 'modern' ? 'bg-[#0e1628] border-slate-850 text-white' :
          'border-[#dbaf5f]/40'
        }`}>
          <h2 className={`text-sm tracking-widest uppercase font-bold text-center mb-8 ${
            template === 'bunga' ? 'text-rose-700' :
            template === 'modern' ? 'text-purple-400' :
            'text-amber-800'
          }`}>
            WAKTU & TEMPAT PELAKSANAAN ACARA
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            
            {/* Timeline date */}
            <div className="flex flex-col items-center justify-center text-center space-y-3 pb-6 sm:pb-0">
              <div className={`p-3 rounded-full ${template === 'bunga' ? 'bg-rose-50 text-rose-600' : template === 'modern' ? 'bg-purple-950/50 text-purple-400' : 'bg-amber-50 text-amber-800'}`}>
                <Clock className="h-6 w-6 stroke-[2]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Tanggal Acara</p>
                <p className="font-bold text-lg mt-1">
                  {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mulai Jam {new Date(event.event_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col items-center justify-center text-center space-y-3 pt-6 sm:pt-0 sm:pl-6 text-slate-900">
              <div className={`p-3 rounded-full ${template === 'bunga' ? 'bg-rose-50 text-rose-600' : template === 'modern' ? 'bg-purple-950/50 text-purple-400' : 'bg-amber-50 text-amber-800'}`}>
                <MapPin className="h-6 w-6 stroke-[2]" />
              </div>
              <div className="w-full">
                <p className="text-[10px] font-bold uppercase text-slate-400">Lokasi Penyelenggaraan</p>
                <p className="font-bold text-lg mt-1 truncate max-w-xs mx-auto text-zinc-950" title={event.location}>{event.location}</p>
                
                {event.maps_iframe && (
                  <div className="mt-4 w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-slate-250/60 shadow-md">
                    <iframe
                      title="Peta Lokasi Interaktif"
                      src={event.maps_iframe}
                      className="w-full h-52 border-0"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-2 items-center">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-650 hover:underline cursor-pointer bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full text-indigo-850"
                  >
                    <Map className="h-3.5 w-3.5" />
                    Buka Google Maps
                  </a>

                  <button
                    onClick={handleCalculateDistance}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 hover:underline cursor-pointer bg-amber-50 border border-amber-100 px-4 py-1.5 rounded-full"
                    disabled={distanceLoading}
                  >
                    <Compass className={`h-3.5 w-3.5 ${distanceLoading ? 'animate-spin' : ''}`} />
                    {distanceLoading ? 'Mendandai GPS...' : 'Hitung Estimasi Jarak GPS'}
                  </button>

                  {distanceText && (
                    <div className="p-3 bg-zinc-50 border rounded-xl text-center text-[10px] leading-relaxed text-slate-600 mt-2 font-mono">
                      {distanceText}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* --- PHOTO GALLERY CAROUSEL SECTION --- */}
        {event && event.gallery_photos && event.gallery_photos.length > 0 && (
          <section className={`rounded-3xl shadow-lg p-6 sm:p-8 border bg-white ${
            template === 'bunga' ? 'border-rose-100' :
            template === 'modern' ? 'bg-[#0e1628] border-slate-800 text-white' :
            'border-[#dbaf5f]/40'
          }`}>
            <div className="text-center mb-6 space-y-1.5">
              <span className={`inline-block text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full font-mono ${
                template === 'bunga' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                template === 'modern' ? 'bg-purple-950/40 text-purple-400 border border-purple-900/50' :
                'bg-amber-50 text-amber-800 border border-amber-100'
              }`}>
                ✨ SWEET MOMENTS & PORTRAITS
              </span>
              <h3 className={`text-xl font-extrabold tracking-tight ${template === 'modern' ? 'text-white' : 'text-slate-900'}`}>
                Galeri Kebahagiaan Kami
              </h3>
              <p className={`text-xs max-w-md mx-auto leading-relaxed ${template === 'modern' ? 'text-slate-400' : 'text-slate-500'}`}>
                Rangkaian foto perjalanan cinta dan potret pre-event indah yang mengabadikan komitmen tulus kami berdua.
              </p>
            </div>

            {/* Main Interactive Carousel container */}
            <div className="relative w-full max-w-xl mx-auto rounded-2xl overflow-hidden aspect-[4/3] bg-zinc-950 shadow-md group border border-slate-150">
              <img
                src={event.gallery_photos[activePhotoIdx]}
                alt={`Engagement Photo ${activePhotoIdx + 1}`}
                className="w-full h-full object-cover transition-all duration-700 ease-in-out"
                referrerPolicy="no-referrer"
              />

              {/* Left Slider Navigation Button */}
              <button
                type="button"
                onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? event.gallery_photos!.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-zinc-900 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-md backdrop-blur-xs z-10 hover:shadow-lg"
                title="Seterusnya"
              >
                <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
              </button>

              {/* Right Slider Navigation Button */}
              <button
                type="button"
                onClick={() => setActivePhotoIdx((prev) => (prev === event.gallery_photos!.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-zinc-900 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-md backdrop-blur-xs z-10 hover:shadow-lg"
                title="Berikutnya"
              >
                <ChevronLeft className="h-5 w-5 stroke-[2.5] rotate-180" />
              </button>

              {/* Hover Index Indicator Overlay Badge */}
              <span className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md text-white text-[9.5px] font-bold px-3 py-1.5 rounded-full font-mono tracking-wider shadow-sm">
                📸 {activePhotoIdx + 1} / {event.gallery_photos.length} FOTO
              </span>
            </div>

            {/* Thumbnail Navigation Row */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
              {event.gallery_photos.map((pt, ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => setActivePhotoIdx(ind)}
                  className={`relative w-11 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all shrink-0 ${
                    activePhotoIdx === ind 
                      ? (template === 'bunga' ? 'border-rose-500 scale-105 shadow-md' : template === 'modern' ? 'border-purple-500 scale-105 shadow-md' : 'border-amber-500 scale-105 shadow-md') 
                      : (template === 'modern' ? 'border-transparent opacity-40 hover:opacity-100' : 'border-transparent opacity-60 hover:opacity-100')
                  }`}
                >
                  <img src={pt} alt={`Thumbnail ${ind + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* --- LIVE STREAM SECTION --- */}
        {event.live_stream_url && (
          <section className={`rounded-3xl shadow-lg p-8 border bg-white ${
            template === 'bunga' ? 'border-rose-100' :
            template === 'modern' ? 'bg-[#0e1628] border-slate-850 text-white' :
            'border-[#dbaf5f]/40'
          }`}>
            <div className="text-center mb-6 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 border border-red-200 text-red-800 rounded-full text-[9px] font-bold font-mono tracking-widest uppercase animate-pulse">
                <Youtube className="h-4.5 w-4.5 text-red-500" />
                <span>Siaran Langsung (Live hybrid)</span>
              </div>
              <h3 className="text-base font-extrabold text-zinc-950">Menonton Ceremonia Siaran Langsung</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Untuk sahabat yang berhalangan hadir secara langsung, silakan ikuti prosesi sakral kami secara online.</p>
            </div>

            {getParsedYouTubeEmbedUrl(event.live_stream_url) ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden border bg-zinc-950 shadow-inner">
                <iframe
                  src={getParsedYouTubeEmbedUrl(event.live_stream_url)}
                  title="Live Stream Frame Player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <a
                href={event.live_stream_url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 rounded-xl text-white font-bold flex items-center justify-center gap-2 text-xs"
              >
                <ExternalLink className="h-4 w-4" />
                Gabung Siaran Online (Zoom/Meet/YouTube)
              </a>
            )}
          </section>
        )}

        {/* --- RSVP INTERACTIVE PUBLIC FORM --- */}
        <section className={`rounded-3xl shadow-lg p-8 border bg-white ${
          template === 'bunga' ? 'border-rose-100' :
          template === 'modern' ? 'bg-[#0e1628] border-slate-800 text-white' :
          'border-[#dbaf5f]/40 font-serif-elegant'
        }`}>
          <div className="text-center mb-6">
            <h2 className={`text-xl font-extrabold ${template === 'bunga' ? 'text-rose-950 text-2xl' : template === 'modern' ? 'text-white font-modern-display text-2xl uppercase' : 'text-amber-950 font-bold'}`}>
              Konfirmasi Kehadiran Tamu (RSVP)
            </h2>
            <p className="text-xs text-slate-505 font-medium text-slate-500 mt-1 max-w-sm mx-auto">
              Mohon kabarkan rencana konfirmasi kedatangan Anda secara instan untuk memperlancar persiapan katering panggung kami.
            </p>
          </div>

          {isSubmitted ? (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-250 text-emerald-950 p-6 rounded-2xl text-center space-y-2 text-xs">
                <CheckSquare className="h-8 w-8 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-sm text-emerald-900">Terima Kasih Atas Tanggapan Anda! 🙌</h4>
                <p className="text-emerald-800 leading-normal">
                  Konfirmasi status RSVP Anda telah dicatat dalam basis data event <strong>"{event.title}"</strong>. 
                  Saran katering dan nomor rombongan Anda diperbarui sewaktu-waktu.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-3 px-4 py-1.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600 hover:bg-slate-100 cursor-pointer text-zinc-900 font-semibold"
                >
                  Ubah Jawaban RSVP
                </button>
              </div>

              {rsvpStatus === 'hadir' && (
                <div className="relative overflow-hidden bg-rose-50/20 border-2 border-dashed border-rose-200 p-6 rounded-2xl space-y-4 text-center">
                  <div className="absolute top-1/2 -left-3 h-6 w-6 rounded-full bg-white border-r border-rose-200 -translate-y-1/2" />
                  <div className="absolute top-1/2 -right-3 h-6 w-6 rounded-full bg-white border-l border-rose-200 -translate-y-1/2" />
                  
                  <div className="text-center space-y-1">
                    <span className="text-[9px] font-mono tracking-widest font-extrabold uppercase bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                      VIP DIGITAL TICKET PASS
                    </span>
                    <h4 className="text-sm font-extrabold text-zinc-950">E-Ticket Masuk Acara</h4>
                    <p className="text-[10px] text-slate-505 text-slate-550">Tunjukkan barcode di bawah ini kepada pramusaji check-in saat tiba di lokasi pintu gerbang acara.</p>
                  </div>

                  {ticketQrUrl ? (
                    <div className="bg-white p-3 rounded-2xl inline-block border shadow-inner">
                      <img src={ticketQrUrl} alt="E-Ticket Scan Pass QR" className="h-36 w-36 object-contain" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <div className="h-36 w-36 bg-slate-100 animate-pulse rounded-2xl mx-auto flex items-center justify-center text-slate-400 text-[10px]">Generating pass...</div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-left border-y border-dashed border-rose-205 py-3 text-[10px] font-sans">
                    <div>
                      <span className="text-slate-400 block font-bold uppercase text-[8px]">NAMA TAMU</span>
                      <span className="font-extrabold text-slate-800 truncate block">{guest?.name || activeGuestName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold uppercase text-[8px]">KATEGORI / PAX</span>
                      <span className="font-extrabold text-slate-800 block">Keluarga & VIP / {numberOfGuests} Orang</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold uppercase text-[8px]">TIPE UNDANGAN</span>
                      <span className="font-extrabold text-slate-800 block">Digital Gold Pass</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold uppercase text-[8px]">KUNCI CHECK-IN</span>
                      <span className="font-extrabold text-slate-800 block font-mono bg-slate-100 px-1 py-0.5 rounded">
                        {(guest?.unique_link || 'demo-code').toUpperCase().substring(0, 8)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold text-[10px] hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Printer className="h-3 w-3" />
                      Cetak E-Tiket Saku
                    </button>
                    <button
                      onClick={() => {
                        const waUrl = `https://wa.me/?text=${encodeURIComponent(
                          `Halo! Saya mengkonfirmasi kehadiran saya di acara "${event.title}". Ini adalah pass masuk digital saya: ${window.location.href}`
                        )}`;
                        window.open(waUrl, '_blank');
                      }}
                      className="py-2 px-3 bg-emerald-600 text-white rounded-lg font-extrabold text-[10px] hover:bg-emerald-555 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Share ticket via WhatsApp Web"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleRSVPSubmit} className="space-y-4 text-xs font-sans text-left">
              
              {/* Radio Attendance */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Apakah Anda Akan Hadir? *</label>
                <div className="grid grid-cols-2 gap-4">
                  
                  <div 
                    onClick={() => {
                      setRsvpStatus('hadir');
                      setWillAttend(true);
                    }}
                    className={`border rounded-xl p-3 text-center cursor-pointer transition-colors font-bold ${
                      rsvpStatus === 'hadir'
                        ? 'border-emerald-500 bg-emerald-50/30 text-emerald-800 ring-2 ring-emerald-500/25'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    💖 Ya, Saya Hadir
                  </div>

                  <div 
                    onClick={() => {
                      setRsvpStatus('tidak_hadir');
                      setWillAttend(false);
                      setNumberOfGuests(0);
                    }}
                    className={`border rounded-xl p-3 text-center cursor-pointer transition-colors font-bold ${
                      rsvpStatus === 'tidak_hadir'
                        ? 'border-rose-500 bg-rose-50/20 text-rose-800 ring-2 ring-rose-500/23'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    💔 Maaf, Absen / Tidak Hadir
                  </div>

                </div>
              </div>

              {/* Number of attendees */}
              {rsvpStatus === 'hadir' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider mb-1.5" htmlFor="numGuests">
                    Jumlah Tamu Rombongan (Orang)
                  </label>
                  <select
                    id="numGuests"
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                    className="block w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-650/15 bg-white"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num} Orang</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Congratulation Message */}
              <div>
                <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider mb-1.5" htmlFor="guestWishes">
                  Kirim Kado Doa / Ucapan Selamat
                </label>
                <textarea
                  id="guestWishes"
                  rows={3}
                  required
                  placeholder="Ketik doa tulus Anda bagi kebahagiaan kami..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="block w-full border border-slate-250 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-650/15 text-slate-800 resize-y bg-slate-50/50"
                />
              </div>

              {/* Image uploaded display */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-650 uppercase tracking-wider">
                  Lampirkan Foto Momen Anda (Opsional - Maks 2MB)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 border text-slate-700 px-3 py-2 rounded-xl text-xs transition-all font-semibold">
                    <Camera className="h-4 w-4" />
                    <span>Upload Foto Selfie</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {guestPhotoBase64 && (
                    <div className="flex items-center gap-2">
                      <img
                        src={guestPhotoBase64}
                        alt="Guest attachment thumb"
                        className="h-10 w-10 rounded-lg object-cover border"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setGuestPhotoBase64('')}
                        className="text-red-650 hover:underline text-[9px] font-bold text-rose-600"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer text-white ${
                  template === 'bunga' ? 'bg-rose-500 hover:bg-rose-600' :
                  template === 'modern' ? 'bg-purple-600 hover:bg-purple-700 font-modern-display' :
                  'bg-amber-800 hover:bg-amber-900'
                }`}
              >
                Kirim Konfirmasi Tanggapan
              </button>

            </form>
          )}
        </section>

        {/* --- WISHBOARD / BLESSINGS GALLERY SECTION --- */}
        <section className={`rounded-3xl shadow-lg p-8 border bg-white ${
          template === 'bunga' ? 'border-rose-100' :
          template === 'modern' ? 'bg-[#0e1628] border-slate-800 text-white' :
          'border-[#dbaf5f]/40 font-serif-elegant'
        }`}>
          <div className="text-center mb-6">
            <h3 className={`text-lg font-extrabold flex items-center justify-center gap-2 ${template === 'bunga' ? 'text-rose-950 font-serif-elegant' : template === 'modern' ? 'text-white uppercase font-modern-display' : 'text-amber-950'}`}>
              <MessageCircle className="h-5 w-5 text-rose-500 animate-pulse" />
              <span>Kotak Kado Doa & Ucapan</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Simak harapan dan kebaikan manis dari rekan-rekan undangan yang telah menyampaikan RSVP.</p>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            {wishGuests.length === 0 ? (
              <p className="text-center text-slate-400 text-xs italic py-6 leading-relaxed">
                Belum ada kado doa terkirim. Jadilah yang pertama mengirimkan ucapan selamat manis pada formulir RSVP di atas!
              </p>
            ) : (
              wishGuests.map((w) => (
                <div 
                  key={w.id} 
                  className={`p-4 rounded-2xl text-xs space-y-2 border text-left ${
                    template === 'bunga' ? 'bg-rose-50/40 border-rose-100/50 text-[#5c3e3e]' : 
                    template === 'modern' ? 'bg-[#15203a] border-slate-800 text-slate-200' : 
                    'bg-[#fdfaf2] border-amber-100 text-[#4c3c31]'
                  }`}
                >
                  <div className="flex items-center justify-between font-sans">
                    <span className="font-extrabold text-slate-900">{w.name}</span>
                    <div className="flex items-center gap-2">
                      {w.viewed_template && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-[8px] text-slate-500 rounded border">Tema: {w.viewed_template}</span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border uppercase ${
                        w.rsvp_status === 'hadir' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {w.rsvp_status === 'hadir' ? '● Hadir' : '× Absen'}
                      </span>
                    </div>
                  </div>
                  <p className="font-medium leading-relaxed italic text-slate-650">
                    "{w.message}"
                  </p>

                  {/* Photo attachment wish thumbnail card */}
                  {w.guest_photo_url && (
                    <div className="mt-2.5 max-w-xs relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                      <img
                        src={w.guest_photo_url}
                        alt="Wish attachment content"
                        className="w-full max-h-48 object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] font-mono font-extrabold text-white">
                        Momen Tamu
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

// Inline helper functions
const getParsedYouTubeEmbedUrl = (url?: string) => {
  if (!url) return '';
  try {
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      return `https://www.youtube.com/embed/${urlParams.get('v')}`;
    }
  } catch (e) {
    console.error(e);
  }
  return '';
};
