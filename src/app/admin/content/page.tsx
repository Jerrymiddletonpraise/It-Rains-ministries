import { requireArea } from "@/lib/auth";
import { getSetting } from "@/lib/data";
import { AdminHeader } from "@/components/admin/ui";
import { SettingsForm, ServicesForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function ContentAdmin() {
  await requireArea("content");
  const [home, about, contact, social, services] = await Promise.all([getSetting("home"), getSetting("about"), getSetting("contact"), getSetting("social"), getSetting("services")]);
  return (
    <>
      <AdminHeader title="Website content" intro="Edit the homepage, pastor's welcome, about pages, contact details, social links and service times." />
      <div className="space-y-8">
        <SettingsForm k="home" title="Homepage & pastor" values={home} labels={{ hero_title: "Hero title", hero_subtitle: "Tagline", hero_image_url: "Hero background image", pastor_name: "Pastor's name", pastor_title: "Pastor's title", pastor_photo_url: "Pastor's photo", pastor_message: "Welcome message", pastor_bio: "Pastor's biography" }} long={["pastor_message", "pastor_bio"]} images={["hero_image_url", "pastor_photo_url"]} />
        <SettingsForm k="about" title="About, vision & mission" values={about} labels={{ story: "Our story", vision: "Vision", mission: "Mission", values: "Core values (one per line)" }} long={["story", "vision", "mission", "values"]} />
        <SettingsForm k="contact" title="Contact details" values={contact} labels={{ email: "Email", phone: "Phone", whatsapp: "WhatsApp number (international format, digits only)", address: "Church address", map_query: "Google Maps search text", office_hours: "Office hours" }} />
        <SettingsForm k="social" title="Social media links" values={social} labels={{ facebook: "Facebook page URL", youtube: "YouTube channel URL (e.g. https://www.youtube.com/@yourchurch). The Watch Live page plays it automatically whenever this channel is live", instagram: "Instagram URL", tiktok: "TikTok URL", x: "X (Twitter) URL", whatsapp_channel: "WhatsApp channel URL", telegram: "Telegram channel URL" }} />
        <ServicesForm services={services} />
      </div>
    </>
  );
}
