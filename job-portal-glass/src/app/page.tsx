import Link from "next/link";
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
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#09090b]/50 backdrop-blur-md">
        <Link href="/" className="font-bold tracking-tight text-white">
          Nexus
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/signin"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Join Beta
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 mb-8">
          ✨ The new standard for tech hiring
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
          Don&apos;t apply. Be queried.
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop throwing PDF resumes into the void. Build a pristine digital
          identity and let the world&apos;s best engineering teams query you
          directly.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-zinc-200 transition-all"
          >
            Build your endpoint
          </Link>
          <Link
            href="/jobs"
            className="px-6 py-3 rounded-xl font-medium border border-white/10 hover:bg-white/5 transition-all"
          >
            Explore the grid
          </Link>
        </div>

        {/* Glassmorphic mockup window */}
        <div className="mt-20 mx-auto max-w-4xl bg-[#09090b]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(168,85,247,0.12)] ring-1 ring-white/10 overflow-hidden">
          {/* Fake macOS window header */}
          <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          {/* Mockup body */}
          <div className="p-8 flex flex-col gap-6 text-left">
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {["React", "Python", "TypeScript", "Generative AI"].map(
                  (skill) => (
                    <span
                      key={skill}
                      className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">
                Preferences
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                  <p className="text-xs text-zinc-500 mb-0.5">Location</p>
                  <p className="text-sm text-zinc-200">
                    Mumbai, India
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                  <p className="text-xs text-zinc-500 mb-0.5">Minimum Comp</p>
                  <p className="text-sm text-zinc-200">
                    $120,000 USD
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                  <p className="text-xs text-zinc-500 mb-0.5">Authorization</p>
                  <p className="text-sm text-zinc-200">
                    H1B / Authorized
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
          <Database className="w-6 h-6 text-zinc-300 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Structured Data
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            No broken PDF parsers. We strictly type your skills, experience, and
            timezone.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
          <Globe className="w-6 h-6 text-zinc-300 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Global Arbitrage
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Seamlessly match with roles across the US, India, and Europe with
            native currency handling.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
          <Code className="w-6 h-6 text-zinc-300 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Developer First
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Built like a developer tool, not a corporate HR portal. Fast, dark
            mode native, and keyboard accessible.
          </p>
        </div>
      </section>
    </div>
  );
}
