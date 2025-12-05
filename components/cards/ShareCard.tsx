'use client';

import { motion } from 'framer-motion';
import { Twitter, Linkedin } from 'lucide-react';
import type { WrappedStats } from '@/lib/types';
import { useProvider } from '../providers/ProviderContext';
import { providerAccentHover, providerLabel, providerTheme } from '@/lib/providerMeta';
import { trackEvent } from '@/lib/mixpanel';

interface CardProps {
  stats: WrappedStats;
}

export function ShareCard({ stats }: CardProps) {
  const provider = useProvider();
  const assistantName = providerLabel(provider);
  const theme = providerTheme(provider);
  const accentHover = providerAccentHover(provider);
  const siteUrl = 'https://aiwrapped.co';

  const twitterText = encodeURIComponent(
    `My ${assistantName} Wrapped:\n• ${stats.totalSessions.toLocaleString()} conversations\n• ${stats.totalMessages.toLocaleString()} messages\n• ${stats.harryPotterMultiple}× Harry Potter length\n• Longest session: ${stats.longestSession.duration}\n\nDiscover yours at: ${siteUrl}\n\nBuilt by @akshayvkt`
  );

  const linkedInText = encodeURIComponent(
    `📊 ${assistantName} Wrapped - My AI Usage\n\n🗓️ Account: ${stats.earliestDate} - ${stats.latestDate}\n💬 ${stats.totalSessions.toLocaleString()} conversations | ${stats.totalMessages.toLocaleString()} messages\n📚 ${(stats.totalTokens / 1000).toFixed(1)}K tokens (${stats.harryPotterMultiple}× Harry Potter series!)\n\n📈 Peak: ${stats.peakWeek.count} sessions in one week\n⏱️ Longest session: ${stats.longestSession.duration}\n\nDiscover your insights at: ${siteUrl}\n\nBuilt by @akshayvkt`
  );

  const shareOnTwitter = () => {
    trackEvent('Shared', { method: 'twitter' });
    window.open(
      `https://twitter.com/intent/tweet?text=${twitterText}`,
      '_blank'
    );
  };

  const shareOnLinkedIn = () => {
    trackEvent('Shared', { method: 'linkedin' });
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}&summary=${linkedInText}`,
      '_blank'
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#10b981] to-[#14b8a6] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+64px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent blobs - emerald/teal theme */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#34d399]/25 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-[#2dd4bf]/20 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-[min(1100px,92vw)] relative z-10"
      >
        {/* Editorial label */}
        <p className="text-[clamp(0.8rem,2.4vw,1rem)] uppercase tracking-[0.3em] text-[#6ee7b7] mb-4 font-bold">
          Share Your Story
        </p>

        {/* Accent line */}
        <div className="h-[0.5rem] w-28 sm:w-32 bg-[#6ee7b7] mx-auto mb-7" />

        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-display text-[clamp(2.4rem,6vw,3.5rem)] md:text-[clamp(3rem,5.5vw,4rem)] font-black text-[#f8f5f2] mb-4 tracking-tight text-balance"
        >
          Your {assistantName} Wrapped
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-[#f8f5f2]/75 text-[clamp(1rem,3vw,1.25rem)] mb-8"
        >
          Share your story
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            onClick={shareOnTwitter}
            className="flex items-center gap-2 px-6 py-3 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/40 backdrop-blur-sm border-2 border-[#1DA1F2]/50 text-[#f8f5f2] rounded-full font-semibold transition-all"
          >
            <Twitter size={20} />
            Share on Twitter
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            onClick={shareOnLinkedIn}
            className="flex items-center gap-2 px-6 py-3 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/40 backdrop-blur-sm border-2 border-[#0A66C2]/50 text-[#f8f5f2] rounded-full font-semibold transition-all"
          >
            <Linkedin size={20} />
            Share on LinkedIn
          </motion.button>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-[#f8f5f2]/70 text-[clamp(0.9rem,2.6vw,1.05rem)]"
        >
          Built by{' '}
          <a
            href="https://twitter.com/akshayvkt"
            target="_blank"
            className={`${theme.accentText} ${accentHover} transition-colors`}
          >
            @akshayvkt
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
