import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowUpRight,
  Leaf,
  ShieldCheck,
  ThermometerSnowflake,
  Mountain,
  Compass,
  Check,
} from "lucide-react";
import editorial from "@/assets/editorial-ritual.jpg";
import { SEO } from "@/components/SEO";
import { Counter } from "@/components/Counter";
import { Newsletter } from "@/components/Newsletter";

const SERIF = "font-['Fraunces',ui-serif,Georgia,serif]";

const PILLARS = [
  {
    number: "01",
    title: "Radical Single-Origin Traceability",
    icon: Compass,
    copy: "Every grain, powder, and raw seed can be mapped back to a singular agricultural cluster. We reject bulk commodity brokers, grain pooling, and opaque regional aggregation.",
  },
  {
    number: "02",
    title: "The Strict 42°C Thermal Ceiling",
    icon: ThermometerSnowflake,
    copy: "Industrial flash drying and steam pasteurization destroy delicate heat-sensitive enzymes. Our botanical lots undergo unhurried, slow ambient air curation below 42°C.",
  },
  {
    number: "03",
    title: "Zero Dilution or Additives",
    icon: Leaf,
    copy: "No anti-caking agents, synthetic stabilizers, natural identical flavorings, or flow enhancers. What appears in the jar is 100% of what was harvested from the earth.",
  },
  {
    number: "04",
    title: "Third-Party Purity Assays",
    icon: ShieldCheck,
    copy: "Every harvest lot is independently screened via mass spectrometry for heavy metals, chemical residues, and microbiological purity before release into circulation.",
  },
];

const CLUSTER_ORIGINS = [
  {
    crop: "Black Ceremonial Chia",
    elevation: "490m MSL",
    terroir: "Neemuch Black Basalt Plateau",
    state: "Madhya Pradesh",
  },
  {
    crop: "Raw Moringa Leaf",
    elevation: "720m MSL",
    terroir: "Western Ghats Foothills",
    state: "Karnataka",
  },
  {
    crop: "Wild Multi-Floral Raw Honey",
    elevation: "880m MSL",
    terroir: "Abujhmad Biosphere Reserve",
    state: "Chhattisgarh",
  },
  {
    crop: "Unhulled Golden Flaxseed",
    elevation: "320m MSL",
    terroir: "Malwa Alluvial Valley",
    state: "Rajasthan Border",
  },
];

