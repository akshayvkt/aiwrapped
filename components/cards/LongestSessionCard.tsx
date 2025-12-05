'use client';

import { motion } from 'framer-motion';
import type { WrappedStats } from '@/lib/types';

interface CardProps {
  stats: WrappedStats;
}

export function LongestSessionCard({ stats }: CardProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#06b6d4] to-[#14b8a6] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent blobs - cyan/teal theme */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#22d3ee]/25 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-[#2dd4bf]/20 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-[min(1100px,92vw)] relative z-10"
      >
        {/* Editorial label */}
        <p className="text-[clamp(0.8rem,2.4vw,1rem)] uppercase tracking-[0.3em] text-[#67e8f9] mb-4 font-bold">
          Marathon Session
        </p>

        {/* Accent line */}
        <div className="h-[0.5rem] w-28 sm:w-32 bg-[#67e8f9] mx-auto mb-7" />

        <p className="text-[#f8f5f2]/75 text-[clamp(1rem,3vw,1.25rem)] mb-6">
          Your longest conversation lasted
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
          className="mb-8"
        >
          <p className="font-display text-[clamp(3.5rem,14vw,8rem)] font-black text-[#f8f5f2] leading-none tracking-tighter break-words">
            {stats.longestSession.duration}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="font-display text-[clamp(1.75rem,5vw,2.75rem)] font-bold text-[#f8f5f2] mb-3 text-balance"
        >
          That's dedication
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-[#f8f5f2]/80 text-[clamp(1rem,3vw,1.25rem)] mt-6 italic text-balance"
        >
          "{stats.longestSession.name}"
        </motion.p>
      </motion.div>
    </div>
  );
}
