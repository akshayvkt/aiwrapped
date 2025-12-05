'use client';

import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import type { WrappedStats } from '@/lib/types';

interface CardProps {
  stats: WrappedStats;
}

export function ImageHighlightsCard({ stats }: CardProps) {
  const imageUsage = stats.imageUsage;

  if (!imageUsage) {
    return null;
  }

  const { totalImages, sessionsWithImages, topSession } = imageUsage;

  const formattedDate = topSession?.date
    ? (() => {
        const date = parseISO(topSession.date);
        if (Number.isNaN(date.getTime())) {
          return topSession.date;
        }
        return format(date, 'MMM d, yyyy');
      })()
    : null;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#9f1239] to-[#be123c] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent blobs - rose gold/copper theme */}
      <div className="absolute top-20 right-0 w-[700px] h-[700px] bg-[#fb7185]/25 rounded-full blur-[130px]" />
      <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-[#fbbf24]/15 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-[min(1100px,92vw)] space-y-10 sm:space-y-12 relative z-10"
      >
        <div>
          {/* Editorial label */}
          <p className="text-[clamp(0.75rem,2vw,0.95rem)] uppercase tracking-[0.3em] text-[#fda4af] mb-4 font-bold">
            Visual Thinking
          </p>

          {/* Accent line */}
          <div className="h-[0.45rem] w-28 sm:w-32 bg-[#fda4af] mx-auto mb-6" />

          <p className="text-[#f8f5f2]/80 text-[clamp(1rem,3vw,1.4rem)] mb-4 text-balance">
            Your prompts weren&apos;t just text
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <p className="font-display text-[clamp(3.25rem,16vw,10rem)] font-black text-[#f8f5f2] mb-2 leading-none tracking-tighter break-words">
              {totalImages.toLocaleString()}
            </p>
            <p className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-[#f8f5f2] mb-1">
              images generated with ChatGPT
            </p>
            <p className="text-[#f8f5f2]/80 text-[clamp(0.95rem,2.8vw,1.3rem)] mt-4">
              across {sessionsWithImages} session{sessionsWithImages === 1 ? '' : 's'}
            </p>
          </motion.div>
        </div>

        {topSession && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="bg-[#f8f5f2]/8 backdrop-blur-sm rounded-3xl px-6 sm:px-8 py-8 sm:py-10 md:px-12 md:py-12 border-2 border-[#fda4af]/40"
          >
            <p className="text-[#f8f5f2]/80 text-[clamp(1rem,3vw,1.4rem)] mb-4">
              Your most image-hungry chat
            </p>

            <p className="font-display text-[clamp(2.75rem,10vw,4.5rem)] font-black text-[#f8f5f2] mb-2 leading-none break-words">
              {topSession.imageCount.toLocaleString()}
            </p>
            <p className="text-[#f8f5f2]/70 text-[clamp(0.95rem,2.8vw,1.25rem)] mb-3">
              images in "{topSession.name}"
            </p>
            {formattedDate && (
              <p className="text-[#f8f5f2]/60 text-[clamp(0.9rem,2.5vw,1.1rem)]">
                on {formattedDate}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
