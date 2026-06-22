/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { db } from '../store';
import { Guest, Event, SimulatedEmail } from '../types';
import { 
  ChevronLeft, Users, Calendar, MapPin, Plus, FileSpreadsheet, 
  Copy, ExternalLink, Trash2, Check, Download, Search, RefreshCw, 
  Send, Mail, Eye, Grid3X3, Star, Map, Compass, Locate, Activity, 
  Info, X, MailCheck, BellRing, Printer, QrCode,
  Heart, Gift, Building2, Baby, Video, Store, Disc, HeartHandshake, GraduationCap, 
  Trophy, BookOpen, Vote, Sparkles, Save, Image
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

// Simple projection from lat/lng to mercator-like flat projection of Indonesia region
function projectCoordinates(lat: number, lng: number) {
  // Map longitude 94 to 142 -> X from 5% to 95%
  const minLng = 94;
  const maxLng = 142;
  const x = ((lng - minLng) / (maxLng - minLng)) * 100;

  // Map latitude -11 to 6 -> Y from 5% to 95%
  const minLat = -11;
  const maxLat = 6;
  const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;

  return { x, y };
}

interface EventDetailProps {
  eventId: string;
  onNavigate: (route: string) => void;
  onSelectGuestInvitation: (slug: string, link: string) => void;
}

export default function EventDetail({ eventId, onNavigate, onSelectGuestInvitation }: EventDetailProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [, setTick] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState<SimulatedEmail | null>(null);
  
  // QR states
  const [activeQrGuest, setActiveQrGuest] = useState<Guest | null>(null);
  const [activeQrData, setActiveQrData] = useState<string>('');

  // Print-Ready PDF states
  const [selectedGuestForPdf, setSelectedGuestForPdf] = useState<Guest | null>(null);
  const [pdfPaperSize, setPdfPaperSize] = useState<'postcard' | 'a6' | 'a5' | 'square'>('postcard');
  const [pdfBleedMm, setPdfBleedMm] = useState<number>(3);
  const [pdfIncludeTrimMarks, setPdfIncludeTrimMarks] = useState<boolean>(true);
  const [pdfAccentColor, setPdfAccentColor] = useState<string>('#18181b');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Background music editing states
  const [editMusicEnabled, setEditMusicEnabled] = useState<boolean>(true);
  const [editMusicUrl, setEditMusicUrl] = useState<string>('https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3');
  const [editMusicTitle, setEditMusicTitle] = useState<string>('Beautiful Dream Piano');
  const [editCustomMusicUrl, setEditCustomMusicUrl] = useState<string>('');
  const [isTestingEditMusic, setIsTestingEditMusic] = useState<boolean>(false);
  const [musicSaveSuccess, setMusicSaveSuccess] = useState<boolean>(false);
  const [hasInitializedMusicState, setHasInitializedMusicState] = useState<boolean>(false);

  // Maps custom embed states
  const [editMapsIframe, setEditMapsIframe] = useState<string>('');
  const [mapsSaveSuccess, setMapsSaveSuccess] = useState<boolean>(false);

  // Guest invitation views chart states
  const [guestViewsBarLimit, setGuestViewsBarLimit] = useState<number>(10);
  const [guestViewsSearch, setGuestViewsSearch] = useState<string>('');
  const [guestViewsSort, setGuestViewsSort] = useState<'highest' | 'lowest' | 'alphabetical'>('highest');

  // Photo gallery configuration states
  const [editGalleryPhotos, setEditGalleryPhotos] = useState<string[]>([]);
  const [gallerySaveSuccess, setGallerySaveSuccess] = useState<boolean>(false);
  const [galleryInputUrl, setGalleryInputUrl] = useState<string>('');

  const handleDownloadGuestPdf = async (guest: Guest) => {
    try {
      setIsGeneratingPdf(true);
      const finalInvitationUrl = `${window.location.origin}/inv/${event?.slug}/${guest.unique_link}`;
      
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          guest,
          scannedUrl: finalInvitationUrl,
          bleedMm: pdfBleedMm,
          paperSize: pdfPaperSize,
          includeTrimMarks: pdfIncludeTrimMarks,
          accentColor: pdfAccentColor,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Gagal menghasilkan PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Undangan_Cetak_${event?.slug || 'event'}_${guest.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Close modal on success
      setSelectedGuestForPdf(null);
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengunduh PDF undangan: ' + err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle opening QR Code modal and generating base64 QR URL on-the-fly
  const handleOpenQrModal = async (guest: Guest) => {
    try {
      const invitationUrl = `${window.location.origin}/inv/${event?.slug}/${guest.unique_link}`;
      const dataUrl = await QRCode.toDataURL(invitationUrl, {
        width: 380,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setActiveQrData(dataUrl);
      setActiveQrGuest(guest);
    } catch (err) {
      console.error('Failed to generate QR Code:', err);
    }
  };

  const handlePrintSinglePass = (guest: Guest, qrDataUrl: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan pop-up / block blocker di peramban Anda untuk mencetak pass.');
      return;
    }
    const htmlContent = `
      <html>
        <head>
          <title>Cetak Pass - ${guest.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500&display=swap');
            body { 
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 40px;
              background-color: #ffffff;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 80vh;
              color: #09090b;
            }
            .ticket-card {
              border: 3px solid #09090b;
              border-radius: 28px;
              padding: 36px;
              width: 380px;
              text-align: center;
              background-color: #ffffff;
              box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            }
            .title-brand {
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.18em;
              text-transform: uppercase;
              font-family: 'JetBrains Mono', monospace;
              color: #71717a;
              margin-bottom: 24px;
              border-bottom: 2px dashed #e4e4e7;
              padding-bottom: 12px;
            }
            .event-title {
              font-size: 20px;
              font-weight: 950;
              margin: 0 0 8px 0;
              letter-spacing: -0.03em;
              line-height: 1.2;
            }
            .guest-label {
              font-size: 9px;
              font-weight: 800;
              color: #a1a1aa;
              text-transform: uppercase;
              margin-top: 28px;
              margin-bottom: 4px;
              letter-spacing: 0.05em;
            }
            .guest-name {
              font-size: 24px;
              font-weight: 900;
              margin: 0;
              color: #09090b;
              word-break: break-word;
              line-height: 1.2;
            }
            .qr-container {
              margin: 28px auto;
              width: 220px;
              height: 220px;
              border: 1px solid #e4e4e7;
              padding: 12px;
              border-radius: 20px;
              background-color: #ffffff;
            }
            .qr-image {
              width: 100%;
              height: 100%;
              display: block;
            }
            .footer-info {
              font-family: 'JetBrains Mono', monospace;
              font-size: 9px;
              color: #71717a;
              margin-top: 24px;
              border-top: 2px dashed #e4e4e7;
              padding-top: 16px;
              line-height: 1.4;
            }
            @media print {
              body { padding: 0; background: none; }
              .ticket-card { box-shadow: none; border-color: #000000; page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="ticket-card">
            <div class="title-brand">✦ INVITELY ENTRY PASS ✦</div>
            <div class="event-title">${event?.title || 'Undangan Digital'}</div>
            <div style="font-size: 11px; color: #52525b; font-weight: 600;">
              ${event?.date ? new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </div>
            
            <div class="guest-label">NAMA TAMU UNDANGAN</div>
            <div class="guest-name">${guest.name}</div>
            
            <div class="qr-container">
              <img class="qr-image" src="${qrDataUrl}" alt="QR Link Pass" />
            </div>

            <div style="font-size: 10px; font-weight: 800; color: #71717a; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.1em;">
              SCAN PADA HARI ACARA
            </div>
            
            <div class="footer-info">
              ID TAUTAN: ${guest.unique_link}<br>
              Generasi Real-time • Invitely
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handlePrintAllPasses = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan pop-up / block blocker di peramban Anda untuk mencetak pass.');
      return;
    }

    let ticketsHtml = '';
    
    for (const g of filteredGuests) {
      const invitationUrl = `${window.location.origin}/inv/${event?.slug}/${g.unique_link}`;
      const qrDataUrl = await QRCode.toDataURL(invitationUrl, {
        width: 300,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      });

      ticketsHtml += `
        <div class="ticket-card">
          <div class="title-brand">✦ INVITELY ENTRY PASS ✦</div>
          <div class="event-title">${event?.title || 'Undangan Digital'}</div>
          <div style="font-size: 10px; color: #52525b; font-weight: 600;">
            ${event?.date ? new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          </div>
          
          <div class="guest-label">NAMA TAMU UNDANGAN</div>
          <div class="guest-name">${g.name}</div>
          
          <div class="qr-container">
            <img class="qr-image" src="${qrDataUrl}" alt="QR Link Pass" />
          </div>

          <div style="font-size: 9px; font-weight: 800; color: #71717a; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em;">
            SCAN PADA HARI ACARA
          </div>
          
          <div class="footer-info">
            ID TAUTAN: ${g.unique_link}<br>
            Generasi Real-time • Invitely
          </div>
        </div>
      `;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Cetak Semua Pass - ${event?.title || 'Event'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500&display=swap');
            body { 
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 24px;
              background-color: #ffffff;
              display: flex;
              flex-wrap: wrap;
              gap: 24px;
              justify-content: center;
              color: #09090b;
            }
            .ticket-card {
              border: 2px solid #000000;
              border-radius: 20px;
              padding: 24px;
              width: 290px;
              text-align: center;
              background-color: #ffffff;
              box-shadow: 0 4px 10px rgba(0,0,0,0.02);
              page-break-inside: avoid;
            }
            .title-brand {
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.15em;
              text-transform: uppercase;
              font-family: 'JetBrains Mono', monospace;
              color: #71717a;
              margin-bottom: 16px;
              border-bottom: 1px dashed #e4e4e7;
              padding-bottom: 8px;
            }
            .event-title {
              font-size: 15px;
              font-weight: 900;
              margin: 0 0 6px 0;
              letter-spacing: -0.02em;
              line-height: 1.2;
            }
            .guest-label {
              font-size: 8px;
              font-weight: bold;
              color: #a1a1aa;
              text-transform: uppercase;
              margin-top: 16px;
              margin-bottom: 2px;
            }
            .guest-name {
              font-size: 18px;
              font-weight: 800;
              margin: 0;
              color: #09090b;
              word-break: break-word;
              line-height: 1.2;
            }
            .qr-container {
              margin: 16px auto;
              width: 170px;
              height: 170px;
              border: 1px solid #e4e4e7;
              padding: 10px;
              border-radius: 12px;
              background-color: #ffffff;
            }
            .qr-image {
              width: 100%;
              height: 100%;
              display: block;
            }
            .footer-info {
              font-family: 'JetBrains Mono', monospace;
              font-size: 8px;
              color: #71717a;
              margin-top: 16px;
              border-top: 1px dashed #e4e4e7;
              padding-top: 12px;
              line-height: 1.3;
            }
            @media print {
              body { padding: 0; background: none; }
              .ticket-card { 
                box-shadow: none; 
                border-color: #000000; 
                margin-bottom: 30px;
              }
            }
          </style>
        </head>
        <body>
          ${ticketsHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Guest inputs state
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  // Bulk CSV input state
  const [csvText, setCsvText] = useState('');
  const [csvFileError, setCsvFileError] = useState('');
  const [csvFileSuccess, setCsvFileSuccess] = useState('');

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'pending' | 'hadir' | 'tidak_hadir'>('semua');

  // Copy feedbacks
  const [copiedLinkIds, setCopiedLinkIds] = useState<Record<string, boolean>>({});
  const [copiedAll, setCopiedAll] = useState(false);

  // Check-In Terminal States
  const [checkinCodeInput, setCheckinCodeInput] = useState('');
  const [checkedinGuest, setCheckedinGuest] = useState<Guest | null>(null);
  const [checkinPhotoBase64, setCheckinPhotoBase64] = useState('');
  const [checkinSuccessMsg, setCheckinSuccessMsg] = useState('');
  const [checkinErrorMsg, setCheckinErrorMsg] = useState('');

  // Handle guest key lookup
  const handleLookupCheckin = (code: string) => {
    setCheckinCodeInput(code);
    setCheckinSuccessMsg('');
    setCheckinErrorMsg('');
    
    if (!code.trim()) {
      setCheckedinGuest(null);
      return;
    }
    
    // Find guest with unique link or unique id matching code
    const cleanCode = code.trim().toLowerCase();
    const found = guests.find(
      (g) => g.unique_link.toLowerCase().includes(cleanCode) || g.id.toLowerCase().includes(cleanCode)
    );
    
    if (found) {
      setCheckedinGuest(found);
    } else {
      setCheckedinGuest(null);
    }
  };

  // Mock Camera Snap Verification generator
  const handleSnapCameraVerify = () => {
    // Generate a beautiful mock checkin-photo with green timestamp overlay
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw background
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, 300, 300);
      
      // Draw simulated target camera lines
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 40, 220, 220);
      
      // Draw corners indicators
      ctx.fillStyle = '#10b981';
      ctx.fillRect(35, 35, 20, 5);
      ctx.fillRect(35, 35, 5, 20);
      
      ctx.fillRect(245, 35, 20, 5);
      ctx.fillRect(260, 35, 5, 20);
      
      ctx.fillRect(35, 260, 20, 5);
      ctx.fillRect(35, 245, 5, 20);
      
      ctx.fillRect(245, 260, 20, 5);
      ctx.fillRect(260, 245, 5, 20);
      
      // Draw circular user avatar placeholder outline
      ctx.beginPath();
      ctx.arc(150, 135, 45, 0, Math.PI * 2);
      ctx.strokeStyle = '#4b5563';
      ctx.stroke();
      
      // Text timestamp metadata overlay
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('CAMERA OK  • 30 FPS', 50, 235);
      ctx.fillText(`ID: ${checkedinGuest?.unique_link.toUpperCase().substring(0, 8) || 'CHECK'}`, 50, 248);
      ctx.fillText(`TIME: ${new Date().toLocaleTimeString()}`, 50, 261);
      
      setCheckinPhotoBase64(canvas.toDataURL('image/png'));
      setCheckinSuccessMsg('Foto verifikasi wajah check-in berhasil diambil!');
    }
  };

  // Perform operational check-in permanent entry
  const handleConfirmCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckinSuccessMsg('');
    setCheckinErrorMsg('');
    
    if (!checkedinGuest) {
      setCheckinErrorMsg('Pilih atau cari kode tamu terlebih dahulu.');
      return;
    }
    
    // Call database operational check-in handler we built in store.ts
    const worked = db.checkinGuest(checkedinGuest.id, checkinPhotoBase64 || undefined);
    
    if (worked) {
      setCheckinSuccessMsg(`Sukses! ${checkedinGuest.name} berhasil melakukan check-in loket masuk.`);
      setCheckinCodeInput('');
      setCheckedinGuest(null);
      setCheckinPhotoBase64('');
      
      // Refresh local page state
      setGuests(db.getEventGuests(eventId));
    } else {
      setCheckinErrorMsg('Terjadi kegagalan memproses check-in ke basis data.');
    }
  };

  useEffect(() => {
    const updateEventState = () => {
      const foundEvent = db.getEvent(eventId);
      setEvent(foundEvent);
      if (foundEvent) {
        setGuests(db.getEventGuests(eventId));
      }
    };

    updateEventState();
    const unsubscribe = db.subscribe(updateEventState);
    return unsubscribe;
  }, [eventId]);

  // Load backend background music configuration into editing states once loaded
  useEffect(() => {
    if (event && !hasInitializedMusicState) {
      setEditMusicEnabled(event.music_enabled !== false);
      setEditMusicUrl(event.music_url || 'https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3');
      setEditMusicTitle(event.music_title || 'Beautiful Dream Piano');
      if (event.music_url && ![
        'https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3',
        'https://assets.mixkit.co/music/preview/mixkit-sunny-day-warm-light-2550.mp3',
        'https://assets.mixkit.co/music/preview/mixkit-forest-trail-1200.mp3',
        'https://assets.mixkit.co/music/preview/mixkit-just-cool-2216.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
      ].includes(event.music_url)) {
        setEditCustomMusicUrl(event.music_url);
      }
      setEditMapsIframe(event.maps_iframe || '');
      setEditGalleryPhotos(event.gallery_photos || []);
      setHasInitializedMusicState(true);
    }
  }, [event, hasInitializedMusicState]);

  const handleSaveBackgroundMusic = () => {
    if (!event) return;
    
    // Pause testing audio first
    try {
      const audioEl = document.getElementById('detail-music-test-audio') as HTMLAudioElement;
      if (audioEl) {
        audioEl.pause();
        setIsTestingEditMusic(false);
      }
    } catch (e) {}

    const res = db.updateEvent(event.id, {
      music_enabled: editMusicEnabled,
      music_url: editMusicUrl || undefined,
      music_title: editMusicTitle || undefined
    });

    if (res.success) {
      setMusicSaveSuccess(true);
      setTimeout(() => setMusicSaveSuccess(false), 3000);
    } else {
      alert('Gagal menyimpan musik: ' + res.error);
    }
  };

  const handleSaveGoogleMaps = () => {
    if (!event) return;

    let finalEmbedUrl = editMapsIframe.trim();
    
    // Try to extract src if the user pasted a full HTML iframe tag block
    const srcMatch = finalEmbedUrl.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
      finalEmbedUrl = srcMatch[1];
    }

    const res = db.updateEvent(event.id, {
      maps_iframe: finalEmbedUrl || undefined
    });

    if (res.success) {
      setMapsSaveSuccess(true);
      setTimeout(() => setMapsSaveSuccess(false), 3000);
    } else {
      alert('Gagal menyimpan koordinat maps: ' + res.error);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!galleryInputUrl.trim()) return;
    setEditGalleryPhotos((prev) => [...prev, galleryInputUrl.trim()]);
    setGalleryInputUrl('');
  };

  const handleUploadGalleryPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readPromises = Array.from(files).map((file: any) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.onerror = () => reject(new Error("Gagal membaca file gambar"));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises)
      .then((newPhotos) => {
        setEditGalleryPhotos((prev) => [...prev, ...newPhotos]);
      })
      .catch((err) => {
        alert(err.message || "Gagal mengunggah foto.");
      });
  };

  const handleRemoveGalleryPhoto = (index: number) => {
    setEditGalleryPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveGalleryPhotos = () => {
    if (!event) return;
    const res = db.updateEvent(event.id, {
      gallery_photos: editGalleryPhotos
    });
    if (res.success) {
      setGallerySaveSuccess(true);
      setTimeout(() => setGallerySaveSuccess(false), 3000);
    } else {
      alert('Gagal menyimpan galeri foto: ' + res.error);
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50 text-slate-800">
        <p className="text-sm font-semibold text-rose-500 mb-2">Error</p>
        <p className="text-lg font-bold text-slate-900 mb-4">Undangan tidak ditemukan!</p>
        <button 
          onClick={() => onNavigate('/dashboard/events')}
          className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const handleAddManualGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    db.addGuest(
      eventId,
      manualName,
      manualEmail || null,
      manualPhone || null
    );

    // reset forms
    setManualName('');
    setManualEmail('');
    setManualPhone('');
    setTick((t) => t + 1);
  };

  const handleCSVImport = (e: React.FormEvent) => {
    e.preventDefault();
    setCsvFileError('');
    setCsvFileSuccess('');

    if (!csvText.trim()) {
      setCsvFileError('Teks CSV kosong. Silakan paste baris nama tamu terlebih dahulu.');
      return;
    }

    const res = db.importGuestsCSV(eventId, csvText);
    if (res.success) {
      setCsvFileSuccess(`Berhasil mengimpor ${res.count} tamu secara massal!`);
      setCsvText('');
      setTick((t) => t + 1);
    } else {
      setCsvFileError(res.error || 'Gagal mengimpor CSV.');
    }
  };

  // Easy CSV File Reader Upload Handler
  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvFileError('');
    setCsvFileSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const res = db.importGuestsCSV(eventId, text);
        if (res.success) {
          setCsvFileSuccess(`Berhasil mengunggah file & mengimpor ${res.count} tamu secara massal!`);
          setTick((t) => t + 1);
        } else {
          setCsvFileError(res.error || 'Gagal menguraikan file.');
        }
      }
    };
    reader.onerror = () => {
      setCsvFileError('Gagal membaca dokumen file.');
    };
    reader.readAsText(file);
  };

  const handleDeleteGuest = (id: string) => {
    if (confirm('Menghapus tamu akan menghilangkan statistik dan login RSVP mereka. Lanjutkan?')) {
      db.deleteGuest(id);
      setTick((t) => t + 1);
    }
  };

  // Copy link function
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLinkIds((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedLinkIds((prev) => ({ ...prev, [id]: false }));
    }, 1200);
  };

  // EXPORT ALL CSV ("Salin Semua Link")
  const exportAllLinksCSVText = () => {
    let header = 'Nama Tamu,Email,Telepon,Unique Link,Alamat Undangan\n';
    const lines = guests.map((g) => {
      const finalLink = `${window.location.origin}/inv/${event.slug}/${g.unique_link}`;
      return `"${g.name}","${g.email || ''}","${g.phone || ''}","${g.unique_link}","${finalLink}"`;
    }).join('\n');

    const totalText = header + lines;
    navigator.clipboard.writeText(totalText);

    setCopiedAll(true);
    setTimeout(() => {
      setCopiedAll(false);
    }, 1500);

    // Dynamic file download simulation so they have physical proof as well!
    try {
      const blob = new Blob([totalText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `daftar_tautan_ tamu_${event.slug}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn('File download not supported in this frame sandbox, copied text to clipboard instead!', e);
    }
  };

  // Get view metrics
  const allViews = db.getInvitationViewsTable();
  const guestViewsTotal = guests.filter((g) => {
    return allViews.some((v) => v.guest_id === g.id);
  }).length;

  const totalGuests = guests.length;
  const confirmedHadir = guests.filter((g) => g.rsvp_status === 'hadir').length;
  const confirmedAbsen = guests.filter((g) => g.rsvp_status === 'tidak_hadir').length;
  const pendingRespon = guests.filter((g) => g.rsvp_status === 'pending').length;

  // Filter views and emails and resolve chart structures
  const eventViews = allViews.filter((v) => guests.some((g) => g.id === v.guest_id));
  const eventEmails = db.getSimulatedEmails().filter((em) => em.event_id === eventId);

  const totalRombonganHadir = guests
    .filter((g) => g.rsvp_status === 'hadir')
    .reduce((acc, g) => acc + (g.number_of_guests || 0), 0);

  // Process guest-by-guest views statistics
  const getGuestViewsAnalytics = () => {
    const rawData = guests.map((g) => {
      const gViews = eventViews.filter((v) => v.guest_id === g.id);
      return {
        id: g.id,
        name: g.name,
        views: gViews.length,
        rsvp_status: g.rsvp_status,
        lastViewed: gViews.length > 0
          ? [...gViews].sort((a, b) => new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime())[0].viewed_at
          : null
      };
    });

    // Filter by search query
    let filtered = rawData;
    if (guestViewsSearch.trim()) {
      const q = guestViewsSearch.toLowerCase();
      filtered = filtered.filter((g) => g.name.toLowerCase().includes(q));
    }

    // Sort accordingly
    if (guestViewsSort === 'highest') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (guestViewsSort === 'lowest') {
      filtered.sort((a, b) => a.views - b.views);
    } else if (guestViewsSort === 'alphabetical') {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'id-ID'));
    }

    return filtered;
  };

  const guestViewsAnalyticsData = getGuestViewsAnalytics();
  const maxIndividualViews = Math.max(...guestViewsAnalyticsData.map((d) => d.views), 1);

  // Limited data purely for Recharts display
  const chartFilteredData = guestViewsBarLimit === -1 
    ? guestViewsAnalyticsData 
    : guestViewsAnalyticsData.slice(0, guestViewsBarLimit);

  // Generate beautiful 7-day chronological views trend array for AreaChart
  const getViewsTrendData = () => {
    const trendMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      trendMap[label] = 0;
    }

    eventViews.forEach((view) => {
      try {
        const viewDate = new Date(view.viewed_at);
        const label = viewDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        if (trendMap[label] !== undefined) {
          trendMap[label]++;
        }
      } catch (err) {
        console.error('Error parsing view date:', err);
      }
    });

    return Object.entries(trendMap).map(([date, count]) => ({
      date,
      'Kunjungan': count,
    }));
  };

  const viewsTrendData = getViewsTrendData();

  const hasRsvpData = confirmedHadir > 0 || confirmedAbsen > 0 || pendingRespon > 0;
  const chartData = hasRsvpData 
    ? [
        { name: 'Hadir', value: confirmedHadir },
        { name: 'Absen', value: confirmedAbsen },
        { name: 'Proses', value: pendingRespon },
      ]
    : [
        { name: 'Belum Ada Data', value: 1 }
      ];
  const chartColors = hasRsvpData 
    ? ['#059669', '#ef4444', '#71717a']
    : ['#e4e4e7'];

  // Search filter computing
  const filteredGuests = guests.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (g.email && g.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (g.phone && g.phone.includes(searchTerm));
    
    if (statusFilter === 'semua') return matchesSearch;
    return matchesSearch && g.rsvp_status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] font-sans pb-40">
      
      {/* Header Sticky Navigation */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            type="button"
            onClick={() => onNavigate('/dashboard/events')}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-550 hover:text-black cursor-pointer transition-colors"
          >
            <ChevronLeft className="h-4.5 w-4.5" /> Kembali Ke Dashboard
          </button>
          <span className="font-extrabold text-sm text-zinc-900 hidden sm:block tracking-tight">Panel Pengelolaan Undangan</span>
          <span className="bg-black text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
            {event.template_id} Theme
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Banner Informational Card */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-2xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-zinc-100 text-black rounded-2xl hidden sm:block shrink-0 border border-zinc-200">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">/{event.slug}</p>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-950 leading-tight">{event.title}</h1>
              
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 font-semibold">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-zinc-400" /> {new Date(event.event_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-zinc-400" /> {event.location}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onSelectGuestInvitation(event.slug, 'budi-wedding-link-abc')}
              className="bg-black hover:opacity-90 text-white font-bold text-xs px-4.5 py-3 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              Lihat Demo Publik
            </button>
          </div>
        </div>

        {/* PREMIUM SPECIALIZED CATEGORIES ACTIVE FIELD BOARD */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBEBE5] shadow-xs mb-8">
          <div className="flex items-center justify-between border-b border-zinc-150 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-black" />
              <span className="text-[11px] font-black text-zinc-900 uppercase tracking-widest font-mono">
                🏆 SPESIFIKASI CATEGORY AKTIF: {event.event_type?.toUpperCase().replace('_', ' ') || 'WEDDING'}
              </span>
            </div>
            <span className="bg-zinc-100 ring-1 ring-zinc-200 text-zinc-805 text-[9px] font-bold px-2.5 py-1 rounded-md uppercase font-mono">
              Dynamic Variable JSON Fields Ready
            </span>
          </div>

          {/* Conditional templates renders */}
          {(!event.event_type || event.event_type === 'wedding') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">💍 PASANGAN PENGANTIN</span>
                <p className="text-sm font-extrabold text-zinc-900 truncate">👩 {event.custom_fields?.bride || 'Siti Nurhayati'}</p>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold">&amp;</p>
                <p className="text-sm font-extrabold text-zinc-900 truncate mt-1">👨 {event.custom_fields?.groom || 'Andi Prasetyo'}</p>
              </div>
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">⏰ WAKTU SYUKURAN</span>
                <p className="text-xs font-bold text-zinc-700">Akad: <span className="font-mono text-zinc-950 font-extrabold">{event.custom_fields?.akad_time || '08:00 WIB'}</span></p>
                <p className="text-xs font-bold text-zinc-700 mt-1.5 font-md">Resepsi: <span className="font-mono text-zinc-950 font-extrabold">{event.custom_fields?.reception_time || '11:00 WIB'}</span></p>
                <p className="text-[10px] text-zinc-550 mt-1.5 font-semibold">Tamu VVIP dibebaskan dari antrean barcode katering.</p>
              </div>
              <div className="p-4 bg-zinc-950 text-white rounded-2xl border border-zinc-800 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 block uppercase tracking-wider mb-2 font-mono">💝 KOTAK AMPLOP DIGITAL (LIVE)</span>
                  <p className="text-xs font-bold text-amber-400">Bank: {event.custom_fields?.gift_bank_name || 'BCA'}</p>
                  <p className="text-xs font-mono font-bold mt-1">Norek: {event.custom_fields?.gift_bank_account || '123-456-7890'}</p>
                </div>
                <div className="text-[10px] text-zinc-400 border-t border-zinc-800 pt-2 mt-2 font-medium">
                  Pemilik: {event.custom_fields?.gift_bank_owner || 'Siti Nurhayati & Andi'}
                </div>
              </div>
            </div>
          )}

          {event.event_type === 'birthday' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-1 font-mono">🎂 PERAYAAN USIA KE</span>
                  <p className="text-2xl font-black text-zinc-900 font-mono">{event.custom_fields?.age || '17'} Tahun</p>
                </div>
                {event.custom_fields?.vip_pass_enabled && (
                  <span className="text-[10px] bg-amber-100 border border-amber-300 text-amber-800 font-extrabold px-3 py-1.5 rounded-xl uppercase">
                    👑 VVIP Pass Enabled
                  </span>
                )}
              </div>
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-1.5 font-mono">🎁 WISHLIST HADIAH</span>
                <p className="text-xs text-zinc-650 leading-relaxed font-semibold">Tamu dapat mengirimkan kado langsung ke alamat via marketplace:</p>
                <a href={event.custom_fields?.wishlist_url || '#'} target="_blank" rel="noreferrer" className="text-xs text-indigo-650 font-bold hover:underline font-mono truncate block mt-2">
                  🔗 {event.custom_fields?.wishlist_url || 'https://tokopedia.com/wishlist/budi'}
                </a>
              </div>
            </div>
          )}

          {event.event_type === 'corporate' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="md:col-span-2 p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">📅 SUSUNAN ACARA & TIMELINE SESI</span>
                <div className="space-y-1.5 mt-2">
                  {(event.custom_fields?.agenda_sessions_raw || '09:00 - Registrasi Tamu, 10:00 - Keynote, 13:00 - Panel Q&A').split(',').map((agenda: string, aIdx: number) => (
                    <div key={aIdx} className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 bg-white p-2 rounded-lg border border-zinc-150">
                      <span className="w-1.5 h-1.5 bg-black rounded-full" />
                      {agenda.trim()}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-zinc-900 text-white rounded-2xl border border-zinc-800 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 block uppercase tracking-wider mb-2 font-mono">🎙️ DAFTAR PEMBICARA</span>
                  <p className="text-xs font-bold text-amber-400 leading-relaxed">{event.custom_fields?.speakers_raw || 'Richard Philips (CEO), Budi Santoso (VP)'}</p>
                </div>
                <div className="border-t border-zinc-800 pt-2.5 mt-3">
                  <span className="text-[8px] text-zinc-400 uppercase font-mono block">Unduhan Materi Presentasi</span>
                  <a href={event.custom_fields?.materials_download_url || '#'} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-450 hover:underline hover:text-emerald-300 font-mono flex items-center gap-1 mt-1 font-bold">
                    📥 Download_Powerpoint.pdf
                  </a>
                </div>
              </div>
            </div>
          )}

          {event.event_type === 'aqiqah' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">👶 BAYI / ANAK YANG DIACARAKAN</span>
                <p className="text-sm font-extrabold text-zinc-950">👶 {event.custom_fields?.child_name || 'Alvaro Putra Pratama'}</p>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold leading-normal">Semoga menjadi anak saleh/salehah yang berbakti bagi agama &amp; orang tua.</p>
              </div>
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">🍽️ PENYAJIAN KATERING</span>
                <p className="text-xs font-bold text-zinc-800">{event.custom_fields?.catering_menu || 'Paket Nasi Kotak Sate & Gulai Kambing Istimewa'}</p>
                <p className="text-[10px] text-zinc-500 mt-2 font-semibold leading-normal">Katering bersertifikat Halal &amp; dimasak higienis.</p>
              </div>
              <div className="p-4 bg-zinc-90 w-full bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">🕊️ MEJA DONASI / INFAK ANAK YATIM</span>
                <p className="text-xs font-bold text-zinc-800">Yayasan Penyalur:</p>
                <p className="text-xs font-mono font-bold text-zinc-950 mt-0.5">&rarr; {event.custom_fields?.charity_box_name || 'Rumah Yatim &'}</p>
              </div>
            </div>
          )}

          {event.event_type === 'webinar_seminar' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-500/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-emerald-850 block uppercase tracking-wider mb-1 font-mono">💻 LINK INTEGRASI WEBINAR</span>
                  <a href={event.custom_fields?.protected_zoom_link || '#'} target="_blank" rel="noreferrer" className="text-xs text-[#059669] hover:underline font-mono truncate block mt-1 font-bold">
                    {event.custom_fields?.protected_zoom_link || 'https://zoom.us/j/987654321'}
                  </a>
                </div>
                <Video className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-1 font-mono">📹 LINK REKAMAN ACARA</span>
                <a href={event.custom_fields?.youtube_recording_url || '#'} target="_blank" rel="noreferrer" className="text-xs text-indigo-650 hover:underline font-mono truncate block mt-1.5 font-bold">
                  {event.custom_fields?.youtube_recording_url || 'https://youtu.be/unlisted-rec'}
                </a>
              </div>
            </div>
          )}

          {event.event_type === 'grand_opening' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">🏷️ KODE PROMO KHUSUS</span>
                <p className="text-sm font-black text-zinc-950 font-mono tracking-widest">{event.custom_fields?.promo_code || 'COFFEE50'}</p>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold leading-normal">Tunjukkan kode ini kepada kasir untuk klaim keuntungan.</p>
              </div>
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">🚗 AREA PARKIR PENGUNJUNG</span>
                <p className="text-xs font-bold text-zinc-800 leading-normal">{event.custom_fields?.parking_guide_info || 'Area Parkir Basement B1 khusus tamu undangan, bebas biaya.'}</p>
              </div>
              <div className="p-4 bg-zinc-950 text-white rounded-2xl border border-zinc-800">
                <span className="text-[9px] font-bold text-zinc-500 block uppercase tracking-wider mb-2 font-mono">🎁 FREE MERCHANDISE GUEST LIST</span>
                <p className="text-xl font-mono font-black text-amber-400">{event.custom_fields?.free_gift_quota || '100'} Gift Packs</p>
                <p className="text-[9px] text-zinc-450 mt-1 font-semibold">Tersedia eksklusif untuk pendaftar awal.</p>
              </div>
            </div>
          )}

          {event.event_type === 'concert' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-4 bg-gradient-to-r from-zinc-900 to-black text-white rounded-2xl border border-zinc-850">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">🎵 ARTIS / BAND PENDUKUNG</span>
                <p className="text-base font-black text-amber-400">&yen; {event.custom_fields?.artist_band_name || 'Dewa 19 Tribute Band'}</p>
                <p className="text-[9px] text-zinc-500 mt-1 font-semibold">Pecinta musik sejati disarankan datang 30 menit awal.</p>
              </div>
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">🎫 PILIHAN KATEGORI TIKET</span>
                <p className="text-xs font-bold text-zinc-800 leading-relaxed font-mono">{event.custom_fields?.ticket_tiers_raw || 'CAT 1 (VVIP): Rp750.000, CAT 2: Rp350.000'}</p>
              </div>
            </div>
          )}

          {event.event_type === 'charity' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-500/10">
                <span className="text-[9px] font-bold text-rose-850 block uppercase tracking-wider mb-1 font-mono">❤️ PENERIMA MANFAAT DONASI</span>
                <p className="text-sm font-extrabold text-rose-950 font-serif-elegant mt-1">{event.custom_fields?.donation_recipient_desc || 'Korban Bencana Banjir Bandang Luwu'}</p>
              </div>
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">🎯 TARGET PENGGALANGAN DANA</span>
                <p className="text-xl font-mono font-black text-zinc-950">Target: Rp{(event.custom_fields?.donation_target || 50000000).toLocaleString('id-ID')}</p>
                <div className="w-full bg-zinc-200 h-2 rounded-full mt-2.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '25%' }} />
                </div>
                <p className="text-[9px] text-zinc-500 mt-1 font-bold">Terkumpul: Rp12.500.000 (25%)</p>
              </div>
            </div>
          )}

          {event.event_type === 'graduation' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-500/15">
                <span className="text-[9px] font-bold text-amber-850 block uppercase tracking-wider mb-1 font-mono">🎓 WISUDAWAN UTAMA</span>
                <p className="text-sm font-black text-amber-950 mt-1">{event.custom_fields?.graduate_name || 'Budi Setiawan, S.Kom.'}</p>
                {event.custom_fields?.cumlaude && (
                  <span className="text-[8px] bg-amber-200 text-amber-950 font-bold px-1.5 py-0.5 rounded uppercase font-mono mt-2 inline-block">
                    🏅 Predikat Cumlaude
                  </span>
                )}
              </div>
              <div className="col-span-2 p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">🏫 JURUSAN &amp; KAMPUS</span>
                <p className="text-xs font-bold text-zinc-800 leading-normal">{event.custom_fields?.major || 'Teknik Informatika - Universitas Indonesia'}</p>
              </div>
            </div>
          )}

          {event.event_type === 'arisan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">🥘 KONTRIBUSI MENU POTLUCK</span>
                <p className="text-xs font-bold text-zinc-700 leading-relaxed">{event.custom_fields?.potluck_contributors || 'Budi: Rendang Sapi, Siti: Es Selendang Mayang, Richard: Cake Cokelat'}</p>
              </div>
              <div className="p-4 bg-zinc-950 text-white rounded-2xl border border-zinc-800">
                <span className="text-[9px] font-bold text-zinc-500 block uppercase tracking-wider mb-2 font-mono">💰 BESARAN IURAN ARISAN</span>
                <p className="text-xl font-mono font-black text-emerald-400">Rp{(event.custom_fields?.dues_amount || 100000).toLocaleString('id-ID')}</p>
                <p className="text-[9px] text-zinc-500 mt-1">Disetorkan langsung pada penarikan arisan bulanan.</p>
              </div>
            </div>
          )}

          {event.event_type === 'sports' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-1 font-mono">👟 KATEGORI OLAHRAGA</span>
                <p className="text-sm font-extrabold text-zinc-900">{event.custom_fields?.sports_category || '5K Fun Run / 10K Tournament'}</p>
              </div>
              <div className="p-4 bg-zinc-950 text-white rounded-2xl border border-zinc-800">
                <span className="text-[9px] font-bold text-zinc-500 block uppercase tracking-wider mb-1 font-mono">🏅 INDEX BIB NUMBER JALUR</span>
                <p className="text-base font-mono font-bold text-amber-400">&yen; Mulai: {event.custom_fields?.bib_number_start || '1001'}</p>
              </div>
            </div>
          )}

          {event.event_type === 'religious' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-500/10">
                <span className="text-[9px] font-bold text-emerald-850 block uppercase tracking-wider mb-1.5 font-mono">👳 PEMBICARA UTAMA Kajian</span>
                <p className="text-sm font-extrabold text-emerald-950">{event.custom_fields?.ustadz_priest_name || 'Ustadz Hanan Attaki, Lc.'}</p>
              </div>
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-1.5 font-mono">🕌 REKENING PENYALURAN INFAK DAN SEDEKAH</span>
                <p className="text-xs font-bold text-zinc-850 font-mono italic">{event.custom_fields?.sedekah_account_details || 'Mandiri Syariah Rek: 777-1234-567'}</p>
              </div>
            </div>
          )}

          {event.event_type === 'rt_rw' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">📋 TOPIK DISKUSI MUSYAWARAH</span>
                <p className="text-xs font-bold text-zinc-800 leading-relaxed mb-1">{event.custom_fields?.discussion_agenda_raw || 'Klarifikasi Laporan Keuangan Iuran, Rencana Kerja Bakti HUT RI'}</p>
              </div>
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-2 font-mono">🗳️ TOPIK POLLING JAJAK PENDAPAT</span>
                <p className="text-xs font-bold text-indigo-700 leading-relaxed italic">{event.custom_fields?.voting_topic || 'Apakah Anda setuju kenaikan iuran sampah warga menjadi Rp30.000?'}</p>
                <div className="flex gap-2.5 mt-3">
                  <span className="bg-zinc-100 border border-zinc-200 text-xs px-2.5 py-1 rounded-lg text-emerald-700 font-extrabold font-mono hover:bg-zinc-200 cursor-pointer transition-all">Setuju (82%)</span>
                  <span className="bg-zinc-100 border border-zinc-200 text-xs px-2.5 py-1 rounded-lg text-rose-700 font-extrabold font-mono hover:bg-zinc-200 cursor-pointer transition-all">Tolak (18%)</span>
                </div>
              </div>
            </div>
          )}

          {event.event_type === 'baby_shower' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-zinc-200">
                <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wider mb-1 font-mono">👶 TEBAKAN GENDER REVEAL POLL</span>
                <p className="text-xs font-bold text-zinc-850 leading-relaxed bg-white rounded-lg p-2 border border-zinc-150 font-mono mt-1">{event.custom_fields?.gender_guesses_raw || 'Laki-laki (Boy) atau Perempuan (Girl)'}</p>
              </div>
              <div className="p-4 bg-zinc-950 text-white rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-bold text-zinc-500 block uppercase tracking-wider mb-1 font-mono text-zinc-450">POLLING AKTIF HARI INI</span>
                  <p className="text-xs text-amber-400 font-bold leading-normal">Boy: 64% Vs Girl: 36%</p>
                </div>
                <div className="w-1.5 h-10 bg-zinc-800 rounded-full overflow-hidden flex flex-col">
                  <div className="bg-blue-400 w-full h-8" />
                  <div className="bg-pink-400 w-full h-4" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BACKGROUND MUSIC SETTINGS PANEL */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBEBE5] shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-150 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Disc className="h-4.5 w-4.5 text-indigo-600 animate-[spin_5s_linear_infinite]" />
              <span className="text-[11px] font-black text-zinc-900 uppercase tracking-widest font-mono">
                🎵 PENGATURAN MUSIK LATAR BELAKANG UNDANGAN
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <span className="text-[10px] font-bold text-zinc-700">Aktifkan Background Music:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={editMusicEnabled}
                  onChange={(e) => setEditMusicEnabled(e.target.checked)}
                />
                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-650"></div>
              </label>
            </div>
          </div>

          <p className="text-xs text-zinc-550 leading-relaxed text-left mb-4 font-semibold text-zinc-600">
            Musik yang Anda aktifkan di bawah ini akan otomatis dimutasi pada saat awal muat halaman demi mematuhi regulasi peramban, dan akan diputar secara instan serta elegan ketika tamu mengklik tombol <strong>&quot;Buka Undangan&quot;</strong>.
          </p>

          {editMusicEnabled ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2 font-mono">
                    🎵 PILIH TRACK LAGU PRESET
                  </label>
                  <select
                    value={[
                      'https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3',
                      'https://assets.mixkit.co/music/preview/mixkit-sunny-day-warm-light-2550.mp3',
                      'https://assets.mixkit.co/music/preview/mixkit-forest-trail-1200.mp3',
                      'https://assets.mixkit.co/music/preview/mixkit-just-cool-2216.mp3',
                      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
                    ].includes(editMusicUrl) ? editMusicUrl : 'custom'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setEditMusicUrl(editCustomMusicUrl || '');
                      } else {
                        setEditMusicUrl(val);
                        if (val === 'https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3') {
                          setEditMusicTitle('Beautiful Dream Piano');
                        } else if (val === 'https://assets.mixkit.co/music/preview/mixkit-sunny-day-warm-light-2550.mp3') {
                          setEditMusicTitle('Sunny Day Acoustic');
                        } else if (val === 'https://assets.mixkit.co/music/preview/mixkit-forest-trail-1200.mp3') {
                          setEditMusicTitle('Forest Trail Harp');
                        } else if (val === 'https://assets.mixkit.co/music/preview/mixkit-just-cool-2216.mp3') {
                          setEditMusicTitle('Just Cool Elegant Jazz');
                        } else if (val === 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3') {
                          setEditMusicTitle('Traditional Gamelan Calm');
                        }
                      }
                    }}
                    className="block w-full border border-zinc-250 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 bg-zinc-50"
                  >
                    <option value="https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3">Beautiful Dream Piano (Wedding/Romantic) 🌸</option>
                    <option value="https://assets.mixkit.co/music/preview/mixkit-sunny-day-warm-light-2550.mp3">Sunny Day Acoustic (Warm/Birthday) 🍰</option>
                    <option value="https://assets.mixkit.co/music/preview/mixkit-forest-trail-1200.mp3">Forest Trail Harp (Classical/Elegant) 🎻</option>
                    <option value="https://assets.mixkit.co/music/preview/mixkit-just-cool-2216.mp3">Just Cool Elegant Jazz (Corp/Lounge) 🎷</option>
                    <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3">Traditional Instrumental Calm (Indonesian Gamelan) 🇮🇩</option>
                    <option value="custom">Custom MP3 Audio URL (Embed Tautan Mandiri) 🔗</option>
                  </select>
                </div>

                {(![
                  'https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3',
                  'https://assets.mixkit.co/music/preview/mixkit-sunny-day-warm-light-2550.mp3',
                  'https://assets.mixkit.co/music/preview/mixkit-forest-trail-1200.mp3',
                  'https://assets.mixkit.co/music/preview/mixkit-just-cool-2216.mp3',
                  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
                ].includes(editMusicUrl) || editMusicUrl === '') && (
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2 font-mono">
                      Masukkan Taut-an File MP3 Langsung (Audio Link)
                    </label>
                    <input
                      type="url"
                      placeholder="Contoh: https://kamu.com/media/audio.mp3"
                      value={editCustomMusicUrl}
                      onChange={(e) => {
                        setEditCustomMusicUrl(e.target.value);
                        setEditMusicUrl(e.target.value);
                      }}
                      className="block w-full border border-zinc-250 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-800 bg-[#FAF9F6] font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2 font-mono">
                    🏷️ JUDUL TAMPILAN TRACK LAGU (DI UNDANGAN)
                  </label>
                  <input
                    type="text"
                    value={editMusicTitle}
                    onChange={(e) => setEditMusicTitle(e.target.value)}
                    placeholder="Contoh: Sayup Alunan Kecapi Sunda"
                    className="block w-full border border-zinc-250 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 bg-zinc-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center">
                    {editMusicUrl ? (
                      <div className="w-full flex items-center">
                        <audio id="detail-music-test-audio" src={editMusicUrl} loop />
                        <button
                          type="button"
                          onClick={() => {
                            const audioEl = document.getElementById('detail-music-test-audio') as HTMLAudioElement;
                            if (audioEl) {
                              if (isTestingEditMusic) {
                                audioEl.pause();
                                setIsTestingEditMusic(false);
                              } else {
                                audioEl.play().catch(e => console.warn('Blocked autoplay test:', e));
                                setIsTestingEditMusic(true);
                              }
                            }
                          }}
                          className={`w-full py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                            isTestingEditMusic 
                              ? 'bg-[#EEF2FF] border-indigo-200 text-indigo-700 font-extrabold animate-pulse' 
                              : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800'
                          }`}
                        >
                          {isTestingEditMusic ? '⏸️ Hentikan Tes' : '▶️ Tes Mainkan'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-amber-600 block pl-1 font-semibold italic">Silakan pilih lagu.</span>
                    )}
                  </div>

                  <button
                    onClick={handleSaveBackgroundMusic}
                    className="w-full bg-[#312e81] hover:bg-indigo-900 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    {musicSaveSuccess ? (
                      <>
                        <Check className="h-4 w-4" />
                        Disimpan!
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Simpan Musik
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-zinc-200 p-6 rounded-2xl flex flex-col items-center justify-center bg-zinc-50 text-center">
              <span className="text-zinc-400 text-xl">🔇</span>
              <p className="text-xs font-bold text-zinc-500 mt-2">Musik latar belakang saat ini dinonaktifkan.</p>
              <p className="text-[10px] text-zinc-400 mt-1">Gunakan toggle di sudut kanan atas panel ini untuk mengaktifkannya kembali.</p>
              <button
                onClick={() => {
                  setEditMusicEnabled(true);
                  db.updateEvent(event.id, { music_enabled: true });
                }}
                className="mt-3 px-4 py-1.5 bg-zinc-150 border border-zinc-200 text-zinc-800 rounded-lg text-[10px] font-bold hover:bg-zinc-200 transition-all cursor-pointer"
              >
                Aktifkan Sekarang
              </button>
            </div>
          )}
        </div>

        {/* GOOGLE MAPS EMBED SETTINGS PANEL */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBEBE5] shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-150 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Map className="h-4.5 w-4.5 text-rose-500 animate-[pulse_2s_infinite]" />
              <span className="text-[11px] font-black text-zinc-900 uppercase tracking-widest font-mono">
                🗺️ EMBED LOKASI ACARA (MAPS GOOGLE)
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-bold font-mono">
              GPS STATUS: ACTIVE
            </div>
          </div>

          <p className="text-xs text-zinc-555 leading-relaxed text-left mb-5 font-semibold text-zinc-600">
            Tempelkan link berbagi Google Maps (dari menu Bagikan &gt; Sematkan peta (Embed Map) atau link koordinat) sehingga tamu dapat melihat peta integrasi interaktif langsung di halaman undangan digital mereka secara responsive.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2 font-mono">
                  🔗 TAUTAN MAPS ATAU KODE EMBED (IFRAME HTML)
                </label>
                <textarea
                  rows={4}
                  value={editMapsIframe}
                  onChange={(e) => setEditMapsIframe(e.target.value)}
                  placeholder="Contoh: <iframe src=&quot;https://www.google.com/maps/embed?...&quot; ...></iframe> atau https://www.google.com/maps/embed?pb=..."
                  className="block w-full border border-zinc-250 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-rose-550 text-zinc-900 bg-zinc-50 font-mono resize-none leading-relaxed"
                />
                <p className="text-[10px] text-zinc-400 mt-2">
                  *Tips: Anda dapat menyalin kode HTML dari Google Maps (&quot;Bagikan&quot; &gt; &quot;Sematkan Peta&quot;), sistem kami akan mendeteksi dan mengekstrak tautan peta secara otomatis!
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveGoogleMaps}
                  className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                >
                  {mapsSaveSuccess ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      Denah Lokasi Tersimpan!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Denah Lokasi Map
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2 font-mono">
                👁️ PRATINJAU MAP INTRAKTIF (PREVIEW)
              </span>
              <div className="flex-1 min-h-[170px] bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl flex items-center justify-center overflow-hidden relative">
                {editMapsIframe ? (
                  <iframe
                    title="Pratinjau Map Lokasi"
                    src={(() => {
                      let url = editMapsIframe.trim();
                      const srcMatch = url.match(/src="([^"]+)"/);
                      if (srcMatch && srcMatch[1]) {
                        return srcMatch[1];
                      }
                      return url;
                    })()}
                    className="w-full h-full min-h-[180px] border-0"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <div className="text-center p-4">
                    <span className="text-zinc-300 text-2xl block mb-2">🗺️</span>
                    <p className="text-[11px] font-bold text-zinc-400">Belum ada peta lokasi tersemat</p>
                    <p className="text-[9px] text-zinc-400 mt-1">Tempelkan link embed di sebelah kiri untuk melihat peta.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- PHOTO GALLERY SETTINGS PANEL --- */}
        <div id="photo-gallery-settings-panel" className="bg-white rounded-3xl p-6 border border-[#EBEBE5] shadow-xs mb-8 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-150 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Image className="h-4.5 w-4.5 text-indigo-600 animate-[pulse_2.5s_infinite]" />
              <span className="text-[11px] font-black text-zinc-900 uppercase tracking-widest font-mono">
                🌸 GALERI FOTO PRE-EVENT & ENGAGEMENT
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-bold font-mono">
              STATUS: {editGalleryPhotos.length} FOTO TERUNGGAH
            </div>
          </div>

          <p className="text-xs text-zinc-650 leading-relaxed mb-5 font-semibold text-zinc-600">
            Unggah foto-foto romantis, lamaran, atau pertunangan Anda (atau tautkan foto online dari Unsplash, Pinterest, blog, dll.) untuk disematkan sebagai karusel visual yang indah di halaman undangan publik Anda.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Control Panel: Column Span 5 */}
            <div className="lg:col-span-5 space-y-4">
              {/* Local file uploader */}
              <div className="border border-dashed border-zinc-250 bg-zinc-50 hover:bg-zinc-100 transition-all rounded-2xl p-5 text-center cursor-pointer relative group">
                <input
                  type="file"
                  multiple
                  id="dashboard-gallery-uploader"
                  accept="image/*"
                  onChange={handleUploadGalleryPhoto}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <span className="text-2xl block mb-1">📸</span>
                <span className="block text-xs font-bold text-zinc-700">Pilih / Unggah Berkas Foto</span>
                <span className="block text-[10px] text-zinc-400 mt-1">Dukung format JPG, PNG, WEBP (bisa pilih banyak berkas sekaligus)</span>
              </div>

              {/* URL paste uploader */}
              <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-xs space-y-2.5">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider font-mono">
                  🔗 Tautkan Link Foto Eksternal
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Contoh: https://images.unsplash.com/photo-..."
                    value={galleryInputUrl}
                    onChange={(e) => setGalleryInputUrl(e.target.value)}
                    className="flex-1 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 bg-white font-mono leading-relaxed"
                  />
                  <button
                    onClick={handleAddGalleryUrl}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    Tambahkan
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Gunakan kolom di atas jika Anda ingin memasukkan URL foto yang sudah di-host di layanan pihak ketiga.
                </p>
              </div>

              {/* presets generator */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold text-zinc-450">Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    const samplePresets = [
                      'https://images.unsplash.com/photo-1519225495810-7517c319867b?q=80&w=1200&auto=format&fit=crop',
                      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop',
                      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200&auto=format&fit=crop',
                      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop'
                    ];
                    setEditGalleryPhotos((prev) => [...prev, ...samplePresets]);
                  }}
                  className="px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                >
                  ✨ Isi 4 Foto Contoh Instan
                </button>
                {editGalleryPhotos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Anda yakin ingin mengosongkan seluruh foto galeri?')) {
                        setEditGalleryPhotos([]);
                      }
                    }}
                    className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-250 text-zinc-700 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                  >
                    Kosongkan
                  </button>
                )}
              </div>

              {/* Save changes action */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-mono">
                  SINKRONISASI: {editGalleryPhotos.length} ITEM
                </span>
                <button
                  onClick={handleSaveGalleryPhotos}
                  className="px-6 py-3 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-xs shrink-0"
                >
                  {gallerySaveSuccess ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      Galeri Tersimpan!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Galeri Foto
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Display / List Grid Panel: Column Span 7 */}
            <div className="lg:col-span-7 bg-[#FAF9F6]/50 border border-zinc-150 rounded-2xl p-4 min-h-[220px] flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider font-mono block">
                  📂 PRATINJAU TATA LETAK GALERI (GRID)
                </span>
                <p className="text-xs font-bold text-zinc-850">
                  Daftar Peta Susunan Galeri Tamu
                </p>
              </div>

              {editGalleryPhotos.length === 0 ? (
                <div className="my-auto py-10 text-center text-zinc-400">
                  <span className="text-3xl block mb-2">🌸</span>
                  <p className="text-xs font-bold">Belum ada foto galeri terpasang</p>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                    Pilih file foto lokal di sebelah kiri atau masukkan link demo preset Unsplash untuk mensimulasikan foto di undangan publik.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[240px] p-1 my-4">
                  {editGalleryPhotos.map((photo, pIdx) => (
                    <div key={pIdx} className="relative aspect-[3/4] rounded-xl overflow-hidden group border border-zinc-150 bg-zinc-100 shadow-2xs">
                      <img
                        src={photo}
                        alt={`Galeri Pre-Event ${pIdx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {/* Floating Indicator */}
                      <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm font-mono z-10">
                        #{pIdx + 1}
                      </span>
                      {/* Delete Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-20">
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryPhoto(pIdx)}
                          className="p-2 bg-rose-650 hover:bg-rose-700 text-white rounded-lg cursor-pointer transition-transform duration-100 transform active:scale-95 shadow-md flex items-center justify-center"
                          title="Hapus Foto"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[9px] text-zinc-400 border-t border-zinc-150 pt-2 font-bold font-mono">
                * CAROUSEL AKAN DIURUTKAN SESUAI NOMOR FOTO DIATAS
              </div>
            </div>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-2xs">
            <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Total Undangan Tamu</span>
            <p className="text-2xl font-extrabold text-[#1A1A1A]">{totalGuests}</p>
            <p className="text-[10px] font-bold text-zinc-400 mt-1 font-mono">Tamu Terdaftar</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-2xs">
            <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Konfirmasi Hadir</span>
            <p className="text-2xl font-extrabold text-emerald-600">{confirmedHadir}</p>
            <p className="text-[10px] font-extrabold text-emerald-700 mt-1 font-mono">Rombongan: +{totalRombonganHadir} Pax</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-2xs">
            <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Konfirmasi Absen</span>
            <p className="text-2xl font-extrabold text-rose-500">{confirmedAbsen}</p>
            <p className="text-[10px] font-extrabold text-zinc-500 mt-1 font-mono">Tunda/Proses: {pendingRespon} Tamu</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-2xs">
            <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Total Kunjungan (Views)</span>
            <p className="text-2xl font-extrabold text-zinc-950">{eventViews.length} Views</p>
            <p className="text-[10px] font-extrabold text-zinc-500 mt-1 font-mono">Pembaca Unik: {guestViewsTotal} Tamu</p>
          </div>
        </div>

        {/* Advanced Visual Statistics & Real-time SMTP Logs Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          
          {/* Bento item 1: Proporsi RSVP (Pie Chart) - Col Span 4 */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-zinc-200 shadow-2xs flex flex-col justify-between h-[340px]">
            <div>
              <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                <Activity className="h-4 w-4 text-emerald-600" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest font-mono">Statistik Kehadiran</span>
              </div>
              <h3 className="text-sm font-black text-zinc-950">Proporsi Konfirmasi RSVP</h3>
              <p className="text-[11px] text-zinc-550 leading-relaxed font-semibold">Distribusi tamu berdasarkan keputusan respon saat ini.</p>
            </div>

            <div className="h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '11px', fontWeight: 'bold' }}
                    formatter={(value: any) => [`${value} Tamu`, 'Jumlah']} 
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Inner Label for Stats Density */}
              <div className="absolute inset-0 flex flex-col items-center justify-center mt-[-10px] pointer-events-none">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">Tanggapan</span>
                <span className="text-lg font-black text-zinc-900">{confirmedHadir + confirmedAbsen}/{totalGuests}</span>
              </div>
            </div>

            {/* Custom Responsive Legend to match Bento Aesthetics */}
            <div className="flex justify-center gap-5 text-[11px] font-bold text-zinc-650 border-t border-zinc-100 pt-3">
              <div className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>Hadir ({confirmedHadir})</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Absen ({confirmedAbsen})</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-zinc-450"></span>
                <span>Proses ({pendingRespon})</span>
              </div>
            </div>
          </div>

          {/* Bento item 2: Chronological Views Trend Line (Recharts AreaChart) - Col Span 8 */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-5 border border-zinc-200 shadow-2xs flex flex-col justify-between h-[340px]">
            <div>
              <div className="flex items-center gap-1.5 text-zinc-450 mb-1">
                <Eye className="h-4 w-4 text-zinc-900" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest font-mono text-zinc-500">Grafik Kunjungan</span>
              </div>
              <h3 className="text-sm font-black text-zinc-950">Tren Kunjungan Undangan (7 Hari Terakhir)</h3>
              <p className="text-[11px] text-zinc-550 leading-relaxed font-semibold">
                Representasi historis total load views yang tercatat pada table database <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-700 font-mono text-[10.5px]">invitation_views</code>.
              </p>
            </div>

            <div className="h-44 mt-3 w-full">
              {eventViews.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={viewsTrendData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e4e4e7',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Kunjungan" 
                      stroke="#4f46e5" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Eye className="h-8 w-8 text-zinc-300 mb-2" />
                  <p className="text-xs font-bold text-zinc-400">Belum Ada Riwayat Kunjungan Undangan</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Bagikan tautan undangan digital Anda untuk mengumpulkan data statistik kunjungan harian.</p>
                </div>
              )}
            </div>

            <div className="text-[10px] text-zinc-400 border-t border-zinc-100 pt-3 flex items-center justify-between font-semibold">
              <span>Total Kunjungan Kumulatif: <span className="font-mono font-black text-zinc-900">{eventViews.length} Kali Dibuka</span></span>
              <span>Proporsi Tamu Unik Membaca: <span className="font-mono font-black text-zinc-900">{totalGuests > 0 ? Math.round((guestViewsTotal / totalGuests) * 100) : 0}%</span></span>
            </div>
          </div>

          {/* Bento item 3: Visitor Geo-analytics Map - Col Span 6 */}
          <div className="lg:col-span-6 bg-zinc-950 text-white rounded-3xl p-5 border border-zinc-800 shadow-2xs flex flex-col justify-between h-[340px]">
            <div>
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                <Compass className="h-4 w-4" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest font-mono">Radar Pengunjung</span>
              </div>
              <h3 className="text-sm font-black text-zinc-100">Sebaran Geografis Kunjungan</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">Kota pengunjung yang membuka undangan digital Anda.</p>
            </div>

            <div className="h-44 bg-zinc-900/40 rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden p-2 relative">
              {eventViews.length > 0 ? (
                <svg viewBox="0 0 500 220" className="w-full h-full text-zinc-800">
                  {/* Sumatra */}
                  <path d="M 40,60 L 80,90 L 150,130 L 180,150 L 160,160 L 120,140 L 70,105 L 30,70 Z" fill="currentColor" opacity="0.12" />
                  {/* Java */}
                  <path d="M 130,165 L 180,175 L 220,180 L 260,180 L 255,188 L 190,183 L 130,170 Z" fill="currentColor" opacity="0.12" />
                  {/* Kalimantan */}
                  <path d="M 160,90 L 220,80 L 240,110 L 230,135 L 180,130 L 160,110 Z" fill="currentColor" opacity="0.12" />
                  {/* Sulawesi */}
                  <path d="M 270,100 L 305,95 L 300,120 L 285,120 L 285,140 L 275,140 L 270,120 Z" fill="currentColor" opacity="0.12" />
                  {/* Bali/Nusa Tenggara */}
                  <path d="M 265,188 L 320,190 L 320,194 L 265,191 Z" fill="currentColor" opacity="0.12" />
                  {/* Papua */}
                  <path d="M 410,110 L 460,115 L 470,155 L 430,165 L 405,140 Z" fill="currentColor" opacity="0.12" />

                  {/* Landmark Cities */}
                  {[
                    { name: 'Medan', x: 65, y: 88 },
                    { name: 'Jakarta', x: 155, y: 167 },
                    { name: 'Bandung', x: 168, y: 171 },
                    { name: 'Surabaya', x: 220, y: 176 },
                    { name: 'Yogyakarta', x: 195, y: 175 },
                    { name: 'Denpasar', x: 245, y: 180 },
                    { name: 'Makassar', x: 285, y: 130 }
                  ].map((landmark, idx) => (
                    <g key={idx} className="opacity-25">
                      <circle cx={landmark.x} cy={landmark.y} r="1.5" fill="#e4e4e7" />
                      <text x={landmark.x} y={landmark.y - 4} fontSize="5" textAnchor="middle" fill="#a1a1aa" className="font-mono">{landmark.name}</text>
                    </g>
                  ))}

                  {/* Dynamic Visitor coordinates dots */}
                  {eventViews.filter((v) => v.latitude && v.longitude).map((view) => {
                    const coords = projectCoordinates(view.latitude!, view.longitude!);
                    const xCoord = (coords.x / 100) * 500;
                    const yCoord = (coords.y / 100) * 220;
                    const gObj = guests.find((g) => g.id === view.guest_id);
                    const guestName = gObj ? gObj.name : 'Pengunjung';

                    return (
                      <g key={view.id} className="cursor-help group">
                        <circle cx={xCoord} cy={yCoord} r="9" fill="#f59e0b" className="animate-ping" opacity="0.3" />
                        <circle cx={xCoord} cy={yCoord} r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                        <title>{`${guestName} (${view.cityName}, IP: ${view.ip_address})`}</title>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="text-center p-4">
                  <Locate className="h-5 w-5 text-zinc-650 mx-auto mb-2" />
                  <p className="text-[10px] text-zinc-500 font-semibold">Belum Ada Sinyal Lokasi Tamu</p>
                </div>
              )}
            </div>

            {/* List Cities Visited list */}
            <div className="flex gap-2.5 overflow-x-auto text-[10px] pb-1 font-mono text-zinc-400 border-t border-zinc-800 pt-3 scrollbar-none items-center">
              <span className="text-zinc-500 font-bold shrink-0">LOKASI AKTIF:</span>
              {Array.from(new Set(eventViews.map(v => v.cityName).filter(Boolean))).map((city, cIdx) => (
                <span key={cIdx} className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md text-amber-400 shrink-0">
                  📍 {city}
                </span>
              ))}
              {eventViews.filter(v => v.cityName).length === 0 && (
                <span className="text-zinc-600">Menunggu kunjungan pertama...</span>
              )}
            </div>
          </div>

          {/* Bento item 4: Automated Email SMTP log Inbox Simulator - Col Span 6 */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-5 border border-zinc-200 shadow-2xs flex flex-col justify-between h-[340px]">
            <div>
              <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                <BellRing className="h-4 w-4 text-emerald-600 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest font-mono">Sistem Terintegrasi</span>
              </div>
              <h3 className="text-sm font-black text-zinc-950">Notifikasi Email Otomatis</h3>
              <p className="text-[11px] text-zinc-550 leading-relaxed font-semibold">Log email alert terkirim real-time kepada Creator.</p>
            </div>

            <div className="grow my-3 overflow-y-auto space-y-2 max-h-[160px] pr-1.5 flex flex-col justify-start">
              {eventEmails.length > 0 ? (
                eventEmails.map((email) => {
                  const isHadir = email.rsvp_status === 'hadir';
                  return (
                    <div 
                      key={email.id} 
                      className="border border-zinc-150 rounded-xl p-2.5 hover:bg-zinc-50 transition-all flex flex-col justify-between gap-1 text-[11px] font-semibold text-zinc-700 bg-[#FAF9F6]/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#1A1A1A] truncate max-w-[150px]">
                          📢 Response: {email.guest_name}
                        </span>
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${
                          isHadir ? 'bg-emerald-50 text-emerald-800 border-emerald-150' : 'bg-rose-50 text-rose-800 border-rose-150'
                        }`}>
                          {isHadir ? 'HADIR' : 'ABSEN'}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-zinc-400 truncate font-mono">Subject: {email.subject}</p>
                      
                      <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono mt-1">
                        <span>SMTP Delivered</span>
                        <button 
                          onClick={() => setSelectedEmail(email)}
                          className="text-indigo-650 hover:text-indigo-800 font-extrabold cursor-pointer hover:underline flex items-center gap-0.5 bg-zinc-100 hover:bg-zinc-200 px-1.5 py-0.5 rounded transition-all"
                        >
                          Pratinjau HTML &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-zinc-400 grow flex flex-col items-center justify-center">
                  <Mail className="h-6 w-6 text-zinc-300 mb-2" />
                  <p className="text-[10px] font-semibold">Belum Ada Respons Pengirim Email</p>
                </div>
              )}
            </div>

            <div className="text-[9px] text-zinc-400 border-t border-zinc-100 pt-3 flex items-center justify-between font-mono font-semibold">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                Websocket SMTP Relay Aktif
              </span>
              <span>Total: {eventEmails.length} Email</span>
            </div>
          </div>

        </div>

        {/* --- GUEST INVITATION VIEWS TRACKER ANALYTICS PANEL --- */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBEBE5] shadow-xs mb-10 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-150 pb-3 mb-5 gap-3">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-indigo-650 animate-pulse animate-[pulse_2.5s_infinite]" />
              <div>
                <span className="text-[11px] font-black text-zinc-900 uppercase tracking-widest font-mono block">
                  📈 ANALISIS KUNJUNGAN PER TAMU UNDANGAN
                </span>
                <p className="text-[10px] text-zinc-400 font-semibold font-mono">
                  REAL-TIME TRAFFIC & INTERACTION MONITOR
                </p>
              </div>
            </div>
            {/* Filter and control block */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-450" />
                <input
                  type="text"
                  placeholder="Cari nama tamu..."
                  value={guestViewsSearch}
                  onChange={(e) => setGuestViewsSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-zinc-200 rounded-xl text-xs bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-zinc-800 w-full sm:w-44"
                />
                {guestViewsSearch && (
                  <button
                    onClick={() => setGuestViewsSearch('')}
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-650 text-[10px] font-extrabold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort dropdown */}
              <select
                value={guestViewsSort}
                onChange={(e) => setGuestViewsSort(e.target.value as any)}
                className="px-2.5 py-1.5 border border-zinc-250 rounded-xl text-xs bg-white text-zinc-700 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="highest">📈 Views Tertinggi</option>
                <option value="lowest">📉 Views Terendah</option>
                <option value="alphabetical">🔤 Nama (A-Z)</option>
              </select>

              {/* Limit dropdown */}
              <select
                value={guestViewsBarLimit}
                onChange={(e) => setGuestViewsBarLimit(Number(e.target.value))}
                className="px-2.5 py-1.5 border border-zinc-250 rounded-xl text-xs bg-white text-[#333333] font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={5}>Top 5 Tamu</option>
                <option value={10}>Top 10 Tamu</option>
                <option value={20}>Top 20 Tamu</option>
                <option value={50}>Top 50 Tamu</option>
                <option value={-1}>Tampilkan Semua</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed mb-6 font-medium">
            Grafik ini memetakan intensitas interaksi setiap tamu dalam membaca undangan digital mereka. Tamu yang sering membuka tautan menandakan keaktifan komunikasi menjelang hari-H penyelenggaraan acara.
          </p>

          {guests.length === 0 ? (
            <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl py-12 text-center">
              <Users className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-400">Belum Ada Tamu Terdaftar</p>
              <p className="text-[10px] text-zinc-400 mt-1">Tambahkan tamu pada daftar tamu terlebih dahulu untuk mulai melacak kunjungan mereka.</p>
            </div>
          ) : eventViews.length === 0 ? (
            <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl py-12 text-center">
              <Eye className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-400">Belum Ada Riwayat Kunjungan Undangan</p>
              <p className="text-[10px] text-zinc-400 mt-1">Belum ada tamu yang mengakses tautan milik mereka. Salin dan kirimkan undangan untuk merekam interaksi ini!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Dynamic Left Column: Recharts Horizontal Bar Chart */}
              <div className="lg:col-span-7 bg-zinc-50 border border-zinc-150 rounded-2xl p-4 h-[350px] flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black font-mono text-indigo-650 uppercase tracking-wider block">Visualisasi Sebaran</span>
                  <p className="text-xs font-bold text-zinc-900">Perbandingan Total Pembukaan Tautan</p>
                </div>

                <div className="grow w-full h-56 mt-4 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={chartFilteredData}
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={true} vertical={false} />
                      <XAxis 
                        type="number" 
                        stroke="#71717a" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#71717a" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        width={75}
                        tickFormatter={(value) => value.length > 11 ? `${value.substring(0, 10)}...` : value}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(79, 70, 229, 0.04)' }}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e4e4e7',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                        formatter={(value: any, name: any, props: any) => {
                          const payload = props.payload;
                          let rsvpBadge = 'PENDING';
                          if (payload.rsvp_status === 'hadir') rsvpBadge = 'HADIR';
                          if (payload.rsvp_status === 'tidak_hadir') rsvpBadge = 'ABSEN';
                          return [
                            <div>
                              <p className="text-[#1a1a1a] font-extrabold">{value} Kali Dibuka</p>
                              <p className="text-[9px] text-indigo-650 mt-1 uppercase font-mono tracking-wider font-extrabold">Status RSVP: {rsvpBadge}</p>
                            </div>,
                            'Kunjungan'
                          ];
                        }}
                      />
                      <Bar 
                        dataKey="views" 
                        radius={[0, 4, 4, 0]}
                        fill="#4f46e5"
                        barSize={14}
                      >
                        {chartFilteredData.map((entry, index) => {
                          const shadeOfBlue = index === 0 ? '#312e81' : '#4f46e5';
                          return <Cell key={`cell-${index}`} fill={shadeOfBlue} className="transition-all duration-300 hover:opacity-85" />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex justify-between items-center text-[9px] font-mono font-bold text-zinc-400 mt-1.5 border-t border-zinc-150 pt-2">
                  <span>* Menampilkan {chartFilteredData.length} dari {guestViewsAnalyticsData.length} tamu terfilter</span>
                  <span>Sumbu-Y: Nama Tamu | Sumbu-X: Frekuensi Hit Undangan</span>
                </div>
              </div>

              {/* Dynamic Right Column: Detailed Scrolling Interactions List */}
              <div className="lg:col-span-5 border border-zinc-150 rounded-2xl p-4 h-[350px] flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black font-mono text-zinc-400 uppercase tracking-wider block">Log Tautan Terbuka</span>
                  <p className="text-xs font-bold text-[#1A1A1A]">Daftar Tamu & Intensitas Baca</p>
                </div>

                <div className="grow my-4 overflow-y-auto pr-1 space-y-2.5 max-h-[220px]">
                  {guestViewsAnalyticsData.map((gAnalytic) => {
                    const progressPercent = Math.max(2, Math.round((gAnalytic.views / maxIndividualViews) * 100));
                    const isNeverViewed = gAnalytic.views === 0;
                    
                    return (
                      <div key={gAnalytic.id} className="text-xs bg-[#FAF9F6]/40 hover:bg-zinc-50 transition-all p-2.5 rounded-xl border border-zinc-100 flex flex-col justify-between gap-1.5 font-semibold text-zinc-700">
                        <div className="flex items-center justify-between font-extrabold">
                          <span className="text-zinc-900 truncate max-w-[170px] text-left">
                            👤 {gAnalytic.name}
                          </span>
                          <span className={`font-mono text-[10px] ${
                            isNeverViewed 
                              ? 'text-zinc-400 font-medium' 
                              : 'text-indigo-650 font-extrabold bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100/50'
                          }`}>
                            {gAnalytic.views} Views
                          </span>
                        </div>

                        {/* Progress line indicator */}
                        <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isNeverViewed ? 'bg-zinc-200' : 'bg-indigo-650'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-zinc-450 font-mono mt-0.5">
                          <span>
                            RSVP: <span className={`font-extrabold ${
                              gAnalytic.rsvp_status === 'hadir' 
                                ? 'text-emerald-500' 
                                : gAnalytic.rsvp_status === 'tidak_hadir' 
                                  ? 'text-rose-450' 
                                  : 'text-zinc-500'
                            }`}>{gAnalytic.rsvp_status.toUpperCase()}</span>
                          </span>
                          <span className="font-semibold text-right text-[8.5px]">
                            {gAnalytic.lastViewed 
                              ? `Akses: ${new Date(gAnalytic.lastViewed).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} ${new Date(gAnalytic.lastViewed).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                              : 'Belum pernah dibaca'
                            }
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] text-zinc-400 border-t border-zinc-100 pt-3 flex items-center justify-between font-bold font-mono">
                  <span>UNIK DIBUKA: {guestViewsTotal} TAMU</span>
                  <span>BELUM DIBACA: {guests.filter(g => !allViews.some(v => v.guest_id === g.id)).length} TAMU</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- PREMIUM TERMINAL CHECK-IN GUEST PANEL --- */}
        <div className="bg-gradient-to-tr from-slate-900 to-zinc-950 text-white rounded-3xl border border-zinc-800 p-6 sm:p-8 space-y-6 mb-12 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
                <QrCode className="h-6 w-6 animate-pulse" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-black uppercase tracking-wider text-white">🎛️ Terminal Check-In Tamu Hari-H</h2>
                <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">Verifikasi undangan fisik/digital via Scan QR atau ketik Kode Tiket masuk.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="py-1 px-2.5 bg-emerald-500/10 text-emerald-300 font-extrabold text-[9px] font-mono tracking-widest uppercase rounded-full border border-emerald-500/20">
                ● LOKET REGISTRASI AKTIF
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input & Search Section - Col Span 6 */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-extrabold text-zinc-300 uppercase tracking-wider mb-2">
                  Cari Nama, ID, atau Kode Unik Tamu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Search className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Contoh: ketik bagian dari unique_link..."
                    value={checkinCodeInput}
                    onChange={(e) => handleLookupCheckin(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500 focus:outline-none rounded-2xl text-xs font-mono font-bold text-white placeholder-zinc-500"
                  />
                </div>
                {guests.length > 0 && !checkedinGuest && checkinCodeInput && (
                  <p className="text-[10px] text-zinc-400 font-semibold mt-1">
                    Silakan ketik kode yang cocok. Contoh kode tersedia: <strong className="text-amber-400 font-mono">{(guests[0]?.unique_link || '').substring(0, 8)}</strong>
                  </p>
                )}
              </div>

              {/* Status Alert logs */}
              {checkinSuccessMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-xl text-xs font-bold leading-normal">
                  🎉 {checkinSuccessMsg}
                </div>
              )}
              {checkinErrorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl text-xs font-bold leading-normal">
                  ⚠️ {checkinErrorMsg}
                </div>
              )}

              {/* Active Match Guest Profile */}
              {checkedinGuest ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <span className="bg-amber-400 text-amber-950 font-black text-[8px] font-mono tracking-widest px-2 py-0.5 rounded uppercase">
                    DATA MATCH TERBACA
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white">{checkedinGuest.name}</h3>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{checkedinGuest.email || 'Tanpa alamat email'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[10px] font-mono border-t border-zinc-800 pt-3">
                    <div>
                      <span className="text-zinc-500 block text-[8px] uppercase">Rombongan Pax</span>
                      <span className="font-extrabold text-white text-[11px]">{checkedinGuest.number_of_guests || 1} Orang</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[8px] uppercase">Status RSVP</span>
                      <span className={`font-extrabold text-[11px] uppercase ${checkedinGuest.rsvp_status === 'hadir' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {checkedinGuest.rsvp_status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[8px] uppercase">Kode Tiket</span>
                      <span className="font-extrabold text-white font-mono bg-zinc-800 px-1 py-0.5 rounded text-[10px] inline-block">{checkedinGuest.unique_link.toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[8px] uppercase">Check-In Terakhir</span>
                      <span className="font-extrabold text-white">{checkedinGuest.checked_in_at ? new Date(checkedinGuest.checked_in_at).toLocaleTimeString() : 'BELUM'}</span>
                    </div>
                  </div>

                  {checkedinGuest.checked_in_at && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-[10px] text-amber-300 font-extrabold leading-normal">
                      Pikiran: Tamu ini sudah pernah check-in pada pukul {new Date(checkedinGuest.checked_in_at).toLocaleTimeString()}. Lanjutkan jika ingin memperbarui foto verifikasi terbaru.
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-dashed border-zinc-800 p-6 rounded-2xl text-center text-zinc-500 text-xs italic">
                  Belum ada tamu terpilih. Ketikkan bagian dari unique_link di atas untuk mengunci data tamu secara otomatis.
                </div>
              )}
            </div>

            {/* Photo Capture Verification - Col Span 6 */}
            <div className="lg:col-span-6 space-y-4">
              <label className="block text-[10px] font-extrabold text-zinc-300 uppercase tracking-wider text-left">
                Verifikasi Kamera Pengenal (Scan + Foto Verifikasi)
              </label>

              <div className="relative aspect-video rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center overflow-hidden">
                {checkinPhotoBase64 ? (
                  <img
                    src={checkinPhotoBase64}
                    alt="Mock Checked-in avatar validation snapshot"
                    className="w-full h-full object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Activity className="h-8 w-8 text-zinc-600 mx-auto animate-pulse" />
                    <p className="text-[10px] font-extrabold text-zinc-400">SIAP MEREKAM VERIFIKASI</p>
                    <p className="text-[8px] text-zinc-500 font-semibold leading-normal max-w-[240px] mx-auto">
                      Ambil foto wajah tamu di gerbang untuk disimpan sebagai bukti otentikasi fisik.
                    </p>
                  </div>
                )}
                {checkinPhotoBase64 && (
                  <div className="absolute top-2 right-2 bg-emerald-600/95 backdrop-blur-md text-[8px] font-mono font-bold text-white px-2 py-0.5 rounded uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> Snapshot Saved
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSnapCameraVerify}
                  disabled={!checkedinGuest}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                    checkedinGuest
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                      : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-c800'
                  }`}
                >
                  📸 Ambil Jepretan Kamera Verifikasi
                </button>

                {checkinPhotoBase64 && (
                  <button
                    type="button"
                    onClick={() => setCheckinPhotoBase64('')}
                    className="bg-zinc-800/50 hover:bg-zinc-850 px-3 text-zinc-400 rounded-xl hover:text-white border border-zinc-800 cursor-pointer text-xs"
                    title="Hapus foto verifikasi saat ini"
                  >
                    Reset Foto
                  </button>
                )}
              </div>

              {/* Confirm submit operational action */}
              <button
                type="button"
                onClick={handleConfirmCheckinSubmit}
                disabled={!checkedinGuest}
                className={`w-full py-4.5 rounded-2xl text-xs uppercase tracking-wider font-extrabold transition-all shadow-md cursor-pointer ${
                  checkedinGuest
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold'
                    : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                }`}
              >
                Konfirmasi Status Masuk (Check-In) Tamu
              </button>
            </div>
          </div>
        </div>

        {/* Input & CSV Import modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Form Manual Input */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-zinc-200 p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <Plus className="h-5 w-5 text-zinc-800 stroke-[3]" />
                <span>Tambah Tamu Satu per Satu</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-1 leading-normal font-semibold">Masukkan informasi korespondensi untuk menghasilkan UUID tautan digital secara otomatis.</p>
            </div>

            <form onSubmit={handleAddManualGuest} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wider mb-1.5" htmlFor="guestName">
                  Nama Tamu *
                </label>
                <input
                  id="guestName"
                  type="text"
                  required
                  placeholder="Contoh: Ibu Rina Herawati"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="block w-full border border-zinc-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-[#1A1A1A] bg-[#FAF9F6] font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wider mb-1.5" htmlFor="guestPhone">
                  Nomor HP / WA (Opsional)
                </label>
                <input
                  id="guestPhone"
                  type="text"
                  placeholder="Contoh: 081234567890"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="block w-full border border-zinc-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-[#1A1A1A] bg-[#FAF9F6] font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wider mb-1.5" htmlFor="guestEmail">
                  Alamat Email (Opsional)
                </label>
                <input
                  id="guestEmail"
                  type="email"
                  placeholder="Contoh: rina.herawati@example.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="block w-full border border-zinc-250 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-[#1A1A1A] bg-[#FAF9F6] font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-black hover:opacity-90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Masukkan Daftar Tamu
              </button>
            </form>
          </div>

          {/* Form CSV Bulk Module */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-zinc-200 p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-black" />
                <span>Import Daftar Tamu CSV (Massal)</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-1 leading-normal font-semibold">Bebas mengunggah berkas eksternal atau memisahkan nama tamu dengan tanda koma / sela baris.</p>
            </div>

            {/* CSV Status Feedbacks */}
            {csvFileError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-750 px-4 py-2.5 rounded-xl text-xs font-bold leading-normal">
                {csvFileError}
              </div>
            )}
            {csvFileSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 leading-normal">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-550 animate-ping" />
                {csvFileSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              
              {/* Option A: Paste String */}
              <form onSubmit={handleCSVImport} className="space-y-3">
                <label className="block text-[10px] font-extrabold text-zinc-700 uppercase tracking-wider">
                  Cara A: Tempel (Paste) Teks CSV
                </label>
                <p className="text-[10px] text-zinc-400 font-bold">Gunakan format kolom: <code className="bg-[#FAF9F6] px-1 rounded font-bold font-mono text-black border border-zinc-200">nama,email,phone</code></p>
                
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Contoh format:&#13;Budi Santoso,budi@mail.com,08129&#13;Siti Maimunah,siti@mail.com,08771"
                  className="block w-full border border-zinc-250 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-[#1A1A1A] font-mono bg-[#FAF9F6] resize-y font-semibold"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#F2F1ED] hover:bg-zinc-200 text-zinc-800 font-extrabold text-xs rounded-xl border border-zinc-300 transition-colors cursor-pointer"
                >
                  Proses Teks & Tambahkan
                </button>
              </form>

              {/* Option B: Choose File */}
              <div className="space-y-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-150 md:pl-6 pt-4 md:pt-0">
                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-700 uppercase tracking-wider mb-2">
                    Cara B: Unggah File CSV (.csv)
                  </label>
                  <p className="text-[10px] text-zinc-400 leading-normal font-semibold">
                    Pilih file berformat <code className="bg-[#F2F1ED] px-1 rounded font-extrabold border border-zinc-250">.csv</code> hasil ekspor dari Excel Anda. Kolom baris pertama bisa berupa judul nama/email/phone atau baris data langsung.
                  </p>
                </div>

                <div className="relative mt-2 border-2 border-dashed border-zinc-350 hover:border-black bg-[#FAF9F6] rounded-xl p-4.5 text-center cursor-pointer transition-colors group">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCSVFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <FileSpreadsheet className="h-6 w-6 text-black mx-auto group-hover:scale-110 transition-transform" />
                    <p className="text-[11px] font-extrabold text-zinc-950">Pilih Berkas CSV Komputer</p>
                    <p className="text-[9px] text-[#1A1A1A] font-semibold">Sertakan berkas berukuran maksimal 5MB</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Guest directory listing section */}
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs">
          
          {/* Searching and Global Tools Bar */}
          <div className="p-5 border-b border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF9F6]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-zinc-950 pr-1 tracking-tight">Daftar Korespondensi Tamu Undang</span>
              
              {/* Filter tabs */}
              <div className="inline-flex bg-zinc-150 p-1 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('semua')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'semua' ? 'bg-black text-white shadow-xs' : 'text-zinc-650 hover:text-black'}`}
                >
                  Semua ({guests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('hadir')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'hadir' ? 'bg-white text-emerald-750 shadow-xs' : 'text-zinc-650 '}`}
                >
                  Hadir ({confirmedHadir})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('tidak_hadir')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'tidak_hadir' ? 'bg-white text-rose-650 shadow-xs' : 'text-zinc-650'}`}
                >
                  Absen ({confirmedAbsen})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'pending' ? 'bg-white text-zinc-800 shadow-xs' : 'text-zinc-650'}`}
                >
                  Menunggu ({pendingRespon})
                </button>
              </div>
            </div>

            {/* Right side controls (Search + Export) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Cari nama / email / HP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full sm:w-56 pl-9 pr-4 py-2 border border-zinc-250 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-zinc-800 bg-white"
                />
              </div>

              {/* CSV Export/Copy Trigger */}
              <button
                type="button"
                onClick={exportAllLinksCSVText}
                className="bg-black hover:opacity-90 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedAll ? <Check className="h-4.5 w-4.5" /> : <Download className="h-4 w-4" />}
                <span>Salin & Ekspor Link (CSV)</span>
              </button>

              {/* Bulk QR Entry Pass Printing Trigger */}
              <button
                type="button"
                onClick={handlePrintAllPasses}
                className="bg-white hover:bg-zinc-100 border border-zinc-250 text-zinc-900 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                title="Cetak seluruh pass & QR Code tamu yang aktif di daftar saat ini"
              >
                <Printer className="h-4 w-4 text-zinc-600" />
                <span>Cetak Semua QR Pass ({filteredGuests.length})</span>
              </button>
            </div>
          </div>

          {/* Table list */}
          {filteredGuests.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 italic text-xs space-y-2">
              <Users className="h-10 w-10 text-zinc-350 mx-auto" />
              <p className="font-bold text-zinc-800">Tidak ada nama tamu terdaftar dalam filter pencarian ini.</p>
              <p className="text-zinc-500 font-semibold">Gunakan form di atas untuk memasukkan tamu pertama secara manual atau bulk-CSV.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-[#FAF9F6] text-zinc-400 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Nama Lengkap</th>
                    <th className="p-4 hidden md:table-cell">Kontak Korespondensi</th>
                    <th className="p-4">Status RSVP</th>
                    <th className="p-4 hidden sm:table-cell">Jumlah Rombongan</th>
                    <th className="p-4 text-center">Tautan Undangan Tamu</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredGuests.map((guest) => {
                    const finalInvitationUrl = `${window.location.origin}/inv/${event.slug}/${guest.unique_link}`;
                    const hasOpenLog = allViews.some((v) => v.guest_id === guest.id);

                    return (
                      <tr key={guest.id} className="hover:bg-[#FAF9F6]/55 transition-colors font-semibold text-zinc-800">
                        <td className="p-4 font-bold text-zinc-950">
                          {guest.name}
                          
                          {/* Opened view badge notification */}
                          {hasOpenLog ? (
                            <span className="ml-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-1 rounded text-[8px] font-extrabold inline-flex items-center gap-0.5">
                              <Eye className="h-2 w-2" /> Dibuka
                            </span>
                          ) : (
                            <span className="ml-1.5 bg-zinc-100 text-zinc-400 px-1 rounded text-[8px] font-semibold inline-block">
                              Belum buka
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-zinc-550 hidden md:table-cell">
                          {guest.email && <p className="leading-tight">{guest.email}</p>}
                          {guest.phone && <p className="leading-tight font-mono text-[10px] text-zinc-950">{guest.phone}</p>}
                          {!guest.email && !guest.phone && <span className="text-zinc-350 italic text-[11px]">- (Tanpa Kontak)</span>}
                        </td>

                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full font-extrabold text-[10px] border tracking-wider ${
                            guest.rsvp_status === 'hadir' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            guest.rsvp_status === 'tidak_hadir' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            'bg-zinc-100 text-zinc-650 border-zinc-200'
                          }`}>
                            {guest.rsvp_status === 'hadir' ? '● HADIR' :
                             guest.rsvp_status === 'tidak_hadir' ? '❌ ABSEN' :
                             '⏳ PROSES'}
                          </span>
                        </td>

                        <td className="p-4 hidden sm:table-cell">
                          {guest.rsvp_status === 'hadir' ? (
                            <span className="font-extrabold text-zinc-955 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded text-xs">{guest.number_of_guests} orang</span>
                          ) : (
                            <span className="text-zinc-350 font-mono">-</span>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5 max-w-[240px] mx-auto bg-[#FAF9F6] rounded-lg p-1.5 border border-zinc-200">
                            <span className="text-[10px] text-zinc-500 truncate grow text-left pl-1 font-mono">{guest.unique_link}</span>
                            
                            {/* QR Code Generate & View Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenQrModal(guest)}
                              className="p-1 rounded text-zinc-550 hover:text-black bg-white hover:bg-zinc-100 cursor-pointer"
                              title="Tampilkan QR Code / Pass Masuk"
                            >
                              <QrCode className="h-3 w-3" />
                            </button>

                            {/* Copy single link button */}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(finalInvitationUrl, guest.id)}
                              className="p-1 rounded text-zinc-550 hover:text-black bg-white hover:bg-zinc-100 cursor-pointer"
                              title="Salin Tautan Khusus"
                            >
                              {copiedLinkIds[guest.id] ? <Check className="h-3 w-3 text-emerald-600 stroke-[3]" /> : <Copy className="h-3 w-3" />}
                            </button>

                            {/* Direct Open Invitation Button */}
                            <button
                              type="button"
                              onClick={() => onSelectGuestInvitation(event.slug, guest.unique_link)}
                              className="p-1 rounded text-zinc-550 hover:text-black bg-white hover:bg-zinc-100 cursor-pointer"
                              title="Buka Halaman Undangan Tamu Sesuai Tema"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </button>

                            {/* WhatsApp share customized template button */}
                            <button
                              type="button"
                              onClick={() => {
                                const currentPhone = guest.phone || '';
                                let targetPhone = currentPhone;
                                if (!currentPhone) {
                                  const promptPhone = prompt(
                                    `Ponsel tamu "${guest.name}" belum tercatat. Masukkan nomor HP/WA barunya (Contoh: 62812345678) untuk menyimpan dan mengirim undangan:`, 
                                    '628'
                                  );
                                  if (promptPhone && promptPhone.trim().length > 5) {
                                    targetPhone = promptPhone.trim();
                                    db.updateGuestPhone(guest.id, targetPhone);
                                  } else {
                                    return;
                                  }
                                }
                                
                                const cleanPhoneNum = targetPhone.replace(/[^0-9]/g, '');
                                const customMsg = `Halo *${guest.name}*! %0D%0A%0D%0AKami mengundang Anda sekalian untuk hadir di acara kami: *"${event.title}"*.%0D%0A%0D%0ASimak rincian peta koordinat serta RSVP kehadiran instan Anda via link e-ticket resmi berikut:%0D%0A${finalInvitationUrl}%0D%0A%0D%0AMerupakan suatu kehormatan bagi kami jika Anda berkenan hadir. Terima kasih!`;
                                window.open(`https://wa.me/${cleanPhoneNum}?text=${customMsg}`, '_blank');
                              }}
                              className="p-1 rounded text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
                              title="Kirim Undangan Otomatis via WhatsApp"
                            >
                              <Send className="h-3 w-3" />
                            </button>
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="text-rose-650 hover:text-rose-800 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Hapus korespondensi"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>

      {/* Visual Email SMTP Simulator Overlay Dialog */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] rounded-3xl border border-zinc-200 shadow-xl overflow-hidden max-w-xl w-full flex flex-col max-h-[85vh]">
            <div className="bg-zinc-950 p-4 flex items-center justify-between text-white border-b border-zinc-c800">
              <div className="flex items-center gap-2">
                <MailCheck className="h-5 w-5 text-emerald-500 animate-bounce" />
                <div>
                  <h4 className="text-xs font-black tracking-tight">Email Client SMTP Preview</h4>
                  <p className="text-[9px] text-zinc-500 font-mono">SIMULATED SMTP HEADER LOGS</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEmail(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-805 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Email Metadata Headers Bar */}
            <div className="bg-white border-b border-zinc-150 p-3.5 space-y-1 text-xs text-zinc-500 font-semibold font-mono">
              <p><span className="text-zinc-400 font-bold">Dari:</span> notifications@invitely.online &lt;SMTP Relay&gt;</p>
              <p><span className="text-zinc-400 font-bold">Kepada:</span> {selectedEmail.recipient_email}</p>
              <p><span className="text-zinc-400 font-bold">Subjek:</span> <span className="font-extrabold text-zinc-900">{selectedEmail.subject}</span></p>
              <p><span className="text-zinc-400 font-bold">Tanggal:</span> {new Date(selectedEmail.sent_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })}</p>
            </div>

            {/* Render HTML content securely inside scoped container */}
            <div className="p-6 overflow-y-auto bg-zinc-50 grow flex justify-center items-start">
              <div 
                className="w-full text-left"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} 
              />
            </div>
            
            <div className="p-3 bg-zinc-100 border-t border-zinc-200 text-center text-[10px] font-mono text-zinc-400 flex justify-between px-4">
              <span>MIME-Version: 1.0</span>
              <span>Content-Type: text/html</span>
              <span className="text-emerald-600 font-extrabold">STATUS: DELIVERED (SUCCESS)</span>
            </div>
          </div>
        </div>
      )}

      {/* Visual QR Code Generator & Ticket Card Dialog Overlay */}
      {activeQrGuest && activeQrData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] rounded-3xl border border-zinc-200 shadow-xl overflow-hidden max-w-md w-full flex flex-col max-h-[90vh]">
            <div className="bg-zinc-950 p-4 flex items-center justify-between text-white border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-amber-500 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black tracking-tight">QR Generator & Ticket Pass</h4>
                  <p className="text-[9px] text-zinc-500 font-mono">REAL-TIME INVITATION CODE</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setActiveQrGuest(null);
                  setActiveQrData('');
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Ticket Preview Card Container */}
            <div className="p-6 overflow-y-auto bg-zinc-50 flex flex-col items-center gap-4">
              
              {/* Boarding Ticket Pass Style Card */}
              <div className="bg-white rounded-2xl border-2 border-zinc-350 p-5 w-full shadow-2xs relative text-zinc-900">
                <div className="flex justify-between items-center border-b border-dashed border-zinc-200 pb-3 mb-4">
                  <span className="text-[9px] font-black tracking-widest text-zinc-400 font-mono">✦ INVITELY TICKET CARD</span>
                  <span className="text-[8px] font-extrabold bg-zinc-100 px-2 py-0.5 rounded text-zinc-650 font-mono">PASS-ONLY</span>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono">Nama Tamu Undangan</p>
                    <h3 className="text-base font-black text-zinc-950 leading-snug mt-1">{activeQrGuest.name}</h3>
                  </div>

                  <div className="flex justify-center">
                    <div className="bg-white border border-zinc-200 p-2.5 rounded-xl">
                      <img src={activeQrData} alt="Guest QR Link" className="w-48 h-48 block" />
                    </div>
                  </div>

                  <div className="bg-[#FAF9F6] border border-zinc-200 rounded-xl p-3 text-center space-y-1">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest font-mono">UUID Kode Masuk</p>
                    <p className="text-[10px] font-bold text-zinc-850 font-mono break-all">{activeQrGuest.unique_link}</p>
                  </div>
                </div>

                <div className="border-t border-dashed border-zinc-200 mt-4 pt-3 flex justify-between items-center text-[10px] font-semibold text-zinc-550">
                  <div>
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-wider font-mono">Dibuat Untuk</p>
                    <p className="font-extrabold text-[#1a1c22] truncate max-w-[140px]">{event?.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-wider font-mono">Status Tamu</p>
                    <span className={`inline-block text-[9px] font-extrabold uppercase rounded px-1.5 border leading-tight ${
                      activeQrGuest.rsvp_status === 'hadir' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      activeQrGuest.rsvp_status === 'tidak_hadir' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                      'bg-zinc-100 text-zinc-650 border-zinc-200'
                    }`}>
                      {activeQrGuest.rsvp_status === 'hadir' ? 'Hadir' : activeQrGuest.rsvp_status === 'tidak_hadir' ? 'Absen' : 'Proses'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 w-full">
                {/* Download PNG Trigger */}
                <a 
                  href={activeQrData}
                  download={`QR_${activeQrGuest.name.replace(/\s+/g, '_')}.png`}
                  className="bg-zinc-950 hover:bg-zinc-900 font-extrabold text-white py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs text-center transition-all cursor-pointer shadow-3xs"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh PNG</span>
                </a>

                {/* Print Trigger */}
                <button 
                  onClick={() => handlePrintSinglePass(activeQrGuest, activeQrData)}
                  className="bg-white hover:bg-zinc-100 border border-zinc-250 font-extrabold text-zinc-900 py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer shadow-4xs"
                  title="Cetak format pass saku fisik"
                >
                  <Printer className="h-4 w-4 text-zinc-650" />
                  <span>Cetak Pass</span>
                </button>
              </div>

              {/* Tips for check-in */}
              <div className="text-[10px] text-zinc-550 leading-normal text-center max-w-[340px] font-semibold mt-1">
                💡 Unduh QR-code ini lalu kirimkan ke guest via WhatsApp/Email. Pada hari-H acara, tanyakan guest untuk memperlihatkan kode QR ini untuk registrasi cepat.
              </div>

            </div>
            
            <div className="p-3 bg-zinc-100 border-t border-zinc-200 text-center text-[10px] font-mono text-zinc-400">
              MIME-Type: image/png • Resolution 380x380px
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
