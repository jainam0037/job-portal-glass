import Link from "next/link";
import Image from "next/image";
import { Database, Globe, Code } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 relative overflow-hidden flex flex-col">
      {/* Grid background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        aria-hidden
      />

      {/* Glowing orbs - subtle aurora blend */}
      <div
        className="absolute -top-24 -left-32 w-[500px] h-[500px] rounded-full bg-purple-500 blur-[160px] opacity-10"
        aria-hidden
      />
      <div
        className="absolute -top-24 -right-32 w-[500px] h-[500px] rounded-full bg-blue-500 blur-[160px] opacity-10"
        aria-hidden
      />

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between pl-4 pr-6 sm:pl-5 sm:pr-8">
          <Link
            href="https://www.adzzat.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] focus-visible:rounded"
          >
            <Image
              src="/full-logo.png"
              alt="Adzzat Logo"
              width={180}
              height={50}
              className="object-contain invert brightness-0 dark:invert"
            />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/signin"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition-all hover:bg-zinc-100 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-28 pb-24 text-center sm:pt-32">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-zinc-400">
          ✨ The new standard for tech hiring
        </div>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl md:tracking-tighter">
          Don&apos;t apply. Be queried.
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
          Stop throwing PDF resumes into the void. Build a pristine digital
          identity and let the world&apos;s best engineering teams query you
          directly.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-white px-6 py-3.5 font-semibold text-black shadow-lg transition-all hover:bg-zinc-100 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
          >
            Build your endpoint
          </Link>
          <Link
            href="/jobs"
            className="rounded-xl border border-white/15 bg-white/[0.02] px-6 py-3.5 font-medium text-zinc-200 transition-all hover:border-white/25 hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b]"
          >
            Explore the grid
          </Link>
        </div>

        {/* Glassmorphic mockup window */}
        <div className="mx-auto mt-20 max-w-4xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09090b]/90 shadow-[0_0_80px_rgba(168,85,247,0.08)] ring-1 ring-white/[0.06] backdrop-blur-2xl">
          {/* Fake macOS window header */}
          <div className="flex h-11 items-center gap-2 border-b border-white/[0.06] px-4">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-amber-500/70" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
          </div>
          {/* Mockup body */}
          <div className="flex flex-col gap-6 p-8 text-left">
            <div>
              <h3 className="mb-3 text-sm font-medium text-zinc-400">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {["React", "Python", "TypeScript", "Generative AI"].map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-300"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-zinc-400">
                Preferences
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
                  <p className="mb-1 text-xs font-medium text-zinc-500">
                    Location
                  </p>
                  <p className="text-sm text-zinc-200">Mumbai, India</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
                  <p className="mb-1 text-xs font-medium text-zinc-500">
                    Minimum Comp
                  </p>
                  <p className="text-sm text-zinc-200">$120,000 USD</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
                  <p className="mb-1 text-xs font-medium text-zinc-500">
                    Authorization
                  </p>
                  <p className="text-sm text-zinc-200">H1B / Authorized</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-32 pt-24">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]">
            <Database className="mb-4 h-6 w-6 text-zinc-400 transition-colors group-hover:text-zinc-300" />
            <h3 className="mb-2 text-lg font-semibold text-white">
              Structured Data
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              No broken PDF parsers. We strictly type your skills, experience,
              and timezone.
            </p>
          </div>
          <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]">
            <Globe className="mb-4 h-6 w-6 text-zinc-400 transition-colors group-hover:text-zinc-300" />
            <h3 className="mb-2 text-lg font-semibold text-white">
              Global Arbitrage
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              Seamlessly match with roles across the US, India, and Europe with
              native currency handling.
            </p>
          </div>
          <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]">
            <Code className="mb-4 h-6 w-6 text-zinc-400 transition-colors group-hover:text-zinc-300" />
            <h3 className="mb-2 text-lg font-semibold text-white">
              Developer First
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              Built like a developer tool, not a corporate HR portal. Fast, dark
              mode native, and keyboard accessible.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
