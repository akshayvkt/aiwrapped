'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AiProvider } from '@/lib/types';
import { providerLabel, providerGradient } from '@/lib/providerMeta';

interface LoadingSequenceProps {
  provider: AiProvider;
  sessionCount: number;
  onComplete: () => void;
}

const STEP_DURATION = 1500; // 1.5 seconds per step
const TOTAL_DURATION = 4500; // 4.5 seconds total

export function LoadingSequence({ provider, sessionCount, onComplete }: LoadingSequenceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const providerName = providerLabel(provider);
  const gradient = providerGradient(provider);

  const messages = [
    `Loading your ${providerName} data`,
    `Analyzing ${sessionCount.toLocaleString()} conversations`,
    'Preparing your insights',
  ];

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / (TOTAL_DURATION / 50));
        return next >= 100 ? 100 : next;
      });
    }, 50);

    // Message transitions
    const step1Timer = setTimeout(() => setCurrentStep(1), STEP_DURATION);
    const step2Timer = setTimeout(() => setCurrentStep(2), STEP_DURATION * 2);

    // Complete slightly early to allow fade-out animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, TOTAL_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.5,
        ease: 'easeInOut'
      }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center overflow-hidden"
    >
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-orange-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full px-8">
        <div className="text-center space-y-8">
          {/* Message */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-2xl md:text-3xl font-semibold text-white"
            >
              {messages[currentStep]}
            </motion.p>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="relative h-1 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm max-w-md mx-auto">
            <motion.div
              className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.05, ease: 'linear' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