export default function AboutUs() {
  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#FAF8F5] text-[#121212]">
      <SEO
        title="Our Story & Philosophy — Nirvana Republic"
        description="At Nirvana Republic, we believe wellness should be simple, accessible, and part of everyday life. Explore our commitment to unblended, single-origin botanical sourcing."
        canonical="/about"
      />

      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative w-full bg-[#14261C] text-[#FAF8F5]">
        <div className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full bg-[#E58866]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/2 h-80 w-80 rounded-full bg-[#FAF8F5]/5 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FAF8F5]/20 bg-[#FAF8F5]/10 px-3.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#FAF8F5]">
              <Sparkles size={12} className="text-[#E58866]" />
              <span>Manifesto &amp; Provenance</span>
            </div>

            <h1
              className={`${SERIF} mt-6 text-balance text-4xl font-normal leading-[1.08] tracking-tight text-[#FAF8F5] sm:text-5xl lg:text-[4.25rem]`}
            >
              Wellness, returned to its <br />
              <span className="italic text-[#E58866]">unhurried origin.</span>
            </h1>

            <p className="mt-8 text-base leading-relaxed text-[#FAF8F5]/85 sm:text-lg">
              At Nirvana Republic, we believe wellness should be simple, accessible, and part of everyday life. As a one stop destination for health and wellness, we offer a thoughtfully curated range of products that support your journey towards a healthier lifestyle.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 2. THE FOUNDATION MANIFESTO ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Editorial Image Card */}
          <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
            <div className="relative overflow-hidden rounded-3xl border border-[#121212]/10 bg-[#F4EFE6] p-3 shadow-xl sm:p-4">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={editorial}
                  alt="Harvest curation ritual at Nirvana Republic"
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#14261C]/80 via-transparent to-transparent" />
              </div>

              <div className="flex items-center justify-between px-2 pt-4 font-mono text-xs text-[#121212]/75">
                <span>The Farm Ledger</span>
                <span className="font-semibold text-[#14261C]">Est. Single Lot</span>
              </div>
            </div>

            {/* Floating Origin Tag */}
            <div className="absolute -bottom-6 -right-3 hidden rounded-2xl border border-[#121212]/10 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14261C] text-[#FAF8F5]">
                  <Mountain size={18} />
                </div>
                <div>
                  <p className="font-mono text-[9.5px] uppercase tracking-widest text-[#121212]/50">
                    Sourcing Policy
                  </p>
                  <p className="font-display text-xs font-semibold text-[#121212]">
                    100% Farm-Direct
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Editorial Narrative */}
          <div className="lg:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#E58866]">
              Why We Exist
            </p>
            <h2 className={`${SERIF} mt-2 text-3xl font-normal tracking-tight text-[#121212] sm:text-4xl lg:text-5xl`}>
              Reclaiming the purity of everyday nourishment.
            </h2>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#121212]/75 sm:text-base">
              <p>
                Modern wellness has become needlessly complicated—dominated by artificial isolates, synthetic multivitamins, and mass-market crops blended across continents to mask sub-par yields.
              </p>
              <p>
                Nirvana Republic was founded on a singular conviction: human vitality thrives when whole botanical foods retain the vitality with which they grew. By forging direct, multi-year contracts with regenerative growers across India, we bridge the gap between conscientious farms and your morning table.
              </p>
              <p>
                We do not alter the crop. We do not spray for shelf-life extensions. We simple-pack single batches with complete lab traceability so you know exactly what touches your body.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-[#14261C] px-8 py-3.5 font-mono text-xs uppercase tracking-wider text-[#FAF8F5] transition-all hover:bg-[#E58866] hover:text-[#14261C]"
              >
                <span>Inspect Current Lots</span>
                <ArrowUpRight size={14} />
              </Link>
              <Link
                to="/journal"
                className="inline-flex items-center gap-2 rounded-full border border-[#121212]/20 px-6 py-3.5 font-mono text-xs uppercase tracking-wider text-[#121212] transition-colors hover:border-[#121212]"
              >
                <span>Read Field Notes</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. OUR FOUR CORE PILLARS ================= */}
      <section className="border-y border-[#121212]/10 bg-[#F4EFE6]/70 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#E58866]">
              Operational Commitments
            </p>
            <h2 className={`${SERIF} mt-2 text-3xl font-normal tracking-tight text-[#121212] sm:text-4xl`}>
              The Four Non-Negotiables
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.number}
                  className="flex flex-col justify-between rounded-3xl border border-[#121212]/10 bg-white p-6 shadow-sm transition-all hover:shadow-md sm:p-7"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#E58866]">
                        {pillar.number}
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF8F5] text-[#14261C]">
                        <Icon size={16} strokeWidth={1.5} />
                      </div>
                    </div>

                    <h3 className={`${SERIF} mt-5 text-xl font-normal text-[#121212]`}>
                      {pillar.title}
                    </h3>

                    <p className="mt-3 text-xs leading-relaxed text-[#121212]/70 sm:text-sm">
                      {pillar.copy}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 4. FARM CLUSTERS DIRECTORY ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#121212]/15 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#E58866]">
              Direct Origin Map
            </p>
            <h2 className={`${SERIF} mt-2 text-3xl font-normal tracking-tight text-[#121212] sm:text-4xl`}>
              Current Named Farm Clusters
            </h2>
          </div>
          <span className="font-mono text-xs uppercase tracking-wider text-[#121212]/60">
            Winter 2025/2026 Registry
          </span>
        </div>

        <div className="mt-8 divide-y divide-[#121212]/10 rounded-3xl border border-[#121212]/10 bg-white">
          {CLUSTER_ORIGINS.map((cluster) => (
            <div
              key={cluster.crop}
              className="flex flex-col justify-between gap-3 p-5 transition-colors hover:bg-[#FAF8F5] sm:flex-row sm:items-center sm:p-6"
            >
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#E58866]">
                  {cluster.state}
                </span>
                <p className={`${SERIF} text-lg font-normal text-[#121212]`}>
                  {cluster.crop}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-xs text-[#121212]/70">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#14261C]" />
                  {cluster.terroir}
                </span>
                <span>Alt: {cluster.elevation}</span>
                <span className="rounded-full border border-[#14261C]/20 px-2.5 py-0.5 text-[10px] uppercase text-[#14261C]">
                  Verified Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 5. PROVENANCE COUNTERS ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-y-8 rounded-3xl border border-[#121212]/10 bg-[#EDE6DC] p-8 md:grid-cols-4 md:divide-x md:divide-[#121212]/10">
          {[
            {
              label: "Estate Clusters",
              note: "Direct farm relationships",
              node: <Counter value={18} duration={1400} className="text-3xl font-bold text-[#121212] md:text-4xl" />,
            },
            {
              label: "Assay Verified",
              note: "Heavy metal & toxin screening",
              node: <Counter value={100} suffix="%" duration={1600} className="text-3xl font-bold text-[#14261C] md:text-4xl" />,
            },
            {
              label: "Milling Ceiling",
              note: "Zero thermal degradation",
              node: <Counter value={42} suffix="°C" duration={1200} className="text-3xl font-bold text-[#121212] md:text-4xl" />,
            },
            {
              label: "Additives Allowed",
              note: "Single ingredient guarantee",
              node: <Counter value={0} duration={800} className="text-3xl font-bold text-[#E58866] md:text-4xl" />,
            },
          ].map((m) => (
            <div key={m.label} className="px-2 sm:px-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#121212]/50 sm:text-[11px]">
                {m.label}
              </p>
              <div className="mt-1">{m.node}</div>
              <p className="mt-1 text-xs text-[#121212]/60">{m.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 6. NEWSLETTER FOOTER ================= */}
      <Newsletter />
    </div>
  );
}