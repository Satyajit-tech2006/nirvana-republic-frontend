import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SEO } from "@/components/SEO";

const PALETTE = {
  olive: "#4D694E",
  cream: "#FFF3D5",
  forest: "#324633",
  amber: "#C87A3E",
  charcoal: "#1E261F",
} as const;

const SERIF = "font-['Fraunces',ui-serif,Georgia,serif]";

const memberPledges = [
  "Verified pure ingredients and lab-tested quality standards",
  "Real-time order tracking and expedited checkout",
  "Saved wishlist items and personalized wellness essentials",
];

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
      navigate("/");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "We couldn't verify those credentials. Please re-check and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title={isLogin ? "Sign In — Nirvana Republic" : "Create Account — Nirvana Republic"}
        description="Access your account, track orders, and manage saved wellness essentials."
        canonical="/auth"
      />

      <main
        className="min-h-[calc(100dvh-3.5rem)] antialiased"
        style={{ backgroundColor: PALETTE.cream, color: PALETTE.charcoal }}
      >
        <div className="mx-auto grid min-h-[calc(100dvh-3.5rem)] max-w-6xl grid-cols-1 md:grid-cols-12">
          {/* Left Column: Brand Feature (Desktop / Tablet) */}
          <section
            className="hidden flex-col justify-between border-r p-6 md:col-span-5 md:flex lg:p-10"
            style={{
              borderColor: `${PALETTE.olive}26`,
              backgroundColor: `${PALETTE.olive}0A`,
            }}
          >
            <div>
              <span
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: PALETTE.amber }}
              >
                Nirvana Republic
              </span>

              <h1
                className={`${SERIF} mt-2 text-balance text-2xl leading-tight tracking-tight sm:text-3xl`}
                style={{ color: PALETTE.charcoal }}
              >
                Simple, thoughtful wellness for everyday life.
              </h1>

              <p className="mt-3 text-xs leading-relaxed opacity-75">
                Sign in to manage your saved formulations, reorder your daily staples, and access verified product information.
              </p>

              <ul className="mt-6 space-y-3">
                {memberPledges.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full"
                      style={{
                        backgroundColor: `${PALETTE.olive}20`,
                        color: PALETTE.olive,
                      }}
                    >
                      <Check size={9} strokeWidth={2.5} />
                    </span>
                    <span className="text-xs leading-relaxed opacity-85">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="border-t pt-4"
              style={{ borderColor: `${PALETTE.olive}20` }}
            >
              <p className="font-mono text-[10px] uppercase tracking-wider opacity-60">
                Nirvana Republic &copy; All rights reserved.
              </p>
            </div>
          </section>

          {/* Right Column: Auth Form */}
          <section className="flex flex-col justify-center px-4 py-8 sm:px-8 md:col-span-7 md:px-8 lg:px-12">
            <div className="mx-auto w-full max-w-sm">
              {/* Header & Toggle */}
              <div
                className="flex items-center justify-between border-b pb-3"
                style={{ borderColor: `${PALETTE.olive}20` }}
              >
                <div>
                  <h2
                    className={`${SERIF} text-xl tracking-tight sm:text-2xl`}
                    style={{ color: PALETTE.charcoal }}
                  >
                    {isLogin ? "Welcome back" : "Create an account"}
                  </h2>
                  <p className="mt-0.5 text-[11px] opacity-65">
                    {isLogin
                      ? "Enter your credentials to access your account."
                      : "Create your account in just a minute."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="font-mono text-[10.5px] uppercase tracking-wider underline underline-offset-4 transition-opacity hover:opacity-80"
                  style={{ color: PALETTE.olive }}
                >
                  {isLogin ? "New user?" : "Sign in?"}
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  className="mt-4 rounded-md border-l-2 p-2.5 font-mono text-[11px] leading-relaxed"
                  style={{
                    borderColor: PALETTE.amber,
                    backgroundColor: `${PALETTE.amber}12`,
                    color: PALETTE.charcoal,
                  }}
                >
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                {!isLogin && (
                  <>
                    <div>
                      <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider opacity-70">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border bg-white px-3 py-2 text-xs outline-none transition-colors focus:border-[#4D694E]"
                        style={{ borderColor: `${PALETTE.olive}26` }}
                        placeholder="Your full name"
                        autoComplete="name"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider opacity-70">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-lg border bg-white px-3 py-2 font-mono text-xs outline-none transition-colors focus:border-[#4D694E]"
                        style={{ borderColor: `${PALETTE.olive}26` }}
                        placeholder="+91 98765 43210"
                        autoComplete="tel"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider opacity-70">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border bg-white px-3 py-2 text-xs outline-none transition-colors focus:border-[#4D694E]"
                    style={{ borderColor: `${PALETTE.olive}26` }}
                    placeholder="you@domain.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="font-mono text-[10px] uppercase tracking-wider opacity-70">
                      Password *
                    </label>
                    <span className="font-mono text-[9px] uppercase tracking-wider opacity-50">
                      Min 6 chars
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border bg-white py-2 pl-3 pr-8 text-xs outline-none transition-colors focus:border-[#4D694E]"
                      style={{ borderColor: `${PALETTE.olive}26` }}
                      placeholder="••••••••"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                    >
                      {showPassword ? (
                        <EyeOff size={13} strokeWidth={1.5} />
                      ) : (
                        <Eye size={13} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
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
                  <span>
                    {submitting
                      ? "Verifying..."
                      : isLogin
                      ? "Sign In"
                      : "Create Account"}
                  </span>
                  <ArrowRight size={12} strokeWidth={1.5} />
                </button>
              </form>

              {/* Privacy Footer */}
              <p className="mt-5 text-center text-[10.5px] leading-relaxed opacity-60">
                By continuing, you agree to our{" "}
                <Link to="/about" className="underline underline-offset-2 opacity-90 hover:opacity-100">
                  terms
                </Link>{" "}
                and privacy policy.
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default AuthPage;