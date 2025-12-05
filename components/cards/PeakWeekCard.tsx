'use client';

import { motion } from 'framer-motion';
import { CountUpNumber } from '../ui/CountUpNumber';
import type { WrappedStats } from '@/lib/types';

interface CardProps {
  stats: WrappedStats;
}

export function PeakWeekCard({ stats }: CardProps) {
  const perDay = Math.round(stats.peakWeek.count / 7);

  return (
    <div className="h-screen flex flex-col items-center justify-center px-[4vw] py-[2vh] bg-gradient-to-br from-[#0ea5e9] to-[#3b82f6] text-[#f8f5f2] relative overflow-hidden">
      {/* Background accent blobs - blue theme */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#38bdf8]/25 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-[#60a5fa]/20 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10"
      >
        {/* Editorial label */}
        <p className="text-[clamp(0.65rem,1.5vh,0.875rem)] uppercase tracking-[0.3em] text-[#7dd3fc] mb-[1.5vh] font-bold">
          Peak Performance
        </p>

        {/* Accent line */}
        <div className="h-[0.5vh] w-[15vw] max-w-32 bg-[#7dd3fc] mx-auto mb-[3vh]" />

        <p className="text-[clamp(0.875rem,2.5vh,1.5rem)] text-[#f8f5f2]/70 mb-[2vh]">
          Your busiest week?
        </p>

        <div className="mb-[2vh]">
          <CountUpNumber
            value={stats.peakWeek.count}
            className="font-display text-[clamp(3rem,14vh,10rem)] font-black text-[#f8f5f2] leading-none tracking-tighter"
          />
        </div>

        <p className="font-display text-[clamp(1.25rem,3vh,2.5rem)] font-bold text-[#f8f5f2] mb-[1vh]">
          conversations in {stats.peakWeek.date}
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-[clamp(0.875rem,2vh,1.25rem)] text-[#f8f5f2]/70 mt-[3vh]"
        >
          That's {perDay} per day
        </motion.p>
      </motion.div>
    </div>
  );
}
