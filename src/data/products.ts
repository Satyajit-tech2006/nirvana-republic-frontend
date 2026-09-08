import ashwagandha from "@/assets/p-ashwagandha.jpg";
import beetroot from "@/assets/p-beetroot.jpg";
import chia from "@/assets/p-chia.jpg";
import flax from "@/assets/p-flax.jpg";
import hibiscus from "@/assets/p-hibiscus.jpg";
import isabgol from "@/assets/p-isabgol.jpg";
import jaggery from "@/assets/p-jaggery.jpg";
import moringa from "@/assets/p-moringa.jpg";
import pumpkin from "@/assets/p-pumpkin.jpg";
import turmeric from "@/assets/p-turmeric.jpg";
import editorial from "@/assets/editorial-ritual.jpg";

export type CategoryId = "powders" | "seeds" | "pantry" | "superfoods";

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: CategoryId;
  price: number;
  mrp?: number;
  weight: string;
  rating: number;
  reviewCount: number;
  images: string[];
  badges: string[];
  description: string;
  benefits: string[];
  ingredients: string;
  howToUse: string[];
  nutrition?: { label: string; value: string }[];
  bestSeller?: boolean;
  featured?: boolean;
  reviews: { name: string; city: string; rating: number; date: string; body: string }[];
};

export const categories: {
  id: CategoryId;
  name: string;
  blurb: string;
  image: string;
}[] = [
  {
    id: "powders",
    name: "Powders",
    blurb: "Single-origin roots, leaves and flowers, finely milled.",
    image: ashwagandha,
  },
  { id: "seeds", name: "Seeds", blurb: "Everyday protein, fibre and omega-3.", image: chia },
  { id: "superfoods", name: "Superfoods", blurb: "Daily greens and antioxidant boosters.", image: moringa },
  { id: "pantry", name: "Pantry", blurb: "Clean staples for the Indian kitchen.", image: jaggery },
];

const genericReviews = (name: string) => [
  {
    name: "Ananya R.",
    city: "Bengaluru",
    rating: 5,
    date: "12 Aug 2026",
    body: `Genuinely clean ${name.toLowerCase()} — no fillers, no strange smell. The pouch reseals well and lasts me a full month.`,
  },
  {
    name: "Karthik S.",
    city: "Chennai",
    rating: 4,
    date: "29 Jul 2026",
    body: "Quality is excellent and delivery was quick. Wish the larger pack size was available more often.",
  },
  {
    name: "Meher D.",
    city: "Mumbai",
    rating: 5,
    date: "04 Jul 2026",
    body: "I've replaced three different supplements with this. Simple, honest labelling is what won me over.",
  },
];

