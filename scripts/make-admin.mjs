// Grants the Super Admin role to an existing account.
// Usage: node --env-file=.env.local scripts/make-admin.mjs someone@example.org
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
if (!email) { console.error("Usage: node --env-file=.env.local scripts/make-admin.mjs <email>"); process.exit(1); }
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: id, error } = await db.rpc("user_id_by_email", { e: email });
if (error || !id) { console.error("No account found for", email, "— register on the website first.", error?.message ?? ""); process.exit(1); }
const { error: e2 } = await db.from("user_roles").upsert({ user_id: id, role: "super_admin" });
if (e2) { console.error(e2.message); process.exit(1); }
console.log(`✓ ${email} is now a Super Admin. Sign in and open /admin.`);
