'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CountUpNumber } from '../ui/CountUpNumber';
import type { WrappedStats } from '@/lib/types';
import { useProvider } from '../providers/ProviderContext';
import { providerLabel } from '@/lib/providerMeta';

const BOOK_LIBRARY = [
  {
    title: 'Diary of a Wimpy Kid',
    approxWords: 18000,
  },
  {
    title: 'Animal Farm',
    approxWords: 29000,
  },
  {
    title: 'The Fault in Our Stars',
    approxWords: 67000,
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    approxWords: 77000,
  },
  {
    title: '1984',
    approxWords: 89000,
  },
  {
    title: 'The Hunger Games',
    approxWords: 101000,
  },
  {
    title: 'Twilight',
    approxWords: 119000,
  },
  {
    title: 'The Da Vinci Code',
    approxWords: 138000,
  },
  {
    title: 'Dune',
    approxWords: 188000,
  },
  {
    title: 'The Lord of the Rings Trilogy',
    approxWords: 455000,
  },
  {
    title: 'The Bible',
    approxWords: 783000,
  },
  {
    title: 'The Harry Potter Series',
    approxWords: 1080000,
  },
] as const;

interface CardProps {
  stats: WrappedStats;
  exportMode?: boolean;
}

export function WordsCard({ stats, exportMode = false }: CardProps) {
  // Convert to millions for display
  const wordsInMillions = stats.estimatedWords / 1000000;
  const [showComparison, setShowComparison] = useState(exportMode);
  const provider = useProvider();
  const assistantName = providerLabel(provider);

  // Smart book picker: find books where ratio is between 2-15x
  const selectedBook = useMemo(() => {
    const targetMin = 2;
    const targetMax = 15;

    // Find books that would give us a ratio in the target range
    const suitableBooks = BOOK_LIBRARY.filter(book => {
      const ratio = stats.estimatedWords / book.approxWords;
      return ratio >= targetMin && ratio <= targetMax;
    });

    // If we found suitable books, pick one randomly
    if (suitableBooks.length > 0) {
      return suitableBooks[Math.floor(Math.random() * suitableBooks.length)];
    }

    // Fallback: if user wrote too little, pick smallest book
    // If user wrote too much, pick largest book
    const allRatios = BOOK_LIBRARY.map(book => ({
      book,
      ratio: stats.estimatedWords / book.approxWords,
    }));

    // If all ratios are below targetMin, pick smallest book
    if (allRatios.every(r => r.ratio < targetMin)) {
      return BOOK_LIBRARY[0];
    }

    // Otherwise pick largest book (for very high word counts)
    return BOOK_LIBRARY[BOOK_LIBRARY.length - 1];
  }, [stats.estimatedWords]);

  const ratioRaw = stats.estimatedWords / selectedBook.approxWords;
  const ratioValue = Math.max(0, Number.isFinite(ratioRaw) ? ratioRaw : 0);
  const displayMultiplier = Math.floor(ratioValue);
  const bookEmojisToShow = Math.min(10, Math.max(1, displayMultiplier));
  const revealTimeoutRef = useRef<number | null>(null);

  const handleWordsReveal = useCallback(() => {
    if (exportMode) {
      setShowComparison(true);
      return;
    }
    if (revealTimeoutRef.current) {
      window.clearTimeout(revealTimeoutRef.current);
    }
    revealTimeoutRef.current = window.setTimeout(() => setShowComparison(true), 20);
  }, [exportMode]);

  useEffect(() => {
    setShowComparison(exportMode);
    if (revealTimeoutRef.current) {
      window.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
  }, [exportMode, stats.estimatedWords]);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#881337] to-[#701a75] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent blobs - burgundy/wine theme */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#be123c]/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-[#a21caf]/15 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-[min(1100px,92vw)] relative z-10"
      >
        <p className="text-[#f8f5f2]/75 text-[clamp(1rem,3vw,1.25rem)] mb-5 uppercase tracking-wider text-balance">
          Together, you and {assistantName} wrote
        </p>

        {/* Accent line */}
        <div className="h-[0.5rem] w-28 sm:w-32 bg-[#be123c] mx-auto mb-7" />

        <div className="mb-10 flex flex-col items-center gap-5 sm:gap-6">
          <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-5">
            <CountUpNumber
              value={wordsInMillions}
              decimals={1}
              className="font-display text-[clamp(3.5rem,16vw,10rem)] font-black text-[#f8f5f2] leading-none tracking-tighter break-words"
              onComplete={handleWordsReveal}
              instant={exportMode}
            />
            <span className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-[#f8f5f2] leading-none pb-2 sm:pb-3">
              million words
            </span>
          </div>
        </div>
      </motion.div>

      <div className="mt-12 sm:mt-14 w-full max-w-[min(1100px,92vw)] min-h-[240px] sm:min-h-[280px] flex items-start justify-center relative z-10">
        <AnimatePresence>
          {showComparison && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 110, damping: 18 }}
              className="text-center w-full"
            >
              <p className="text-[#f8f5f2]/70 text-[clamp(1rem,3vw,1.25rem)] mb-5 uppercase tracking-wider">
                That's
              </p>

              <div className="mb-8 flex flex-col items-center gap-5 sm:gap-6">
                <div className="flex flex-wrap items-baseline justify-center gap-3 sm:gap-5">
                <CountUpNumber
                  value={displayMultiplier}
                  decimals={0}
                  className="font-display text-[clamp(3rem,10vw,6rem)] font-black text-[#f8f5f2]"
                  instant={exportMode}
                />
                <span className="font-display text-[clamp(1.25rem,3.8vw,2.25rem)] font-bold text-[#f8f5f2]/80">
                  times longer than
                </span>
              </div>
                <p className="font-display text-[clamp(1.5rem,4.2vw,2.75rem)] font-bold text-[#fda4af] break-words text-balance">
                  {selectedBook.title}
                </p>
              </div>

              <div className="flex justify-center gap-2 md:gap-3 flex-wrap">
                {Array.from({ length: bookEmojisToShow }).map((_, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      delay: 0.25 + index * 0.1,
                      type: 'spring',
                      stiffness: 240,
                      damping: 16,
                    }}
                    className="text-4xl md:text-5xl"
                    role="img"
                    aria-label="book"
                  >
                    📚
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
