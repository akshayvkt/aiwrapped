'use client';

import { motion } from 'framer-motion';
import type { WrappedStats } from '@/lib/types';

interface CardProps {
  stats: WrappedStats;
}

export function QuickConversationsCard({ stats }: CardProps) {
  const quickCategory = stats.messageDistribution.find((d) => d.label.includes('Quick Q&A'));
  const shortCategory = stats.messageDistribution.find((d) => d.label.includes('Short'));
  const combinedPercentage = Math.round((quickCategory?.percentage || 0) + (shortCategory?.percentage || 0));
  const topSession = stats.topSessions[0];

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-5 sm:px-7 md:px-8 py-8 sm:py-11 md:py-12 bg-gradient-to-br from-[#dc2626] to-[#ea580c] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent blobs - coral/salmon theme */}
      <div className="absolute top-20 right-0 w-[700px] h-[700px] bg-[#fb7185]/25 rounded-full blur-[130px]" />
      <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-[#fdba74]/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-4xl w-full space-y-[2vh] relative z-10"
      >
        <div>
          <p className="text-[clamp(0.85rem,2.4vh,1.7rem)] text-[#f8f5f2]/80 mb-[2vh]">
            Most of the time, your sessions are <span className="font-display text-[clamp(1rem,2.8vh,2rem)] font-bold text-[#f8f5f2]">short and direct</span>
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <p className="font-display text-[clamp(3rem,12vh,10rem)] font-black text-[#f8f5f2] leading-none tracking-tighter">
              {combinedPercentage}%
            </p>

            <p className="font-display text-[clamp(1.25rem,3vh,2.5rem)] font-bold text-[#f8f5f2]">
              sessions
            </p>

            <p className="text-[clamp(0.875rem,2vh,1.5rem)] text-[#f8f5f2]/80 mt-[0.5vh]">
              under 10 messages
            </p>
          </motion.div>
        </div>

        {topSession && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="bg-[#f8f5f2]/8 backdrop-blur-sm rounded-2xl px-[4vw] py-[2vh] border-2 border-[#fb7185]/40"
          >
            <p className="text-[clamp(0.85rem,2.4vh,1.7rem)] text-[#f8f5f2]/80 mb-[1.5vh]">
              But when you find something worth it… <span className="font-display font-bold text-[clamp(1rem,2.8vh,2rem)] text-[#fef3c7]">you really commit.</span>
            </p>

            <p className="font-display text-[clamp(3rem,10vh,8rem)] font-black text-[#f8f5f2] leading-none">
              {topSession.messages}
            </p>
            <p className="text-[clamp(0.75rem,1.8vh,1.25rem)] text-[#f8f5f2]/70 mb-[1.5vh]">
              messages in one chat
            </p>

            <p className="text-[clamp(0.75rem,1.5vh,1rem)] text-[#f8f5f2]/90 italic">
              in &ldquo;{topSession.name}&rdquo; chat
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
