/**
 * Official founding story, vision and mission of Global Christian Church,
 * as provided by the church on 2026-11-28. Administrators can still override the
 * pastor's name, photo and biography from the GCC Control Center.
 */
export const FOUNDER_NAME = "CHIEFPRO DON";
export const FOUNDED_ON = "November 25, 2026";
export const FOUNDED_ISO = "2026-11-25";

export const founderIntro =
  "A mighty man of God, a visionary leader, and a servant with a divine assignment to impact the world.";

export const founderStory: string[] = [
  "The vision did not begin with great resources, a large congregation, or the expectation that something extraordinary was about to happen. In fact, it began when it seemed like nothing was going to happen at all.",
  "But something had already been planted deep within his spirit.",
  "It was a vision that came with extraordinary clarity, a vision that could not be ignored or forgotten. Even when there was no visible evidence of what was to come, the vision remained alive within him.",
];

export const founderCalling: string[] = [
  `${FOUNDER_NAME} believes that his calling is to reach humanity, heal the brokenhearted, restore hope to those who have lost their way, and remind people of who they truly are.`,
  "His mission is to help humanity rediscover where they came from, understand the gifts and divine potential God placed within them, and awaken the supernatural power and purpose that they have been given.",
  "He is committed to helping people move beyond pain, limitations, fear, and spiritual confusion into a life of faith, understanding, healing, and purpose.",
];

export const founderQuote =
  "The vision is bigger than one man. It is about transforming lives, restoring humanity, and reminding every individual that they were created with purpose.";

export const beginning: string[] = [
  `The church was officially founded on ${FOUNDED_ON}.`,
  "What began as a vision planted in the spirit became a mission with a purpose: to create a spiritual home where people from every background can find God, experience healing, discover their identity, and grow into their divine purpose.",
  "The church is built on the belief that nobody should be forgotten, nobody should be abandoned, and nobody should feel that their past determines their future.",
  "We welcome everyone, regardless of their background, financial situation, nationality, or life experiences.",
  "This is more than a church building. It is a movement of faith, love, restoration, and spiritual awakening.",
];

export const visionStatement =
  "To create a spiritual home where people from every background can find God, experience healing, discover their identity, and grow into their divine purpose.";
export const missionStatement =
  "To heal hearts, awaken purpose, restore identity, and remind humanity of the extraordinary gifts God has placed within them.";

export type MissionIcon = "heart" | "sunrise" | "fingerprint" | "sparkles" | "book" | "home" | "hand" | "globe" | "unlock";
export const missionPoints: { icon: MissionIcon; title: string; body: string }[] = [
  { icon: "heart", title: "Heal the brokenhearted", body: "Bringing the comfort of God to every wounded heart." },
  { icon: "sunrise", title: "Restore hope to the hopeless", body: "Carrying the light of a new beginning to those who have lost their way." },
  { icon: "fingerprint", title: "Rediscover God-given identity", body: "Helping people remember who they truly are and where they came from." },
  { icon: "sparkles", title: "Awaken gifts and potential", body: "Stirring up the gifts and divine potential God placed within humanity." },
  { icon: "book", title: "Teach the Word of God", body: "Sharing the Word with clarity, depth, faith and understanding." },
  { icon: "home", title: "Bring families together", body: "Uniting families and communities in love, prayer and fellowship." },
  { icon: "hand", title: "Spread love and compassion", body: "Showing love, compassion and understanding to everyone we meet." },
  { icon: "globe", title: "Reach the world digitally", body: "Reaching people across every nation through free digital ministry." },
  { icon: "unlock", title: "Make growth accessible", body: "Making spiritual growth accessible to everyone, whatever their means." },
];

/** Closing message for the homepage, in the church's own words. */
export const worldMessage = {
  headline: "The vision was planted in the spirit before it was ever seen in the world.",
  lines: [
    "What looked like nothing was happening was actually the beginning of something greater.",
    "We are here to heal hearts, awaken purpose, restore identity, and remind humanity of the extraordinary gifts God has placed within them.",
    "This is not just about building a church. It is about answering a calling, transforming lives, and reaching the world.",
  ],
  welcome: ["Welcome to the vision.", "Welcome to the movement.", "Welcome home."],
};

export const freeWorship = {
  headline: "God’s love is free. So is every service.",
  body: "Access to worship should never be restricted by someone’s ability to pay. Watch live services, recorded sermons, worship sessions and teachings from any country, on any phone, tablet, laptop or computer.",
  nos: ["No membership fees", "No subscriptions", "No paywall", "No credit card", "No sign-up to watch"],
};
