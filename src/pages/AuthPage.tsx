import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SEO } from "@/components/SEO";

const sanctuaryPledges = [
  "Track lots from 18 verified single-origin Indian farm clusters",
  "Access independent batch certificates & harvest chemistry",
  "Save custom pantry rituals with one-click reordering",
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
        title={isLogin ? "Sign In — Sanctuary Account" : "Open Your Pantry Account"}
        description="Access your saved harvest batches, track single-origin dispatch orders, and manage clean daily rituals."
        canonical="/auth"
      />

      <main className="min-h-[calc(100dvh-5rem)] bg-background">
        <div className="container-page grid min-h-[calc(100dvh-5rem)] lg:grid-cols-12">
          {/* Editorial Left Column */}
          <section className="hidden flex-col justify-between border-r border-border/80 py-16 pr-12 lg:col-span-5 lg:flex xl:col-span-6 xl:pr-20">
            <div>
              <p className="eyebrow-accent">Member Sanctuary</p>
              <h1 className="mt-4 text-balance font-display text-4xl leading-[1.12] tracking-tight text-foreground xl:text-display-md">
                Every harvest traced. Every batch accountable.
              </h1>
              <p className="mt-5 max-w-[38ch] text-[15px] leading-relaxed text-muted-foreground">
                Your account is a quiet corner for managing whole-food staples, lab-tested harvests, and unhurried daily rituals.
              </p>

              <ul className="mt-12 space-y-4">
                {sanctuaryPledges.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-sand-200 text-moss">
                      <Check size={10} strokeWidth={2.5} />
                    </span>
                    <span className="text-xs leading-relaxed text-foreground/85">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border/80 pt-6">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Nirvana Republic &copy; Batch Registry &middot; Raipur, Chhattisgarh
              </p>
            </div>
          </section>

          {/* Form Right Column */}
          <section className="flex flex-col justify-center py-12 sm:py-16 lg:col-span-7 lg:py-20 lg:pl-12 xl:col-span-6 xl:pl-20">
            <div className="mx-auto w-full max-w-md">
              {/* Top Mode Segmented Switch */}
              <div className="flex items-center justify-between border-b border-border/80 pb-4">
                <div>
                  <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
                    {isLogin ? "Welcome back" : "Create an account"}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isLogin
                      ? "Enter your details to sign in to your pantry."
                      : "A single step to start saving and tracking batches."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="font-mono text-xs uppercase tracking-wider text-moss underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  {isLogin ? "Need an account?" : "Have an account?"}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-6 border-l-2 border-clay bg-sand-100/60 p-3.5 text-xs leading-relaxed text-clay">
                  {error}
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {!isLogin && (
                  <>
                    <div>
                      <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        Full Name <span className="text-clay">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-base text-sm"
                        placeholder="Amara Sen"
                        autoComplete="name"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-base text-sm"
                        placeholder="+91 98765 43210"
                        autoComplete="tel"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Email Address <span className="text-clay">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-base text-sm"
                    placeholder="amara@domain.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Password <span className="text-clay">*</span>
                    </label>
                    {isLogin && (
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Min 6 chars
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-base pr-10 text-sm"
                      placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff size={15} strokeWidth={1.5} />
                      ) : (
                        <Eye size={15} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-base btn-primary mt-2 w-full py-3.5 text-xs uppercase tracking-[0.14em] disabled:pointer-events-none disabled:opacity-50"
                >
                  <span>{submitting ? "Verifying..." : isLogin ? "Sign In" : "Open Sanctuary Account"}</span>
                  <ArrowRight size={13} strokeWidth={1.5} />
                </button>
              </form>

              {/* Privacy Footnote */}
              <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
                By entering, you agree to our{" "}
                <Link to="/about" className="link-underline text-foreground">
                  harvest standards
                </Link>{" "}
                and unblended sourcing policy.
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default AuthPage;