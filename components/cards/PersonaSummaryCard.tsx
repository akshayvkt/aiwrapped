'use client';

import { motion } from 'framer-motion';
import type { WrappedStats } from '@/lib/types';

interface CardProps {
  stats: WrappedStats;
}

export function PersonaSummaryCard({ stats }: CardProps) {
  const summary = stats.persona?.summary ?? 'You have a curious mind that ping-pongs between ideas, shipping things just fast enough to stay ahead of your questions.';

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-5 sm:px-7 md:px-8 py-8 sm:py-11 md:py-12 bg-gradient-to-br from-[#0f766e] to-[#155e75] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent blobs - teal/turquoise theme */}
      <div className="absolute top-20 left-0 w-[600px] h-[600px] bg-[#14b8a6]/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-[#06b6d4]/15 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-[min(1100px,92vw)] relative z-10"
      >
        <p className="text-[clamp(0.65rem,1.5vh,0.875rem)] uppercase tracking-[0.4em] text-[#14b8a6] mb-[1.5vh] font-bold">
          Who You Are
        </p>
        {/* Accent line */}
        <div className="h-[0.5vh] w-[15vw] max-w-32 bg-[#14b8a6] mx-auto mb-[2vh]" />

        <div className="max-w-[min(900px,92vw)] mx-auto px-3">
          <p className="text-[clamp(0.98rem,2.4vh,1.3rem)] leading-[1.55] font-medium text-balance">
            {summary}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