export const products: Product[] = [
  {
    id: "nr-01",
    slug: "ashwagandha-root-powder",
    name: "Ashwagandha Root Powder",
    tagline: "Calm, steady energy from KSM-grade roots",
    category: "powders",
    price: 449,
    mrp: 599,
    weight: "250 g",
    rating: 4.8,
    reviewCount: 412,
    images: [ashwagandha, editorial, moringa],
    badges: ["Single origin", "Lab tested"],
    description:
      "Slow-dried Withania somnifera roots from Neemuch, stone-milled into a fine powder. One spoon in warm milk at night is the whole ritual — no capsules, no complicated stacks.",
    benefits: [
      "Supports the body's response to everyday stress",
      "Traditionally used for restful sleep",
      "Helps sustain stamina and recovery",
    ],
    ingredients: "100% Ashwagandha (Withania somnifera) root powder. Nothing else.",
    howToUse: [
      "Stir 3–5 g (about one teaspoon) into warm milk or water.",
      "Best taken at night, after dinner.",
      "Use consistently for 8–12 weeks for best results.",
    ],
    nutrition: [
      { label: "Energy", value: "245 kcal / 100 g" },
      { label: "Protein", value: "3.9 g" },
      { label: "Total Carbohydrate", value: "49.9 g" },
      { label: "Dietary Fibre", value: "32.3 g" },
      { label: "Total Fat", value: "0.3 g" },
    ],
    bestSeller: true,
    featured: true,
    reviews: genericReviews("Ashwagandha"),
  },
  {
    id: "nr-02",
    slug: "beetroot-powder",
    name: "Beetroot Powder",
    tagline: "Cold-processed beets for natural pre-workout colour",
    category: "powders",
    price: 379,
    mrp: 449,
    weight: "200 g",
    rating: 4.6,
    reviewCount: 238,
    images: [beetroot, editorial, turmeric],
    badges: ["No added sugar", "Vegan"],
    description:
      "Whole Indian beets, gently dried below 45°C to keep their colour and nitrates intact. Earthy-sweet, and brilliant in smoothies, chillas and rotis.",
    benefits: [
      "Naturally rich in dietary nitrates",
      "Supports stamina before a workout",
      "Adds colour and iron to everyday food",
    ],
    ingredients: "100% dehydrated beetroot (Beta vulgaris) powder.",
    howToUse: [
      "Blend 5 g into a smoothie or juice.",
      "Knead into atta for naturally pink rotis.",
      "Avoid boiling — add after cooking to preserve nutrients.",
    ],
    nutrition: [
      { label: "Energy", value: "323 kcal / 100 g" },
      { label: "Protein", value: "12.1 g" },
      { label: "Total Carbohydrate", value: "62.4 g" },
      { label: "Dietary Fibre", value: "18.0 g" },
      { label: "Iron", value: "9.8 mg" },
    ],
    featured: true,
    reviews: genericReviews("Beetroot powder"),
  },
  {
    id: "nr-03",
    slug: "raw-chia-seeds",
    name: "Raw Chia Seeds",
    tagline: "Omega-3 and fibre, ready in five minutes",
    category: "seeds",
    price: 299,
    mrp: 399,
    weight: "500 g",
    rating: 4.9,
    reviewCount: 1043,
    images: [chia, editorial, flax],
    badges: ["Triple cleaned", "High fibre"],
    description:
      "Premium grade unroasted chia, triple cleaned and sorted. Soak a spoon overnight and breakfast is done before you wake up.",
    benefits: [
      "8 g of fibre in every 30 g serving",
      "Plant-based omega-3 (ALA)",
      "Keeps you full through the morning",
    ],
    ingredients: "100% raw chia seeds (Salvia hispanica).",
    howToUse: [
      "Soak 15 g in 100 ml water or milk for 15 minutes.",
      "Top curd, oats or fruit bowls.",
      "Drink plenty of water through the day.",
    ],
    nutrition: [
      { label: "Energy", value: "486 kcal / 100 g" },
      { label: "Protein", value: "16.5 g" },
      { label: "Total Fat", value: "30.7 g" },
      { label: "Omega-3 (ALA)", value: "17.8 g" },
      { label: "Dietary Fibre", value: "34.4 g" },
    ],
    bestSeller: true,
    featured: true,
    reviews: genericReviews("Chia seeds"),
  },
  {
    id: "nr-04",
    slug: "roasted-flax-seeds",
    name: "Roasted Flax Seeds",
    tagline: "Slow roasted, ready to eat by the spoon",
    category: "seeds",
    price: 219,
    weight: "400 g",
    rating: 4.7,
    reviewCount: 517,
    images: [flax, chia, editorial],
    badges: ["Slow roasted", "No oil"],
    description:
      "Roasted in small batches without oil or salt, so they stay nutty and crisp. Keep the jar on the dining table — that's the entire habit.",
    benefits: ["Plant omega-3 and lignans", "Supports digestion", "Ready to eat, no prep"],
    ingredients: "100% roasted flax seeds (Linum usitatissimum).",
    howToUse: [
      "Eat a teaspoon after meals.",
      "Grind fresh and sprinkle over sabzi or curd.",
      "Store in a cool, dry place.",
    ],
    nutrition: [
      { label: "Energy", value: "534 kcal / 100 g" },
      { label: "Protein", value: "18.3 g" },
      { label: "Total Fat", value: "42.2 g" },
      { label: "Dietary Fibre", value: "27.3 g" },
    ],
    bestSeller: true,
    reviews: genericReviews("Flax seeds"),
  },
  {
    id: "nr-05",
    slug: "hibiscus-powder",
    name: "Hibiscus Powder",
    tagline: "Shade-dried petals for a tart daily brew",
    category: "powders",
    price: 349,
    mrp: 429,
    weight: "150 g",
    rating: 4.5,
    reviewCount: 164,
    images: [hibiscus, editorial, beetroot],
    badges: ["Shade dried", "Caffeine free"],
    description:
      "Hibiscus sabdariffa petals from Tamil Nadu, shade-dried to hold their ruby colour. Tart, floral, and lovely iced through summer.",
    benefits: ["Naturally rich in antioxidants", "Caffeine-free daily brew", "Also loved as a hair rinse"],
    ingredients: "100% hibiscus (Hibiscus sabdariffa) flower powder.",
    howToUse: [
      "Steep 2 g in hot water for 5 minutes; sweeten with jaggery.",
      "Chill with lemon for a summer cooler.",
      "Mix into hair masks with curd.",
    ],
    reviews: genericReviews("Hibiscus powder"),
  },
  {
    id: "nr-06",
    slug: "isabgol-husk",
    name: "Isabgol Husk",
    tagline: "99% pure psyllium for everyday regularity",
    category: "pantry",
    price: 269,
    mrp: 319,
    weight: "200 g",
    rating: 4.7,
    reviewCount: 689,
    images: [isabgol, editorial, flax],
    badges: ["99% purity", "Unflavoured"],
    description:
      "Sieved to 99% purity from Gujarat-grown psyllium. Unflavoured, unsweetened, and gone in one glass of water.",
    benefits: ["Soluble fibre for regularity", "Supports gut comfort", "Helps you feel full for longer"],
    ingredients: "100% psyllium husk (Plantago ovata).",
    howToUse: [
      "Stir 5 g into a full glass of water and drink immediately.",
      "Take at night or 30 minutes before a meal.",
      "Always follow with extra water.",
    ],
    nutrition: [
      { label: "Energy", value: "180 kcal / 100 g" },
      { label: "Dietary Fibre", value: "80.0 g" },
      { label: "Total Fat", value: "0.5 g" },
    ],
    bestSeller: true,
    reviews: genericReviews("Isabgol"),
  },
  {
    id: "nr-07",
    slug: "organic-jaggery-powder",
    name: "Organic Jaggery Powder",
    tagline: "Chemical-free sweetness from Kolhapur cane",
    category: "pantry",
    price: 189,
    weight: "700 g",
    rating: 4.8,
    reviewCount: 823,
    images: [jaggery, editorial, turmeric],
    badges: ["No sulphur", "Organic cane"],
    description:
      "Open-pan jaggery from Kolhapur, powdered so it dissolves like sugar. A straight swap in chai, kheer and everyday baking.",
    benefits: ["A direct one-for-one sugar swap", "No sulphur or chemical clarifiers", "Retains cane minerals"],
    ingredients: "100% organic sugarcane jaggery powder.",
    howToUse: [
      "Replace sugar 1:1 in chai, coffee and desserts.",
      "Dissolve in warm water with lemon.",
      "Store airtight away from moisture.",
    ],
    nutrition: [
      { label: "Energy", value: "383 kcal / 100 g" },
      { label: "Total Carbohydrate", value: "95.2 g" },
      { label: "Iron", value: "11.0 mg" },
    ],
    bestSeller: true,
    featured: true,
    reviews: genericReviews("Jaggery powder"),
  },
  {
    id: "nr-08",
    slug: "moringa-leaf-powder",
    name: "Moringa Leaf Powder",
    tagline: "Your daily greens, in one teaspoon",
    category: "superfoods",
    price: 399,
    mrp: 499,
    weight: "250 g",
    rating: 4.6,
    reviewCount: 356,
    images: [moringa, editorial, turmeric],
    badges: ["Shade dried", "Iron rich"],
    description:
      "Drumstick leaves harvested at dawn and shade-dried the same day, so the powder stays vivid green rather than khaki.",
    benefits: ["Plant iron and calcium", "Supports everyday immunity", "Vivid green, never bitter-burnt"],
    ingredients: "100% moringa (Moringa oleifera) leaf powder.",
    howToUse: [
      "Whisk 3 g into water, juice or dal.",
      "Add after cooking, off the heat.",
      "Start with half a teaspoon.",
    ],
    nutrition: [
      { label: "Energy", value: "205 kcal / 100 g" },
      { label: "Protein", value: "27.1 g" },
      { label: "Calcium", value: "2003 mg" },
      { label: "Iron", value: "28.2 mg" },
    ],
    featured: true,
    reviews: genericReviews("Moringa"),
  },
  {
    id: "nr-09",
    slug: "raw-pumpkin-seeds",
    name: "Raw Pumpkin Seeds",
    tagline: "Magnesium-rich seeds for the 4 pm slump",
    category: "seeds",
    price: 329,
    mrp: 389,
    weight: "350 g",
    rating: 4.7,
    reviewCount: 274,
    images: [pumpkin, chia, editorial],
    badges: ["Unsalted", "Hand sorted"],
    description:
      "Plump, hulled pepitas with a clean bite. Keep a small katori at your desk and the evening biscuit habit quietly disappears.",
    benefits: ["Naturally high in magnesium and zinc", "Plant protein snack", "No salt, no oil"],
    ingredients: "100% raw hulled pumpkin seeds (Cucurbita pepo).",
    howToUse: ["Snack on 20 g a day.", "Toss over salads and poha.", "Blend into chutneys for body."],
    nutrition: [
      { label: "Energy", value: "559 kcal / 100 g" },
      { label: "Protein", value: "30.2 g" },
      { label: "Magnesium", value: "592 mg" },
    ],
    reviews: genericReviews("Pumpkin seeds"),
  },
  {
    id: "nr-10",
    slug: "turmeric-latte-powder",
    name: "Turmeric Latte Powder",
    tagline: "Haldi doodh, already measured for you",
    category: "superfoods",
    price: 429,
    mrp: 549,
    weight: "200 g",
    rating: 4.8,
    reviewCount: 391,
    images: [turmeric, editorial, jaggery],
    badges: ["High curcumin", "With black pepper"],
    description:
      "Lakadong-grade turmeric blended with cinnamon, cardamom and a pinch of black pepper. One scoop, warm milk, done in ninety seconds.",
    benefits: ["High-curcumin Lakadong turmeric", "Pepper added for absorption", "Comforting evening ritual"],
    ingredients: "Turmeric (82%), cinnamon, cardamom, dry ginger, black pepper.",
    howToUse: [
      "Whisk 5 g into 200 ml hot milk.",
      "Sweeten with our jaggery powder.",
      "Best in the hour before bed.",
    ],
    nutrition: [
      { label: "Energy", value: "354 kcal / 100 g" },
      { label: "Protein", value: "7.8 g" },
      { label: "Dietary Fibre", value: "21.1 g" },
    ],
    bestSeller: true,
    reviews: genericReviews("Turmeric latte"),
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const relatedProducts = (product: Product) =>
  products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4).length >= 3
    ? products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)
    : products.filter((p) => p.id !== product.id).slice(0, 4);
