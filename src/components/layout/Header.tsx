import { getCurrentStream, getSetting } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { detectYoutubeLive } from "@/lib/youtube";
import { NavBar } from "./NavBar";

export async function Header() {
  const [stream, session, social] = await Promise.all([getCurrentStream().catch(() => null), getSession().catch(() => null), getSetting("social").catch(() => null)]);
  const live = stream?.status === "live" || Boolean(await detectYoutubeLive(social?.youtube).catch(() => null));
  return <NavBar live={live} signedIn={Boolean(session?.user)} staff={Boolean(session?.roles.length)} />;
}
