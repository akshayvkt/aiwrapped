'use client';

import { motion } from 'framer-motion';
import { parse, differenceInDays } from 'date-fns';
import type { WrappedStats } from '@/lib/types';
import { CountUpNumber } from '../ui/CountUpNumber';
import { useProvider } from '../providers/ProviderContext';
import { providerLabel } from '@/lib/providerMeta';

interface CardProps {
  stats: WrappedStats;
}

export function StreaksCard({ stats }: CardProps) {
  const provider = useProvider();
  const assistantName = providerLabel(provider);
  const streaks = stats.streaks;
  if (!streaks) {
    return null;
  }

  const { longest, totalActiveDays } = streaks;

  // Calculate frequency: total days / active days, rounded down
  const earliestDateParsed = parse(stats.earliestDate, 'MMM yyyy', new Date());
  const totalDays = differenceInDays(new Date(), earliestDateParsed);
  const frequency = Math.floor(totalDays / totalActiveDays);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#312e81] to-[#1e3a8a] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent gradients - pre-baked for mobile perf */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 78% 18%, rgba(59, 130, 246, 0.28) 0%, rgba(59, 130, 246, 0.08) 34%, rgba(59, 130, 246, 0) 58%), radial-gradient(circle at 20% 82%, rgba(96, 165, 250, 0.2) 0%, rgba(96, 165, 250, 0.07) 34%, rgba(96, 165, 250, 0) 58%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[min(1100px,92vw)]">
        {/* Main stat - top section */}
        <div className="mb-12 sm:mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[#f8f5f2]/70 text-[clamp(0.95rem,2.8vw,1.2rem)] mb-5 uppercase tracking-wider"
          >
            You once used {assistantName} every day for
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mb-3"
          >
            <span className="font-display text-[clamp(3.75rem,18vw,12rem)] font-black text-[#f8f5f2] leading-none tracking-tighter break-words">
              <CountUpNumber
                value={longest.length}
                className="font-display text-[clamp(3.75rem,18vw,12rem)] font-black text-[#f8f5f2] leading-none tracking-tighter"
              />
            </span>
            <span className="font-display text-[clamp(1.75rem,6vw,4rem)] font-bold text-[#60a5fa] ml-3 sm:ml-4 align-baseline">
              days
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="h-1.5 w-40 sm:w-48 bg-[#60a5fa] mb-5" />

            <p className="text-[#f8f5f2]/70 text-[clamp(1rem,3vw,1.4rem)]">
              Remember what you were doing then?
            </p>
          </motion.div>
        </div>

        {/* Bottom section - frequency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="flex items-start justify-end"
        >
          <div className="relative bg-[#f8f5f2]/5 backdrop-blur-sm rounded-3xl px-6 sm:px-10 py-8 sm:py-10 md:px-14 md:py-12 border-4 border-[#f8f5f2]/20 max-w-2xl w-full">
            {/* Decorative accent corner */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-[#60a5fa]/25 rounded-br-full" />

            <p className="text-[#f8f5f2]/75 text-[clamp(0.95rem,2.8vw,1.2rem)] mb-4">
              On average, you use {assistantName} every
            </p>

            <p className="font-display text-[clamp(2rem,6vw,3.5rem)] font-bold text-[#f8f5f2] leading-snug">
              {frequency} day{frequency === 1 ? '' : 's'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
