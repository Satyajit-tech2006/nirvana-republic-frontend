import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Leaf,
  ShieldCheck,
  ThermometerSnowflake,
  Compass,
} from "lucide-react";
import editorial from "@/assets/editorial-ritual.jpg";
import { SEO } from "@/components/SEO";
import api from "@/lib/axios";
import ENDPOINTS from "@/lib/endpoints";

const PALETTE = {
  olive: "#4D694E",
  cream: "#FFF3D5",
  forest: "#324633",
  amber: "#C87A3E",
  charcoal: "#1E261F",
} as const;

const SERIF = "font-['Fraunces',ui-serif,Georgia,serif]";

const DEFAULT_PILLARS = [
  {
    number: "01",
    title: "Pure & Transparent Sourcing",
    icon: Compass,
    copy: "Every ingredient is thoroughly verified for origin and identity. We reject opaque aggregation, synthetic fillers, and unverified bulk sourcing.",
  },
  {
    number: "02",
    title: "Gentle Low-Temperature Processing",
    icon: ThermometerSnowflake,
    copy: "High heat and aggressive chemical processing degrade natural botanical vitality. Our botanicals are cured and handled under strict temperature limits.",
  },
  {
    number: "03",
    title: "Zero Artificial Additives",
    icon: Leaf,
    copy: "No anti-caking agents, synthetic stabilizers, artificial colors, or chemical preservatives. Only pure, clean nourishment.",
  },
  {
    number: "04",
    title: "Third-Party Purity Assays",
    icon: ShieldCheck,
    copy: "Every batch is independently screened via advanced lab assays for heavy metals, residues, and microbiological purity before distribution.",
  },
];

const PILLAR_ICONS = [Compass, ThermometerSnowflake, Leaf, ShieldCheck];

