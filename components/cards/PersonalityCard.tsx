'use client';

import { motion } from 'framer-motion';
import type { WrappedStats } from '@/lib/types';

interface CardProps {
  stats: WrappedStats;
}

export function PersonalityCard({ stats }: CardProps) {
  const title = stats.persona?.title ?? 'The Enigmatic Explorer';
  const summary = stats.persona?.summary ?? 'You have a curious mind that ping-pongs between ideas, shipping things just fast enough to stay ahead of your questions.';

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#6b21a8] to-[#4c1d95] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent blobs - purple/violet theme */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-[#a855f7]/20 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#ec4899]/15 rounded-full blur-[120px]" />

      {/* Center-aligned layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10 w-full max-w-[min(1100px,92vw)]"
      >
        {/* Small label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[clamp(0.8rem,2.4vw,1rem)] uppercase tracking-[0.3em] text-[#a855f7] mb-5 sm:mb-6 font-bold"
        >
          Your Personality
        </motion.p>

        {/* MASSIVE headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-display text-[clamp(2.2rem,7vw,4rem)] sm:text-[clamp(3rem,8vw,5rem)] lg:text-[clamp(3.5rem,7vw,5.5rem)] font-black leading-[0.95] tracking-tighter text-[#f8f5f2] max-w-[min(950px,90vw)] mx-auto break-words text-balance mb-4 sm:mb-5"
        >
          {title}
        </motion.h2>

        {/* Accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="h-[0.5rem] w-28 sm:w-36 md:w-44 bg-[#ec4899] mb-6 sm:mb-8 mx-auto"
        />

        {/* Summary */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-[clamp(0.95rem,2.2vw,1.2rem)] leading-[1.6] text-[#f8f5f2]/85 max-w-[min(700px,85vw)] mx-auto"
        >
          {summary}
        </motion.p>
      </motion.div>
    </div>
  );
}
