'use client';

import { motion } from 'framer-motion';
import type { WrappedStats } from '@/lib/types';

interface CardProps {
  stats: WrappedStats;
}

export function RoastCard({ stats }: CardProps) {
  const greentext = stats.persona?.roast ?? ">be me\n>mass AI to mass a simple decision\n>mass 3 hours researching\n>still mass decide";

  // Split by newlines and render each line
  const lines = greentext.split(/\\n|\n/).filter(line => line.trim());

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-11 md:py-12 bg-gradient-to-br from-[#1a472a] to-[#2d5a3d] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent blobs - dark green 4chan theme */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-[#4ade80]/15 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#22c55e]/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-left w-full max-w-[min(600px,92vw)] relative z-10"
      >
        {/* Header label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[clamp(1.1rem,3vw,1.4rem)] text-[#4ade80] mb-2 font-semibold"
        >
          You, basically:
        </motion.p>

        {/* Accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="h-1 w-16 sm:w-20 bg-[#4ade80] mb-5 sm:mb-6 origin-left"
        />

        {/* Greentext lines */}
        <div className="font-mono space-y-1">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              className="text-[clamp(1rem,3vw,1.3rem)] leading-[1.6] text-[#6ee7b7]"
            >
              {line}
            </motion.p>
          ))}
        </div>

      </motion.div>
    </div>
  );
}
