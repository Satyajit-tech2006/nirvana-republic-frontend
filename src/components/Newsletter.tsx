import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setEmail("");
      setLoading(false);
      toast.success("You're on the list. Check your inbox for your 10% ritual code.");
    }, 400);
  };

  return (
    <section className="border-t border-border/80 bg-sand-50/50 py-20 md:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow-accent">The Sunday Dispatch</p>
          <h2 className="mt-4 text-balance font-display text-3xl leading-[1.1] tracking-tight text-foreground md:text-display-md">
            One simple idea for eating better, every Sunday.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            No fads, no complex regimens. Just seasonal harvest notes, simple kitchen rituals, and
            10% off your first batch.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex w-full max-w-md flex-col gap-2.5 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="input-base rounded-full px-5 py-3 text-sm shadow-xs"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-base btn-primary shrink-0 py-3 text-xs uppercase tracking-wider"
            >
              <span>{loading ? "Joining..." : "Subscribe"}</span>
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </form>

          <p className="mt-4 text-[11px] text-muted-foreground/75">
            Single-origin dispatches only. Unsubscribe anytime in one click.
          </p>
        </div>
      </div>
    </section>
  );
}