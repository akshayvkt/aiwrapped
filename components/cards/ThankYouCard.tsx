'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { WrappedStats } from '@/lib/types';
import { useProvider } from '../providers/ProviderContext';
import { providerLabel } from '@/lib/providerMeta';

interface CardProps {
  stats: WrappedStats;
  exportMode?: boolean;
}

export function ThankYouCard({ stats, exportMode = false }: CardProps) {
  const provider = useProvider();
  const assistantName = providerLabel(provider);
  const thankYouCount = stats.thankYouCount ?? 0;
  const apologyCount = stats.apologyCount ?? 0;

  const [showThanksCard, setShowThanksCard] = useState(exportMode);
  const [showApologyCard, setShowApologyCard] = useState(exportMode);

  useEffect(() => {
    if (exportMode) {
      return;
    }
    const timers = new Set<number>();

    const thanksTimeout = window.setTimeout(() => {
      setShowThanksCard(true);
      const apologyTimeout = window.setTimeout(() => setShowApologyCard(true), 1000);
      timers.add(apologyTimeout);
    }, 500);

    timers.add(thanksTimeout);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [exportMode]);

  const maxTilt = 14;
  const computeTilt = (thanks: number, apologies: number) => {
    const total = thanks + apologies;
    if (total === 0) return 0;
    const offset = (apologies - thanks) / total;
    return Math.max(-maxTilt, Math.min(maxTilt, offset * maxTilt * 1.4));
  };

  const preApologyTilt = computeTilt(thankYouCount, 0);
  const finalTilt = computeTilt(thankYouCount, apologyCount);
  const tiltAngle = showApologyCard ? finalTilt : showThanksCard ? preApologyTilt : 0;

  const liftOffset = (tiltAngle / maxTilt) * 48;
  const leftCardYOffset = -liftOffset;
  const rightCardYOffset = liftOffset;

  const userKinder = thankYouCount > apologyCount;

  const mobileCardWidth = 'min(32vw, 220px)';

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-4 sm:px-6 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent blobs - sapphire blue theme */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#60a5fa]/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-[#3b82f6]/15 rounded-full blur-[130px]" />

      <div className="w-full max-w-[min(1100px,92vw)] space-y-6 sm:space-y-8 relative z-10">
        {/* Seesaw Section */}
        <div className="relative w-full min-h-[280px] sm:min-h-[340px] md:min-h-[380px]">
          <motion.div
            className="absolute left-1/2 bottom-[22%] sm:bottom-[20%] h-[10px] sm:h-3 w-[80%] sm:w-full max-w-3xl -translate-x-1/2 rounded-full bg-[#60a5fa]/35 shadow-[0_18px_48px_rgba(96,165,250,0.25)]"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: tiltAngle }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
            style={{ transformOrigin: '50% 50%' }}
          />
          <motion.div
            className="absolute left-1/2 bottom-[22%] sm:bottom-[20%] h-12 w-12 sm:h-16 sm:w-16 -translate-x-1/2 translate-y-[calc(100%+8px)] rounded-full bg-[#3b82f6]/50 backdrop-blur-sm border-2 border-[#f8f5f2]/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          />

          <motion.div
            className="absolute left-[10%] sm:left-[6%] bottom-[18%] sm:bottom-[22%]"
            initial={{ opacity: 0, y: -60 }}
            animate={
              showThanksCard
                ? { opacity: 1, y: leftCardYOffset }
                : { opacity: 0, y: -60 }
            }
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
            style={{ width: mobileCardWidth }}
          >
            <motion.div
              animate={
                showThanksCard ? { rotate: -tiltAngle * 0.3 } : { rotate: 0 }
              }
              transition={{ type: 'spring', stiffness: 110, damping: 16 }}
              className="bg-[#f8f5f2]/8 rounded-3xl px-6 py-5 sm:px-8 sm:py-6 flex flex-col items-center backdrop-blur-sm border-2 border-[#60a5fa]/50"
            >
              <p className="text-sm md:text-base uppercase tracking-[0.2em] text-[#93c5fd] mb-3 font-bold">
                You said thanks
              </p>
              <p className="font-display text-7xl md:text-8xl font-black text-[#f8f5f2] leading-none">
                {thankYouCount}
              </p>
              <p className="text-[#f8f5f2]/70 text-lg mt-3">
                {thankYouCount === 1 ? 'time' : 'times'}
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute right-[10%] sm:right-[6%] bottom-[18%] sm:bottom-[22%]"
            initial={{ opacity: 0, y: -60 }}
            animate={
              showApologyCard
                ? { opacity: 1, y: rightCardYOffset }
                : { opacity: 0, y: -60 }
            }
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
            style={{ width: mobileCardWidth }}
          >
            <motion.div
              animate={
                showApologyCard ? { rotate: -tiltAngle * 0.3 } : { rotate: 0 }
              }
              transition={{ type: 'spring', stiffness: 110, damping: 16 }}
              className="bg-[#f8f5f2]/8 rounded-3xl px-6 py-5 sm:px-8 sm:py-6 flex flex-col items-center backdrop-blur-sm border-2 border-[#3b82f6]/50"
            >
              <p className="text-sm md:text-base uppercase tracking-[0.2em] text-[#60a5fa] mb-3 font-bold">
                {assistantName} said sorry
              </p>
              <p className="font-display text-7xl md:text-8xl font-black text-[#f8f5f2] leading-none">
                {apologyCount}
              </p>
              <p className="text-[#f8f5f2]/70 text-lg mt-3">
                {apologyCount === 1 ? 'time' : 'times'}
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Caption Section - Pre-allocated space */}
        <div className="min-h-[140px] sm:min-h-[160px] md:min-h-[180px] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showApologyCard ? 1 : 0 }}
            transition={{ duration: 0.6, delay: showApologyCard ? 0.4 : 0 }}
            className="text-[#f8f5f2] text-[clamp(1rem,3vw,1.25rem)] text-center px-4 max-w-[min(900px,92vw)] space-y-3"
          >
            <p className="font-semibold">
              {userKinder
                ? 'You out-polited an AI.'
                : 'Someone needs to work on their confidence.'}
            </p>
            <p className="text-[#f8f5f2]/70">
              {userKinder
                ? 'Your parents raised you TOO well.'
                : "(Spoiler: It's not you.)"}
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
