export type PhotoVariant =
  | "cafe"
  | "sunset"
  | "rain"
  | "roadtrip"
  | "cozy"
  | "dance"
  | "bookstore"
  | "cherry-blossom"
  | "beach-picnic"
  | "city-night"
  | "rooftop"
  | "flower-market"
  | "autumn"
  | "arcade"
  | "mountain"
  | "sunday-morning";

export type Accent = "pink" | "lavender" | "butter" | "mint";

export interface Memory {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  caption: string;
  detail: string;
  photo: PhotoVariant;
  accent: Accent;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  answer: string;
  correctReaction: string;
  wrongReaction: string;
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  serial: string;
  accent: Accent;
}

export interface FinalLetter {
  eyebrow: string;
  title: string;
  subtitle: string;
  tapHint: string;
  salutation: string;
  paragraphs: string[];
  signature: string;
  signatureName: string;
  postscript: string;
  question: string;
  yesLabel: string;
  thinkLabel: string;
  thinkingNotes: string[];
  acceptAfterThinkingLabel: string;
  celebration: {
    flag: string;
    title: string;
    subtitle: string;
    note: string;
  };
}

export interface SecretMessage {
  id: string;
  text: string;
  x: number;
  y: number;
}

export interface LovelyContent {
  sender: string;
  recipient: string;
  tagline: string;
  invitation: {
    eyebrow: string;
    title: string;
    subtitle: string;
    hint: string;
    cta: string;
    note: string;
  };
  memories: Memory[];
  quiz: QuizQuestion[];
  coupons: Coupon[];
  compliments: string[];
  reasons: string[];
  secretMessages: SecretMessage[];
  emergencyNote: string;
  finalLetter: FinalLetter;
}

export const defaultEmergencyNote =
  "If you're having a hard day, come back to this page. You are loved on the good days, the quiet days, and the days you don't feel like yourself. Especially those.";

