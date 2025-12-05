'use client';

import { motion } from 'framer-motion';
import type { WrappedStats } from '@/lib/types';

interface CardProps {
  stats: WrappedStats;
}

export function PredictionCard({ stats }: CardProps) {
  const prediction = stats.persona?.prediction ?? "Next year you'll chase another wild idea—you'll blame curiosity, but it'll secretly be because you can't resist a fresh start.";

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#a21caf] to-[#c026d3] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent blobs - magenta/fuchsia theme */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-[#d946ef]/20 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#e879f9]/15 rounded-full blur-[120px]" />

      {/* Center-aligned layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10 w-full max-w-[min(1100px,92vw)]"
      >
        {/* Big headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-display text-[clamp(2.2rem,7vw,4rem)] sm:text-[clamp(3rem,8vw,5rem)] lg:text-[clamp(3.5rem,7vw,5.5rem)] font-black leading-[0.95] tracking-tighter text-[#f8f5f2] mb-4 sm:mb-5"
        >
          What&apos;s Next For You
        </motion.h2>

        {/* Accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="h-[0.5rem] w-28 sm:w-36 md:w-44 bg-[#e879f9] mb-6 sm:mb-8 mx-auto"
        />

        {/* Prediction text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-[clamp(0.95rem,2.2vw,1.2rem)] leading-[1.6] text-[#f8f5f2]/85 max-w-[min(700px,85vw)] mx-auto"
        >
          {prediction}
        </motion.p>
      </motion.div>
    </div>
  );
}
