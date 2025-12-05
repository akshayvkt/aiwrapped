'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CountUpNumber } from '../ui/CountUpNumber';
import type { WrappedStats } from '@/lib/types';
import { useProvider } from '../providers/ProviderContext';
import { providerLabel } from '@/lib/providerMeta';

interface CardProps {
  stats: WrappedStats;
  exportMode?: boolean;
}

export function SessionsCard({ stats, exportMode = false }: CardProps) {
  const provider = useProvider();
  const assistantName = providerLabel(provider);
  const [showMessages, setShowMessages] = useState(exportMode);

  const handleSessionsComplete = useCallback(() => {
    if (exportMode) {
      setShowMessages(true);
      return;
    }
    setTimeout(() => setShowMessages(true), 140);
  }, [exportMode]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#ea580c] to-[#dc2626] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent gradients - pre-baked for mobile perf */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 78% 20%, rgba(251, 146, 60, 0.24) 0%, rgba(251, 146, 60, 0.07) 36%, rgba(251, 146, 60, 0) 58%), radial-gradient(circle at 18% 82%, rgba(251, 191, 36, 0.18) 0%, rgba(251, 191, 36, 0.06) 34%, rgba(251, 191, 36, 0) 56%)',
        }}
      />

      {/* Asymmetric editorial layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[min(1100px,92vw)]"
      >
        {/* Main stat - asymmetric */}
        <div className="mb-12 sm:mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#f8f5f2]/70 text-[clamp(0.95rem,2.8vw,1.2rem)] mb-5 uppercase tracking-wider"
          >
            During this time, you had
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative"
          >
            {/* Massive number with Playfair Display */}
            <CountUpNumber
              value={stats.totalSessions}
              className="font-display text-[clamp(3.75rem,18vw,12rem)] font-black text-[#f8f5f2] leading-none tracking-tighter mb-3 break-words"
              onComplete={handleSessionsComplete}
              instant={exportMode}
            />

            {/* Accent line */}
            <div className="h-1.5 w-40 sm:w-48 bg-[#fbbf24] mb-5" />

            <p className="font-display text-[clamp(1.75rem,5vw,3rem)] md:text-[clamp(2.5rem,4vw,3.75rem)] font-bold text-[#f8f5f2] mb-2">
              conversations
            </p>

            <p className="text-[#f8f5f2]/75 text-[clamp(1rem,3vw,1.4rem)]">
              with <span className="text-[#fbbf24] font-semibold">{assistantName}</span>
            </p>
          </motion.div>
        </div>

        {/* Secondary stat - magazine-style callout */}
        <div className="min-h-[240px] sm:min-h-[260px] md:min-h-[300px] flex items-start justify-end">
          <AnimatePresence>
            {showMessages && (
              <motion.div
                initial={{ opacity: 0, x: 30, rotate: -2 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ duration: 0.6 }}
                className="relative bg-[#f8f5f2]/5 backdrop-blur-sm rounded-3xl px-6 sm:px-10 py-10 sm:py-12 md:px-14 md:py-14 border-4 border-[#f8f5f2]/20 max-w-2xl w-full"
              >
                {/* Decorative accent corner */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-[#fb923c]/25 rounded-br-full" />

                <p className="text-[#f8f5f2]/75 text-[clamp(0.95rem,2.8vw,1.2rem)] mb-5 uppercase tracking-wider">
                  And in those chats you passed
                </p>

                <CountUpNumber
                  value={stats.totalMessages}
                  className="font-display text-[clamp(3rem,12vw,7rem)] md:text-[clamp(4rem,10vw,8.5rem)] font-black text-[#f8f5f2] leading-none mb-3 break-words"
                />
                <p className="text-[#f8f5f2]/75 text-[clamp(1rem,3vw,1.4rem)]">
                  messages back and forth
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