export const lovelyContent: LovelyContent = {
  sender: "Alex",
  recipient: "Mia",
  tagline: "A little website, a lot of love.",
  invitation: {
    eyebrow: "A little something for you",
    title: "Someone has something for you...",
    subtitle:
      "A tiny corner of the internet, folded up like a love note and tied with a pink ribbon.",
    hint: "psst... it's from someone who really, really likes you.",
    cta: "Open your surprise",
    note: "Sealed with a strawberry heart. Best opened with a smile.",
  },
  memories: [
    {
      id: "the-day-we-met",
      date: "September 14, 2022",
      title: "The day we met",
      excerpt: "You laughed at my terrible joke. That was the whole beginning.",
      caption:
        "You laughed at the joke nobody else laughed at, and I spent the rest of the night trying to think of another one. I don't think I've stopped trying since.",
      detail:
        "I ordered the wrong drink on purpose just so I'd have a reason to come back to the counter. You noticed. You still let me pretend it was an accident.",
      photo: "cafe",
      accent: "pink",
    },
    {
      id: "first-date",
      date: "October 2, 2022",
      title: "Our first date",
      excerpt: "Two coffees, three hours, and a walk that took the long way home.",
      caption:
        "We said we'd just grab a coffee. We stayed until the cafe turned the lights down, then walked the long way home because neither of us wanted the evening to end.",
      detail:
        "You held your cup with both hands the entire time. I remember thinking: that's it, that's my favorite person, right there.",
      photo: "sunset",
      accent: "butter",
    },
    {
      id: "rainy-afternoon",
      date: "March 18, 2023",
      title: "The rainy afternoon",
      excerpt: "We missed the bus on purpose. Or at least, we pretended to.",
      caption:
        "One umbrella, two soaked shoulders, and the best afternoon I'd had in months. We missed the bus and honestly, I've never been happier to be late for anything.",
      detail:
        "You did the thing where you tilt the umbrella toward me and get your whole left side wet. You said you didn't notice. I absolutely noticed.",
      photo: "rain",
      accent: "lavender",
    },
    {
      id: "first-trip",
      date: "July 9, 2023",
      title: "Our first little trip",
      excerpt: "You packed snacks for a whole week. I packed one charger.",
      caption:
        "The windows were down, the playlist was questionable, and the road went somewhere neither of us had been. I remember looking over and thinking: this is what happy feels like.",
      detail:
        "You made a whole spreadsheet of places to stop. We ignored it entirely and found a diner with the world's best pancakes. You were right about being flexible, even if you'd never admit it.",
      photo: "roadtrip",
      accent: "mint",
    },
    {
      id: "kitchen-dance",
      date: "November 12, 2024",
      title: "The kitchen dance",
      excerpt: "No music for the first ten seconds. Then you hummed.",
      caption:
        "You came in with the grocery bags, kicked off your shoes, and held out your hand like we were somewhere much fancier than our kitchen. It's still my favorite place to dance.",
      detail:
        "There was pasta on the stove and a playlist on my phone that skipped every good song. We didn't care. We stayed there until the sauce got a little too close to the bottom of the pan.",
      photo: "dance",
      accent: "pink",
    },
    {
      id: "ordinary-tuesday",
      date: "January 23, 2025",
      title: "Just an ordinary Tuesday",
      excerpt: "You fell asleep on my shoulder. I didn't move for an hour.",
      caption:
        "Nothing happened that day. That's exactly why I love it. You fell asleep halfway through a movie, and I stayed very still so I wouldn't wake you.",
      detail:
        "I never told you that I missed the entire ending. I still don't know how it finishes. I'd choose the same ending every time.",
      photo: "cozy",
      accent: "lavender",
    },
  ],
  quiz: [
    {
      id: "favorite-food",
      prompt: "What's my favorite food?",
      options: [
        { id: "sushi", text: "Sushi, always" },
        { id: "pasta", text: "Pasta. Any shape, any time" },
        { id: "tacos", text: "Tacos on a Friday" },
        { id: "yours", text: "Whatever you're eating" },
      ],
      answer: "pasta",
      correctReaction:
        "Pasta! Specifically the kind you make. The best part is always eating it with you, though.",
      wrongReaction:
        "Close, but it's pasta. I'll let it slide, but only because you're cute when you guess.",
    },
    {
      id: "dream-trip",
      prompt: "Where would I most love to travel with you?",
      options: [
        { id: "kyoto", text: "Kyoto in cherry blossom season" },
        { id: "cabin", text: "A cabin with no wifi and a very big blanket" },
        { id: "paris", text: "Paris, to be insufferable about it" },
        { id: "beach", text: "Anywhere with a beach and a snack" },
      ],
      answer: "cabin",
      correctReaction:
        "A cabin with no wifi, no plans, and a truly unreasonable number of blankets. You know me a little too well.",
      wrongReaction:
        "Tempting! But honestly: a cabin, no wifi, and nowhere to be. You, a blanket, and a very slow morning.",
    },
    {
      id: "catchphrase",
      prompt: "What phrase do I use way too much?",
      options: [
        { id: "episode", text: '"One more episode?"' },
        { id: "hungry", text: '"I\'m hungry."' },
        { id: "cat", text: '"We should get a cat."' },
        { id: "five-min", text: '"I\'m five minutes away."' },
      ],
      answer: "hungry",
      correctReaction:
        "Guilty. I say it approximately every forty-five minutes. You've started packing snacks preemptively.",
      wrongReaction:
        "Plot twist: it's \"I'm hungry.\" I say it constantly. You're a saint for feeding me.",
    },
    {
      id: "favorite-memory",
      prompt: "What's my favorite memory of us?",
      options: [
        { id: "rain", text: "The rainy walk with one umbrella" },
        { id: "party", text: "That party where we hid in the kitchen" },
        { id: "first-date", text: "Our first date that lasted all evening" },
        { id: "ordinary", text: "An ordinary Tuesday doing nothing at all" },
      ],
      answer: "ordinary",
      correctReaction:
        "The ordinary Tuesday. That's the thing about us: even the boring days feel like something worth keeping.",
      wrongReaction:
        "Those are all top ten. But the winner is the ordinary Tuesday. You, me, a bad movie, and nowhere else to be.",
    },
    {
      id: "makes-me-smile",
      prompt: "What's one thing that always makes me smile?",
      options: [
        { id: "singing", text: "Your terrible singing in the car" },
        { id: "texts", text: "Your good morning texts" },
        { id: "cooking", text: "Your experimental cooking" },
        { id: "fashion", text: "Your very confident outfit choices" },
      ],
      answer: "singing",
      correctReaction:
        "Your car singing. You know every wrong lyric with total confidence, and it's my favorite sound in the world.",
      wrongReaction:
        "All excellent answers. But it's the car singing. The wrong lyrics, the full commitment, all of it. Never stop.",
    },
  ],
  coupons: [
    {
      id: "free-hug",
      title: "One Free Hug",
      description:
        "Redeem any time, day or night. Extra tight ones included at no additional cost.",
      serial: "LOV-001",
      accent: "pink",
    },
    {
      id: "date-night",
      title: "Your Choice of Date Night",
      description:
        "You pick the place. I'll drive, pay, and only pretend I know where I'm going.",
      serial: "LOV-002",
      accent: "lavender",
    },
    {
      id: "breakfast",
      title: "Breakfast in Bed",
      description:
        "Pancakes, coffee, and absolutely no alarms. Crumbs in the sheets are encouraged.",
      serial: "LOV-003",
      accent: "butter",
    },
    {
      id: "undivided",
      title: "A Whole Day of My Undivided Attention",
      description:
        "Phone on silent. Snacks included. You are the entire plan, start to finish.",
      serial: "LOV-004",
      accent: "mint",
    },
  ],
  compliments: [
    "You make ordinary Tuesdays feel like the best part of the week.",
    "Your laugh is my favorite sound, and I'm not even exaggerating a little.",
    "You're the human equivalent of finding money in a coat pocket.",
    "Talking to you is my favorite way to waste an entire afternoon.",
    "You make my heart do the little flip thing. Every single time.",
    "You're the reason I check my phone and smile like a fool in public.",
    "The world is softer around the edges when you're in it.",
    "You're my favorite person to do absolutely nothing with.",
    "If I had to choose a favorite place, it would be next to you.",
    "You're the good part of every day, and also dessert.",
    "Being loved by you feels like coming home to a light left on.",
    "You are proof that some things are even better than the version I imagined.",
  ],
  reasons: [
    "You remember the tiny things: how I take my coffee, the songs I skip, the stories I tell twice.",
    "You make me laugh in the middle of being grumpy. It's unfair, honestly.",
    "You're brave in quiet ways that no one else notices. I notice.",
    "You give the kind of hugs that fix an entire day.",
    "You listen like what I'm saying actually matters. Because to you, it does.",
    "You make me want to be a softer, kinder, slightly more patient person.",
    "You're endlessly curious, and being around you makes the world feel bigger.",
    "You choose me every day, even the boring days. Especially the boring days.",
  ],
  secretMessages: [
    {
      id: "secret-1",
      text: "I still keep the ticket stub from our first movie in my wallet. Don't tell anyone.",
      x: 10,
      y: 24,
    },
    {
      id: "secret-2",
      text: "Sometimes I replay our conversations in my head when I can't sleep.",
      x: 27,
      y: 64,
    },
    {
      id: "secret-3",
      text: "I practiced saying hi to you for three days before we actually met.",
      x: 43,
      y: 30,
    },
    {
      id: "secret-4",
      text: "You're in my five-year plan. You're kind of the whole thing, actually.",
      x: 59,
      y: 68,
    },
    {
      id: "secret-5",
      text: "I'm not sure I believed in 'the one' until you laughed at my dumb joke.",
      x: 76,
      y: 26,
    },
    {
      id: "secret-6",
      text: "I love you in the small hours too, not just the pretty ones.",
      x: 90,
      y: 58,
    },
    {
      id: "secret-7",
      text: "The first time you called me by my nickname, I smiled for the rest of the day.",
      x: 18,
      y: 84,
    },
    {
      id: "secret-8",
      text: "I have a note on my phone titled 'things to tell Mia' and it is embarrassingly long.",
      x: 51,
      y: 84,
    },
    {
      id: "secret-9",
      text: "Every time a song we like comes on, I turn it up a little for you.",
      x: 68,
      y: 46,
    },
  ],
  emergencyNote: defaultEmergencyNote,
  finalLetter: {
    eyebrow: "One last thing",
    title: "There's just one more thing...",
    subtitle:
      "I tried to fit all of this into a card. The card gave up. So I made you this instead.",
    tapHint: "Tap the seal when you're ready.",
    salutation: "My dearest Mia,",
    paragraphs: [
      "I've been trying to find the right words for weeks, and it turns out they don't make a card big enough for this.",
      "You are my favorite hello, my safest place, and the person I want to tell everything to. Even the boring things. Especially the boring things.",
      "Thank you for the rainy walks, the burnt pancakes, the songs sung badly, and the quiet moments in between. Thank you for making a regular life feel like something worth keeping.",
      "So here's my very simple question.",
    ],
    signature: "With all my love, always,",
    signatureName: "",
    postscript:
      "P.S. You're my favorite person. This is not up for debate.",
    question: "Will you be my Valentine?",
    yesLabel: "Of course! ❤️",
    thinkLabel: "Let me think...",
    thinkingNotes: [
      "Of course you can think. I'll be right here, holding this heart.",
      "Still thinking? That's okay. Some things are worth a moment.",
      "I'll wait forever if I have to. But maybe a tiny hint? ❤️",
    ],
    acceptAfterThinkingLabel: "Okay, fine. Yes. Obviously. ❤️",
    celebration: {
      flag: "She said yes",
      title: "Happy Valentine's Day! ❤️",
      subtitle: "I knew you'd say yes. I hoped really, really hard.",
      note: "To Mia, with all my love and approximately one thousand more little surprises.",
    },
  },
};
