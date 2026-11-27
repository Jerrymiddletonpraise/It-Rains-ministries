export interface NavItem { label: string; to: string; description?: string; }
export interface NavGroup { label: string; items: NavItem[]; }

export const navGroups: NavGroup[] = [
  { label: "About", items: [
    { label: "About GCC", to: "/about", description: "Who we are" },
    { label: "Vision and Mission", to: "/vision-mission", description: "Why we exist" },
    { label: "What We Believe", to: "/beliefs", description: "Our statement of faith" },
    { label: "Leadership", to: "/leadership", description: "Our pastors and leaders" },
    { label: "FAQ", to: "/faq", description: "Common questions" },
  ] },
  { label: "Watch", items: [
    { label: "GCC Worldwide Live", to: "/watch", description: "Join the live broadcast" },
    { label: "Sermon Library", to: "/sermons", description: "Messages on demand" },
    { label: "Podcasts", to: "/podcasts", description: "Listen anywhere" },
  ] },
  { label: "Connect", items: [
    { label: "Plan Your Visit", to: "/visit", description: "First-time visitors" },
    { label: "Ministries", to: "/ministries", description: "Find your place" },
    { label: "Events and Calendar", to: "/events", description: "What’s coming up" },
    { label: "Become a Member", to: "/membership", description: "Join the family" },
    { label: "Volunteer", to: "/volunteer", description: "Serve with us" },
    { label: "Testimonies", to: "/testimonies", description: "Stories of faith" },
    { label: "Contact Us", to: "/contact", description: "Get in touch" },
  ] },
  { label: "Grow", items: [
    { label: "Online Bible and Resources", to: "/resources", description: "Read, study, grow" },
    { label: "Daily Devotionals", to: "/devotionals", description: "A word for today" },
    { label: "Prayer Request Center", to: "/prayer", description: "We will pray with you" },
  ] },
];

export const footerLegal: NavItem[] = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms and Conditions", to: "/terms" },
];
