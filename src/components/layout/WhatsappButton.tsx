import { getSetting } from "@/lib/data";
import { WhatsappIcon } from "@/components/ui/SocialIcons";
import { FooterGate } from "./FooterGate";

export async function WhatsappButton() {
  const contact = await getSetting("contact");
  const num = contact.whatsapp?.replace(/\D/g, "");
  if (!num) return null;
  return (
    <FooterGate>
      <a href={`https://wa.me/${num}?text=${encodeURIComponent("Hello IT RAINS MINISTRIES, ")}`} target="_blank" rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105">
        <WhatsappIcon className="h-7 w-7" />
      </a>
    </FooterGate>
  );
}
