"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/** "Notify me when we go live" — Web Push where the browser supports it (Android, desktop, iOS 16.4+ home-screen app). */
export function NotifyButton({ className = "" }: { className?: string }) {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!key || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);
    navigator.serviceWorker.register("/sw.js").then(async (reg) => setOn(Boolean(await reg.pushManager.getSubscription()))).catch(() => setSupported(false));
  }, [key]);
  if (!supported) return null;
  async function toggle() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await fetch("/api/push", { method: "DELETE", body: JSON.stringify({ endpoint: existing.endpoint }) });
        await existing.unsubscribe(); setOn(false);
      } else {
        if ((await Notification.requestPermission()) !== "granted") return;
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key!) });
        await fetch("/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub.toJSON()) });
        setOn(true);
      }
    } finally { setBusy(false); }
  }
  return (
    <button onClick={toggle} disabled={busy} className={`inline-flex items-center gap-2 rounded-full border border-gold-500/60 px-5 py-2.5 text-sm font-semibold text-gold-400 hover:bg-gold-500/10 ${className}`}>
      {on ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}{on ? "Notifications on (turn off)" : "Notify me when we go live"}
    </button>
  );
}
