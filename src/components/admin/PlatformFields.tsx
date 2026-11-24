import { inputCls } from "@/components/ui";

type Values = { youtube_url?: string | null; facebook_url?: string | null; instagram_url?: string | null; tiktok_url?: string | null; extra_links?: { label: string; url: string }[] | null };

/** Links to the same broadcast on every platform. Shared by "new broadcast" and "broadcast settings". */
export function PlatformFields({ values = {}, main }: { values?: Values; main?: string }) {
  const extra = (values.extra_links ?? []).map((l) => `${l.label} | ${l.url}`).join("\n");
  return (
    <fieldset className="space-y-3 rounded-2xl border border-navy-900/10 p-4 md:col-span-2">
      <legend className="px-2 text-sm font-semibold">Where else is this service live?</legend>
      <p className="text-xs text-navy-800/60">Paste the live link from each app you stream to. YouTube and Facebook play right on the Watch Live page (viewers can switch between them). Instagram, TikTok and other apps show as &ldquo;Watch on&rdquo; buttons, because those apps don&apos;t allow their live videos inside other websites.</p>
      <label className="block text-sm font-medium">YouTube live link{main === "youtube" && " (main player)"}
        <input name="youtube_url" type="url" required={main === "youtube"} defaultValue={values.youtube_url ?? ""} className={inputCls} placeholder="https://www.youtube.com/live/…" /></label>
      <label className="block text-sm font-medium">Facebook live video link{main === "facebook" && " (main player)"}
        <input name="facebook_url" type="url" required={main === "facebook"} defaultValue={values.facebook_url ?? ""} className={inputCls} placeholder="https://www.facebook.com/yourpage/videos/…" /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium">Instagram live / profile link
          <input name="instagram_url" type="url" defaultValue={values.instagram_url ?? ""} className={inputCls} placeholder="https://www.instagram.com/yourpage/live/" /></label>
        <label className="block text-sm font-medium">TikTok live link
          <input name="tiktok_url" type="url" defaultValue={values.tiktok_url ?? ""} className={inputCls} placeholder="https://www.tiktok.com/@yourpage/live" /></label>
      </div>
      <label className="block text-sm font-medium">Other apps (one per line, as Name | link)
        <textarea name="extra_links" rows={2} defaultValue={extra} className={inputCls} placeholder={"Twitch | https://www.twitch.tv/yourchannel\nX | https://x.com/yourpage"} /></label>
    </fieldset>
  );
}
