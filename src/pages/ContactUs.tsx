import React, { useState } from "react";
import {
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { Newsletter } from "@/components/Newsletter";

const SERIF = "font-['Fraunces',ui-serif,Georgia,serif]";

export default function ContactUs() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Inquiry on Active Lots",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulated submission until connected to backend dispatch endpoint
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("Dispatch request logged. An atelier specialist will connect shortly.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "Inquiry on Active Lots",
        message: "",
      });
    }, 1000);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#FAF8F5] text-[#121212]">
      <SEO
        title="Contact & Botanical Registry Office — Nirvana Republic"
        description="Reach out to Nirvana Republic. Contact our facility in Baloda Bazar, Chhattisgarh for harvest queries, lab certifications, and wholesale allocations."
        canonical="/contact"
      />

      {/* ================= 1. HEADER ================= */}
      <section className="relative w-full bg-[#14261C] text-[#FAF8F5]">
        <div className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full bg-[#E58866]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-1/2 h-80 w-80 rounded-full bg-[#FAF8F5]/5 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FAF8F5]/20 bg-[#FAF8F5]/10 px-3.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#FAF8F5]">
              <Sparkles size={12} className="text-[#E58866]" />
              <span>Direct Liaison</span>
            </div>

            <h1
              className={`${SERIF} mt-6 text-4xl font-normal leading-[1.08] tracking-tight text-[#FAF8F5] sm:text-5xl lg:text-[4rem]`}
            >
              Connect with our <br />
              <span className="italic text-[#E58866]">sanctuary desk.</span>
            </h1>

            <p className="mt-6 text-sm leading-relaxed text-[#FAF8F5]/80 sm:text-base">
              Whether you require verifiable laboratory purity assays, custom estate orders, or traceability documentation, our manufacturing hub is directly reachable.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 2. MAIN GRID: CONTACT INFO + INQUIRY FORM ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Direct Facility Cards */}
          <div className="space-y-8 lg:col-span-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#E58866]">
                Sanctuary Address
              </p>
              <h2 className={`${SERIF} mt-2 text-3xl font-normal text-[#121212]`}>
                Manufacturing &amp; Central Registry
              </h2>
            </div>

            <div className="space-y-4">
              {/* Address Card */}
              <div className="flex items-start gap-4 rounded-3xl border border-[#121212]/10 bg-[#F4EFE6] p-6 transition-all hover:bg-white hover:shadow-md">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#14261C] text-[#FAF8F5]">
                  <Building2 size={18} />
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#121212]/50">
                    Registered Facility
                  </p>
                  <p className="font-display text-base font-semibold text-[#121212]">
                    ISRARC MANUFACTURING
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#121212]/75 sm:text-sm">
                    Baloda Bazar – Bhatapara Highway <br />
                    Chhattisgarh – 493332, India
                  </p>
                </div>
              </div>

              {/* Telephone Card */}
              <div className="flex items-start gap-4 rounded-3xl border border-[#121212]/10 bg-[#F4EFE6] p-6 transition-all hover:bg-white hover:shadow-md">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#14261C] text-[#FAF8F5]">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#121212]/50">
                    Direct Line
                  </p>
                  <a
                    href="tel:+919770830959"
                    className="font-mono text-sm font-semibold text-[#121212] transition-colors hover:text-[#E58866]"
                  >
                    +91 97708 30959
                  </a>
                  <p className="mt-1 text-xs text-[#121212]/60">
                    Mon – Sat · 9:30 AM to 6:30 PM IST
                  </p>
                </div>
              </div>

              {/* Email Card */}
              <div className="flex items-start gap-4 rounded-3xl border border-[#121212]/10 bg-[#F4EFE6] p-6 transition-all hover:bg-white hover:shadow-md">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#14261C] text-[#FAF8F5]">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#121212]/50">
                    Electronic Dispatch
                  </p>
                  <a
                    href="mailto:republicnirvana@gmail.com"
                    className="font-mono text-sm font-semibold text-[#121212] transition-colors hover:text-[#E58866]"
                  >
                    republicnirvana@gmail.com
                  </a>
                  <p className="mt-1 text-xs text-[#121212]/60">
                    Direct inquiries &amp; lab assay verifications
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-[#121212]/10 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
              <span className="font-mono text-xs uppercase tracking-widest text-[#E58866]">
                Message Ledger
              </span>
              <h2 className={`${SERIF} mt-2 text-2xl font-normal text-[#121212] sm:text-3xl`}>
                Transmit an inquiry
              </h2>
              <p className="mt-1 text-xs text-[#121212]/60 sm:text-sm">
                Provide your details below to connect with our botanical sourcing team.
              </p>

              {submitted && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#14261C]/20 bg-[#14261C]/5 p-4 font-mono text-xs text-[#14261C]">
                  <CheckCircle2 size={16} className="shrink-0 text-[#14261C]" />
                  <span>
                    Inquiry registered. Our compliance officer will reach out via email shortly.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Satyajit Swain"
                      className="w-full rounded-2xl border border-[#121212]/15 bg-[#FAF8F5] px-4 py-3 font-sans text-xs text-[#121212] outline-none transition-colors focus:border-[#14261C] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="patron@domain.com"
                      className="w-full rounded-2xl border border-[#121212]/15 bg-[#FAF8F5] px-4 py-3 font-sans text-xs text-[#121212] outline-none transition-colors focus:border-[#14261C] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-2xl border border-[#121212]/15 bg-[#FAF8F5] px-4 py-3 font-mono text-xs text-[#121212] outline-none transition-colors focus:border-[#14261C] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                      Subject Matter
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-[#121212]/15 bg-[#FAF8F5] px-3.5 py-3 font-sans text-xs text-[#121212] outline-none transition-colors focus:border-[#14261C] focus:bg-white"
                    >
                      <option value="Inquiry on Active Lots">Inquiry on Active Lots</option>
                      <option value="Lab Assay Request">Request Batch Lab Assay (COA)</option>
                      <option value="Wholesale / Estate Supply">Bulk / Estate Supply</option>
                      <option value="Customer Order Status">Order &amp; Delivery Tracking</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-[#121212]/70">
                    Inquiry Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Provide lot numbers, questions on harvest timing, or details regarding your order..."
                    className="w-full rounded-2xl border border-[#121212]/15 bg-[#FAF8F5] p-4 font-sans text-xs leading-relaxed text-[#121212] outline-none transition-colors focus:border-[#14261C] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#14261C] py-4 font-mono text-xs uppercase tracking-wider text-[#FAF8F5] transition-all hover:bg-[#E58866] hover:text-[#14261C] disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{submitting ? "Transmitting..." : "Submit Dispatch Inquiry"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. MAP SECTION POINTING TO BHATAPARA - BALODA BAZAR ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-[#121212]/10 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-[#121212]/10 bg-[#FAF8F5] p-6 sm:flex-row sm:items-center sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14261C] text-[#FAF8F5]">
                <MapPin size={18} />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#121212]/50">
                  Cartographic Pin
                </p>
                <p className={`${SERIF} text-base font-normal text-[#121212] sm:text-lg`}>
                  Baloda Bazar – Bhatapara Highway, CG 493332
                </p>
              </div>
            </div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#E58866]">
              21.6538° N, 81.9490° E
            </span>
          </div>

          {/* Embedded Google Map */}
          <div className="relative h-[380px] w-full bg-[#E8E1D5] sm:h-[460px]">
            <iframe
              title="ISRARC Manufacturing — Baloda Bazar Bhatapara Highway"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118742.6372866946!2d81.8791011357605!3d21.68882998642278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a2861c8a14b584d%3A0xe9f75d5fa4b4ddc5!2sBhatapara%20-%20Baloda%20Bazar%20Rd%2C%20Chhattisgarh!5e0!3m2!1sen!2sin!4v1711283921094!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "contrast(102%) saturate(90%)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ================= 4. NEWSLETTER ================= */}
      <Newsletter />
    </div>
  );
}