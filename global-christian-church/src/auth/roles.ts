/** Must match the public.app_role enum in supabase/migrations. */
export const ROLES = [
  "super_admin", "church_admin", "senior_pastor", "pastor", "ministry_leader",
  "media_team", "finance_team", "prayer_team", "volunteer", "member",
] as const;
export type AppRole = (typeof ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Administrator", church_admin: "Church Administrator", senior_pastor: "Senior Pastor",
  pastor: "Pastor", ministry_leader: "Ministry Leader", media_team: "Media Team", finance_team: "Finance Team",
  prayer_team: "Prayer Team", volunteer: "Volunteer", member: "Registered Member",
};

/** Roles that can open the GCC Control Center at all. Each section narrows this further. */
export const STAFF_ROLES: AppRole[] = ["super_admin", "church_admin", "senior_pastor", "pastor", "ministry_leader", "media_team", "finance_team", "prayer_team"];
const ADMIN: AppRole[] = ["super_admin", "church_admin"];
const PASTORAL: AppRole[] = ["super_admin", "church_admin", "senior_pastor", "pastor"];

/** Who may manage each Control Center area. Mirrors the RLS policies; the database is the real gate. */
export const SECTION_ACCESS: Record<string, AppRole[]> = {
  overview: STAFF_ROLES,
  inbox: PASTORAL,
  content: [...ADMIN, "senior_pastor"],
  members: PASTORAL,
  visitors: PASTORAL,
  ministries: [...PASTORAL, "ministry_leader"],
  events: [...PASTORAL, "ministry_leader"],
  sermons: [...PASTORAL, "media_team"],
  media: [...ADMIN, "media_team"],
  streaming: [...ADMIN, "media_team"],
  giving: [...ADMIN, "senior_pastor", "finance_team"],
  prayer: [...PASTORAL, "prayer_team"],
  volunteers: [...PASTORAL, "ministry_leader"],
  notifications: [...ADMIN, "senior_pastor"],
  reports: [...ADMIN, "senior_pastor", "finance_team"],
  integrations: ADMIN,
  settings: ADMIN,
  roles: ["super_admin"],
  audit: ADMIN,
};

export const hasAnyRole = (userRoles: AppRole[], allowed: AppRole[]) => userRoles.some((r) => allowed.includes(r));
