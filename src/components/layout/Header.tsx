import { getCurrentStream } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { NavBar } from "./NavBar";

export async function Header() {
  const [stream, session] = await Promise.all([getCurrentStream().catch(() => null), getSession().catch(() => null)]);
  return <NavBar live={stream?.status === "live"} signedIn={Boolean(session?.user)} staff={Boolean(session?.roles.length)} />;
}
