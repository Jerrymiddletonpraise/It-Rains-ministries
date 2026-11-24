export const ROLES = ["super_admin", "pastor", "media_team", "finance_team", "department_leader", "moderator"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  pastor: "Pastor",
  media_team: "Media Team",
  finance_team: "Finance Team",
  department_leader: "Department Leader",
  moderator: "Moderator",
};

/** Admin areas and which roles may use them. super_admin always has access. Mirrors the RLS policies in SQL. */
export const PERMISSIONS = {
  overview: ["pastor", "media_team", "finance_team", "department_leader", "moderator"],
  live: ["pastor", "media_team"],
  moderation: ["pastor", "media_team", "moderator"],
  media: ["pastor", "media_team"],
  events: ["pastor", "department_leader"],
  announcements: ["pastor", "department_leader"],
  departments: ["pastor", "department_leader"],
  prayer: ["pastor", "moderator"],
  testimonies: ["pastor", "moderator"],
  messages: ["pastor", "moderator"],
  giving: ["finance_team"],
  newsletter: ["pastor"],
  content: ["pastor"],
  groups: ["pastor", "department_leader"],
  members: ["pastor"],
  roles: [],
  analytics: ["pastor", "media_team", "finance_team"],
} satisfies Record<string, Role[]>;
export type Area = keyof typeof PERMISSIONS;

export function can(roles: Role[], area: Area) {
  if (roles.includes("super_admin")) return true;
  return (PERMISSIONS[area] as Role[]).some((r) => roles.includes(r));
}
