'use client';

import { motion } from 'framer-motion';

export function PersonaLoadingCard() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+56px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Background accent blobs - lavender/periwinkle theme */}
      <div className="absolute top-20 left-0 w-[700px] h-[700px] bg-[#a78bfa]/25 rounded-full blur-[130px]" />
      <div className="absolute bottom-20 right-0 w-[600px] h-[600px] bg-[#c4b5fd]/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full max-w-[min(1100px,92vw)] space-y-6 sm:space-y-8 relative z-10"
      >
        {/* Editorial label */}
        <p className="text-[clamp(0.75rem,2.4vw,1rem)] uppercase tracking-[0.4em] text-[#c4b5fd] font-bold">
          Cooking your persona
        </p>

        {/* Accent line */}
        <div className="h-[0.5rem] w-28 sm:w-32 bg-[#a78bfa] mx-auto mb-5" />

        {/* Pulsing loading card - editorial style */}
        <motion.div
          initial={{ opacity: 0.4, scale: 0.95 }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1, 0.95] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto h-28 sm:h-32 w-full max-w-md rounded-3xl bg-[#f8f5f2]/10 backdrop-blur-sm border-2 border-[#a78bfa]/50"
        />

        <p className="text-[#f8f5f2]/80 text-[clamp(0.95rem,3vw,1.25rem)] leading-relaxed px-3 text-balance">
          We're reading your chats' vibe. This slide will update once the AI finishes writing your title, summary, and roast.
        </p>
      </motion.div>
    </div>
  );
}
