'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParseError } from '@/lib/parseClaudeExport';
import { parseExport } from '@/lib/parseExport';
import { calculateStats } from '@/lib/calculateStats';
import { WRAPPED_STORAGE_KEY } from '@/lib/constants';
import { providerAccentHover, providerGradient, providerLabel as getProviderLabel, providerTheme } from '@/lib/providerMeta';
import type { AiProvider, AiSession, PersonalityBlurb } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { LoadingSequence } from '@/components/ui/LoadingSequence';
import { insertAnalytics } from '@/lib/analytics';
import { createShareableWrap, updateSharedWrapWithPersona } from '@/lib/sharing';
import { trackEvent } from '@/lib/mixpanel';

const DEFAULT_PROVIDER: AiProvider = 'chatgpt';

type SessionInfo = {
  date: string;
  title: string;
  userMessages: string[]; // first 3 human messages
};

function buildSessionInfoList(sessions: AiSession[]): SessionInfo[] {
  const validSessions = [...sessions]
    .sort((a, b) => {
      const dateA = parseISO(a.created_at);
      const dateB = parseISO(b.created_at);
      const timeA = Number.isNaN(dateA.getTime()) ? 0 : dateA.getTime();
      const timeB = Number.isNaN(dateB.getTime()) ? 0 : dateB.getTime();
      return timeB - timeA;
    })
    .filter(session => {
      // Must have a title
      if (!session.name?.trim()) return false;

      // Must have >6 total messages (user sent at least 3)
      const messageCount = session.chat_messages?.length ?? 0;
      if (messageCount <= 6) return false;

      // First human message must be 100-500 chars
      const firstHuman = session.chat_messages?.find(m => m.sender === 'human');
      const firstMsgLen = firstHuman?.text?.trim()?.length ?? 0;
      if (firstMsgLen < 100 || firstMsgLen > 500) return false;

      return true;
    })
    .slice(0, 100) // max 100 sessions
    .map(session => {
      const date = parseISO(session.created_at);
      const formattedDate = Number.isNaN(date.getTime())
        ? session.created_at
        : format(date, 'yyyy-MM-dd');

      // Extract first 3 human messages
      const humanMessages = session.chat_messages
        ?.filter(m => m.sender === 'human')
        .slice(0, 3)
        .map(m => m.text?.trim())
        .filter((text): text is string => Boolean(text)) ?? [];

      return {
        date: formattedDate,
        title: session.name!.trim(),
        userMessages: humanMessages,
      };
    });

  return validSessions;
}

async function generatePersonaPayload(sessions: SessionInfo[]): Promise<PersonalityBlurb | null> {
  try {
    const response = await fetch('/api/persona', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ sessions }),
    });

    if (!response.ok) {
      console.warn('Persona API returned non-OK status:', response.status);
      return null;
    }

    const data = await response.json();
    if (data && data.persona) {
      return data.persona as PersonalityBlurb;
    }
  } catch (error) {
    console.error('Failed to generate persona:', error);
  }

  return null;
}

