import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, ShieldCheck, Sprout, Timer } from "lucide-react";
import hero from "@/assets/hero.jpg";
import editorial from "@/assets/editorial-ritual.jpg";
import { ProductCard } from "@/components/ProductCard";
import { SectionHead } from "@/components/SectionHead";
import { Newsletter } from "@/components/Newsletter";
import { categories, products } from "@/data/products";
import { journal } from "@/data/journal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nirvana Republic — Better food. Made simple." },
      {
        name: "description",
        content:
          "Clean seeds, powders and pantry essentials from an Indian wellness collective. Single-origin, lab tested, and simple enough to keep up with every day.",
      },
      { property: "og:title", content: "Nirvana Republic — Better food. Made simple." },
      {
        property: "og:description",
        content: "Clean seeds, powders and pantry essentials from an Indian wellness collective.",
      },
    ],
  }),
  component: Home,
});

const promises = [
  { icon: Leaf, title: "Single origin", copy: "Each batch traced to one farm cluster, named on the pack." },
  { icon: ShieldCheck, title: "Lab tested", copy: "Every lot screened for pesticides, metals and microbes." },
  { icon: Timer, title: "Two-minute rituals", copy: "One spoon, one glass. No routines to memorise." },
  { icon: Sprout, title: "Nothing added", copy: "No fillers, no sulphur, no flavourings. Ever." },
];

function Home() {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="container-page pt-8 md:pt-14">
        <div className="grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <div className="rise-in">
            <p className="eyebrow">Wellness collective · Est. Bengaluru</p>
            <h1 className="mt-6 text-balance text-[2.9rem] leading-[1.02] md:text-[4.6rem]">
              Better food.
              <br />
              Made simple.
            </h1>
            <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
              Healthy eating doesn't have to be complicated. We source clean seeds, powders and pantry
              staples from Indian farms, and keep the instructions to one line.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/shop" className="btn-base btn-primary px-7">
                Shop Collection
              </Link>
              <Link to="/about" className="btn-base btn-outline px-7">
                Our story
              </Link>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-7 text-sm">
              {[
                ["48,000+", "households served"],
                ["37", "partner farms"],
                ["4.8★", "average rating"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl">{value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <img
              src={hero}
              alt="Kraft pouch of superfood powder beside a bowl of chia seeds on cream linen"
              width={1600}
              height={1104}
              className="aspect-[4/3] w-full rounded-sm object-cover shadow-soft md:aspect-[5/4]"
            />
            <div className="absolute -bottom-6 left-6 hidden max-w-[15rem] rounded-sm bg-card p-5 shadow-lift md:block">
              <p className="font-display text-lg leading-snug">One spoon. Warm milk. Done.</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Our best-selling ashwagandha, in the time it takes to boil water.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Promise strip */}
      <section className="container-page mt-20 md:mt-28">
        <div className="grid gap-8 border-y border-border py-10 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex gap-4">
              <Icon size={20} strokeWidth={1.25} className="mt-0.5 shrink-0 text-moss" />
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-page py-20 md:py-28">
        <SectionHead
          eyebrow="Featured"
          title="Start with the essentials"
          intro="Four products that cover most of what a day actually needs — energy, fibre, greens and clean sweetness."
          linkTo="/shop"
          linkLabel="Shop all products"
        />
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-secondary/70 py-20 md:py-28">
        <div className="container-page">
          <SectionHead eyebrow="Shop by category" title="Find your shelf" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/shop"
                search={{ category: c.id }}
                className="group relative overflow-hidden rounded-sm bg-card"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={900}
                  height={900}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-5 pt-14">
                  <p className="font-display text-xl text-background">{c.name}</p>
                  <p className="mt-1 text-xs leading-snug text-background/75">{c.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="container-page py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:gap-20">
          <div>
            <p className="eyebrow">Why Nirvana Republic</p>
            <h2 className="mt-4 text-balance text-3xl leading-tight md:text-[2.5rem]">
              We removed everything that made eating well feel like work.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Most wellness brands sell you a protocol. We'd rather sell you one honest ingredient and tell
              you exactly what to do with it — in a sentence, not a supplement schedule.
            </p>
          </div>
          <div className="space-y-8">
            {[
              {
                n: "01",
                t: "Simplicity",
                c: "One product, one purpose, one spoon. If a routine takes more than two minutes, we redesign it.",
              },
              {
                n: "02",
                t: "Quality you can verify",
                c: "Farm cluster, harvest month and lab report reference printed on every pouch. No proprietary blends.",
              },
              {
                n: "03",
                t: "Everyday, not occasional",
                c: "Priced and packed for daily use, because consistency beats intensity every single time.",
              },
            ].map((item) => (
              <div key={item.n} className="flex gap-6 border-t border-border pt-6">
                <span className="font-display text-sm text-clay">{item.n}</span>
                <div>
                  <p className="font-display text-xl">{item.t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.c}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section className="container-page pb-20 md:pb-28">
        <SectionHead
          eyebrow="Best sellers"
          title="What India keeps reordering"
          linkTo="/shop"
          linkLabel="See the full range"
        />
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Educational */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-page grid items-center gap-12 py-20 md:grid-cols-2 md:gap-20 md:py-28">
          <img
            src={editorial}
            alt="Stirring moringa powder into a glass of water in a bright kitchen"
            loading="lazy"
            width={1408}
            height={1008}
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-primary-foreground/60">
              The two-minute method
            </p>
            <h2 className="mt-4 text-balance text-3xl leading-tight md:text-[2.5rem]">
              Three spoons is the entire wellness routine.
            </h2>
            <ol className="mt-8 space-y-6">
              {[
                ["Morning", "A teaspoon of moringa in water, before chai. Greens handled."],
                ["Afternoon", "Soaked chia or a small katori of pumpkin seeds instead of a biscuit."],
                ["Night", "Ashwagandha in warm milk, sweetened with jaggery. Sleep handled."],
              ].map(([time, copy]) => (
                <li key={time} className="flex gap-5 border-t border-primary-foreground/15 pt-5">
                  <span className="w-24 shrink-0 text-xs uppercase tracking-[0.16em] text-primary-foreground/60">
                    {time}
                  </span>
                  <span className="text-sm leading-relaxed text-primary-foreground/85">{copy}</span>
                </li>
              ))}
            </ol>
            <Link
              to="/journal"
              className="link-underline mt-9 inline-flex items-center gap-2 text-sm text-primary-foreground"
            >
              Read the wellness journal <ArrowRight size={15} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* Journal */}
      <section className="container-page py-20 md:py-28">
        <SectionHead
          eyebrow="From the community"
          title="Notes from our kitchen and our farms"
          linkTo="/journal"
          linkLabel="All journal entries"
        />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {journal.map((post) => (
            <Link key={post.slug} to="/journal" className="group">
              <img
                src={post.image}
                alt={post.title}
                loading="lazy"
                width={1000}
                height={750}
                className="aspect-[4/3] w-full rounded-sm object-cover transition-opacity duration-500 group-hover:opacity-90"
              />
              <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-clay">{post.category}</p>
              <h3 className="mt-2 text-balance font-display text-xl leading-snug">{post.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {post.date} · {post.readTime}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  );
}
