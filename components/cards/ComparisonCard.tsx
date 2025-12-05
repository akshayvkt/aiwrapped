'use client';

import { motion } from 'framer-motion';
import { CountUpNumber } from '../ui/CountUpNumber';
import type { WrappedStats } from '@/lib/types';

interface CardProps {
  stats: WrappedStats;
}

export function ComparisonCard({ stats }: CardProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#f59e0b] to-[#f97316] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent gradients - pre-baked for mobile perf */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 78% 18%, rgba(251, 191, 36, 0.24) 0%, rgba(251, 191, 36, 0.08) 34%, rgba(251, 191, 36, 0) 58%), radial-gradient(circle at 18% 82%, rgba(251, 146, 60, 0.2) 0%, rgba(251, 146, 60, 0.07) 34%, rgba(251, 146, 60, 0) 58%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-[min(1100px,92vw)] relative z-10"
      >
        {/* Editorial label */}
        <p className="text-[clamp(0.8rem,2.4vw,1rem)] uppercase tracking-[0.3em] text-[#fde68a] mb-4 font-bold">
          In Perspective
        </p>

        {/* Accent line */}
        <div className="h-[0.5rem] w-28 sm:w-32 bg-[#fde68a] mx-auto mb-7" />

        <p className="text-[#f8f5f2]/75 text-[clamp(1rem,3vw,1.25rem)] mb-5">
          That's
        </p>

        <div className="mb-6 flex items-baseline justify-center gap-3 sm:gap-4">
          <CountUpNumber
            value={stats.harryPotterMultiple}
            decimals={1}
            className="font-display text-[clamp(3.5rem,16vw,10rem)] font-black text-[#f8f5f2] leading-none tracking-tighter"
            suffix="×"
          />
        </div>

        <p className="font-display text-[clamp(1.75rem,5vw,2.75rem)] font-bold text-[#f8f5f2] mb-2 text-balance">
          longer than the entire
        </p>

        <p className="font-display text-[clamp(2rem,5.5vw,3rem)] font-black text-[#fde68a] mb-8 text-balance">
          Harry Potter series
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5, type: 'spring' }}
          className="text-6xl md:text-7xl"
        >
          📚
        </motion.div>
      </motion.div>
    </div>
  );
}