export default function Home() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>(DEFAULT_PROVIDER);
  const [needsProviderChoice, setNeedsProviderChoice] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showLoadingSequence, setShowLoadingSequence] = useState(false);
  const [loadingSessionCount, setLoadingSessionCount] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Track page view on mount
  useEffect(() => {
    trackEvent('Page View');
  }, []);

  const assistantLabel = getProviderLabel(selectedProvider);
  const providerSettingsUrl = selectedProvider === 'chatgpt'
    ? 'https://chatgpt.com/#settings/DataControls'
    : 'https://claude.ai/settings/data-privacy-controls';
  const heroTitle = needsProviderChoice
    ? 'AI Wrapped'
    : selectedProvider === 'chatgpt'
    ? 'ChatGPT Wrapped'
    : 'Claude Wrapped';
  const exampleWrapUrl = selectedProvider === 'chatgpt'
    ? 'https://aiwrapped.co/share/FE4SwxUb'
    : 'https://aiwrapped.co/share/KKZ11NDX';
  const exportVideoUrl = selectedProvider === 'chatgpt'
    ? '/export_chatgpt_data.mp4'
    : '/export_claude_data.mp4';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const zipFile = files.find(f => f.name.endsWith('.zip'));

    if (zipFile) {
      await processFile(zipFile);
    } else {
      setError('Please upload a ZIP file');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File, providerHint?: AiProvider) => {
    console.log('📦 Processing file:', file.name);
    setPendingFile(file);
    setIsProcessing(true);
    setError(null);
    setNeedsProviderChoice(false);

    try {
      const { provider, sessions } = await parseExport(file, providerHint);
      console.log(`✅ Detected provider: ${provider}`);
      console.log(`✅ Loaded ${sessions.length} sessions`);

      setSelectedProvider(provider);
      const calculatedStats = calculateStats(provider, sessions);
      console.log('✅ Stats calculated:', calculatedStats);

      // Track successful file upload
      trackEvent('File Uploaded', {
        provider,
        session_count: sessions.length,
      });

      // Create shareable wrap - capture promise so persona update can wait for shareId
      const shareIdPromise = createShareableWrap(calculatedStats).then(id => {
        if (id) {
          console.log('✅ Shareable wrap created:', id);

          // Update localStorage with shareId
          const currentStats = localStorage.getItem(WRAPPED_STORAGE_KEY);
          if (currentStats) {
            const parsed = JSON.parse(currentStats);
            localStorage.setItem(WRAPPED_STORAGE_KEY, JSON.stringify({
              ...parsed,
              shareId: id,
            }));
          }
        }
        return id;
      }).catch(err => {
        console.error('Failed to create shareable wrap:', err);
        return null;
      });

      // Store stats without persona first
      localStorage.setItem(WRAPPED_STORAGE_KEY, JSON.stringify({
        ...calculatedStats,
        persona: undefined,
      }));

      // Insert analytics (fire and forget - runs in background)
      insertAnalytics(calculatedStats, sessions).catch(err => {
        console.error('Analytics insertion failed:', err);
      });

      // Start persona generation IMMEDIATELY (fire and forget)
      const sessionInfoList = buildSessionInfoList(sessions);
      if (sessionInfoList.length > 0) {
        console.log('🧠 Starting persona generation with', sessionInfoList.length, 'sessions');
        (async () => {
          try {
            const persona = await generatePersonaPayload(sessionInfoList);
            if (persona) {
              const latestRaw = localStorage.getItem(WRAPPED_STORAGE_KEY);
              if (latestRaw) {
                const latestStats = JSON.parse(latestRaw);
                const merged = { ...latestStats, persona };
                localStorage.setItem(WRAPPED_STORAGE_KEY, JSON.stringify(merged));
                window.dispatchEvent(new StorageEvent('storage', {
                  key: WRAPPED_STORAGE_KEY,
                  newValue: JSON.stringify(merged),
                }));
                window.dispatchEvent(new Event('wrapped:persona-ready'));

                // Wait for shareId, then update shared wrap with persona
                const shareId = await shareIdPromise;
                if (shareId) {
                  updateSharedWrapWithPersona(shareId, persona).catch(err => {
                    console.error('Failed to update shared wrap with persona:', err);
                  });
                }
              }
            }
          } catch (personaError) {
            console.error('Persona generation failed:', personaError);
          }
        })();
      }

      // Show loading sequence (while API call runs in background)
      setLoadingSessionCount(sessions.length);
      setShowLoadingSequence(true);
      setIsProcessing(false);
      setPendingFile(null);
    } catch (err) {
      console.error('❌ Error:', err);
      if (err instanceof ParseError) {
        if (err.message.includes('determine whether this export')) {
          setNeedsProviderChoice(true);
          setError('We couldn\'t tell whether this export came from Claude or ChatGPT. Choose one to continue.');
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('An unexpected error occurred');
      }
      setIsProcessing(false);
    }
  };

  const handleManualProviderSelect = async (provider: AiProvider) => {
    if (!pendingFile) {
      return;
    }
    setSelectedProvider(provider);
    await processFile(pendingFile, provider);
  };

  const handleLoadingComplete = () => {
    // Navigate immediately - crossfade handled by CardContainer entrance animation
    router.push('/results');
  };

  // Teaser insights
  const teasers = [
    { icon: '📅', label: 'Your Power Days', desc: 'When you think deepest' },
    { icon: '💬', label: 'Total Conversations', desc: 'Every chat counted' },
    { icon: '⏰', label: 'Time of Day', desc: 'Your active hours' },
    { icon: '🔥', label: 'Longest Session', desc: 'Your deepest dive' },
    { icon: '✨', label: 'And more...', desc: 'Many more insights await' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Grain texture overlay */}
      <div className="grain-overlay" />

      {/* Dramatic background elements - editorial style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary accent blob - changes color based on provider */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.4, 0.3],
            backgroundColor: selectedProvider === 'claude' ? '#ff006e' : '#10a37f',
          }}
          transition={{
            scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            backgroundColor: { duration: 0.6, ease: 'easeInOut' },
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px]"
        />

        {/* Secondary accent blob - changes color based on provider */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
            backgroundColor: selectedProvider === 'claude' ? '#ccff00' : '#6ee7b7',
          }}
          transition={{
            scale: { duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 },
            opacity: { duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 },
            backgroundColor: { duration: 0.6, ease: 'easeInOut' },
          }}
          className="absolute bottom-20 left-0 w-[500px] h-[500px] rounded-full blur-[100px]"
        />

        {/* Large decorative typography in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25rem] font-display font-black text-white/[0.02] select-none whitespace-nowrap">
          2025
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 md:pt-24 pb-12 md:pb-20 relative z-10">
        {/* Provider toggle + Help link - top row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="inline-flex rounded-full bg-[#f8f5f2]/10 p-1 border border-[#f8f5f2]/20 relative">
            {(['chatgpt', 'claude'] as AiProvider[]).map(option => {
              const isActive = option === selectedProvider;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedProvider(option)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-300 relative ${
                    isActive
                      ? 'text-[#f8f5f2]'
                      : 'text-[#f8f5f2]/60 hover:text-[#f8f5f2]'
                  }`}
                  disabled={isProcessing}
                >
                  {isActive && (
                    <motion.div
                      layoutId="provider-highlight"
                      className="absolute inset-0 rounded-full bg-[#ff006e]"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{option === 'chatgpt' ? 'ChatGPT' : 'Claude'}</span>
                </button>
              );
            })}
          </div>

          {/* Help link in header - hover reveals "Email us" */}
          <a
            href="mailto:support@dysunlabs.com"
            className="group relative text-sm font-medium transition-colors duration-200"
          >
            <span className="text-[#f8f5f2]/50 group-hover:opacity-0 transition-opacity duration-200">
              Need help?
            </span>
            <span className="absolute inset-0 text-[#ff006e] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Email us
            </span>
          </a>
        </motion.div>

        {/* Header - MASSIVE and asymmetric */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 md:mb-12"
        >
          {/* Oversized, editorial headline */}
          <div className="relative">
            <h1 className="font-display font-black text-[4rem] md:text-[8rem] lg:text-[9.5rem] leading-[0.85] tracking-tighter text-[#f8f5f2] mb-6 -ml-2">
              {heroTitle.split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                  style={{
                    marginLeft: i === 1 ? '10%' : '0',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-2 w-32 md:w-48 bg-[#ff006e] origin-left mb-8"
            />

            {/* Subtitle - positioned asymmetrically */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-3xl font-medium text-[#f8f5f2]/80 max-w-2xl leading-tight mb-6"
            >
              Your {assistantLabel} journey, <span className="text-[#ff006e] italic">visualized</span>
            </motion.p>

            {/* Example wrap CTA */}
            <motion.a
              href={exampleWrapUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f8f5f2]/10 border border-[#f8f5f2]/20 text-[#f8f5f2] text-base font-medium hover:bg-[#ff006e]/20 hover:border-[#ff006e]/40 transition-all duration-300 overflow-hidden"
            >
              {/* Shimmer effect - two elements for continuous loop */}
              <span className="absolute inset-0 animate-[shimmer_3s_linear_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="relative">✨</span>
              <span className="relative">See an example wrap</span>
              <span className="relative inline-block transition-transform duration-200 group-hover:translate-x-2">→</span>
            </motion.a>
          </div>

        </motion.div>

        {/* Asymmetric editorial grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Upload Area - spans 8 columns, asymmetric positioning */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8"
          >
            {/* Bold border with hover effect */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className={`relative border-4 border-[#f8f5f2]/20 hover:border-[#ff006e]/60 transition-all duration-500 rounded-3xl overflow-hidden backdrop-blur-sm bg-[#0a0a0a]/60`}
            >
              {/* Halftone pattern overlay */}
              <div className="absolute inset-0 halftone text-[#ff006e] opacity-10 pointer-events-none" />

              <div className="relative p-8 md:p-12">
                {/* Editorial heading */}
                <div className="mb-6">
                  <h3 className="font-display text-3xl md:text-4xl font-bold text-[#f8f5f2] mb-3 leading-tight">
                    Get your Wrapped
                  </h3>
                  <div className="h-1 w-24 bg-[#ccff00] mb-4" />
                  <p className="text-[#a8a29e] text-base">
                    Getting your {assistantLabel} Wrapped is easy.{' '}
                    <button
                      type="button"
                      onClick={() => setShowVideoModal(true)}
                      className="text-[#ccff00] hover:text-[#ff006e] underline underline-offset-2 transition-colors"
                    >
                      Watch the video
                    </button>
                    {' '}or{' '}
                    <a href="#export-instructions" className="text-[#ccff00] hover:text-[#ff006e] underline underline-offset-2 transition-colors">
                      see steps below
                    </a>.
                  </p>
                </div>

                {/* Upload drop zone - playful and dramatic */}
                <motion.div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.02 }}
                  animate={{
                    scale: isDragging ? 1.05 : 1,
                    borderColor: isDragging ? '#ff006e' : 'rgba(248, 245, 242, 0.3)',
                  }}
                  className="relative border-4 border-dashed rounded-2xl p-12 mx-auto max-w-xl transition-all duration-300 cursor-pointer backdrop-blur-sm bg-[#f8f5f2]/5 hover:bg-[#f8f5f2]/10 mb-2"
                >
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isProcessing}
                  />

                  <motion.div
                    animate={{
                      y: isProcessing ? [0, -10, 0] : 0,
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: isProcessing ? Infinity : 0,
                      ease: 'easeInOut',
                    }}
                  >
                    <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-[#ff006e]' : 'text-[#ccff00]'} transition-colors`} />
                  </motion.div>

                  <p className="font-display text-2xl font-bold text-[#f8f5f2] mb-2 text-center">
                    {isProcessing ? 'Processing...' : 'Drop ZIP file here'}
                  </p>
                  <p className="text-base text-[#f8f5f2]/60 text-center">
                    or click to browse
                  </p>
                </motion.div>

                <div className="flex items-center justify-center gap-2 mt-4 mb-6">
                  <span className="text-lg">🎁</span>
                  <p className="text-sm font-medium text-[#f8f5f2]/70">
                    Join <span className="text-[#ccff00] font-bold">100s</span> who&apos;ve created their Wrapped
                  </p>
                </div>

                {needsProviderChoice && (
                  <div className="mb-8 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-6 py-5 text-left text-yellow-100">
                    <p className="text-sm md:text-base">
                      We couldn't auto-detect this ZIP. Pick which export you uploaded and we'll process it.
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                      {(['claude', 'chatgpt'] as AiProvider[]).map(option => (
                        <button
                          key={`manual-${option}`}
                          type="button"
                          onClick={() => handleManualProviderSelect(option)}
                          disabled={isProcessing}
                          className="rounded-full border border-yellow-400/60 px-4 py-2 text-sm font-semibold text-yellow-100 hover:bg-yellow-400/20 transition-colors disabled:opacity-60"
                        >
                          Process as {option === 'chatgpt' ? 'ChatGPT' : 'Claude'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions section heading */}
                <div id="export-instructions" className="mb-6 scroll-mt-8">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h4 className="font-display text-2xl md:text-3xl font-bold text-[#f8f5f2] leading-tight">
                      How to get your Wrapped
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowVideoModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ccff00] text-[#0a0a0a] text-sm font-bold hover:bg-[#ccff00]/80 transition-colors"
                    >
                      <Play size={14} fill="currentColor" />
                      Watch video
                    </button>
                  </div>
                  <div className="h-1 w-20 bg-[#ccff00]" />
                </div>

                {/* Instructions - editorial list style */}
                <div className="space-y-4 max-w-2xl">
                  <p className="flex gap-4 items-start">
                    <span className="font-display text-3xl font-bold text-[#ff006e]">1</span>
                    <span className="text-[#f8f5f2]/80 text-lg pt-1">
                      Click on <strong>Export Data</strong> from{' '}
                      <a
                        href={providerSettingsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#ff006e] hover:text-[#ccff00] underline underline-offset-4 decoration-2 transition-colors font-medium"
                      >
                        Settings on {assistantLabel}
                      </a>
                    </span>
                  </p>
                  <p className="flex gap-4 items-start">
                    <span className="font-display text-3xl font-bold text-[#ff006e]">2</span>
                    <span className="text-[#f8f5f2]/80 text-lg pt-1">{assistantLabel} will email your export in 5-10 minutes</span>
                  </p>
                  <p className="flex gap-4 items-start">
                    <span className="font-display text-3xl font-bold text-[#ff006e]">3</span>
                    <span className="text-[#f8f5f2]/80 text-lg pt-1">Download the file and upload it here. That&apos;s it - enjoy your Wrapped!</span>
                  </p>
                </div>

                {/* Help and privacy links */}
                <div className="mt-8 pt-6 border-t border-[#f8f5f2]/10 flex items-center justify-between">
                  <p className="text-[#f8f5f2]/50 text-sm">
                    Having trouble?{' '}
                    <a
                      href="mailto:support@dysunlabs.com"
                      className="text-[#ff006e] hover:text-[#ccff00] underline underline-offset-2 transition-colors"
                    >
                      Contact us
                    </a>
                  </p>
                  <a
                    href="/privacy"
                    className="text-[#f8f5f2]/40 text-sm hover:text-[#f8f5f2]/60 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </div>

                </div>
            </motion.div>

            {/* Error Display - editorial style */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-red-500/10 border-l-4 border-[#ff006e] rounded-r-2xl backdrop-blur-sm"
              >
                <p className="text-[#f8f5f2] text-base font-medium">{error}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Teaser Preview Cards - Magazine-style callouts */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Section label - editorial style */}
            <div className="mb-8">
              <h3 className="font-display text-4xl font-bold text-[#f8f5f2] leading-tight mb-2">
                You'll<br />discover:
              </h3>
              <div className="h-1 w-16 bg-[#ccff00]" />
            </div>

            {/* Magazine-style callout cards */}
            {teasers.map((teaser, index) => (
              <motion.div
                key={teaser.label}
                initial={{ opacity: 0, x: 20, rotate: -2 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.6 + index * 0.08,
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{
                  scale: 1.03,
                  rotate: index % 2 === 0 ? 1 : -1,
                  transition: { duration: 0.2 }
                }}
                className="relative group"
              >
                {/* Card background with dramatic border */}
                <div className="relative bg-[#f8f5f2]/5 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-[#f8f5f2]/20 hover:border-[#ff006e]/60 transition-all duration-300 p-5">
                  {/* Accent corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff006e]/20 rounded-bl-full" />

                  <div className="relative flex items-start gap-4">
                    {/* Large emoji icon */}
                    <span className="text-5xl leading-none flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {teaser.icon}
                    </span>

                    {/* Text content */}
                    <div className="flex-1 pt-1">
                      <p className="font-display text-xl font-bold text-[#f8f5f2] mb-1 leading-tight">
                        {teaser.label}
                      </p>
                      <p className="text-[#f8f5f2]/60 text-sm leading-snug">
                        {teaser.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer - editorial style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-20 md:mt-32 border-t border-[#f8f5f2]/10 pt-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Privacy note */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse" />
              <p className="text-[#f8f5f2]/60 text-sm">
                Your conversations stay on your device.
              </p>
            </div>

            {/* Credit */}
            <p className="text-[#f8f5f2]/40 text-sm">
              Built by{' '}
              <a
                href="https://twitter.com/akshayvkt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff006e] hover:text-[#ccff00] font-medium transition-colors underline underline-offset-2"
              >
                @akshayvkt
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Sticky top trust bar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a] backdrop-blur-md border-b border-[#f8f5f2]/10"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center justify-start md:justify-center gap-2 md:gap-8 text-xs md:text-sm">
          {/* Desktop: all three */}
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-[#ccff00]">🔒</span>
            <span className="text-[#f8f5f2]/80 font-medium">Your file stays on your device</span>
          </div>
          <span className="text-[#f8f5f2]/20 hidden md:inline">•</span>
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-[#ff006e]">🚫</span>
            <span className="text-[#f8f5f2]/80 font-medium">Your chats aren&apos;t stored</span>
          </div>
          <span className="text-[#f8f5f2]/20 hidden md:inline">•</span>
          <a
            href="https://github.com/akshayvkt/aiwrapped"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 group"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" className="fill-[#f8f5f2] group-hover:fill-[#ccff00] transition-colors flex-shrink-0"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            <span className="text-[#f8f5f2]/80 font-medium group-hover:text-[#ccff00] transition-colors">
              Don&apos;t trust us? <span className="underline underline-offset-2">Code is public</span>
            </span>
          </a>

          {/* Mobile: two items */}
          <div className="flex md:hidden items-center gap-1.5">
            <span className="text-[#ff006e]">🚫</span>
            <span className="text-[#f8f5f2]/80 font-medium">Your chats aren&apos;t stored</span>
          </div>
          <span className="text-[#f8f5f2]/20 md:hidden">•</span>
          <a
            href="https://github.com/akshayvkt/aiwrapped"
            target="_blank"
            rel="noopener noreferrer"
            className="flex md:hidden items-center gap-1.5 group"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" className="fill-[#f8f5f2] group-hover:fill-[#ccff00] transition-colors flex-shrink-0"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            <span className="text-[#f8f5f2]/80 font-medium group-hover:text-[#ccff00] transition-colors">
              Trust issues? <span className="underline underline-offset-2">Code is public</span>
            </span>
          </a>
        </div>
      </motion.div>

      {/* Loading sequence overlay */}
      <AnimatePresence>
        {showLoadingSequence && (
          <LoadingSequence
            provider={selectedProvider}
            sessionCount={loadingSessionCount}
            onComplete={handleLoadingComplete}
          />
        )}
      </AnimatePresence>

      {/* Video tutorial modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer"
            onClick={() => setShowVideoModal(false)}
          >
            {/* Close hint */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute top-6 right-6 flex items-center gap-2 text-[#f8f5f2]/60 text-sm"
            >
              <span>Click anywhere to close</span>
              <X size={18} />
            </motion.div>

            {/* Video container - responsive sizing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl max-h-[80vh] cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={exportVideoUrl}
                controls
                autoPlay
                className="w-full h-full rounded-2xl shadow-2xl"
                style={{ maxHeight: '80vh' }}
              >
                Your browser does not support the video tag.
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
