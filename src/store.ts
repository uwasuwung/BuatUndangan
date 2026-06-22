/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Profile, UserPlan, Event, Guest, RsvpResponse, InvitationView, ThemeType, SimulatedEmail } from './types';

// Helper to generate IDs similar to UUIDs
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Preseeded Sample Data
const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'user-richard-123',
    full_name: 'Richard Philips',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
  }
];

const DEFAULT_USER_PLANS: UserPlan[] = [
  {
    user_id: 'user-richard-123',
    plan: 'free',
    events_created: 2,
    max_events: 25,
    subscription_expires_at: null,
  }
];

const DEFAULT_EVENTS: Event[] = [
  {
    id: 'event-wedding-1',
    user_id: 'user-richard-123',
    slug: 'pernikahan-richard-lisa',
    title: 'Pernikahan Richard & Lisa',
    event_date: '2026-08-18T09:00:00Z',
    location: 'Gedung Kriya Asri, Jakarta Selatan',
    template_id: 'classic',
    cover_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: 'event-birthday-2',
    user_id: 'user-richard-123',
    slug: 'gala-dinner-modern',
    title: 'Modern Business Grand Launching',
    event_date: '2026-11-22T18:00:00Z',
    location: 'WTC Grand Ballroom, Surabaya',
    template_id: 'modern',
    cover_image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  }
];

