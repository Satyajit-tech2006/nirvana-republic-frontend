import React, { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
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

export default function ContactUs() {
  const [contactData, setContactData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  useEffect(() => {
    let isMounted = true;
    const fetchContactInfo = async () => {
      try {
        const { data } = await api.get(ENDPOINTS.SITE_CONTENT.GET, {
          params: { _t: Date.now() },
        });

        const payload = data?.data?.contact ? data.data : data?.contact ? data : null;
        if (isMounted && payload?.contact) {
          setContactData(payload.contact);
        }
      } catch (err) {
        console.error("Failed to load contact info:", err);
      }
    };

    fetchContactInfo();
    return () => {
      isMounted = false;
    };
  }, []);

  const facilityName = contactData?.facilityName || "ISBABC MANUFACTURING";
  const addressLine1 =
    contactData?.addressLine1 || "Baloda Bazar - Bhatapara Highway";
  const addressLine2 =
    contactData?.addressLine2 || "Chhattisgarh - 493332, India";
  const phone = contactData?.phone || "+91 97708 30055";
  const phoneHours =
    contactData?.phoneHours || "Mon – Sat · 9:30 AM to 6:30 PM IST";
  const email = contactData?.email || "republicnirvana@gmail.com";
  const emailSubtext =
    contactData?.emailSubtext || "Direct inquiries & customer support";
  const mapCoordinates =
    contactData?.mapCoordinates || "21.6548° N, 81.9492° E";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("Inquiry sent. Our team will get back to you shortly.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: "",
      });
    }, 800);
  };

  return (
    <div
      className="w-full max-w-full overflow-x-hidden antialiased"
      style={{ backgroundColor: PALETTE.cream, color: PALETTE.charcoal }}
    >
      <SEO
        title="Contact Us — Nirvana Republic"
        description="Get in touch with Nirvana Republic for orders, support, and inquiries."
        canonical="/contact"
      />

      {/* ================= 1. HEADER (Olive Green #4D694E) ================= */}
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
              Get In Touch
            </span>

            <h1
              className={`${SERIF} mt-2 text-3xl font-normal leading-tight tracking-tight sm:text-4xl lg:text-5xl`}
              style={{ color: PALETTE.cream }}
            >
              Connect with us
            </h1>

            <p
              className="mt-2 text-xs leading-relaxed opacity-90 sm:text-sm"
              style={{ color: `${PALETTE.cream}D9` }}
            >
              Have a question about our products or need assistance with an existing order? We are here to help.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 2. MAIN GRID: INFO + INQUIRY FORM ================= */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left: Contact Info */}
          <div className="space-y-4 lg:col-span-5">
            <div>
              <p
                className="font-mono text-[10px] uppercase tracking-[0.2em]"
                style={{ color: PALETTE.amber }}
              >
                Direct Office
              </p>
              <h2
                className={`${SERIF} mt-0.5 text-xl font-normal sm:text-2xl`}
                style={{ color: PALETTE.charcoal }}
              >
                Facility Coordinates
              </h2>
            </div>

            <div className="space-y-2.5">
              {/* Address Card */}
              <div
                className="flex items-start gap-3 rounded-xl border p-4 shadow-2xs"
                style={{
                  backgroundColor: "white",
                  borderColor: `${PALETTE.olive}26`,
                }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: PALETTE.olive,
                    color: PALETTE.cream,
                  }}
                >
                  <Building2 size={15} />
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider opacity-60">
                    Facility
                  </p>
                  <p className="text-xs font-semibold sm:text-sm">
                    {facilityName}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed opacity-75">
                    {addressLine1} <br />
                    {addressLine2}
                  </p>
                </div>
              </div>

              {/* Telephone Card */}
              <div
                className="flex items-start gap-3 rounded-xl border p-4 shadow-2xs"
                style={{
                  backgroundColor: "white",
                  borderColor: `${PALETTE.olive}26`,
                }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: PALETTE.olive,
                    color: PALETTE.cream,
                  }}
                >
                  <Phone size={15} />
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider opacity-60">
                    Telephone
                  </p>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="font-mono text-xs font-semibold transition-colors hover:underline"
                    style={{ color: PALETTE.charcoal }}
                  >
                    {phone}
                  </a>
                  <p className="mt-0.5 text-[10.5px] opacity-60">
                    {phoneHours}
                  </p>
                </div>
              </div>

              {/* Email Card */}
              <div
                className="flex items-start gap-3 rounded-xl border p-4 shadow-2xs"
                style={{
                  backgroundColor: "white",
                  borderColor: `${PALETTE.olive}26`,
                }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: PALETTE.olive,
                    color: PALETTE.cream,
                  }}
                >
                  <Mail size={15} />
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider opacity-60">
                    Email
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="font-mono text-xs font-semibold transition-colors hover:underline"
                    style={{ color: PALETTE.charcoal }}
                  >
                    {email}
                  </a>
                  <p className="mt-0.5 text-[10.5px] opacity-60">
                    {emailSubtext}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <div
              className="rounded-2xl border p-5 shadow-2xs sm:p-6"
              style={{
                backgroundColor: "white",
                borderColor: `${PALETTE.olive}26`,
              }}
            >
              <span
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: PALETTE.amber }}
              >
                Direct Message
              </span>
              <h2 className={`${SERIF} mt-0.5 text-xl font-normal sm:text-2xl`}>
                Send a message
              </h2>
              <p className="mt-0.5 text-xs opacity-65">
                Fill in the details below and we will respond within 24 hours.
              </p>

              {submitted && (
                <div
                  className="mt-4 flex items-center gap-2 rounded-xl border p-3 font-mono text-xs"
                  style={{
                    borderColor: `${PALETTE.olive}33`,
                    backgroundColor: `${PALETTE.olive}10`,
                    color: PALETTE.olive,
                  }}
                >
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>
                    Your message has been sent. We will get back to you shortly.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider opacity-70">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full rounded-lg border px-3 py-2 text-xs outline-none transition-colors focus:border-[#4D694E]"
                      style={{
                        borderColor: `${PALETTE.olive}26`,
                        backgroundColor: PALETTE.cream,
                      }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider opacity-70">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@domain.com"
                      className="w-full rounded-lg border px-3 py-2 text-xs outline-none transition-colors focus:border-[#4D694E]"
                      style={{
                        borderColor: `${PALETTE.olive}26`,
                        backgroundColor: PALETTE.cream,
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider opacity-70">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-lg border px-3 py-2 font-mono text-xs outline-none transition-colors focus:border-[#4D694E]"
                      style={{
                        borderColor: `${PALETTE.olive}26`,
                        backgroundColor: PALETTE.cream,
                      }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider opacity-70">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-lg border px-2.5 py-2 text-xs outline-none transition-colors focus:border-[#4D694E]"
                      style={{
                        borderColor: `${PALETTE.olive}26`,
                        backgroundColor: PALETTE.cream,
                      }}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order & Delivery Tracking">Order &amp; Delivery Tracking</option>
                      <option value="Product Details">Product Information</option>
                      <option value="Bulk Inquiries">Bulk / Corporate Orders</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider opacity-70">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={3}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    className="w-full rounded-lg border p-3 text-xs leading-relaxed outline-none transition-colors focus:border-[#4D694E]"
                    style={{
                      borderColor: `${PALETTE.olive}26`,
                      backgroundColor: PALETTE.cream,
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 font-mono text-xs uppercase tracking-wider transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: PALETTE.olive,
                    color: PALETTE.cream,
                  }}
                >
                  <Send size={12} />
                  <span>{submitting ? "Sending..." : "Submit Message"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. MAP SECTION ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div
          className="overflow-hidden rounded-2xl border shadow-2xs"
          style={{
            backgroundColor: "white",
            borderColor: `${PALETTE.olive}26`,
          }}
        >
          <div
            className="flex flex-col justify-between gap-2 border-b p-3.5 sm:flex-row sm:items-center sm:px-5"
            style={{
              borderColor: `${PALETTE.olive}26`,
              backgroundColor: PALETTE.cream,
            }}
          >
            <div className="flex items-center gap-2">
              <MapPin size={15} style={{ color: PALETTE.olive }} />
              <p className="text-xs sm:text-sm">
                {addressLine1}, {addressLine2}
              </p>
            </div>
            <span
              className="font-mono text-[10.5px] uppercase tracking-wider"
              style={{ color: PALETTE.amber }}
            >
              {mapCoordinates}
            </span>
          </div>

          <div className="relative h-[280px] w-full bg-[#E8E1D5] sm:h-[340px]">
            <iframe
              title="Facility Location — Baloda Bazar Bhatapara Highway"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118742.6372866946!2d81.8791011357605!3d21.68882998642278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a2861c8a14b584d%3A0xe9f75d5fa4b4ddc5!2sBhatapara%20-%20Baloda%20Bazar%20Rd%2C%20Chhattisgarh!5e0!3m2!1sen!2sin!4v1711283921094!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}