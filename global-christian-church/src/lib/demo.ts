/**
 * DEMONSTRATION CONTENT
 * Everything here is sample content shown only until the church publishes official records in Supabase.
 * Every component that renders it shows a visible "Demo content" label. Nothing here describes a real
 * person, address, history or doctrinal statement of Global Christian Church.
 */
import type { Broadcast, ChurchEvent, Devotional, Faq, GivingCampaign, Leader, Ministry, Resource, Sermon, Testimony } from "./types";

const day = 86_400_000;
const at = (offsetDays: number, hour: number, minute = 0) => {
  const d = new Date(Date.now() + offsetDays * day); d.setHours(hour, minute, 0, 0); return d.toISOString();
};
const nextWeekday = (weekday: number, hour: number) => {
  const d = new Date(); d.setHours(hour, 0, 0, 0);
  const diff = (weekday - d.getDay() + 7) % 7; d.setDate(d.getDate() + (diff === 0 && d.getTime() < Date.now() ? 7 : diff));
  return d.toISOString();
};

export const demoSermons: Sermon[] = [
  { id: "d-s1", slug: "demo-faith-that-reaches", title: "Faith That Reaches the Nations", speaker: "Demo Speaker", scripture_reference: "Matthew 28:19-20", description: "Sample sermon entry used to preview the sermon library layout.", kind: "video_sermon", series: "Demo Series: Go", category: "Mission", video_url: null, audio_url: null, thumbnail_url: null, notes_url: null, preached_on: at(-3, 10), duration_minutes: 46, is_featured: true },
  { id: "d-s2", slug: "demo-one-family", title: "One Family, Many Nations", speaker: "Demo Speaker", scripture_reference: "Ephesians 4:1-6", description: "Sample sermon entry used to preview the sermon library layout.", kind: "video_sermon", series: "Demo Series: Together", category: "Unity", video_url: null, audio_url: null, thumbnail_url: null, notes_url: null, preached_on: at(-10, 10), duration_minutes: 41, is_featured: true },
  { id: "d-s3", slug: "demo-the-lord-is-my-shepherd", title: "The Lord Is My Shepherd", speaker: "Demo Speaker", scripture_reference: "Psalm 23", description: "Sample audio teaching used to preview audio playback layout.", kind: "audio_sermon", series: null, category: "Comfort", video_url: null, audio_url: null, thumbnail_url: null, notes_url: null, preached_on: at(-17, 10), duration_minutes: 38, is_featured: true },
  { id: "d-s4", slug: "demo-worship-night", title: "Worship Night (Recording)", speaker: "Demo Worship Team", scripture_reference: "Psalm 100", description: "Sample worship recording entry.", kind: "worship", series: null, category: "Worship", video_url: null, audio_url: null, thumbnail_url: null, notes_url: null, preached_on: at(-24, 19), duration_minutes: 72, is_featured: false },
  { id: "d-s5", slug: "demo-bible-teaching-romans", title: "Walking Through Romans: Part 1", speaker: "Demo Teacher", scripture_reference: "Romans 1:16-17", description: "Sample Bible teaching entry.", kind: "bible_teaching", series: "Demo Series: Romans", category: "Bible Study", video_url: null, audio_url: null, thumbnail_url: null, notes_url: null, preached_on: at(-31, 19), duration_minutes: 55, is_featured: false },
  { id: "d-s6", slug: "demo-conference-session", title: "Conference Session One", speaker: "Demo Guest Speaker", scripture_reference: "Acts 1:8", description: "Sample conference recording entry.", kind: "conference", series: "Demo Conference", category: "Conference", video_url: null, audio_url: null, thumbnail_url: null, notes_url: null, preached_on: at(-45, 18), duration_minutes: 64, is_featured: false },
  { id: "d-p1", slug: "demo-podcast-episode-1", title: "Podcast Episode 1: Starting Strong", speaker: "Demo Host", scripture_reference: "Proverbs 3:5-6", description: "Sample podcast episode entry.", kind: "podcast", series: "Demo Podcast", category: "Podcast", video_url: null, audio_url: null, thumbnail_url: null, notes_url: null, preached_on: at(-5, 7), duration_minutes: 28, is_featured: false },
  { id: "d-p2", slug: "demo-podcast-episode-2", title: "Podcast Episode 2: Prayer in Daily Life", speaker: "Demo Host", scripture_reference: "Philippians 4:6-7", description: "Sample podcast episode entry.", kind: "podcast", series: "Demo Podcast", category: "Podcast", video_url: null, audio_url: null, thumbnail_url: null, notes_url: null, preached_on: at(-12, 7), duration_minutes: 31, is_featured: false },
];

