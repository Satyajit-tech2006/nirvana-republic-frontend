import { useState } from "react";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");

  return (
    <section className="container-page py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">The Sunday note</p>
        <h2 className="mt-4 text-balance text-3xl md:text-[2.6rem] md:leading-[1.1]">
          One simple idea for eating better, every Sunday.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          No fads, no 30-day challenges. Just recipes, sourcing notes and small habits from our kitchen —
          plus 10% off your first order.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setEmail("");
            toast.success("You're on the list. Check your inbox for your 10% code.");
          }}
          className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-full border border-border bg-card px-5 py-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />
          <button type="submit" className="btn-base btn-primary shrink-0">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
