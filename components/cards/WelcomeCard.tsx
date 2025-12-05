'use client';

import { motion } from 'framer-motion';
import type { WrappedStats } from '@/lib/types';
import { useProvider } from '../providers/ProviderContext';
import { providerLabel } from '@/lib/providerMeta';

interface CardProps {
  stats: WrappedStats;
}

export function WelcomeCard({ stats }: CardProps) {
  const provider = useProvider();
  const assistantName = providerLabel(provider);
  const latestYear = stats.latestDate.split(' ')[1];

  return (
    <div className="h-screen flex flex-col items-center justify-center px-[4vw] py-[2vh] bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] text-[#f8f5f2] relative overflow-hidden">
      {/* Background accent blobs - blue/cyan theme */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#60a5fa]/25 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-[#22d3ee]/20 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center relative z-10"
      >
        {/* Editorial label */}
        <p className="text-[clamp(0.65rem,1.5vh,0.875rem)] uppercase tracking-[0.3em] text-[#bae6fd] mb-[1.5vh] font-bold">
          Your Year In Review
        </p>

        {/* Accent line */}
        <div className="h-[0.5vh] w-[15vw] max-w-32 bg-[#bae6fd] mx-auto mb-[3vh]" />

        <h1 className="font-display text-[clamp(2rem,6vh,4.5rem)] font-black text-[#f8f5f2] mb-[1.5vh] tracking-tight">
          Your {assistantName} Wrapped
        </h1>
        <p className="text-[clamp(1rem,2.5vh,1.5rem)] text-[#f8f5f2]/70">is ready</p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-[4vh]"
        >
          <span className="font-display text-[clamp(4rem,18vh,12rem)] font-black text-[#f8f5f2] leading-none tracking-tighter">{latestYear}</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
