"use client";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-black text-white px-4 pb-16 pt-24 relative overflow-hidden flex items-center justify-center">
      {/* Background Blobs */}
      <div className="fixed top-[20%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <section className="mx-auto w-full max-w-md relative z-10">
        {children}
      </section>
    </main>
  );
}
