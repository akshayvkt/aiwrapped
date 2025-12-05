'use client';

import { motion } from 'framer-motion';
import type { WrappedStats } from '@/lib/types';
import { useProvider } from '../providers/ProviderContext';
import { providerLabel } from '@/lib/providerMeta';
import { parse, differenceInDays } from 'date-fns';

interface CardProps {
  stats: WrappedStats;
}

export function TimeSpanCard({ stats }: CardProps) {
  const provider = useProvider();
  const assistantName = providerLabel(provider);

  // Parse earliestDate (format: "MMM yyyy") and calculate days ago
  const earliestDateParsed = parse(stats.earliestDate, 'MMM yyyy', new Date());
  const daysAgo = differenceInDays(new Date(), earliestDateParsed);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#047857] to-[#065f46] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent gradients - pre-baked for mobile perf */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 82% 18%, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.06) 36%, rgba(16, 185, 129, 0) 60%), radial-gradient(circle at 22% 82%, rgba(52, 211, 153, 0.18) 0%, rgba(52, 211, 153, 0.05) 34%, rgba(52, 211, 153, 0) 58%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[min(1100px,92vw)] text-center">
        {/* Main stat - top section */}
        <div className="mb-8 sm:mb-10">
          {/* Step 1: "You started using ChatGPT" */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[#f8f5f2]/70 text-[clamp(0.95rem,2.8vw,1.2rem)] mb-5 uppercase tracking-wider"
          >
            You started using <span className="font-bold text-[#f8f5f2]">{assistantName}</span>
          </motion.p>

          {/* Step 2: The number + "days ago" */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mb-3"
          >
            <span className="font-display text-[clamp(3.75rem,18vw,12rem)] font-black text-[#f8f5f2] leading-none tracking-tighter break-words">
              {daysAgo.toLocaleString()}
            </span>
            <span className="font-display text-[clamp(1.75rem,6vw,4rem)] font-bold text-[#34d399] ml-3 sm:ml-4 align-baseline">
              days ago
            </span>
          </motion.div>

          {/* Accent line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="h-1.5 w-40 sm:w-48 bg-[#34d399] mx-auto" />
          </motion.div>
        </div>

        {/* Message comparison section - Vertical Timeline */}
        {stats.firstMessage && stats.latestMessage && (
          <div className="relative flex flex-col gap-4 text-left max-w-md mx-auto">
            {/* Timeline vertical line */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 1.5, duration: 0.6, ease: 'easeOut' }}
              className="absolute left-[11px] top-[12px] bottom-[12px] w-[2px] bg-[#34d399]/50 origin-top"
            />

            {/* How It Started */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="flex gap-4 items-start"
            >
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-[#047857] border-2 border-[#34d399] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#34d399]" />
              </div>

              {/* Content */}
              <div>
                <p className="text-[#34d399] text-[clamp(0.7rem,1.8vw,0.85rem)] font-bold uppercase tracking-wider mb-1.5">
                  How It Started
                </p>
                <div className="bg-[#34d399]/15 backdrop-blur-sm px-4 py-3 rounded-xl border border-[#34d399]/30 inline-block">
                  <p className="text-[#f8f5f2] text-[clamp(0.9rem,2.2vw,1.05rem)] leading-relaxed">
                    {stats.firstMessage.text}
                  </p>
                  <p className="text-[#f8f5f2]/50 text-[clamp(0.65rem,1.6vw,0.75rem)] mt-2">
                    {stats.firstMessage.date}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* How It's Going */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.9, duration: 0.5 }}
              className="flex gap-4 items-start"
            >
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-[#047857] border-2 border-[#34d399] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#34d399]" />
              </div>

              {/* Content */}
              <div>
                <p className="text-[#34d399] text-[clamp(0.7rem,1.8vw,0.85rem)] font-bold uppercase tracking-wider mb-1.5">
                  How It&apos;s Going
                </p>
                <div className="bg-[#34d399]/15 backdrop-blur-sm px-4 py-3 rounded-xl border border-[#34d399]/30 inline-block">
                  <p className="text-[#f8f5f2] text-[clamp(0.9rem,2.2vw,1.05rem)] leading-relaxed">
                    {stats.latestMessage.text}
                  </p>
                  <p className="text-[#f8f5f2]/50 text-[clamp(0.65rem,1.6vw,0.75rem)] mt-2">
                    {stats.latestMessage.date}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Fallback: just show first message if no latest */}
        {stats.firstMessage && !stats.latestMessage && (
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.5 }}
              className="relative"
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0, duration: 0.5 }}
                className="text-[#f8f5f2]/70 text-[clamp(1rem,2.8vw,1.2rem)] mb-4"
              >
                And here was the first message you sent
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5, duration: 0.4 }}
                className="inline-block bg-[#34d399]/20 backdrop-blur-sm px-5 sm:px-6 py-4 sm:py-5 rounded-2xl max-w-xl"
              >
                <p className="text-[#f8f5f2] text-[clamp(1.1rem,3.5vw,1.5rem)] leading-relaxed">
                  {stats.firstMessage.text}
                </p>
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
