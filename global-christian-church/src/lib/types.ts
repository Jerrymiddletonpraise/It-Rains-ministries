export type MediaKind = "video_sermon" | "audio_sermon" | "podcast" | "bible_teaching" | "worship" | "conference";

export interface Sermon {
  id: string; title: string; slug: string; speaker: string | null; scripture_reference: string | null;
  description: string | null; kind: MediaKind; series: string | null; category: string | null;
  video_url: string | null; audio_url: string | null; thumbnail_url: string | null; notes_url: string | null;
  preached_on: string | null; duration_minutes: number | null; is_featured: boolean;
}
export interface Ministry {
  id: string; slug: string; name: string; summary: string | null; description: string | null;
  audience: string | null; meeting_info: string | null; image_url: string | null; contact_email: string | null; sort_order: number;
}
export interface ChurchEvent {
  id: string; slug: string; title: string; description: string | null; starts_at: string; ends_at: string | null;
  location: string | null; online_url: string | null; image_url: string | null; ministry_id: string | null;
  registration_required: boolean; capacity: number | null; is_recurring: boolean; recurrence_rule: string | null;
}
export interface Testimony { id: string; author_name: string; title: string | null; body: string; location: string | null; created_at: string; }
export interface Leader { id: string; name: string; title: string; bio: string | null; photo_url: string | null; sort_order: number; }
export interface Devotional { id: string; title: string; scripture_reference: string | null; scripture_text: string | null; body: string; author: string | null; publish_on: string; }
export interface Resource { id: string; title: string; description: string | null; category: string; file_url: string | null; external_url: string | null; is_members_only: boolean; }
export interface Faq { id: string; question: string; answer: string; category: string | null; sort_order: number; }
export interface Broadcast {
  id: string; title: string; description: string | null; scheduled_start: string; scheduled_end: string | null;
  status: "scheduled" | "live" | "ended" | "cancelled"; embed_url: string | null; scripture_reference: string | null; scripture_text: string | null; chat_enabled?: boolean;
}
export interface GivingCampaign { id: string; slug: string; title: string; description: string | null; goal_amount_cents: number | null; category: string; image_url: string | null; ends_on: string | null; }
