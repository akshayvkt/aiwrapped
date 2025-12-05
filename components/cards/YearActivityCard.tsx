'use client';

import { motion } from 'framer-motion';
import type { WrappedStats } from '@/lib/types';
import { CountUpNumber } from '../ui/CountUpNumber';
import { YearHeatmap } from '../ui/YearHeatmap';
import { useProvider } from '../providers/ProviderContext';
import { providerLabel } from '@/lib/providerMeta';

interface CardProps {
  stats: WrappedStats;
  exportMode?: boolean;
}

export function YearActivityCard({ stats, exportMode = false }: CardProps) {
  const provider = useProvider();
  const assistantName = providerLabel(provider);

  const totalActiveDays = stats.streaks?.totalActiveDays ?? 0;
  const activeDatesThisYear = stats.activeDatesThisYear ?? [];
  const daysThisYear = activeDatesThisYear.length;
  const currentYear = new Date().getFullYear();
  const today = new Date();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#4c1d95] to-[#5b21b6] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+48px)]">
      {/* Background accent gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 75% 20%, rgba(163, 230, 53, 0.15) 0%, rgba(163, 230, 53, 0.04) 35%, rgba(163, 230, 53, 0) 55%), radial-gradient(circle at 25% 80%, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.06) 35%, rgba(139, 92, 246, 0) 55%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[min(1100px,92vw)] flex flex-col">
        {/* Top section - Overall stat */}
        <div className="mb-6 sm:mb-8">
          <motion.p
            initial={exportMode ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: exportMode ? 0 : 0.2, duration: 0.5 }}
            className="text-[#f8f5f2]/70 text-[clamp(0.85rem,2.5vw,1.1rem)] mb-3 uppercase tracking-wider"
          >
            Overall, you used {assistantName} on
          </motion.p>

          <motion.div
            initial={exportMode ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: exportMode ? 0 : 0.5, duration: 0.6 }}
            className="mb-2"
          >
            <CountUpNumber
              value={totalActiveDays}
              className="font-display text-[clamp(2.5rem,12vw,6rem)] font-black text-[#f8f5f2] leading-none tracking-tighter"
              instant={exportMode}
            />
            <span className="font-display text-[clamp(1.25rem,4vw,2.5rem)] font-bold text-[#a3e635] ml-2 sm:ml-3 align-baseline">
              different days
            </span>
          </motion.div>

          {/* Accent line */}
          <motion.div
            initial={exportMode ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: exportMode ? 0 : 1.0, duration: 0.5 }}
            className="h-1 w-32 sm:w-40 bg-[#a3e635] mb-6 sm:mb-8"
          />
        </div>

        {/* Middle section - This year stat */}
        <div className="mb-5 sm:mb-6">
          <motion.p
            initial={exportMode ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: exportMode ? 0 : 1.3, duration: 0.5 }}
            className="text-[#f8f5f2]/70 text-[clamp(0.85rem,2.5vw,1.1rem)] mb-2 uppercase tracking-wider"
          >
            In {currentYear} alone, you showed up on
          </motion.p>

          <motion.div
            initial={exportMode ? { opacity: 1 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: exportMode ? 0 : 1.6, duration: 0.5 }}
          >
            <CountUpNumber
              value={daysThisYear}
              className="font-display text-[clamp(2rem,8vw,4rem)] font-black text-[#f8f5f2] leading-none tracking-tighter"
              instant={exportMode}
            />
            <span className="font-display text-[clamp(1rem,3vw,1.75rem)] font-bold text-[#a3e635] ml-2 align-baseline">
              days
            </span>
          </motion.div>
        </div>

        {/* Bottom section - Year Heatmap */}
        <motion.div
          initial={exportMode ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: exportMode ? 0 : 1.9, duration: 0.5 }}
          className="flex items-center justify-center mt-4 sm:mt-6"
        >
          <div className="w-full max-w-lg sm:max-w-xl mx-auto">
            <YearHeatmap
              activeDates={activeDatesThisYear}
              year={currentYear}
              exportMode={exportMode}
              endDate={today}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
