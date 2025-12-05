'use client';

import { useState, useEffect, useRef, useCallback, type ComponentType } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, MotionConfig } from 'framer-motion';
import { toPng } from 'html-to-image';
import type { WrappedStats } from '@/lib/types';
import { useProvider } from '../providers/ProviderContext';
import { providerTheme } from '@/lib/providerMeta';
import { trackEvent } from '@/lib/mixpanel';

interface CardInfo {
  component: ComponentType<{ stats: WrappedStats; exportMode?: boolean }>;
  name: string;
}

interface CardContainerProps {
  cards: CardInfo[];
  stats: WrappedStats;
}

const CARD_DURATION = 7000; // 7 seconds per card
const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

/**
 * Instagram Stories-style container
 * - Progress bars at top
 * - Auto-advance timer
 * - Tap left/right zones for navigation
 * - Hold to pause
 * - Pause button
 * - Swipe gestures
 */
export function CardContainer({ cards, stats }: CardContainerProps) {
  const provider = useProvider();
  const theme = providerTheme(provider);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [renderDownloadFrame, setRenderDownloadFrame] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const pauseTimeRef = useRef<number>(0);
  const cardContentRef = useRef<HTMLDivElement>(null);
  const downloadFrameRef = useRef<HTMLDivElement>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressValue = useMotionValue(0);
  const progressWidth = useTransform(progressValue, (v) => `${v}%`);

  const resetProgress = useCallback(() => {
    progressValue.set(0);
    startTimeRef.current = Date.now();
  }, [progressValue]);

  const waitForDownloadFrame = useCallback(() => {
    return new Promise<void>((resolve) => {
      const check = () => {
        if (downloadFrameRef.current) {
          resolve();
          return;
        }
        requestAnimationFrame(check);
      };
      check();
    });
  }, []);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      resetProgress();
    }
  }, [cards.length, currentIndex, resetProgress]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      resetProgress();
    }
  }, [currentIndex, resetProgress]);

  // Auto-advance and progress animation
  useEffect(() => {
    if (isPaused) return;

    let frameId = 0;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const newProgress = Math.min((elapsed / CARD_DURATION) * 100, 100);

      progressValue.set(newProgress);

      if (newProgress >= 100) {
        if (currentIndex < cards.length - 1) {
          goToNext();
        }
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [cards.length, currentIndex, goToNext, isPaused, progressValue]);

  // Pause/Resume handlers
  const handlePauseStart = useCallback(() => {
    setIsPaused(true);
    pauseTimeRef.current = Date.now();
  }, []);

  const handlePauseEnd = useCallback(() => {
    setIsPaused(false);
    // Adjust start time to account for pause duration
    const pauseDuration = Date.now() - pauseTimeRef.current;
    startTimeRef.current += pauseDuration;
  }, []);

  const togglePause = useCallback(() => {
    if (isPaused) {
      handlePauseEnd();
    } else {
      handlePauseStart();
    }
  }, [handlePauseEnd, handlePauseStart, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, togglePause]);

  const CardComponent = cards[currentIndex].component;

  // Download handler with watermark
  const handleDownload = async () => {
    if (isDownloading) return;

    trackEvent('Card Downloaded', { card_index: currentIndex + 1, card_name: cards[currentIndex].name });
    setRenderDownloadFrame(true);
    // Wait for the download frame to render before capturing
    await waitForDownloadFrame();
    // Give the export frame a couple of paint frames to settle
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);

    try {
      setIsDownloading(true);
      setShowSuccess(false);
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }

      const targetNode = downloadFrameRef.current ?? cardContentRef.current;
      if (!targetNode) {
        throw new Error('No card node available for download');
      }

      // Capture the card at fixed story dimensions for consistent exports
      const dataUrl = await toPng(targetNode, {
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        pixelRatio: 1,
        cacheBust: true,
        backgroundColor: '#000000',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      });

      // Load image and add watermark
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Draw the captured image
        ctx.drawImage(img, 0, 0);

        // Add watermark in bottom right
        const watermarkText = 'aiwrapped.co';
        const fontSize = 48;
        const padding = 64;

        ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(watermarkText, canvas.width - padding, canvas.height - padding);

        // Download the image
        canvas.toBlob((blob) => {
          if (!blob) {
            setIsDownloading(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${theme.downloadPrefix}-card-${currentIndex + 1}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          setIsDownloading(false);
          setShowSuccess(true);
          successTimeoutRef.current = setTimeout(() => {
            setShowSuccess(false);
            successTimeoutRef.current = null;
          }, 1800);
        }, 'image/png');
      };
      img.src = dataUrl;
      img.onerror = () => {
        setIsDownloading(false);
        setShowSuccess(false);
      };
    } catch (error) {
      console.error('Failed to download card:', error);
      setIsDownloading(false);
      setShowSuccess(false);
    }
    setRenderDownloadFrame(false);
  };

  // Clean up pending timeout when component unmounts
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // Animation variants - instant switch like Instagram
  const variants = {
    enter: {
      opacity: 0,
    },
    center: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="relative h-[100dvh] min-h-[100dvh] max-h-[100dvh] bg-[#0a0a0a] overflow-hidden"
    >
      {/* Editorial grain texture overlay */}
      <div className="grain-overlay" />

      {/* Editorial progress bars at top */}
      <div className="fixed top-0 left-0 right-0 z-50 flex gap-2 p-3">
        {cards.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1.5 bg-[#f8f5f2]/20 rounded-full overflow-hidden backdrop-blur-sm"
          >
            <motion.div
              className="h-full bg-white/90 rounded-full"
              initial={{ width: '0%' }}
              animate={
                index === currentIndex
                  ? undefined
                  : { width: index < currentIndex ? '100%' : '0%' }
              }
              style={index === currentIndex ? { width: progressWidth } : undefined}
              transition={{ duration: 0.3, ease: 'linear' }}
            />
          </div>
        ))}
      </div>

      {/* Pause button */}
      <button
        onClick={togglePause}
        className="fixed top-4 right-4 z-50 p-2 text-white/80 hover:text-white transition-colors"
        aria-label={isPaused ? 'Resume' : 'Pause'}
      >
        {isPaused ? (
          // Play icon
          <svg
            className="w-5 h-5 text-white ml-0.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          // Pause icon
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        )}
      </button>

      {/* Main card area with tap zones */}
      <div className="h-full flex items-center justify-center relative">
        {/* Left tap zone (1/3 of screen) - exclude bottom 40% for card buttons */}
        <div
          className="absolute left-0 top-0 bottom-[40%] w-1/3 z-30 cursor-pointer"
          onClick={goToPrevious}
          onMouseDown={handlePauseStart}
          onMouseUp={handlePauseEnd}
          onMouseLeave={() => {
            if (isPaused) handlePauseEnd();
          }}
          onTouchStart={handlePauseStart}
          onTouchEnd={handlePauseEnd}
        />

        {/* Right tap zone (2/3 of screen) - exclude bottom 40% for card buttons */}
        <div
          className="absolute right-0 top-0 bottom-[40%] w-2/3 z-30 cursor-pointer"
          onClick={goToNext}
          onMouseDown={handlePauseStart}
          onMouseUp={handlePauseEnd}
          onMouseLeave={() => {
            if (isPaused) handlePauseEnd();
          }}
          onTouchStart={handlePauseStart}
          onTouchEnd={handlePauseEnd}
        />

        {/* Card content */}
        <AnimatePresence initial={true} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            ref={cardContentRef}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              opacity: { duration: 0.5, ease: 'easeInOut' },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;

              if (swipe < -10000) {
                goToNext();
              } else if (swipe > 10000) {
                goToPrevious();
              }
            }}
            className="w-full h-full flex items-stretch"
          >
            <div className="story-card-container">
              <div className="story-card-inner">
                <CardComponent stats={stats} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Download button (bottom left) */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="fixed bottom-8 left-8 z-[100] p-2 text-white/80 hover:text-white transition-colors pointer-events-auto disabled:opacity-40 disabled:hover:text-white/80 disabled:cursor-not-allowed"
        aria-label="Download"
      >
        {showSuccess ? (
          <svg
            className="w-5 h-5 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : isDownloading ? (
          <svg
            className="w-5 h-5 text-white animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-30"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              d="M4 12a8 8 0 018-8"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        )}
      </button>

      {/* Share button (bottom center) - ghost style */}
      <button
        onClick={async () => {
          if (!stats.shareId) {
            console.error('No share ID found');
            return;
          }

          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://aiwrapped.co';
          const shareUrl = `${baseUrl}/share/${stats.shareId}`;

          try {
            // Copy to clipboard
            await navigator.clipboard.writeText(shareUrl);
            trackEvent('Shared', { method: 'copy_link', card_name: cards[currentIndex].name });

            // Show success state
            setShareSuccess(true);
            setTimeout(() => {
              setShareSuccess(false);
            }, 2000);
          } catch (error) {
            console.error('Failed to copy to clipboard:', error);
          }
        }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-5 py-2.5 flex items-center gap-2 bg-white/10 border border-white/30 backdrop-blur-sm rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200"
        aria-label="Share"
      >
        {shareSuccess ? (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium">Copied!</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span className="text-sm font-medium">Share</span>
          </>
        )}
      </button>

      {/* Hidden off-screen frame for exporting consistent story-sized images */}
      {renderDownloadFrame && (
        <div className="fixed -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
          <MotionConfig reducedMotion="always">
            <div
              ref={downloadFrameRef}
              className="story-download-frame export-ready flex h-[1920px] w-[1080px] items-stretch justify-center bg-black"
            >
              <div className="story-card-container">
                <div className="story-card-inner">
                  <CardComponent key={`download-${currentIndex}`} stats={stats} exportMode />
                </div>
              </div>
            </div>
          </MotionConfig>
        </div>
      )}

    </motion.div>
  );
}
