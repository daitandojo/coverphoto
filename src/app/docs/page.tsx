"use client";

import { motion } from "framer-motion";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#080808] text-[rgba(240,237,232,0.7)]">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div className="space-y-3">
          <a href="/" className="text-xs tracking-[0.3em] text-[#C8B99A] uppercase hover:underline" style={{ fontFamily: "'DM Mono', monospace" }}>← Back to Studio</a>
          <h1 className="text-3xl md:text-4xl text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>API Documentation</h1>
          <p className="text-sm leading-relaxed" style={{ fontFamily: "'DM Mono', monospace" }}>CoverPhoto offers a REST API for programmatic portrait generation. Requires a Studio-tier subscription.</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>Authentication</h2>
          <div className="text-sm space-y-2" style={{ fontFamily: "'DM Mono', monospace" }}>
            <p>All API requests require an API key passed via the <code className="text-[#C8B99A]">Authorization</code> header:</p>
            <pre className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-white/5 text-xs overflow-x-auto">
              <code>Authorization: Bearer cp_api_live_xxxxxxxxxxxxx</code>
            </pre>
            <p>Contact the CoverPhoto team to obtain an API key for your Studio subscription.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>Endpoints</h2>

          <div className="space-y-6 text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>
            <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/5">
              <p className="text-[#C8B99A] mb-2">POST /api/v1/generate</p>
              <p className="text-xs text-[rgba(240,237,232,0.4)] mb-3">Generate portraits from reference images.</p>
              <p className="text-xs text-[rgba(240,237,232,0.4)] mb-2">Request body:</p>
              <pre className="text-xs overflow-x-auto">{JSON.stringify({
                images: ["https://yourdomain.com/ref1.jpg", "https://yourdomain.com/ref2.jpg"],
                types: ["executive", "founder"],
                constraints: { smile: true, bright: true },
              }, null, 2)}</pre>
            </div>

            <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/5">
              <p className="text-[#C8B99A] mb-2">GET /api/v1/generate/:id</p>
              <p className="text-xs text-[rgba(240,237,232,0.4)]">Poll the status of a generation request. Returns <code>completed</code> with image URLs when done.</p>
            </div>

            <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/5">
              <p className="text-[#C8B99A] mb-2">POST /api/v1/webhooks</p>
              <p className="text-xs text-[rgba(240,237,232,0.4)]">Register a webhook URL that Receive events when generations complete.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>Rate Limits</h2>
          <p className="text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>Studio tier: 100 requests per minute. Higher limits available on request.</p>
        </section>
      </div>
    </main>
  );
}
