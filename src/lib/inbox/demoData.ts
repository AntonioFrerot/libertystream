export interface InboxMessage {
  id: string;
  from: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
  partnerUserId?: string;
  partnerSlug?: string;
}

export interface InboxNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export const DEMO_MESSAGES: InboxMessage[] = [
  {
    id: "m1",
    from: "NeonWolf",
    avatar: "https://picsum.photos/seed/neonwolf/200/200",
    preview: "Salut ! On collab ce week-end ?",
    time: "2 min",
    unread: true,
  },
  {
    id: "m2",
    from: "IronFist",
    avatar: "https://picsum.photos/seed/ironfist/200/200",
    preview: "Merci pour le tip hier 🔥",
    time: "1h",
    unread: true,
  },
  {
    id: "m3",
    from: "LibertyPlace",
    avatar: "https://picsum.photos/seed/libertyplace/200/200",
    preview: "Bienvenue sur LibertyPlace !",
    time: "2j",
    unread: false,
  },
];

export const DEMO_NOTIFICATIONS: InboxNotification[] = [
  {
    id: "n1",
    title: "Nouveau follower",
    body: "CyberFan42 a commencé à te suivre.",
    time: "5 min",
    unread: true,
  },
  {
    id: "n2",
    title: "Tip reçu",
    body: "NeonGirl t'a envoyé €25.",
    time: "32 min",
    unread: true,
  },
  {
    id: "n3",
    title: "Nouvel abonné",
    body: "LibertyMax s'est abonné à ta chaîne.",
    time: "3h",
    unread: false,
  },
  {
    id: "n4",
    title: "Stream en direct",
    body: "GoldenCards est en live, Slots Marathon.",
    time: "6h",
    unread: false,
  },
];
