import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About CoverPhoto — Premium AI Portrait Studio",
  description:
    "CoverPhoto is a premium AI portrait generation tool. Upload reference images and receive professionally composed portraits in 12 styles, 8 specialties, with full creative control.",
  openGraph: {
    title: "About CoverPhoto — Premium AI Portrait Studio",
    description:
      "Learn how CoverPhoto uses gpt-image-2 to create photorealistic AI portraits with face-consistent likeness from your reference photos.",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#080808] text-[rgba(240,237,232,0.7)]">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        {/* Header */}
        <header className="space-y-4 text-center">
          <Link href="/" className="text-xs tracking-[0.3em] text-[#C8B99A] uppercase hover:underline" style={{ fontFamily: "'DM Mono', monospace" }}>
            ← Back to Studio
          </Link>
          <h1 className="text-4xl md:text-5xl text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
            About CoverPhoto
          </h1>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ fontFamily: "'DM Mono', monospace" }}>
            A premium AI portrait studio that turns your reference images into professionally composed photographs.
          </p>
        </header>

        {/* How It Works */}
        <section className="space-y-4">
          <h2 className="text-2xl text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>How It Works</h2>
          <div className="space-y-3 text-sm leading-relaxed" style={{ fontFamily: "'DM Mono', monospace" }}>
            <p>CoverPhoto uses OpenAI&apos;s gpt-image-2 model (hosted on Replicate) to generate photorealistic portraits. Upload 2–3 reference photos of a person, select from 12 portrait types and 8 specialty categories, configure constraints like lighting, expression, and framing — and receive professionally composed portraits that preserve the subject&apos;s likeness.</p>
            <p>Each portrait is crafted by an AI photographer brief — a detailed composition, wardrobe, lighting, and mood specification written in the style of a master portrait photographer. The result is indistinguishable from a professional studio session.</p>
          </div>
        </section>

        {/* Portrait Types */}
        <section className="space-y-4">
          <h2 className="text-2xl text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>Portrait Types</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>
            {["Executive", "Founder", "Statesperson", "Outdoorsman", "Passport", "LinkedIn", "Artist", "Athlete", "Scholar", "Minimalist", "Romantic", "Maverick"].map((t) => (
              <div key={t} className="p-3 rounded-lg border border-white/5 bg-[rgba(255,255,255,0.02)]">
                <p className="text-[#C8B99A]">{t}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Specialties */}
        <section className="space-y-4">
          <h2 className="text-2xl text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>Specialty Portraits</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>
            {["Tailored Photo (throne, robe, artifacts)", "Bridal Portrait", "Passport Strip (regulation)", "Hair Style Preview (6 variants)", "Couple Portrait", "Time Travel", "Celebrity Morph", "Holiday France"].map((s) => (
              <div key={s} className="p-3 rounded-lg border border-white/5 bg-[rgba(255,255,255,0.02)]">
                <p className="text-[#C8B99A]">{s}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Prompt Constraints */}
        <section className="space-y-4">
          <h2 className="text-2xl text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>Full Creative Control</h2>
          <p className="text-sm leading-relaxed" style={{ fontFamily: "'DM Mono', monospace" }}>
            With 19 prompt constraints — including Smiling, Looking into Camera, Dramatic Lighting, Vintage, Active, With Others, Full Body, and more — you have fine-grained control over every generated portrait. Combine multiple constraints to achieve exactly the look you want.
          </p>
        </section>

        {/* Technology */}
        <section className="space-y-4">
          <h2 className="text-2xl text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>Technology</h2>
          <div className="text-sm leading-relaxed space-y-3" style={{ fontFamily: "'DM Mono', monospace" }}>
            <p>CoverPhoto is built on Next.js 16 with Tailwind CSS, Framer Motion for animations, and Zustand for state management. Image generation is powered by OpenAI&apos;s gpt-image-2 model, accessed via Replicate&apos;s API. Reference images are stored temporarily on Vercel Blob and removed after processing.</p>
            <p>Authentication is handled by NextAuth.js with Google OAuth and email/password options. The database runs on Neon PostgreSQL via Prisma. Payments are processed through Lemon Squeezy.</p>
          </div>
        </section>

        {/* Privacy & Terms */}
        <section className="space-y-4">
          <h2 className="text-2xl text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>Privacy & Terms</h2>
          <div className="text-sm leading-relaxed space-y-3" style={{ fontFamily: "'DM Mono', monospace" }}>
            <p>CoverPhoto does not store your reference images or generated portraits on its servers. Images are uploaded temporarily for processing and removed after your session ends. We do not train AI models on your photos.</p>
            <p>This tool may not be used to create misleading or fraudulent representations of individuals. Do not upload images of people without their consent.</p>
            <p>Portraits are generated using AI and should not be used for official identification documents unless explicitly verified.</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-white/5 text-center">
          <Link href="/" className="text-xs tracking-[0.3em] text-[rgba(200,185,154,0.3)] uppercase hover:text-[#C8B99A] transition-colors" style={{ fontFamily: "'DM Mono', monospace" }}>
            CoverPhoto — Premium AI Portrait Studio
          </Link>
        </footer>
      </div>
    </main>
  );
}