const ministryNames: [string, string, string][] = [
  ["Children’s Ministry", "Children and families", "Helping children discover the love of God in a safe, joyful environment."],
  ["Youth Ministry", "Teens", "A place for teenagers to grow in faith, friendship and purpose."],
  ["Young Adults", "Ages 18 to 30", "Community, discipleship and leadership for the next generation."],
  ["Men’s Ministry", "Men", "Brotherhood, accountability and spiritual growth for men."],
  ["Women’s Ministry", "Women", "Fellowship, Bible study and encouragement for women."],
  ["Marriage and Family", "Couples and families", "Strengthening marriages and homes through teaching and support."],
  ["Worship Ministry", "Singers, musicians, creatives", "Leading the church in worship through music and the arts."],
  ["Evangelism", "Everyone", "Sharing the good news of Jesus Christ locally and online."],
  ["Missions", "Everyone", "Supporting and sending mission work around the world."],
  ["Prayer Ministry", "Everyone", "Standing in prayer for the church, the community and the nations."],
  ["Media Ministry", "Creatives and technicians", "Broadcasting worship and the Word to a worldwide audience."],
  ["Community Outreach", "Everyone", "Serving neighbours in practical ways with compassion."],
  ["Pastoral Care", "Anyone in need", "Care, counsel and support in every season of life."],
];
export const demoMinistries: Ministry[] = ministryNames.map(([name, audience, summary], i) => ({
  id: `d-m${i}`, slug: name.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  name, audience, summary, description: `${summary} This description is demonstration content; the ministry leader can replace it from the Control Center.`,
  meeting_info: null, image_url: null, contact_email: null, sort_order: i,
}));

export const demoEvents: ChurchEvent[] = [
  { id: "d-e1", slug: "demo-sunday-worship", title: "Sunday Worship Service", description: "Demo recurring service. Official service times will be published by the church.", starts_at: nextWeekday(0, 10), ends_at: null, location: "Location to be announced", online_url: "/watch", image_url: null, ministry_id: null, registration_required: false, capacity: null, is_recurring: true, recurrence_rule: "FREQ=WEEKLY;BYDAY=SU" },
  { id: "d-e2", slug: "demo-midweek-bible-study", title: "Midweek Bible Study", description: "Demo recurring Bible study.", starts_at: nextWeekday(3, 19), ends_at: null, location: "Online", online_url: "/watch", image_url: null, ministry_id: null, registration_required: false, capacity: null, is_recurring: true, recurrence_rule: "FREQ=WEEKLY;BYDAY=WE" },
  { id: "d-e3", slug: "demo-prayer-night", title: "Night of Prayer", description: "Demo special event.", starts_at: at(9, 19), ends_at: null, location: "Location to be announced", online_url: null, image_url: null, ministry_id: null, registration_required: true, capacity: 200, is_recurring: false, recurrence_rule: null },
  { id: "d-e4", slug: "demo-youth-gathering", title: "Youth Gathering", description: "Demo ministry event.", starts_at: at(14, 18), ends_at: null, location: "Location to be announced", online_url: null, image_url: null, ministry_id: "d-m1", registration_required: true, capacity: 80, is_recurring: false, recurrence_rule: null },
  { id: "d-e5", slug: "demo-outreach-day", title: "Community Outreach Day", description: "Demo outreach event.", starts_at: at(21, 9), ends_at: null, location: "Location to be announced", online_url: null, image_url: null, ministry_id: "d-m11", registration_required: true, capacity: null, is_recurring: false, recurrence_rule: null },
];

export const demoTestimonies: Testimony[] = [
  { id: "d-t1", author_name: "Demo Member", title: "Found a family online", body: "This is a sample testimony used to preview the layout. Real testimonies appear here once members share them and the church approves them.", location: "Demo City", created_at: at(-4, 12) },
  { id: "d-t2", author_name: "Demo Visitor", title: "Prayer answered", body: "Sample testimony text. Every published testimony is reviewed by the church before it is shown publicly.", location: "Demo City", created_at: at(-11, 12) },
  { id: "d-t3", author_name: "Demo Volunteer", title: "Serving with joy", body: "Sample testimony text demonstrating how stories of faith will be presented on the website.", location: "Demo City", created_at: at(-20, 12) },
];

