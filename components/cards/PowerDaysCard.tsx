'use client';

import { motion } from 'framer-motion';
import type { WrappedStats } from '@/lib/types';

interface CardProps {
  stats: WrappedStats;
}

export function PowerDaysCard({ stats }: CardProps) {
  // Safety check for missing data
  if (!stats.powerDays || !stats.powerDays.topDays) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 md:px-12 bg-gradient-to-br from-[#f43f5e] to-[#ec4899] text-[#f8f5f2] relative overflow-hidden">
      {/* Background accent blobs - pink/rose theme */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#fb7185]/25 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-[#f472b6]/20 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl w-full relative z-10"
      >
        {/* Editorial label */}
        <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[#fda4af] mb-6 font-bold">
          Power Days
        </p>

        {/* Accent line */}
        <div className="h-2 w-32 bg-[#fda4af] mx-auto mb-10" />

        {/* Title */}
        <h2 className="font-display text-4xl md:text-6xl font-black text-[#f8f5f2] mb-12 tracking-tight">
          Your Top Thinking Days
        </h2>

        {/* Top 4 days */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="space-y-4">
            {stats.powerDays.topDays.map((day, index) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                className="text-left max-w-md mx-auto"
              >
                <p className="font-display text-2xl md:text-3xl font-bold text-[#f8f5f2]">
                  <span className="text-[#fda4af] mr-4">{index + 1}.</span>
                  {day}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