export default function AboutUs() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchContent = async () => {
      try {
        const { data } = await api.get(ENDPOINTS.SITE_CONTENT.GET, {
          params: { _t: Date.now() },
        });

        const payload = data?.data?.about ? data.data : data?.about ? data : null;
        if (isMounted && payload?.about) {
          setContent(payload.about);
        }
      } catch (err) {
        console.error("Failed to load dynamic about content:", err);
      }
    };

    fetchContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const heroHeading =
    content?.heroHeading || "Wellness, returned to its unhurried origin.";
  const heroSubheading =
    content?.heroSubheading ||
    "At Nirvana Republic, we believe wellness should be simple, accessible, and part of everyday life. As a one stop destination for health and wellness, we offer a thoughtfully curated range of products that support your journey towards a healthier lifestyle.";

  const storyTitle =
    content?.storyTitle || "Reclaiming the purity of everyday nourishment.";
  const storyParagraph1 =
    content?.storyParagraph1 ||
    "Modern wellness has become needlessly complicated—dominated by artificial isolates, synthetic multivitamins, and complex regimens that lose sight of clean basics.";
  const storyParagraph2 =
    content?.storyParagraph2 ||
    "Nirvana Republic was founded on a singular conviction: human vitality thrives when whole botanical foods retain their natural integrity. We bridge the gap between quality growers and your daily routine.";
  const storyParagraph3 =
    content?.storyParagraph3 ||
    "We maintain transparent standards, rigorous third-party quality testing, and clean packaging so you always know what touches your body.";

  const activeImage = content?.storyImageUrl || editorial;

  const activePillars =
    Array.isArray(content?.nonNegotiables) && content.nonNegotiables.length > 0
      ? content.nonNegotiables.map((item: any, idx: number) => ({
          number: `0${idx + 1}`,
          title: item.title,
          copy: item.description || item.copy || "",
          icon: PILLAR_ICONS[idx % PILLAR_ICONS.length],
        }))
      : DEFAULT_PILLARS;

  return (
    <div
      className="w-full max-w-full overflow-x-hidden antialiased"
      style={{ backgroundColor: PALETTE.cream, color: PALETTE.charcoal }}
    >
      <SEO
        title="Our Story & Philosophy — Nirvana Republic"
        description={heroSubheading}
        canonical="/about"
      />

      {/* ================= 1. HERO SECTION ================= */}
      <section
        className="relative w-full"
        style={{ backgroundColor: PALETTE.olive, color: PALETTE.cream }}
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="max-w-2xl">
            <span
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: PALETTE.cream }}
            >
              Our Philosophy
            </span>

            <h1
              className={`${SERIF} mt-2 text-3xl font-normal leading-tight tracking-tight sm:text-4xl lg:text-5xl`}
              style={{ color: PALETTE.cream }}
            >
              {heroHeading}
            </h1>

            <p
              className="mt-3 text-xs leading-relaxed opacity-90 sm:text-sm"
              style={{ color: `${PALETTE.cream}D9` }}
            >
              {heroSubheading}
            </p>
          </div>
        </div>
      </section>

      {/* ================= 2. THE FOUNDATION MANIFESTO ================= */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-10">
          {/* Left: Image Card */}
          <div className="relative mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
            <div
              className="relative overflow-hidden rounded-2xl border p-2 shadow-2xs sm:p-3"
              style={{
                backgroundColor: "white",
                borderColor: `${PALETTE.olive}26`,
              }}
            >
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={activeImage}
                  alt="Nirvana Republic Botanical Quality"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>

              <div className="flex items-center justify-between px-1.5 pt-2 font-mono text-[10.5px] opacity-70">
                <span>Verified Standards</span>
                <span className="font-semibold" style={{ color: PALETTE.olive }}>
                  100% Pure Origin
                </span>
              </div>
            </div>
          </div>

          {/* Right: Narrative */}
          <div className="lg:col-span-7">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: PALETTE.amber }}
            >
              Our Purpose
            </p>
            <h2
              className={`${SERIF} mt-1 text-2xl font-normal tracking-tight sm:text-3xl`}
              style={{ color: PALETTE.charcoal }}
            >
              {storyTitle}
            </h2>

            <div className="mt-3 space-y-2.5 text-xs leading-relaxed opacity-80 sm:text-sm">
              <p>{storyParagraph1}</p>
              <p>{storyParagraph2}</p>
              {storyParagraph3 && <p>{storyParagraph3}</p>}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: PALETTE.olive,
                  color: PALETTE.cream,
                }}
              >
                <span>Browse Catalog</span>
                <ArrowUpRight size={13} />
              </Link>
              <Link
                to="/journal"
                className="inline-flex items-center gap-1 rounded-full border px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors hover:bg-white/40"
                style={{
                  borderColor: `${PALETTE.olive}40`,
                  color: PALETTE.charcoal,
                }}
              >
                <span>Read Journal</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. OUR FOUR CORE COMMITMENTS ================= */}
      <section
        className="border-t py-8 sm:py-12"
        style={{
          borderColor: `${PALETTE.olive}1A`,
          backgroundColor: `${PALETTE.olive}08`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: PALETTE.amber }}
            >
              Quality Standards
            </p>
            <h2
              className={`${SERIF} mt-1 text-xl font-normal sm:text-2xl`}
              style={{ color: PALETTE.charcoal }}
            >
              Our Four Guiding Principles
            </h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activePillars.map((pillar: any) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.number}
                  className="flex flex-col justify-between rounded-2xl border p-4 shadow-2xs sm:p-5"
                  style={{
                    backgroundColor: "white",
                    borderColor: `${PALETTE.olive}26`,
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className="font-mono text-[11px] font-semibold"
                        style={{ color: PALETTE.amber }}
                      >
                        {pillar.number}
                      </span>
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: `${PALETTE.olive}15`,
                          color: PALETTE.olive,
                        }}
                      >
                        <Icon size={14} strokeWidth={1.5} />
                      </div>
                    </div>

                    <h3
                      className={`${SERIF} mt-3 text-base font-normal sm:text-lg`}
                      style={{ color: PALETTE.charcoal }}
                    >
                      {pillar.title}
                    </h3>

                    <p className="mt-1.5 text-xs leading-relaxed opacity-75">
                      {pillar.copy}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}