export const demoLeaders: Leader[] = [
  { id: "d-l1", name: "Leader name awaiting church", title: "Pastor", bio: "Demo placeholder. Leadership profiles are managed from the Control Center.", photo_url: null, sort_order: 1 },
  { id: "d-l2", name: "Leader name awaiting church", title: "Ministry Leader", bio: "Demo placeholder. Leadership profiles are managed from the Control Center.", photo_url: null, sort_order: 2 },
  { id: "d-l3", name: "Leader name awaiting church", title: "Worship Leader", bio: "Demo placeholder. Leadership profiles are managed from the Control Center.", photo_url: null, sort_order: 3 },
];

// Scripture quotations below are from the King James Version (public domain).
export const demoDevotionals: Devotional[] = [
  { id: "d-dv1", title: "Trust in Every Season", scripture_reference: "Proverbs 3:5-6 (KJV)", scripture_text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.", body: "Demo devotional text. The church’s devotional writers will publish daily devotionals here.", author: "Demo Author", publish_on: at(0, 6) },
  { id: "d-dv2", title: "Strength for Today", scripture_reference: "Isaiah 40:31 (KJV)", scripture_text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", body: "Demo devotional text used to preview the layout.", author: "Demo Author", publish_on: at(-1, 6) },
  { id: "d-dv3", title: "Peace Beyond Understanding", scripture_reference: "Philippians 4:6-7 (KJV)", scripture_text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.", body: "Demo devotional text used to preview the layout.", author: "Demo Author", publish_on: at(-2, 6) },
];

export const demoResources: Resource[] = [
  { id: "d-r1", title: "Bible Reading Plan (Demo)", description: "Sample reading plan resource.", category: "Reading plans", file_url: null, external_url: null, is_members_only: false },
  { id: "d-r2", title: "New Believers Guide (Demo)", description: "Sample discipleship course resource.", category: "Discipleship courses", file_url: null, external_url: null, is_members_only: false },
  { id: "d-r3", title: "Small Group Study Guide (Demo)", description: "Sample Bible study guide.", category: "Bible study guides", file_url: null, external_url: null, is_members_only: false },
  { id: "d-r4", title: "Family Devotions Pack (Demo)", description: "Sample family resource.", category: "Family resources", file_url: null, external_url: null, is_members_only: false },
  { id: "d-r5", title: "Leadership Training Module (Demo)", description: "Sample leadership training resource.", category: "Leadership training", file_url: null, external_url: null, is_members_only: true },
  { id: "d-r6", title: "E-book Sample (Demo)", description: "Sample e-book resource.", category: "E-books", file_url: null, external_url: null, is_members_only: true },
];

export const demoFaqs: Faq[] = [
  { id: "d-f1", question: "How can I watch services online?", answer: "Visit the Watch Live page. When the media team starts a broadcast, it plays right on this website, and recordings appear in the Sermon Library.", category: "Online", sort_order: 1 },
  { id: "d-f2", question: "How do I submit a prayer request?", answer: "Use the Prayer Request Center. You can choose to keep your request private, so only the prayer team and pastors can read it.", category: "Prayer", sort_order: 2 },
  { id: "d-f3", question: "Is online giving secure?", answer: "Payments are processed by Stripe or PayPal. Card details never touch this website’s servers. Online giving is not yet active and will open after the church approves it.", category: "Giving", sort_order: 3 },
  { id: "d-f4", question: "How do I become a member?", answer: "Create an account and complete the Become a Member form. A church administrator will follow up with next steps.", category: "Membership", sort_order: 4 },
  { id: "d-f5", question: "Where is the church located and when are services?", answer: "Official location and service times have not been published yet. They will appear on the Contact and First-Time Visitors pages once the church provides them.", category: "Visiting", sort_order: 5 },
];

export const demoBroadcast: Broadcast = {
  id: "d-b1", title: "Sunday Worship Service (Demo schedule)", description: "Demo broadcast entry. The media team schedules real broadcasts from the Control Center.",
  scheduled_start: nextWeekday(0, 10), scheduled_end: null, status: "scheduled", embed_url: null,
  scripture_reference: "Psalm 100:4 (KJV)", scripture_text: "Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.",
};

export const demoCampaigns: GivingCampaign[] = [
  { id: "d-c1", slug: "demo-missions", title: "Missions Outreach (Demo)", description: "Sample campaign page preview.", goal_amount_cents: null, category: "missions", image_url: null, ends_on: null },
  { id: "d-c2", slug: "demo-building", title: "Building Fund (Demo)", description: "Sample campaign page preview.", goal_amount_cents: null, category: "building_fund", image_url: null, ends_on: null },
];
