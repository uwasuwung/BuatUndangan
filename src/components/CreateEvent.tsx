/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from '../store';
import { 
  Sparkles, Calendar, MapPin, Image, Eye, ChevronLeft, Save, Info, Crown, Check,
  Heart, Gift, Building2, Baby, Video, Store, Disc, HeartHandshake, GraduationCap, 
  Users, Trophy, BookOpen, Vote
} from 'lucide-react';

interface CreateEventProps {
  onNavigate: (route: string) => void;
}

export default function CreateEvent({ onNavigate }: CreateEventProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [eventDate, setEventDate] = useState('2026-08-18T09:00');
  const [location, setLocation] = useState('');
  const [templateId, setTemplateId] = useState<'classic' | 'bunga' | 'modern'>('classic');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  
  // Choice of 16 Event Types State
  const [eventType, setEventType] = useState<'wedding' | 'birthday' | 'corporate' | 'aqiqah' | 'webinar_seminar' | 'grand_opening' | 'concert' | 'charity' | 'graduation' | 'arisan' | 'sports' | 'religious' | 'rt_rw' | 'baby_shower'>('wedding');

  // Custom Fields States mapped per Event Type
  const [weddingBride, setWeddingBride] = useState('Siti Nurhayati');
  const [weddingGroom, setWeddingGroom] = useState('Andi Prasetyo');
  const [weddingAkadTime, setWeddingAkadTime] = useState('08:00 WIB');
  const [weddingReceptionTime, setWeddingReceptionTime] = useState('11:00 WIB');
  const [weddingGiftBank, setWeddingGiftBank] = useState('BCA');
  const [weddingGiftAccount, setWeddingGiftAccount] = useState('123-456-7890');
  const [weddingGiftOwner, setWeddingGiftOwner] = useState('Siti Nurhayati & Andi');

  const [birthdayAge, setBirthdayAge] = useState('17');
  const [birthdayWishlist, setBirthdayWishlist] = useState('https://tokopedia.com/wishlist/budi');
  const [birthdayVVIPEnabled, setBirthdayVVIPEnabled] = useState(true);

  const [corpCompany, setCorpCompany] = useState('PT Solusi Teknologi Indonesia');
  const [corpSessions, setCorpSessions] = useState('09:00 - Registrasi Tamu, 10:00 - Keynote, 13:00 - Panel Q&A');
  const [corpSpeakers, setCorpSpeakers] = useState('Richard Philips (CEO), Budi Santoso (VP)');
  const [corpPdfUrl, setCorpPdfUrl] = useState('https://example.com/slide-presentasi.pdf');

  const [aqiqahChild, setAqiqahChild] = useState('Alvaro Putra Pratama');
  const [aqiqahMenu, setAqiqahMenu] = useState('Paket Nasi Kotak Gulai Kambing Istimewa');
  const [aqiqahCharityBox, setAqiqahCharityBox] = useState('Rumah Yatim & Dhuafa Nusantara');

  const [webinarZoomLink, setWebinarZoomLink] = useState('https://zoom.us/j/987654321');
  const [webinarRecordingUrl, setWebinarRecordingUrl] = useState('https://youtu.be/unlisted-rec');

  const [openingPromo, setOpeningPromo] = useState('COFFEE50');
  const [openingParking, setOpeningParking] = useState('Area Parkir Basement B1 khusus tamu undangan, bebas biaya.');
  const [openingGiftCount, setOpeningGiftCount] = useState('100');

  const [concertArtist, setConcertArtist] = useState('Dewa 19 Tribute Band');
  const [concertPlaylist, setConcertPlaylist] = useState('https://open.spotify.com/playlist/37i9dQZF1DX10zKzsJ2jva');
  const [concertTiers, setConcertTiers] = useState('CAT 1 (VVIP): Rp750.000, CAT 2: Rp350.000');

  const [charityTarget, setCharityTarget] = useState('50000000');
  const [charityRecipient, setCharityRecipient] = useState('Korban Bencana Banjir Bandang Luwu');

  const [gradName, setGradName] = useState('Budi Setiawan, S.Kom.');
  const [gradMajor, setGradMajor] = useState('Teknik Informatika - Universitas Indonesia');
  const [gradCumlaude, setGradCumlaude] = useState(true);

  const [arisanPotluckText, setArisanPotluckText] = useState('Budi: Rendang Sapi, Siti: Es Selendang Mayang, Richard: Cake Cokelat');
  const [arisanDues, setArisanDues] = useState('100000');

  const [sportsCategory, setSportsCategory] = useState('5K Fun Run / 10K Tournament');
  const [sportsBibStart, setSportsBibStart] = useState('1001');

  const [religiousSpeaker, setReligiousSpeaker] = useState('Ustadz Hanan Attaki, Lc.');
  const [religiousSedekah, setReligiousSedekah] = useState('Mandiri Syariah Rek: 777-1234-567');

  const [rtrwAgenda, setRtrwAgenda] = useState('Klarifikasi Laporan Keuangan Iuran, Rencana Kerja Bakti HUT RI');
  const [rtrwTopic, setRtrwTopic] = useState('Apakah Anda setuju kenaikan iuran sampah warga menjadi Rp30.000?');

  const [babyGenderGuesses, setBabyGenderGuesses] = useState('Laki-laki (Boy) atau Perempuan (Girl)');

  // Premium properties states
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [eventPassword, setEventPassword] = useState('');
  const [rsvpLimit, setRsvpLimit] = useState(150);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [latitude, setLatitude] = useState(-6.2088);
  const [longitude, setLongitude] = useState(106.8456);
  
  const [plan, setPlan] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setPlan(db.getCurrentPlan());
  }, []);

  // Sync title with formatting a slug automatically
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    
    // Auto generate clean slug
    const formatted = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-'); // replace space with dashes
    setSlug(formatted);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-'); // replace non-alphanumeric with dash
    setSlug(formatted);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !slug.trim() || !location.trim() || !eventDate) {
      setErrorMsg('Harap lengkapi semua isian formulir wajib.');
      return;
    }

    // Convert local datetime input format ("2026-08-18T09:00") to full ISO String
    const formattedISO = new Date(eventDate).toISOString();

    const result = db.createEvent(
      title,
      slug,
      formattedISO,
      location,
      templateId,
      coverImageUrl || undefined
    );

    if (result.success && result.eventId) {
      // Build the EAV custom_fields based on the active eventType selector value
      const custom_fields: Record<string, any> = {};
      
      if (eventType === 'wedding') {
        custom_fields.bride = weddingBride;
        custom_fields.groom = weddingGroom;
        custom_fields.akad_time = weddingAkadTime;
        custom_fields.reception_time = weddingReceptionTime;
        custom_fields.gift_bank_name = weddingGiftBank;
        custom_fields.gift_bank_account = weddingGiftAccount;
        custom_fields.gift_bank_owner = weddingGiftOwner;
      } else if (eventType === 'birthday') {
        custom_fields.age = birthdayAge;
        custom_fields.wishlist_url = birthdayWishlist;
        custom_fields.vip_pass_enabled = birthdayVVIPEnabled;
      } else if (eventType === 'corporate') {
        custom_fields.company = corpCompany;
        custom_fields.agenda_sessions_raw = corpSessions;
        custom_fields.speakers_raw = corpSpeakers;
        custom_fields.materials_download_url = corpPdfUrl;
      } else if (eventType === 'aqiqah') {
        custom_fields.child_name = aqiqahChild;
        custom_fields.catering_menu = aqiqahMenu;
        custom_fields.charity_box_name = aqiqahCharityBox;
      } else if (eventType === 'webinar_seminar') {
        custom_fields.protected_zoom_link = webinarZoomLink;
        custom_fields.youtube_recording_url = webinarRecordingUrl;
      } else if (eventType === 'grand_opening') {
        custom_fields.promo_code = openingPromo;
        custom_fields.parking_guide_info = openingParking;
        custom_fields.free_gift_quota = openingGiftCount;
      } else if (eventType === 'concert') {
        custom_fields.artist_band_name = concertArtist;
        custom_fields.spotify_embed_url = concertPlaylist;
        custom_fields.ticket_tiers_raw = concertTiers;
      } else if (eventType === 'charity') {
        custom_fields.donation_target = Number(charityTarget);
        custom_fields.donation_collected = 12500000;
        custom_fields.donation_recipient_desc = charityRecipient;
      } else if (eventType === 'graduation') {
        custom_fields.graduate_name = gradName;
        custom_fields.major = gradMajor;
        custom_fields.cumlaude = gradCumlaude;
      } else if (eventType === 'arisan') {
        custom_fields.potluck_contributors = arisanPotluckText;
        custom_fields.dues_amount = Number(arisanDues);
      } else if (eventType === 'sports') {
        custom_fields.sports_category = sportsCategory;
        custom_fields.bib_number_start = sportsBibStart;
      } else if (eventType === 'religious') {
        custom_fields.ustadz_priest_name = religiousSpeaker;
        custom_fields.sedekah_account_details = religiousSedekah;
      } else if (eventType === 'rt_rw') {
        custom_fields.discussion_agenda_raw = rtrwAgenda;
        custom_fields.voting_topic = rtrwTopic;
      } else if (eventType === 'baby_shower') {
        custom_fields.gender_guesses_raw = babyGenderGuesses;
      }

      // Save premium settings utilizing the new update module
      db.updateEvent(result.eventId, {
        live_stream_url: liveStreamUrl || undefined,
        event_password: eventPassword || undefined,
        rsvp_limit: rsvpLimit || undefined,
        ab_test_enabled: abTestEnabled,
        latitude,
        longitude,
        event_type: eventType,
        custom_fields
      });
      onNavigate('/dashboard/events');
    } else {
      // Set the quota violation or other DB errors directly
      setErrorMsg(result.error || 'Terjadi kesalahan basis data.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] font-sans pb-40">
      {/* Top Banner Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => onNavigate('/dashboard/events')}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-550 hover:text-black cursor-pointer transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Kembali
          </button>
          <span className="font-extrabold text-sm text-zinc-900 tracking-tight">Buat Undangan Baru</span>
          <div className="w-12" /> {/* alignment spacer */}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8">
        {/* Banner Quota Limit Notice */}
        {plan && (
          <div className="bg-[#F2F1ED] border border-zinc-250 p-4.5 rounded-2xl flex items-center justify-between gap-4 mb-6 shadow-2xs">
            <div className="flex gap-2.5 items-start">
              <Info className="h-5 w-5 text-zinc-800 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-zinc-800 uppercase tracking-widest">Akun Kuota Saat Ini</p>
                <p className="text-xs text-zinc-650 mt-1 font-semibold leading-relaxed">
                  Anda telah membuat <strong>{plan.events_created}</strong> dari <strong>{plan.max_events}</strong> undangan dalam paket {plan.plan === 'premium' ? '👑 Premium' : 'Free (Gratis)'}.
                </p>
              </div>
            </div>
            {plan.plan === 'free' && (
              <button 
                type="button"
                onClick={() => onNavigate('/dashboard/subscription')}
                className="bg-black hover:opacity-90 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Langganan
              </button>
            )}
          </div>
        )}

        {/* Quota Constraint Error Focus */}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-950 p-5 rounded-r-2xl mb-6 shadow-sm leading-relaxed text-xs">
            <h4 className="font-extrabold text-sm mb-1">Gagal Menyimpan Undangan</h4>
            <p className="font-medium text-red-900">{errorMsg}</p>
            {errorMsg.includes('mencapai batas 25') && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/dashboard/subscription')}
                  className="bg-black text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  Buka Halaman Langganan (Gunakan Kode UPGRADE2025)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Create Form */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-6 text-left">
          
          {/* CATEGORY SELECTOR BOX */}
          <div className="border border-zinc-200 bg-[#FAF9F6] rounded-2xl p-4 sm:p-5">
            <label className="block text-xs font-black text-zinc-800 uppercase tracking-wider mb-3">
              🎯 PILIH JENIS UNDANGAN & FITUR KHUSUSNYA *
            </label>
            <p className="text-[11px] text-zinc-500 mb-4 font-medium leading-relaxed">
              Setiap jenis undangan mengaktifkan kolom input data, widget tampilan interaktif, dan kustomisasi khusus versi cetak/digital secara instan.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
              {[
                { id: 'wedding', label: 'Wedding / Nikah', icon: Heart, desc: 'Bride & Groom, Akad, Gift Box, Doa' },
                { id: 'birthday', label: 'Ulang Tahun / Birthday', icon: Gift, desc: 'Badge Usia, Shopee Wishlist, VIP Tier' },
                { id: 'corporate', label: 'Corporate & Bisnis', icon: Building2, desc: 'Agenda Sesi, Speakers, Zoom, PDF' },
                { id: 'aqiqah', label: 'Aqiqah & Sunatan', icon: Baby, desc: 'Kirim Doa, Pilihan Menu, Meja Donasi' },
                { id: 'webinar_seminar', label: 'Webinar & Seminar', icon: Video, desc: 'Unique access link, PDF material, Chat' },
                { id: 'grand_opening', label: 'Grand Opening Resto/Cafe', icon: Store, desc: 'Promo Code, Parking Guide, 100 Quota' },
                { id: 'concert', label: 'Musik & Konser', icon: Disc, desc: 'CAT selection, Seat Map, Playlist' },
                { id: 'charity', label: 'Charity & Fundraising', icon: HeartHandshake, desc: 'Target Goal, Donor wall, Volunteer' },
                { id: 'graduation', label: 'Graduation / Wisuda', icon: GraduationCap, desc: 'Bio, Toga Photo, Ijazah Pickup' },
                { id: 'arisan', label: 'Arisan / Family Gathering', icon: Users, desc: 'Doorprize Namepicker, Potluck Food' },
                { id: 'sports', label: 'Sports & fun run', icon: Trophy, desc: 'Start Bib Generator, Map routes' },
                { id: 'religious', label: 'Pengajian / Keagamaan', icon: BookOpen, desc: 'Jadwal Ibadah, Infak Board, Stream' },
                { id: 'rt_rw', label: 'Rapat RT / RW Desa', icon: Vote, desc: 'Voting Polling, Agenda, Laporan PDF' },
                { id: 'baby_shower', label: 'Baby Shower / Gender', icon: Sparkles, desc: 'Tebak Gender Poll, Baby Wishlist' }
              ].map((item) => {
                const IconComponent = item.icon;
                const isSelected = eventType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setEventType(item.id as any);
                      document.getElementById('eventTitle')?.focus();
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all outline-none cursor-pointer group ${
                      isSelected
                        ? 'border-black bg-zinc-950 text-white shadow-xs scale-102 font-bold'
                        : 'border-zinc-200 bg-white hover:bg-zinc-100/60 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-zinc-800 text-amber-400' : 'bg-zinc-100 text-zinc-500'} group-hover:scale-105 transition-transform`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold tracking-tight line-clamp-1">{item.label}</h4>
                      <p className={`text-[8px] mt-0.5 line-clamp-1 leading-normal font-semibold ${isSelected ? 'text-zinc-400' : 'text-zinc-405'}`}>
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2" htmlFor="eventTitle">
              Judul Undangan (Nama Acara) *
            </label>
            <input
              id="eventTitle"
              type="text"
              required
              placeholder="Contoh: Pernikahan Budi & Ani / Reuni Akbar 2026"
              value={title}
              onChange={handleTitleChange}
              className="block w-full border border-zinc-250 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-zinc-800 transition-colors bg-[#FAF9F6]"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1" htmlFor="eventSlug">
              Tautan URL Unik (Slug) *
            </label>
            <p className="text-[11px] text-zinc-500 mb-2">Tautan akhir: https://undangan.online/inv/<strong className="text-zinc-950 font-extrabold">{slug || 'slug-anda'}</strong>/[unique_link]</p>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 text-xs font-mono select-none">
                /inv/
              </span>
              <input
                id="eventSlug"
                type="text"
                required
                placeholder="slug-undangan-anda"
                value={slug}
                onChange={handleSlugChange}
                className="block w-full pl-14 pr-4 py-3 border border-zinc-250 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-zinc-800 font-mono transition-colors bg-[#FAF9F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Event date */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2" htmlFor="eventDate">
                Tanggal & Jam Acara *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Calendar className="h-4.5 w-4.5" />
                </span>
                <input
                  id="eventDate"
                  type="datetime-local"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-zinc-250 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-zinc-800 transition-colors bg-[#FAF9F6]"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2" htmlFor="eventLocation">
                Lokasi / Alamat Lengkap *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <MapPin className="h-4.5 w-4.5" />
                </span>
                <input
                  id="eventLocation"
                  type="text"
                  required
                  placeholder="Contoh: Gedung Kriya Asri, Jaksel"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-zinc-250 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-zinc-850 transition-colors bg-[#FAF9F6]"
                />
              </div>
            </div>
          </div>

          {/* Cover image url */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1" htmlFor="eventCover">
              Alamat Foto Cover Utama (Opsional)
            </label>
            <p className="text-[11px] text-zinc-500 mb-2">Masukkan URL gambar atau gunakan default dari kami.</p>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Image className="h-4.5 w-4.5" />
              </span>
              <input
                id="eventCover"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-zinc-250 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-zinc-850 transition-colors bg-[#FAF9F6]"
              />
            </div>
            
            {/* Preset photos select shortcut */}
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Pilihan Gambar:</span>
              <button
                type="button"
                onClick={() => setCoverImageUrl('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200')}
                className="text-xs bg-[#F2F1ED] hover:bg-zinc-200 text-zinc-800 font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
              >
                🌸 Wedding Rose
              </button>
              <button
                type="button"
                onClick={() => setCoverImageUrl('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200')}
                className="text-xs bg-[#F2F1ED] hover:bg-zinc-200 text-zinc-800 font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
              >
                ✨ Luxury Party
              </button>
            </div>
          </div>

          {/* PREMIUM CONFIGURATIONS PANEL */}
          <div className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-500/20 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-amber-500/15 pb-3">
              <Crown className="h-5 w-5 text-amber-600 animate-pulse" />
              <div>
                <h3 className="text-sm font-black text-amber-950 uppercase tracking-widest text-[#451a03]">👑 FITUR PREMIUM AKTIF (High Impact)</h3>
                <p className="text-[10px] text-amber-700 font-medium">Tingkatkan efisiensi dan interaktivitas undangan Anda secara instan.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* YouTube Live Stream */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-800 uppercase tracking-wider mb-2">
                  Link Live Streaming (YouTube / Zoom)
                </label>
                <input
                  type="url"
                  placeholder="Contoh: https://youtube.com/watch?v=..."
                  value={liveStreamUrl}
                  onChange={(e) => setLiveStreamUrl(e.target.value)}
                  className="block w-full border border-zinc-250 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-800 bg-[#FAF9F6] font-mono"
                />
              </div>

              {/* Event Password */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-800 uppercase tracking-wider mb-2">
                  Kata Sandi Undangan (Optional Password)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: nikahanbudi"
                  value={eventPassword}
                  onChange={(e) => setEventPassword(e.target.value)}
                  className="block w-full border border-zinc-250 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-800 bg-[#FAF9F6]"
                />
              </div>

              {/* RSVP Limit */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-800 uppercase tracking-wider mb-2">
                  Batas Maksimal Tamu (RSVP Limit Pax)
                </label>
                <input
                  type="number"
                  min={1}
                  value={rsvpLimit}
                  onChange={(e) => setRsvpLimit(Number(e.target.value))}
                  className="block w-full border border-zinc-250 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-800 bg-[#FAF9F6]"
                />
              </div>

              {/* GPS Coordinates Overrides */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-800 uppercase tracking-wider mb-2">
                  Latitude / Longitude Lokasi (GPS Estimator)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    placeholder="Lat"
                    className="block w-full border border-zinc-250 rounded-xl px-2 py-3 text-xs focus:outline-none font-mono text-zinc-800 bg-[#FAF9F6]"
                  />
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    placeholder="Lng"
                    className="block w-full border border-zinc-250 rounded-xl px-2 py-3 text-xs focus:outline-none font-mono text-zinc-800 bg-[#FAF9F6]"
                  />
                </div>
              </div>
            </div>

            {/* A/B Testing Toggle */}
            <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-amber-500/10">
              <input
                type="checkbox"
                id="abTestingCheckbox"
                checked={abTestEnabled}
                onChange={(e) => setAbTestEnabled(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500 focus:ring-offset-0"
              />
              <div className="text-left">
                <label htmlFor="abTestingCheckbox" className="text-xs font-bold text-zinc-850 block select-none cursor-pointer text-zinc-900">
                  Aktifkan A/B Testing Desain Undangan
                </label>
                <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">
                  Sistem akan membagi 50% tamu untuk melihat tema pilihan utama Anda, dan 50% tamu lainnya melihat tema Bloom Florals secara otomatis untuk menguji preferensi template.
                </p>
              </div>
            </div>
          </div>

          {/* DYNAMIC VARIABLE FIELDS FOR THE 14 UNIQUE CATEGORIES */}
          <div className="bg-zinc-100/50 rounded-2xl p-5 border border-zinc-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4.5 w-4.5 text-black" />
              <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-widest">
                INFORMASI KHUSUS TEMA: {eventType.toUpperCase().replace('_', ' ')}
              </h3>
            </div>

            {eventType === 'wedding' && (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Nama Pengantin Wanita</label>
                    <input type="text" value={weddingBride} onChange={(e) => setWeddingBride(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Nama Pengantin Pria</label>
                    <input type="text" value={weddingGroom} onChange={(e) => setWeddingGroom(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Waktu Akad Nikah</label>
                    <input type="text" value={weddingAkadTime} onChange={(e) => setWeddingAkadTime(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Waktu Resepsi</label>
                    <input type="text" value={weddingReceptionTime} onChange={(e) => setWeddingReceptionTime(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                </div>
                <div className="border-t border-zinc-200 pt-3">
                  <span className="block text-[10px] font-bold text-zinc-800 uppercase tracking-wider mb-2">🎁 KOTAK AMPLOP DIGITAL (Angpao Online)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] text-zinc-500 mb-1">Nama Bank</label>
                      <input type="text" value={weddingGiftBank} onChange={(e) => setWeddingGiftBank(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-2 py-1.5 text-xs text-zinc-805" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-500 mb-1">No Rekening / OVO / DANA</label>
                      <input type="text" value={weddingGiftAccount} onChange={(e) => setWeddingGiftAccount(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-2 py-1.5 text-xs text-zinc-805" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-500 mb-1">Atas Nama Pemilik</label>
                      <input type="text" value={weddingGiftOwner} onChange={(e) => setWeddingGiftOwner(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-2 py-1.5 text-xs text-zinc-805" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {eventType === 'birthday' && (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Usia Ke- (Misal: 17 / 5)</label>
                    <input type="number" value={birthdayAge} onChange={(e) => setBirthdayAge(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805 animate-fade-in" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Tautan Wishlist Hadiah (Tokopedia/Shopee)</label>
                    <input type="text" value={birthdayWishlist} onChange={(e) => setBirthdayWishlist(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-500/10 flex items-center justify-between">
                  <div className="text-zinc-800 text-[11px] font-medium">Aktifkan VVIP Ticket Premium</div>
                  <input type="checkbox" checked={birthdayVVIPEnabled} onChange={(e) => setBirthdayVVIPEnabled(e.target.checked)} className="h-4 w-4 rounded text-black focus:ring-0" />
                </div>
              </div>
            )}

            {eventType === 'corporate' && (
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Nama Perusahaan / Penyelenggara</label>
                  <input type="text" value={corpCompany} onChange={(e) => setCorpCompany(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Agenda Sesi Per Jam (Pecah dengan koma)</label>
                  <textarea value={corpSessions} onChange={(e) => setCorpSessions(e.target.value)} rows={2} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Nama Pembicara (Pecah dengan koma)</label>
                    <input type="text" value={corpSpeakers} onChange={(e) => setCorpSpeakers(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">URL Unduh Dokumen (PDF/PPT)</label>
                    <input type="url" value={corpPdfUrl} onChange={(e) => setCorpPdfUrl(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-850" />
                  </div>
                </div>
              </div>
            )}

            {eventType === 'aqiqah' && (
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Nama Bayi / Anak Tercinta</label>
                  <input type="text" value={aqiqahChild} onChange={(e) => setAqiqahChild(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Informasi Katering Menu</label>
                    <input type="text" value={aqiqahMenu} onChange={(e) => setAqiqahMenu(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Nama Yayasan Penyalur Berkat / Yatim</label>
                    <input type="text" value={aqiqahCharityBox} onChange={(e) => setAqiqahCharityBox(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                </div>
              </div>
            )}

            {eventType === 'webinar_seminar' && (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Link Webinar Zoom / Meet</label>
                    <input type="url" value={webinarZoomLink} onChange={(e) => setWebinarZoomLink(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Link Alternatif Penyimpanan Rekaman</label>
                    <input type="url" value={webinarRecordingUrl} onChange={(e) => setWebinarRecordingUrl(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                </div>
              </div>
            )}

            {eventType === 'grand_opening' && (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Kode Promo Khusus</label>
                    <input type="text" value={openingPromo} onChange={(e) => setOpeningPromo(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805 font-mono" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Panduan Tempat Parkir</label>
                    <input type="text" value={openingParking} onChange={(e) => setOpeningParking(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Ketersediaan Quota Hadiah Gratis</label>
                  <input type="number" value={openingGiftCount} onChange={(e) => setOpeningGiftCount(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                </div>
              </div>
            )}

            {eventType === 'concert' && (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Artis / Band Pendukung</label>
                    <input type="text" value={concertArtist} onChange={(e) => setConcertArtist(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Tautan Playlist Lagu (Spotify/YouTube)</label>
                    <input type="text" value={concertPlaylist} onChange={(e) => setConcertPlaylist(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Tier / Kategori Tiket (Pisahkan koma)</label>
                  <input type="text" value={concertTiers} onChange={(e) => setConcertTiers(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                </div>
              </div>
            )}

            {eventType === 'charity' && (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Target Dana Penggalangan (Rp)</label>
                    <input type="number" value={charityTarget} onChange={(e) => setCharityTarget(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-850" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Nama Lembaga / Kumpulan Penerima</label>
                    <input type="text" value={charityRecipient} onChange={(e) => setCharityRecipient(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                </div>
              </div>
            )}

            {eventType === 'graduation' && (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Nama Wisudawan & Gelar</label>
                    <input type="text" value={gradName} onChange={(e) => setGradName(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Jurusan & Fakultas Kampus</label>
                    <input type="text" value={gradMajor} onChange={(e) => setGradMajor(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="cumlaudeGrad" checked={gradCumlaude} onChange={(e) => setGradCumlaude(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-black focus:ring-0" />
                  <label htmlFor="cumlaudeGrad" className="text-xs font-bold text-zinc-700">Wisudawan Berpredikat Cumlaude</label>
                </div>
              </div>
            )}

            {eventType === 'arisan' && (
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Kontribusi Menu Potluck Terdaftar</label>
                  <textarea value={arisanPotluckText} onChange={(e) => setArisanPotluckText(e.target.value)} rows={2} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Besaran Uang Iuran Bulanan (Rp)</label>
                  <input type="number" value={arisanDues} onChange={(e) => setArisanDues(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                </div>
              </div>
            )}

            {eventType === 'sports' && (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Kategori Balapan (E.g. 5K, 10K)</label>
                    <input type="text" value={sportsCategory} onChange={(e) => setSportsCategory(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Permulaan Angka Nomor Dada (Bib)</label>
                    <input type="number" value={sportsBibStart} onChange={(e) => setSportsBibStart(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                  </div>
                </div>
              </div>
            )}

            {eventType === 'religious' && (
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Pembicara Utama / Ustadz / Pendeta</label>
                  <input type="text" value={religiousSpeaker} onChange={(e) => setReligiousSpeaker(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">No Rekening Penyaluran Infak/Sedekah</label>
                  <input type="text" value={religiousSedekah} onChange={(e) => setReligiousSedekah(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805" />
                </div>
              </div>
            )}

            {eventType === 'rt_rw' && (
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Agenda Utama Musyawarah Warga</label>
                  <textarea value={rtrwAgenda} onChange={(e) => setRtrwAgenda(e.target.value)} rows={2} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-850" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Topik Untuk Jajak Pendapat / Polling Warga</label>
                  <input type="text" value={rtrwTopic} onChange={(e) => setRtrwTopic(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-850" />
                </div>
              </div>
            )}

            {eventType === 'baby_shower' && (
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-1">Polling Pilihan Tebak Gender</label>
                  <input type="text" value={babyGenderGuesses} onChange={(e) => setBabyGenderGuesses(e.target.value)} className="w-full border border-zinc-250 bg-white rounded-xl px-3 py-2 text-xs text-zinc-805 animate-fade-in" />
                </div>
              </div>
            )}
          </div>

          {/* Theme template selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3">
              Pilihan Desain Tema Undangan (Minimal 3 Tema) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Classic Gold Card */}
              <div 
                onClick={() => setTemplateId('classic')}
                className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
                  templateId === 'classic'
                    ? 'border-amber-400 bg-amber-50/25 ring-2 ring-amber-400/25'
                    : 'border-zinc-200 bg-white hover:bg-zinc-105'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-950 font-serif-elegant">Classic Gold</span>
                    {templateId === 'classic' && <Check className="h-4.5 w-4.5 text-amber-600 stroke-[3]" />}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal font-semibold">
                    Tipografi elegan serifs emas, hiasan ornamen luks klasik bernuansa khidmat romantis.
                  </p>
                </div>
                <div className="h-14 bg-amber-100/50 rounded-xl mt-4 border border-amber-200/40 flex items-center justify-center font-serif-elegant font-bold text-amber-900 text-xs">
                  A & B
                </div>
              </div>

              {/* Bunga Daisy Card */}
              <div 
                onClick={() => setTemplateId('bunga')}
                className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
                  templateId === 'bunga'
                    ? 'border-rose-400 bg-rose-50/25 ring-2 ring-rose-400/25'
                    : 'border-zinc-200 bg-white hover:bg-zinc-105'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-950">Bloom Florals</span>
                    {templateId === 'bunga' && <Check className="h-4.5 w-4.5 text-rose-600 stroke-[3]" />}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal font-semibold">
                    Ilustrasi bunga mekar manis, berlatar pastel lembut yang estetik, romantis retro.
                  </p>
                </div>
                <div className="h-14 bg-rose-100/50 rounded-xl mt-4 border border-rose-200/40 flex items-center justify-center font-serif-elegant font-bold text-rose-900 text-xs italic">
                  Rose Garden
                </div>
              </div>

              {/* Modern Slate */}
              <div 
                onClick={() => setTemplateId('modern')}
                className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
                  templateId === 'modern'
                    ? 'border-zinc-800 bg-zinc-950 ring-2 ring-zinc-800/25 text-white'
                    : 'border-zinc-200 bg-white hover:bg-zinc-105'
                }`}
              >
                <div className={`${templateId === 'modern' ? 'text-white' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-modern-display">Modern Slate</span>
                    {templateId === 'modern' && <Check className="h-4.5 w-4.5 text-white stroke-[3]" />}
                  </div>
                  <p className={`text-[11px] leading-normal font-semibold ${templateId === 'modern' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Sleek minimalis gelap, paduan tulisan sans-serif kontras dan ornamen aksen bercahaya.
                  </p>
                </div>
                <div className={`h-14 rounded-xl mt-4 flex items-center justify-center font-modern-display font-medium text-xs border ${
                  templateId === 'modern' ? 'bg-zinc-900 border-zinc-800 text-purple-400' : 'bg-zinc-100 border-zinc-200 text-zinc-650'
                }`}>
                  MODERN & CO
                </div>
              </div>

            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4.5 bg-black hover:opacity-95 text-white font-extrabold text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Save className="h-5 w-5" />
            Simpan Undangan & Generasikan
          </button>

        </form>
      </main>
    </div>
  );
}
