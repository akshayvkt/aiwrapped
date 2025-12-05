'use client';

import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import type { WrappedStats } from '@/lib/types';

interface CardProps {
  stats: WrappedStats;
}

export function BusiestDayCard({ stats }: CardProps) {
  if (!stats.busiestDay) {
    return null;
  }

  const parsedDate = parseISO(stats.busiestDay.date);
  const prettyDate = Number.isNaN(parsedDate.getTime())
    ? stats.busiestDay.date
    : format(parsedDate, 'MMM d, yyyy');

  return (
    <div className="h-screen flex flex-col items-center justify-center px-[4vw] py-[2vh] bg-gradient-to-br from-[#0ea5e9] to-[#3b82f6] text-[#f8f5f2] relative overflow-hidden">
      {/* Background accent blobs - sky blue theme */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#38bdf8]/25 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-[#60a5fa]/20 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl relative z-10"
      >
        {/* Editorial label */}
        <p className="text-[clamp(0.65rem,1.5vh,0.875rem)] uppercase tracking-[0.3em] text-[#7dd3fc] mb-[1.5vh] font-bold">
          Your Busiest Day
        </p>

        {/* Accent line */}
        <div className="h-[0.5vh] w-[15vw] max-w-32 bg-[#7dd3fc] mx-auto mb-[3vh]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-[1.5vh]"
        >
          <p className="font-display text-[clamp(3rem,14vh,10rem)] font-black text-[#f8f5f2] leading-none tracking-tighter">
            {stats.busiestDay.sessions}
          </p>
          <p className="font-display text-[clamp(1.25rem,3.5vh,2.5rem)] font-bold text-[#f8f5f2]">
            conversations
          </p>
          <p className="text-[clamp(0.875rem,2.5vh,1.5rem)] text-[#f8f5f2]/70 mt-[1.5vh]">
            in a single day ({prettyDate})
          </p>
          <p className="text-[clamp(0.75rem,2vh,1.25rem)] text-[#f8f5f2]/60 mt-[1vh]">
            {stats.busiestDay.messages.toLocaleString()} messages exchanged
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