const DEFAULT_GUESTS: Guest[] = [
  // Guests for Richard & Lisa Wedding
  {
    id: 'guest-1',
    event_id: 'event-wedding-1',
    name: 'Budi Santoso',
    email: 'budi.santoso@example.com',
    phone: '081234567890',
    unique_link: 'budi-wedding-link-abc',
    rsvp_status: 'hadir',
    will_attend: true,
    number_of_guests: 2,
    message: 'Selamat ya Richard & Lisa! Semoga langgeng dan bahagia selalu dunia akhirat.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'guest-2',
    event_id: 'event-wedding-1',
    name: 'Siti Rahma',
    email: 'siti.rahma@example.com',
    phone: '08987654321',
    unique_link: 'siti-wedding-link-xyz',
    rsvp_status: 'tidak_hadir',
    will_attend: false,
    number_of_guests: 0,
    message: 'Maaf berhalangan hadir karena ada tugas luar kota. Selamat menempuh hidup baru!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'guest-3',
    event_id: 'event-wedding-1',
    name: 'Andi Wijaya',
    email: 'andi.wijaya@example.com',
    phone: '085544332211',
    unique_link: 'andi-wedding-link-123',
    rsvp_status: 'pending',
    will_attend: null,
    number_of_guests: 1,
    message: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'guest-4',
    event_id: 'event-wedding-1',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@example.com',
    phone: '087788990011',
    unique_link: 'dewi-wedding-link-789',
    rsvp_status: 'hadir',
    will_attend: true,
    number_of_guests: 3,
    message: 'Sangat terhormat diundang ke perhelatan istimewa ini. Sukses selalu buat kalian berdua!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  }
];

const DEFAULT_RSVP_RESPONSES: RsvpResponse[] = [
  {
    id: 'rsvp-log-1',
    guest_id: 'guest-1',
    old_status: 'pending',
    new_status: 'hadir',
    changed_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'rsvp-log-2',
    guest_id: 'guest-2',
    old_status: 'pending',
    new_status: 'tidak_hadir',
    changed_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'rsvp-log-3',
    guest_id: 'guest-4',
    old_status: 'pending',
    new_status: 'hadir',
    changed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  }
];

export interface LocationDetails {
  cityName: string;
  countryName: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

export function lookupIPLocation(ip: string): LocationDetails {
  const cleanIP = ip.trim();
  if (cleanIP === '192.168.1.5' || cleanIP === '127.0.0.1') {
    return {
      cityName: 'Jakarta',
      countryName: 'Indonesia',
      countryCode: 'ID',
      latitude: -6.2088,
      longitude: 106.8456
    };
  }
  if (cleanIP === '180.252.12.98') {
    return {
      cityName: 'Surabaya',
      countryName: 'Indonesia',
      countryCode: 'ID',
      latitude: -7.2575,
      longitude: 112.7521
    };
  }
  if (cleanIP === '103.8.188.42') {
    return {
      cityName: 'Bandung',
      countryName: 'Indonesia',
      countryCode: 'ID',
      latitude: -6.9175,
      longitude: 107.6191
    };
  }
  if (cleanIP === '202.162.24.18') {
    return {
      cityName: 'Yogyakarta',
      countryName: 'Indonesia',
      countryCode: 'ID',
      latitude: -7.7956,
      longitude: 110.3695
    };
  }

  // Deterministic cities across Indonesia for realism
  const cities: LocationDetails[] = [
    { cityName: 'Semarang', countryName: 'Indonesia', countryCode: 'ID', latitude: -6.9667, longitude: 110.4167 },
    { cityName: 'Medan', countryName: 'Indonesia', countryCode: 'ID', latitude: 3.5952, longitude: 98.6722 },
    { cityName: 'Denpasar', countryName: 'Indonesia', countryCode: 'ID', latitude: -8.6500, longitude: 115.2167 },
    { cityName: 'Makassar', countryName: 'Indonesia', countryCode: 'ID', latitude: -5.1477, longitude: 119.4327 },
    { cityName: 'Palembang', countryName: 'Indonesia', countryCode: 'ID', latitude: -2.9761, longitude: 104.7753 },
    { cityName: 'Balikpapan', countryName: 'Indonesia', countryCode: 'ID', latitude: -1.2654, longitude: 116.8312 },
    { cityName: 'Malang', countryName: 'Indonesia', countryCode: 'ID', latitude: -7.9797, longitude: 112.6304 }
  ];

  let hash = 0;
  for (let i = 0; i < cleanIP.length; i++) {
    hash = cleanIP.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % cities.length;
  return cities[index];
}

export function generateRSVPEmailHtml(
  guestName: string,
  eventTitle: string,
  rsvpStatus: 'hadir' | 'tidak_hadir',
  numberOfGuests: number,
  message: string | null,
  contactPhone: string | null,
  contactEmail: string | null
): string {
  const isHadir = rsvpStatus === 'hadir';
  const statusColor = isHadir ? '#047857' : '#be123c';
  const statusBg = isHadir ? '#ecfdf5' : '#fff1f2';
  const statusBorder = isHadir ? '#a7f3d0' : '#fecdd3';
  const statusBadge = isHadir ? '✔️ HADIR (CONFIRMED)' : '❌ TIDAK HADIR / ABSEN';
  
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; background-color: #faf9f6;">
      <div style="background-color: #09090b; padding: 24px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.025em;">Invitely. Notification</h2>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #a1a1aa; font-family: monospace;">NOTIFIKASI RSVP REAL-TIME</p>
      </div>
      <div style="padding: 24px; background-color: white;">
        <p style="font-size: 14px; text-align: center; color: #71717a; margin-top: 0;">Halo Creator,</p>
        <h3 style="font-size: 18px; font-weight: 800; text-align: center; color: #18181b; margin: 8px 0 20px 0;">${guestName} Baru Saja Merespon Undangan Anda!</h3>
        
        <div style="background-color: ${statusBg}; border: 1px solid ${statusBorder}; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="font-size: 11px; color: ${statusColor}; font-weight: bold; text-transform: uppercase;">Status Kehadiran</td>
              <td style="font-size: 11px; color: ${statusColor}; font-weight: bold; text-transform: uppercase; text-align: right;">Jumlah Rombongan</td>
            </tr>
            <tr>
              <td style="font-size: 16px; color: ${statusColor}; font-weight: 800;">${statusBadge}</td>
              <td style="font-size: 16px; color: ${statusColor}; font-weight: 800; text-align: right;">${isHadir ? numberOfGuests : 0} Orang</td>
            </tr>
          </table>
        </div>

        <table style="width: 100%; font-size: 13px; color: #3f3f46; margin-bottom: 20px; border-bottom: 1px solid #f4f4f5; padding-bottom: 16px;">
          <tr>
            <td style="font-weight: bold; width: 120px; padding: 4px 0;">Nama Tamu:</td>
            <td style="padding: 4px 0; color: #09090b;">${guestName}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">Kontak HP:</td>
            <td style="padding: 4px 0; color: #09090b;">${contactPhone || '-'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0;">Email:</td>
            <td style="padding: 4px 0; color: #09090b;">${contactEmail || '-'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0; vertical-align: top;">Pesan/Doa:</td>
            <td style="padding: 4px 0; color: #09090b; font-style: italic;">"${message || '-'}"</td>
          </tr>
        </table>

        <div style="text-align: center;">
          <a href="#" style="background-color: #09090b; color: white; padding: 12px 24px; text-decoration: none; font-size: 12px; font-weight: bold; border-radius: 8px; display: inline-block;">Kelola Tamu Di Dashboard</a>
        </div>
      </div>
      <div style="background-color: #f4f4f5; padding: 12px; text-align: center; font-size: 10px; color: #71717a; border-top: 1px solid #e4e4e7;">
        Email ini sistematis dikirimkan secara otomatis oleh server Invitely kepada pemilik event.
      </div>
    </div>
  `;
}

const DEFAULT_EMAILS: SimulatedEmail[] = [
  {
    id: 'email-1',
    event_id: 'event-wedding-1',
    recipient_email: 'philipsrichard8943@gmail.com',
    guest_name: 'Budi Santoso',
    rsvp_status: 'hadir',
    number_of_guests: 2,
    message: 'Selamat ya Richard & Lisa! Semoga langgeng dan bahagia selalu dunia akhirat.',
    subject: '[Invitely] ✔️ RSVP Hadir: Budi Santoso untuk acara "Pernikahan Richard & Lisa"',
    body_html: generateRSVPEmailHtml(
      'Budi Santoso',
      'Pernikahan Richard & Lisa',
      'hadir',
      2,
      'Selamat ya Richard & Lisa! Semoga langgeng dan bahagia selalu dunia akhirat.',
      '081234567890',
      'budi.santoso@example.com'
    ),
    sent_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: 'delivered'
  },
  {
    id: 'email-2',
    event_id: 'event-wedding-1',
    recipient_email: 'philipsrichard8943@gmail.com',
    guest_name: 'Siti Rahma',
    rsvp_status: 'tidak_hadir',
    number_of_guests: 0,
    message: 'Maaf berhalangan hadir karena ada tugas luar kota. Selamat menempuh hidup baru!',
    subject: '[Invitely] ❌ RSVP Absen: Siti Rahma untuk acara "Pernikahan Richard & Lisa"',
    body_html: generateRSVPEmailHtml(
      'Siti Rahma',
      'Pernikahan Richard & Lisa',
      'tidak_hadir',
      0,
      'Maaf berhalangan hadir karena ada tugas luar kota. Selamat menempuh hidup baru!',
      '08987654321',
      'siti.rahma@example.com'
    ),
    sent_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    status: 'delivered'
  }
];

const DEFAULT_INVITATION_VIEWS: InvitationView[] = [
  {
    id: 'view-1',
    guest_id: 'guest-1',
    viewed_at: new Date(Date.now() - 1000 * 60 * 60 * 13).toISOString(),
    ip_address: '192.168.1.5',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X)',
    cityName: 'Jakarta',
    countryName: 'Indonesia',
    countryCode: 'ID',
    latitude: -6.2088,
    longitude: 106.8456
  },
  {
    id: 'view-2',
    guest_id: 'guest-2',
    viewed_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    ip_address: '180.252.12.98',
    user_agent: 'Mozilla/5.0 (Linux; Android 10; SM-G960F)',
    cityName: 'Surabaya',
    countryName: 'Indonesia',
    countryCode: 'ID',
    latitude: -7.2575,
    longitude: 112.7521
  },
  {
    id: 'view-3',
    guest_id: 'guest-4',
    viewed_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    ip_address: '103.8.188.42',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    cityName: 'Bandung',
    countryName: 'Indonesia',
    countryCode: 'ID',
    latitude: -6.9175,
    longitude: 107.6191
  }
];

export class DBStore {
  // Database Tables in localStorage
  private profiles: Profile[] = [];
  private userPlans: UserPlan[] = [];
  private events: Event[] = [];
  private guests: Guest[] = [];
  private rsvpResponses: RsvpResponse[] = [];
  private invitationViews: InvitationView[] = [];
  private emails: SimulatedEmail[] = [];

  // Active Session State
  private currentUserId: string | null = null;

  // Listeners for reactivity
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedProfiles = localStorage.getItem('inv_profiles');
      const storedPlans = localStorage.getItem('inv_plans');
      const storedEvents = localStorage.getItem('inv_events');
      const storedGuests = localStorage.getItem('inv_guests');
      const storedRSVPs = localStorage.getItem('inv_rsvp_responses');
      const storedViews = localStorage.getItem('inv_views');
      const storedSession = localStorage.getItem('inv_session_user_id');

      if (storedProfiles) this.profiles = JSON.parse(storedProfiles);
      else {
        this.profiles = DEFAULT_PROFILES;
        this.saveJSON('inv_profiles', this.profiles);
      }

      if (storedPlans) this.userPlans = JSON.parse(storedPlans);
      else {
        this.userPlans = DEFAULT_USER_PLANS;
        this.saveJSON('inv_plans', this.userPlans);
      }

      if (storedEvents) this.events = JSON.parse(storedEvents);
      else {
        this.events = DEFAULT_EVENTS;
        this.saveJSON('inv_events', this.events);
      }

      if (storedGuests) this.guests = JSON.parse(storedGuests);
      else {
        this.guests = DEFAULT_GUESTS;
        this.saveJSON('inv_guests', this.guests);
      }

      if (storedRSVPs) this.rsvpResponses = JSON.parse(storedRSVPs);
      else {
        this.rsvpResponses = DEFAULT_RSVP_RESPONSES;
        this.saveJSON('inv_rsvp_responses', this.rsvpResponses);
      }

      if (storedViews) this.invitationViews = JSON.parse(storedViews);
      else {
        this.invitationViews = DEFAULT_INVITATION_VIEWS;
        this.saveJSON('inv_views', this.invitationViews);
      }

      const storedEmails = localStorage.getItem('inv_emails');
      if (storedEmails) this.emails = JSON.parse(storedEmails);
      else {
        this.emails = DEFAULT_EMAILS;
        this.saveJSON('inv_emails', this.emails);
      }

      // Default session to the preseeded user Richard if no active session is set
      this.currentUserId = storedSession || 'user-richard-123';
      localStorage.setItem('inv_session_user_id', this.currentUserId);

    } catch (e) {
      console.error('Failed to initialize local DB store, fallback to memory', e);
      this.profiles = DEFAULT_PROFILES;
      this.userPlans = DEFAULT_USER_PLANS;
      this.events = DEFAULT_EVENTS;
      this.guests = DEFAULT_GUESTS;
      this.rsvpResponses = DEFAULT_RSVP_RESPONSES;
      this.invitationViews = DEFAULT_INVITATION_VIEWS;
      this.emails = DEFAULT_EMAILS;
      this.currentUserId = 'user-richard-123';
    }
  }

  private saveJSON(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving key ${key} to storage`, e);
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // --- GETTERS & METRICS ---

  public getProfiles(): Profile[] {
    return [...this.profiles];
  }

  public getUserPlans(): UserPlan[] {
    return [...this.userPlans];
  }

  public getEventsTable(): Event[] {
    return [...this.events];
  }

  public getGuestsTable(): Guest[] {
    return [...this.guests];
  }

  public getRsvpResponsesTable(): RsvpResponse[] {
    return [...this.rsvpResponses];
  }

  public getInvitationViewsTable(): InvitationView[] {
    return [...this.invitationViews];
  }

  public getSimulatedEmails(): SimulatedEmail[] {
    return [...this.emails];
  }

  public getSessionUserId(): string | null {
    return this.currentUserId;
  }

  public getCurrentProfile(): Profile | null {
    if (!this.currentUserId) return null;
    return this.profiles.find((p) => p.id === this.currentUserId) || null;
  }

  public getCurrentPlan(): UserPlan | null {
    if (!this.currentUserId) return null;
    return this.userPlans.find((p) => p.user_id === this.currentUserId) || null;
  }

  public getUserEvents(): Event[] {
    if (!this.currentUserId) return [];
    return this.events.filter((e) => e.user_id === this.currentUserId);
  }

  public getEvent(id: string): Event | null {
    return this.events.find((e) => e.id === id) || null;
  }

  public getEventBySlug(slug: string): Event | null {
    return this.events.find((e) => e.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  public getGuestByLink(unique_link: string): Guest | null {
    return this.guests.find((g) => g.unique_link === unique_link) || null;
  }

  public getEventGuests(eventId: string): Guest[] {
    return this.guests.filter((g) => g.event_id === eventId);
  }

  // --- AUTH OPERATIONS ---

  public signUp(email: string, fullName: string): { success: boolean; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Simple email checks
    if (!trimmedEmail || !fullName.trim()) {
      return { success: false, error: 'Email dan Nama Lengkap wajib diisi.' };
    }

    const exists = this.profiles.some((p) => p.id === trimmedEmail); // using email as ID
    if (exists) {
      return { success: false, error: 'Email sudah terdaftar.' };
    }

    const userId = generateUUID();
    const newProfile: Profile = {
      id: userId,
      full_name: fullName,
      created_at: new Date().toISOString(),
    };

    const newPlan: UserPlan = {
      user_id: userId,
      plan: 'free',
      events_created: 0,
      max_events: 25,
      subscription_expires_at: null,
    };

    this.profiles.push(newProfile);
    this.userPlans.push(newPlan);

    this.saveJSON('inv_profiles', this.profiles);
    this.saveJSON('inv_plans', this.userPlans);

    this.currentUserId = userId;
    localStorage.setItem('inv_session_user_id', userId);

    this.notify();
    return { success: true };
  }

  public signIn(email: string): { success: boolean; error?: string } {
    // For our user experience, we can login existing seeded users like Richard or match fullname/id
    const user = this.profiles.find((p) => p.full_name.toLowerCase().includes(email.toLowerCase()) || p.id === email);
    
    if (user) {
      this.currentUserId = user.id;
      localStorage.setItem('inv_session_user_id', user.id);
      this.notify();
      return { success: true };
    }

    // If typing new email, let's auto-register to keep testing seamless and delightful!
    const autoName = email.split('@')[0];
    const cleanName = autoName.charAt(0).toUpperCase() + autoName.slice(1);
    return this.signUp(email, cleanName);
  }

  public signOut() {
    this.currentUserId = null;
    localStorage.removeItem('inv_session_user_id');
    this.notify();
  }

  // Set session directly for testing convenience in db console
  public forceSetSession(userId: string) {
    this.currentUserId = userId;
    localStorage.setItem('inv_session_user_id', userId);
    this.notify();
  }

  // --- EVENT OPERATIONS ---

  public createEvent(
    title: string,
    slug: string,
    date: string,
    location: string,
    templateId: 'classic' | 'bunga' | 'modern',
    coverImageUrl?: string,
    eventType?: 'wedding' | 'birthday' | 'corporate' | 'aqiqah' | 'webinar_seminar' | 'grand_opening' | 'concert' | 'charity' | 'graduation' | 'arisan' | 'sports' | 'religious' | 'rt_rw' | 'baby_shower' | 'other',
    customFields?: Record<string, any>
  ): { success: boolean; error?: string; eventId?: string } {
    if (!this.currentUserId) {
      return { success: false, error: 'User tidak dalam keadaan login.' };
    }

    const plan = this.getCurrentPlan();
    if (!plan) {
      return { success: false, error: 'User plan tidak ditemukan.' };
    }

    // VERIFY FREE LIMITATION:
    if (plan.plan === 'free' && plan.events_created >= plan.max_events) {
      return {
        success: false,
        error: 'Anda telah mencapai batas 25 undangan gratis. Silakan berlangganan untuk membuat undangan tanpa batas.',
      };
    }

    // Ensure slug is unique
    const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const slugExists = this.events.some((e) => e.slug === formattedSlug);
    if (slugExists) {
      return { success: false, error: 'Slug undangan ini sudah digunakan. Coba ganti yang lain.' };
    }

    const eventId = generateUUID();
    const newEvent: Event = {
      id: eventId,
      user_id: this.currentUserId,
      slug: formattedSlug,
      title,
      event_date: date,
      location,
      template_id: templateId,
      cover_image_url: coverImageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200',
      created_at: new Date().toISOString(),
      event_type: eventType || 'wedding',
      custom_fields: customFields || {}
    };

    // Increment events_created
    plan.events_created += 1;

    this.events.push(newEvent);
    
    // Save tables
    this.saveJSON('inv_events', this.events);
    this.saveJSON('inv_plans', this.userPlans);

    this.notify();
    return { success: true, eventId };
  }

  public deleteEvent(eventId: string): { success: boolean } {
    const eventIndex = this.events.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) return { success: false };

    const event = this.events[eventIndex];
    
    // Remove guest and views cascade
    const eventGuests = this.getEventGuests(eventId);
    const guestIds = eventGuests.map((g) => g.id);
    
    this.guests = this.guests.filter((g) => g.event_id !== eventId);
    this.rsvpResponses = this.rsvpResponses.filter((r) => !guestIds.includes(r.guest_id));
    this.invitationViews = this.invitationViews.filter((v) => !guestIds.includes(v.guest_id));
    
    // Remove event
    this.events.splice(eventIndex, 1);

    // Decrement plan created count if > 0 (to make testing quotas easier!)
    const plan = this.userPlans.find((p) => p.user_id === event.user_id);
    if (plan && plan.events_created > 0) {
      plan.events_created -= 1;
    }

    this.emails = this.emails.filter((em) => em.event_id !== eventId);
    this.saveJSON('inv_events', this.events);
    this.saveJSON('inv_guests', this.guests);
    this.saveJSON('inv_rsvp_responses', this.rsvpResponses);
    this.saveJSON('inv_views', this.invitationViews);
    this.saveJSON('inv_emails', this.emails);
    this.saveJSON('inv_plans', this.userPlans);

    this.notify();
    return { success: true };
  }

  // --- GUEST OPERATIONS ---

  public addGuest(
    eventId: string,
    name: string,
    email: string | null,
    phone: string | null
  ): { success: boolean; guest?: Guest } {
    const cleanName = name.trim();
    if (!cleanName) return { success: false };

    // slugify guest name for beautiful link ending
    const slugName = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
    const uniqueLink = `${slugName}-${generateUUID().slice(0, 8)}`;

    const newGuest: Guest = {
      id: generateUUID(),
      event_id: eventId,
      name: cleanName,
      email: email ? email.trim() : null,
      phone: phone ? phone.trim() : null,
      unique_link: uniqueLink,
      rsvp_status: 'pending',
      will_attend: null,
      number_of_guests: 1,
      message: null,
      created_at: new Date().toISOString(),
    };

    this.guests.push(newGuest);
    this.saveJSON('inv_guests', this.guests);
    this.notify();

    return { success: true, guest: newGuest };
  }

  public importGuestsCSV(eventId: string, csvText: string): { success: boolean; count: number; error?: string } {
    if (!csvText.trim()) return { success: false, count: 0, error: 'File CSV kosong.' };

    const lines = csvText.split(/\r?\n/);
    if (lines.length === 0) return { success: false, count: 0, error: 'Format file tidak memiliki baris.' };

    let addedCount = 0;
    // Simple CSV parser
    // Check if headers exist
    const hasHeaders = lines[0].toLowerCase().includes('nama') || lines[0].toLowerCase().includes('name');
    const startIndex = hasHeaders ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // split by comma or semi-colon
      const cols = line.split(/[,;]/);
      let name = cols[0]?.trim();
      let email = cols[1]?.trim() || '';
      let phone = cols[2]?.trim() || '';

      // clean quotes if any
      name = name?.replace(/^["']|["']$/g, '');
      email = email?.replace(/^["']|["']$/g, '');
      phone = phone?.replace(/^["']|["']$/g, '');

      if (name) {
        this.addGuest(eventId, name, email || null, phone || null);
        addedCount++;
      }
    }

    return { success: true, count: addedCount };
  }

  public updateGuestPhone(guestId: string, phone: string) {
    const guest = this.guests.find((g) => g.id === guestId);
    if (guest) {
      guest.phone = phone.trim();
      this.saveJSON('inv_guests', this.guests);
      this.notify();
    }
  }

  public deleteGuest(guestId: string) {
    this.guests = this.guests.filter((g) => g.id !== guestId);
    this.rsvpResponses = this.rsvpResponses.filter((r) => r.guest_id !== guestId);
    this.invitationViews = this.invitationViews.filter((v) => v.guest_id !== guestId);

    this.saveJSON('inv_guests', this.guests);
    this.saveJSON('inv_rsvp_responses', this.rsvpResponses);
    this.saveJSON('inv_views', this.invitationViews);

    this.notify();
  }

  // --- RSVP LOGGING & TRACKING ---

  public trackView(guestId: string, userAgent?: string, ip?: string, viewedTemplate?: 'classic' | 'bunga' | 'modern') {
    const guest = this.guests.find((g) => g.id === guestId);
    if (!guest) return;

    const ipAddress = ip || '127.0.0.1';
    const loc = lookupIPLocation(ipAddress);
    
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent || '');
    const deviceType = isMobile ? 'mobile' : 'desktop';
    
    guest.visited_device = deviceType;
    if (viewedTemplate) {
      guest.viewed_template = viewedTemplate;
    }

    // Log the view in invitation_views
    const newView: InvitationView = {
      id: generateUUID(),
      guest_id: guestId,
      viewed_at: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent || 'Browser',
      cityName: loc.cityName,
      countryName: loc.countryName,
      countryCode: loc.countryCode,
      latitude: loc.latitude,
      longitude: loc.longitude
    };

    this.invitationViews.push(newView);
    this.saveJSON('inv_views', this.invitationViews);
    this.saveJSON('inv_guests', this.guests);
    this.notify();
  }

  public updateRSVP(
    guestId: string,
    rsvpStatus: 'hadir' | 'tidak_hadir',
    willAttend: boolean,
    numberOfGuests: number,
    message: string | null,
    guestPhotoUrl?: string
  ): { success: boolean; guest?: Guest } {
    const guest = this.guests.find((g) => g.id === guestId);
    if (!guest) return { success: false };

    const oldStatus = guest.rsvp_status;
    guest.rsvp_status = rsvpStatus;
    guest.will_attend = willAttend;
    guest.number_of_guests = willAttend ? numberOfGuests : 0;
    guest.message = message ? message.trim() : guest.message;
    if (guestPhotoUrl !== undefined) {
      guest.guest_photo_url = guestPhotoUrl;
    }

    // Log response
    const newLog: RsvpResponse = {
      id: generateUUID(),
      guest_id: guestId,
      old_status: oldStatus,
      new_status: rsvpStatus,
      changed_at: new Date().toISOString(),
    };

    this.rsvpResponses.push(newLog);

    const event = this.getEvent(guest.event_id);
    if (event) {
      const creatorProfile = this.profiles.find((p) => p.id === event.user_id);
      const recipientEmail = creatorProfile?.id.includes('@') ? creatorProfile.id : 'philipsrichard8943@gmail.com';
      const isHadir = rsvpStatus === 'hadir';
      const subjectStatus = isHadir ? '✔️ RSVP Hadir' : '❌ RSVP Absen';
      
      const newEmail: SimulatedEmail = {
        id: generateUUID(),
        event_id: guest.event_id,
        recipient_email: recipientEmail,
        guest_name: guest.name,
        rsvp_status: rsvpStatus,
        number_of_guests: isHadir ? numberOfGuests : 0,
        message: message,
        subject: `[Invitely] ${subjectStatus}: ${guest.name} untuk acara "${event.title}"`,
        body_html: generateRSVPEmailHtml(
          guest.name,
          event.title,
          rsvpStatus,
          numberOfGuests,
          message,
          guest.phone,
          guest.email
        ),
        sent_at: new Date().toISOString(),
        status: 'delivered'
      };
      
      this.emails.push(newEmail);
      this.saveJSON('inv_emails', this.emails);
    }

    this.saveJSON('inv_guests', this.guests);
    this.saveJSON('inv_rsvp_responses', this.rsvpResponses);

    this.notify();
    return { success: true, guest };
  }

  public updateEvent(
    eventId: string,
    updates: Partial<Omit<Event, 'id' | 'user_id' | 'created_at'>>
  ): { success: boolean; error?: string } {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return { success: false, error: 'Event tidak ditemukan.' };

    const originalSlug = event.slug;
    if (updates.slug && updates.slug !== originalSlug) {
      const formattedSlug = updates.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      const slugExists = this.events.some((e) => e.slug === formattedSlug && e.id !== eventId);
      if (slugExists) {
        return { success: false, error: 'Slug undangan ini sudah digunakan. Coba ganti yang lain.' };
      }
      event.slug = formattedSlug;
    }

    if (updates.title !== undefined) event.title = updates.title;
    if (updates.event_date !== undefined) event.event_date = updates.event_date;
    if (updates.location !== undefined) event.location = updates.location;
    if (updates.template_id !== undefined) event.template_id = updates.template_id;
    if (updates.cover_image_url !== undefined) event.cover_image_url = updates.cover_image_url;
    if (updates.live_stream_url !== undefined) event.live_stream_url = updates.live_stream_url;
    if (updates.event_password !== undefined) event.event_password = updates.event_password;
    if (updates.rsvp_limit !== undefined) event.rsvp_limit = updates.rsvp_limit;
    if (updates.ab_test_enabled !== undefined) event.ab_test_enabled = updates.ab_test_enabled;
    if (updates.latitude !== undefined) event.latitude = updates.latitude;
    if (updates.longitude !== undefined) event.longitude = updates.longitude;
    if (updates.event_type !== undefined) event.event_type = updates.event_type;
    if (updates.custom_fields !== undefined) event.custom_fields = updates.custom_fields;
    if (updates.music_url !== undefined) event.music_url = updates.music_url;
    if (updates.music_enabled !== undefined) event.music_enabled = updates.music_enabled;
    if (updates.music_title !== undefined) event.music_title = updates.music_title;
    if (updates.maps_iframe !== undefined) event.maps_iframe = updates.maps_iframe;
    if (updates.gallery_photos !== undefined) event.gallery_photos = updates.gallery_photos;

    this.saveJSON('inv_events', this.events);
    this.notify();
    return { success: true };
  }

  public checkinGuest(
    guestId: string,
    checkinPhoto?: string
  ): { success: boolean; guest?: Guest } {
    const guest = this.guests.find((g) => g.id === guestId);
    if (!guest) return { success: false };

    guest.rsvp_status = 'hadir';
    guest.will_attend = true;
    guest.checked_in_at = new Date().toISOString();
    if (checkinPhoto) {
      guest.checkin_photo = checkinPhoto;
    }

    this.saveJSON('inv_guests', this.guests);
    this.notify();
    return { success: true, guest };
  }

  // --- PREMIUM PLAN UPDATE ---

  public upgradePlan(userId: string, code: string): { success: boolean; error?: string } {
    const plan = this.userPlans.find((p) => p.user_id === userId);
    if (!plan) return { success: false, error: 'User plan profile tidak dapat ditemukan.' };

    if (code.trim().toUpperCase() === 'UPGRADE2025' || code.trim() === 'UPGRADE_FREE_TEST_CODE') {
      plan.plan = 'premium';
      plan.max_events = 999999;
      plan.subscription_expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(); // 1 year expiry
      
      this.saveJSON('inv_plans', this.userPlans);
      this.notify();
      return { success: true };
    }

    return { success: false, error: 'Kode upgrade rahasia tidak valid!' };
  }

  public downgradePlan(userId: string) {
    const plan = this.userPlans.find((p) => p.user_id === userId);
    if (plan) {
      plan.plan = 'free';
      plan.max_events = 25;
      plan.subscription_expires_at = null;
      this.saveJSON('inv_plans', this.userPlans);
      this.notify();
    }
  }

  // Helper method to reset the entire database to original preseeded state
  public clearAndPreseed() {
    localStorage.removeItem('inv_profiles');
    localStorage.removeItem('inv_plans');
    localStorage.removeItem('inv_events');
    localStorage.removeItem('inv_guests');
    localStorage.removeItem('inv_rsvp_responses');
    localStorage.removeItem('inv_views');
    localStorage.removeItem('inv_emails');
    this.loadFromStorage();
    this.notify();
  }
}

// Single active instance
export const db = new DBStore();
