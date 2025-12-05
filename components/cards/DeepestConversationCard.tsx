'use client';

import { motion } from 'framer-motion';
import type { WrappedStats } from '@/lib/types';

interface CardProps {
  stats: WrappedStats;
}

export function DeepestConversationCard({ stats }: CardProps) {
  const topSession = stats.topSessions[0];

  if (!topSession) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#ef4444] to-[#f43f5e] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent blobs - red/rose theme */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#f87171]/25 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-[#fb7185]/20 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-[min(1100px,92vw)] relative z-10"
      >
        {/* Editorial label */}
        <p className="text-[clamp(0.8rem,2.4vw,1rem)] uppercase tracking-[0.3em] text-[#fca5a5] mb-4 font-bold">
          Deep Dive
        </p>

        {/* Accent line */}
        <div className="h-[0.5rem] w-28 sm:w-32 bg-[#fca5a5] mx-auto mb-6" />

        <p className="text-[#f8f5f2]/75 text-[clamp(1rem,3vw,1.3rem)] mb-6 text-balance">
          But when you find something worth it?
        </p>

        <p className="font-display text-[clamp(3.5rem,16vw,10rem)] font-black text-[#f8f5f2] leading-none tracking-tighter mb-3 break-words">
          {topSession.messages}
        </p>

        <p className="font-display text-[clamp(1.6rem,4.5vw,2.5rem)] font-bold text-[#f8f5f2] mb-4">
          messages
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="text-[#f8f5f2]/80 text-[clamp(1rem,3vw,1.25rem)] mb-4 italic text-balance px-3">
            &ldquo;{topSession.name}&rdquo;
          </p>

          <p className="font-display text-[clamp(1.2rem,3.4vw,1.8rem)] font-bold text-[#fca5a5]">
            You really commit.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
