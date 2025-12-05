'use client';

import { motion } from 'framer-motion';
import type { WrappedStats } from '@/lib/types';

interface CardProps {
  stats: WrappedStats;
}

// Title and one-liner based on peak time
const peakTimeContent: Record<string, { title: string; oneLiner: string }> = {
  Morning: {
    title: 'Early Bird',
    oneLiner: "You get your questions in before most people hit snooze.",
  },
  Afternoon: {
    title: 'Afternoon Thinker',
    oneLiner: "Your best ideas hit when you're supposed to be in that meeting.",
  },
  Evening: {
    title: 'Night Mode',
    oneLiner: "Work ends. Your brain finally turns on.",
  },
  Midnight: {
    title: 'Night Owl',
    oneLiner: "You and 3am have a thing. It's complicated.",
  },
};

export function TimeOfDayCard({ stats }: CardProps) {
  // Safety check for missing data
  if (!stats.timeOfDay || !stats.timeOfDay.periods) {
    return null;
  }

  // Sort by percentage (highest to lowest)
  const sortedPeriods = [...stats.timeOfDay.periods].sort(
    (a, b) => b.percentage - a.percentage
  );

  // Get peak time (first in sorted list)
  const peakPeriod = sortedPeriods[0]?.period ?? 'Afternoon';
  const { title, oneLiner } = peakTimeContent[peakPeriod] ?? peakTimeContent.Afternoon;

  // Define colors for each period - follows the day progression
  const colorMap: Record<string, string> = {
    Morning: 'bg-amber-400',
    Afternoon: 'bg-yellow-500',
    Evening: 'bg-orange-600',
    Midnight: 'bg-amber-700',
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center w-full px-5 sm:px-8 py-[2vh] bg-gradient-to-br from-[#0e7490] via-[#0d9488] to-[#059669] text-[#f0fdfa] relative overflow-hidden">
      {/* Background accent gradients - subtle glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 78% 18%, rgba(167, 243, 208, 0.15) 0%, transparent 50%), radial-gradient(circle at 18% 82%, rgba(103, 232, 249, 0.12) 0%, transparent 50%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-[min(1100px,92vw)] relative z-10"
      >
        {/* Small label - context */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[clamp(0.8rem,2.4vw,1rem)] uppercase tracking-[0.3em] text-[#67e8f9] mb-5 sm:mb-6 font-bold"
        >
          When You Think
        </motion.p>

        {/* Title - fun label based on peak time */}
        <h2 className="font-display text-[clamp(2.5rem,8vw,4.5rem)] font-black text-[#f0fdfa] mb-4 tracking-tight">
          {title}
        </h2>

        {/* Accent line */}
        <div className="h-[0.5rem] w-28 sm:w-32 bg-gradient-to-r from-[#67e8f9] to-[#6ee7b7] mb-5 mx-auto" />

        {/* One-liner */}
        <p className="text-[#f0fdfa]/90 text-[clamp(1rem,2.8vw,1.25rem)] mb-10 max-w-lg mx-auto">
          {oneLiner}
        </p>

        {/* Horizontal Bar Chart */}
        <div className="w-full max-w-[min(900px,92vw)] mx-auto space-y-5 sm:space-y-6">
          {sortedPeriods.map((period, index) => (
            <motion.div
              key={period.period}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.3 + index * 0.15,
                duration: 0.5,
              }}
              className="w-full"
            >
              {/* Period label */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[clamp(1.4rem,4vw,1.8rem)]">{period.emoji}</span>
                <span className="text-[clamp(1.25rem,3.6vw,1.6rem)] text-[#f0fdfa] font-semibold">
                  {period.period}
                </span>
              </div>

              {/* Bar with percentage at the end */}
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${period.percentage}%` }}
                  transition={{
                    delay: 0.5 + index * 0.15,
                    duration: 0.8,
                    ease: 'easeOut',
                  }}
                  className={`h-12 ${colorMap[period.period]} rounded-full shadow-lg`}
                />
                <span className="font-display text-[clamp(1.4rem,4vw,1.9rem)] font-bold text-[#f0fdfa] min-w-[3.5rem]">
                  {Math.round(period.percentage)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
