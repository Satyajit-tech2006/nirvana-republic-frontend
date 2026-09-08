import j1 from "@/assets/journal-1.jpg";
import j2 from "@/assets/journal-2.jpg";
import j3 from "@/assets/journal-3.jpg";

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
};

export const journal: JournalPost[] = [
  {
    slug: "five-minute-breakfast",
    title: "The five-minute breakfast that actually keeps you full",
    excerpt:
      "Soaked chia, curd and whatever fruit is in the house. Why the simplest plate usually beats the most optimised one.",
    category: "Everyday eating",
    readTime: "4 min read",
    date: "02 Sep 2026",
    image: j1,
  },
  {
    slug: "haldi-doodh-right",
    title: "Getting haldi doodh right (and why pepper matters)",
    excerpt:
      "A pinch of black pepper changes how much curcumin your body can actually use. Here's the ratio we settled on.",
    category: "Rituals",
    readTime: "5 min read",
    date: "21 Aug 2026",
    image: j2,
  },
  {
    slug: "where-our-seeds-come-from",
    title: "Where our seeds come from, farm by farm",
    excerpt:
      "Neemuch for ashwagandha, Kolhapur for jaggery, Saurashtra for isabgol. Sourcing notes from the last harvest.",
    category: "Sourcing",
    readTime: "6 min read",
    date: "09 Aug 2026",
    image: j3,
  },
];
