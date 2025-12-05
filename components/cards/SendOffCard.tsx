'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link as LinkIcon, Linkedin, Instagram } from 'lucide-react';
import type { WrappedStats } from '@/lib/types';
import { providerLabel } from '@/lib/providerMeta';

interface SendOffCardProps {
  stats: WrappedStats;
}

export function SendOffCard({ stats }: SendOffCardProps) {
  const [copied, setCopied] = useState(false);
  const [instagramCopied, setInstagramCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://aiwrapped.co';
  const shareUrl = stats.shareId ? `${baseUrl}/share/${stats.shareId}` : baseUrl;

  const assistantName = providerLabel(stats.provider);
  const shareMessage = `Just got my AI Wrapped! I had ${stats.totalSessions.toLocaleString()} conversations with ${assistantName} this year 🤖\n\nCheck yours out: ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShareX = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareInstagram = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setInstagramCopied(true);
      setTimeout(() => setInstagramCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-5 sm:px-8 py-8 sm:py-12 md:py-14 bg-gradient-to-br from-[#0a0a0a] to-[#171717] text-[#f8f5f2] relative overflow-hidden pb-[calc(env(safe-area-inset-bottom,0)+72px)] pt-[calc(env(safe-area-inset-top,0)+16px)]">
      {/* Rainbow accent blobs - subtle and atmospheric */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#ff006e]/10 rounded-full blur-[140px]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ccff00]/8 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-[#3b82f6]/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-[#a855f7]/10 rounded-full blur-[140px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center space-y-8 sm:space-y-10 relative z-10 w-full max-w-[min(1100px,92vw)]"
      >
        {/* Editorial label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[clamp(0.85rem,2.6vw,1.1rem)] uppercase tracking-[0.5em] text-[#f8f5f2]/60 font-bold"
        >
          Here's To What's Next
        </motion.p>

        {/* Accent line */}
        <div className="h-[0.5rem] w-28 sm:w-32 bg-gradient-to-r from-[#ff006e] via-[#ccff00] to-[#3b82f6] mx-auto" />

        {/* MASSIVE 2026 with gradient - the showstopper! */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative"
        >
          <h2 className="font-display text-[clamp(4.5rem,18vw,12rem)] md:text-[clamp(6rem,16vw,14rem)] font-black leading-none tracking-tighter bg-gradient-to-r from-[#ff006e] via-[#ccff00] to-[#3b82f6] bg-clip-text text-transparent break-words">
            2026
          </h2>
          <p className="text-[clamp(1.1rem,3.4vw,1.5rem)] text-[#f8f5f2]/75 mt-5">
            Keep thinking. Keep building. See you next year.
          </p>
        </motion.div>

        {/* Rainbow Share Buttons - each with unique color! */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10 relative z-40 pointer-events-auto"
        >
          {/* Hot Pink - Copy Link */}
          <button
            onClick={handleCopyLink}
            className="px-6 py-3 bg-[#ff006e]/20 hover:bg-[#ff006e]/40 active:bg-[#ff006e]/50 backdrop-blur-sm border-2 border-[#ff006e]/50 rounded-full font-semibold transition-all min-w-[170px] flex items-center gap-2 justify-center active:scale-95"
          >
            {copied ? (
              <>✓ Copied!</>
            ) : (
              <>
                <LinkIcon className="w-5 h-5" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          {/* Lime - Share on X */}
          <button
            onClick={handleShareX}
            className="px-6 py-3 bg-[#ccff00]/20 hover:bg-[#ccff00]/40 active:bg-[#ccff00]/50 backdrop-blur-sm border-2 border-[#ccff00]/50 rounded-full font-semibold transition-all min-w-[170px] active:scale-95 text-[#f8f5f2]"
          >
            𝕏 Share on X
          </button>

          {/* Blue - Share on LinkedIn */}
          <button
            onClick={handleShareLinkedIn}
            className="px-6 py-3 bg-[#3b82f6]/20 hover:bg-[#3b82f6]/40 active:bg-[#3b82f6]/50 backdrop-blur-sm border-2 border-[#3b82f6]/50 rounded-full font-semibold transition-all min-w-[170px] flex items-center gap-2 justify-center active:scale-95"
          >
            <Linkedin className="w-5 h-5" />
            <span>LinkedIn</span>
          </button>

          {/* Purple - Share on Instagram */}
          <button
            onClick={handleShareInstagram}
            className="px-6 py-3 bg-[#a855f7]/20 hover:bg-[#a855f7]/40 active:bg-[#a855f7]/50 backdrop-blur-sm border-2 border-[#a855f7]/50 rounded-full font-semibold transition-all min-w-[170px] flex items-center gap-2 justify-center active:scale-95"
          >
            {instagramCopied ? (
              <>✓ Link copied! Paste in IG</>
            ) : (
              <>
                <Instagram className="w-5 h-5" />
                <span>Instagram</span>
              </>
            )}
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
}
