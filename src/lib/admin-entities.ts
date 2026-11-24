import type { Area } from "@/lib/roles";
import { MEDIA_CATEGORIES } from "@/lib/utils";

export type FieldType = "text" | "textarea" | "number" | "bool" | "datetime" | "date" | "select" | "list" | "image" | "file" | "url";
export type FieldDef = {
  name: string; label: string; type: FieldType; required?: boolean; options?: Record<string, string>; hint?: string;
  bucket?: "public-assets" | "media"; accept?: string; default?: string | number | boolean; full?: boolean;
};
export type EntityDef = {
  table: string; area: Area; label: string; singular: string; order: { column: string; ascending: boolean };
  columns: { name: string; label: string; type?: "bool" | "datetime" | "date" | "select" }[];
  fields: FieldDef[]; slugFrom?: string; publicPath?: (row: Record<string, unknown>) => string;
};

export const ENTITIES: Record<string, EntityDef> = {
  media: {
    table: "media_items", area: "media", label: "Sermons & Media", singular: "media item", order: { column: "created_at", ascending: false }, slugFrom: "title",
    publicPath: (r) => `/sermons/${r.slug}`,
    columns: [{ name: "title", label: "Title" }, { name: "category", label: "Category", type: "select" }, { name: "preached_on", label: "Date", type: "date" }, { name: "published", label: "Published", type: "bool" }, { name: "featured", label: "Featured", type: "bool" }, { name: "views", label: "Views" }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true },
      { name: "category", label: "Category", type: "select", options: MEDIA_CATEGORIES, required: true },
      { name: "media_type", label: "Type", type: "select", options: { video: "Video", audio: "Audio", document: "Document / download" }, required: true },
      { name: "speaker", label: "Speaker / preacher", type: "text" },
      { name: "preached_on", label: "Date", type: "date" },
      { name: "scripture", label: "Scripture reference", type: "text" },
      { name: "duration_minutes", label: "Duration (minutes)", type: "number" },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "video_url", label: "Video: YouTube/Vimeo link or upload", type: "file", bucket: "media", accept: "video/*", hint: "Paste a YouTube or Vimeo link, or upload an MP4.", full: true },
      { name: "audio_url", label: "Audio: link or upload (MP3)", type: "file", bucket: "media", accept: "audio/*", full: true },
      { name: "file_path", label: "Downloadable resource (PDF, slides…)", type: "file", bucket: "media", accept: ".pdf,.doc,.docx,.ppt,.pptx,.zip,.epub", hint: "Shown as a Download button.", full: true },
      { name: "thumbnail_url", label: "Thumbnail image", type: "image", bucket: "public-assets", full: true },
      { name: "published", label: "Published", type: "bool", default: true },
      { name: "featured", label: "Featured sermon", type: "bool" },
      { name: "members_only", label: "Members only", type: "bool" },
    ],
  },
  events: {
    table: "events", area: "events", label: "Events", singular: "event", order: { column: "starts_at", ascending: false }, slugFrom: "title",
    publicPath: (r) => `/events/${r.slug}`,
    columns: [{ name: "title", label: "Title" }, { name: "starts_at", label: "Starts", type: "datetime" }, { name: "category", label: "Category" }, { name: "capacity", label: "Capacity" }, { name: "published", label: "Published", type: "bool" }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true },
      { name: "category", label: "Category", type: "select", options: { program: "Church program", conference: "Conference", revival: "Revival meeting", "worship night": "Special worship night", "prayer retreat": "Prayer retreat", "bible conference": "Bible conference", youth: "Youth program", online: "Online event" }, required: true },
      { name: "timezone", label: "Time zone (IANA, e.g. Africa/Lagos, America/New_York)", type: "text", default: "UTC", required: true },
      { name: "starts_at", label: "Starts", type: "datetime", required: true },
      { name: "ends_at", label: "Ends", type: "datetime" },
      { name: "summary", label: "Short summary", type: "text", full: true },
      { name: "description", label: "Full description", type: "textarea", full: true },
      { name: "is_online", label: "Online event", type: "bool" },
      { name: "online_url", label: "Online link (sent to registrants)", type: "url" },
      { name: "location", label: "Venue / address", type: "text" },
      { name: "map_query", label: "Google Maps search (optional)", type: "text" },
      { name: "capacity", label: "Registration limit (blank = unlimited)", type: "number" },
      { name: "image_url", label: "Banner image", type: "image", bucket: "public-assets", full: true },
      { name: "registration_open", label: "Registration open", type: "bool", default: true },
      { name: "published", label: "Published", type: "bool", default: true },
    ],
  },
  announcements: {
    table: "announcements", area: "announcements", label: "Announcements", singular: "announcement", order: { column: "created_at", ascending: false },
    columns: [{ name: "title", label: "Title" }, { name: "pinned", label: "Pinned", type: "bool" }, { name: "members_only", label: "Members", type: "bool" }, { name: "published", label: "Published", type: "bool" }, { name: "expires_at", label: "Expires", type: "datetime" }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, full: true },
      { name: "body", label: "Message", type: "textarea", required: true, full: true },
      { name: "link_url", label: "Link (optional)", type: "url" },
      { name: "expires_at", label: "Hide after", type: "datetime" },
      { name: "pinned", label: "Pin to top", type: "bool" },
      { name: "members_only", label: "Members only", type: "bool" },
      { name: "published", label: "Published", type: "bool", default: true },
    ],
  },
  departments: {
    table: "departments", area: "departments", label: "Ministry Departments", singular: "department", order: { column: "sort_order", ascending: true }, slugFrom: "name",
    publicPath: (r) => `/ministries/${r.slug}`,
    columns: [{ name: "name", label: "Name" }, { name: "leader_name", label: "Leader" }, { name: "schedule", label: "Schedule" }, { name: "published", label: "Published", type: "bool" }],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, full: true },
      { name: "summary", label: "Short summary", type: "text", full: true },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "activities", label: "Activities (one per line)", type: "list", full: true },
      { name: "schedule", label: "Schedule", type: "text" },
      { name: "leader_name", label: "Leader", type: "text" },
      { name: "contact_email", label: "Contact email", type: "text" },
      { name: "contact_phone", label: "Contact phone", type: "text" },
      { name: "sort_order", label: "Display order", type: "number", default: 0 },
      { name: "image_url", label: "Image", type: "image", bucket: "public-assets", full: true },
      { name: "published", label: "Published", type: "bool", default: true },
    ],
  },
  groups: {
    table: "groups", area: "groups", label: "Online Groups", singular: "group", order: { column: "name", ascending: true },
    columns: [{ name: "name", label: "Name" }, { name: "meeting_info", label: "Meets" }],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, full: true },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "meeting_info", label: "Meeting info (e.g. Tuesdays 7pm on Zoom)", type: "text", full: true },
    ],
  },
};
