export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 to-black text-white py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-neutral-400 hover:text-white transition-colors text-sm">
          ← Back to AI Wrapped
        </a>

        <h1 className="font-display text-4xl font-bold mt-8 mb-2">Privacy Policy</h1>
        <p className="text-neutral-500 mb-12">Effective Date: December 5, 2025</p>

        {/* The Basics Card */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl p-8 mb-12 border border-neutral-800">
          <h2 className="text-xl font-semibold text-emerald-400 mb-6">The Basics</h2>

          <p className="text-neutral-300 mb-6">
            <strong className="text-white">Your conversations are private.</strong> Here&apos;s what you actually need to know:
          </p>

          <div className="space-y-4 text-neutral-300">
            <p>
              <strong className="text-white">Your export stays in your browser</strong> - We never upload your conversation history to our servers. All parsing happens on your device.
            </p>

            <p>
              <strong className="text-white">We generate your persona using AI</strong> - Session titles and the first 3 messages from a small sample of your conversations are sent to Claude to create your personality summary. This isn&apos;t stored.
            </p>

            <p>
              <strong className="text-white">We store what you see on your cards</strong> - Your stats, first message, and latest message are saved so your wrap can be shared. Nothing more.
            </p>

            <p>
              <strong className="text-white">We track basic analytics</strong> - Page views and button clicks via Mixpanel. No conversation data.
            </p>

            <p>
              <strong className="text-white">You&apos;re in control</strong> - Want your wrap deleted? Email us and it&apos;s gone.
            </p>
          </div>

          <p className="text-neutral-400 mt-6 text-sm">
            <strong className="text-neutral-300">Bottom line:</strong> We built AI Wrapped to show you fun insights about your AI usage. We&apos;re not in the business of hoarding your data.
          </p>
        </div>

        {/* Full Policy */}
        <p className="text-neutral-500 text-sm mb-8">Read the full privacy policy below.</p>

        <div className="space-y-10 text-neutral-400 text-sm">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-3">
              <strong className="text-neutral-300">Data you provide:</strong> When you upload your Claude or ChatGPT export, the ZIP file is processed entirely in your browser. We do not receive or store your full conversation history.
            </p>
            <p className="mb-3">
              <strong className="text-neutral-300">Persona generation:</strong> To create your AI persona, we send session titles and the first 3 messages from a small sample of your conversations (up to 100) to Anthropic&apos;s Claude API. This data is used only to generate your personality summary and is not stored by us or Anthropic.
            </p>
            <p>
              <strong className="text-neutral-300">Sharing data:</strong> When your wrap is created, we store: your provider (Claude/ChatGPT), aggregate statistics (message counts, dates, streaks), your first and latest message (displayed on your cards), one session title, and your generated persona. This enables the sharing feature.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>
              We use your data solely to generate and display your AI Wrapped summary. We <strong className="text-white">do not</strong> sell your data. We <strong className="text-white">do not</strong> use your conversations to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Analytics</h2>
            <p>
              We use Mixpanel to collect anonymous usage analytics (page views, feature usage). This helps us improve the product. No conversation content is ever sent to analytics services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Data Retention</h2>
            <p>
              Shared wraps are stored indefinitely to keep share links working. You can request deletion at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Data Deletion</h2>
            <p>
              To delete your shared wrap, email{" "}
              <a href="mailto:support@dysunlabs.com" className="text-white underline">
                support@dysunlabs.com
              </a>{" "}
              with your share link. We&apos;ll remove it within 7 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong className="text-neutral-300">Anthropic (Claude API)</strong> - Persona generation</li>
              <li><strong className="text-neutral-300">Supabase</strong> - Database for shared wraps</li>
              <li><strong className="text-neutral-300">Mixpanel</strong> - Anonymous analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Contact</h2>
            <p>
              Questions? Reach out at{" "}
              <a href="mailto:support@dysunlabs.com" className="text-white underline">
                support@dysunlabs.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-neutral-800 text-sm text-neutral-500">
          <p>AI Wrapped is built by Dysun Inc.</p>
        </div>
      </div>
    </main>
  );
}
