/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Profile {
  id: string; // auth.users UUID
  full_name: string;
  created_at: string;
}

export interface UserPlan {
  user_id: string; // Profile.id
  plan: 'free' | 'premium';
  events_created: number;
  max_events: number;
  subscription_expires_at: string | null;
}

export interface Event {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  event_date: string;
  location: string;
  template_id: 'classic' | 'bunga' | 'modern';
  cover_image_url?: string;
  created_at: string;
  // Premium properties
  live_stream_url?: string;
  event_password?: string;
  rsvp_limit?: number;
  ab_test_enabled?: boolean;
  latitude?: number;
  longitude?: number;
  event_type?: 'wedding' | 'birthday' | 'corporate' | 'aqiqah' | 'webinar_seminar' | 'grand_opening' | 'concert' | 'charity' | 'graduation' | 'arisan' | 'sports' | 'religious' | 'rt_rw' | 'baby_shower' | 'other';
  custom_fields?: Record<string, any>;
  music_url?: string;
  music_enabled?: boolean;
  music_title?: string;
  maps_iframe?: string;
  gallery_photos?: string[];
}

export interface Guest {
  id: string;
  event_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  unique_link: string; // UUID/Random string
  rsvp_status: 'pending' | 'hadir' | 'tidak_hadir';
  will_attend: boolean | null;
  number_of_guests: number;
  message: string | null;
  created_at: string;
  // Premium properties
  checked_in_at?: string;
  checkin_photo?: string; // base64 snapshot string
  guest_photo_url?: string; // photo attached in guest book wish
  visited_device?: string; // desktop or mobile
  viewed_template?: 'classic' | 'bunga' | 'modern'; // A/B test view
}

export interface RsvpResponse {
  id: string;
  guest_id: string;
  old_status: string;
  new_status: string;
  changed_at: string;
}

export interface InvitationView {
  id: string;
  guest_id: string;
  viewed_at: string;
  ip_address?: string;
  user_agent?: string;
  cityName?: string;
  countryName?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface SimulatedEmail {
  id: string;
  event_id: string;
  recipient_email: string;
  guest_name: string;
  rsvp_status: 'hadir' | 'tidak_hadir' | 'pending';
  number_of_guests: number;
  message: string | null;
  subject: string;
  body_html: string;
  sent_at: string;
  status: 'sent' | 'delivered';
}

export type ThemeType = 'classic' | 'bunga' | 'modern';
