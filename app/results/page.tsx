'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CardContainer } from '@/components/cards/CardContainer';
import { TimeSpanCard } from '@/components/cards/TimeSpanCard';
import { SessionsCard } from '@/components/cards/SessionsCard';
import { ThankYouCard } from '@/components/cards/ThankYouCard';
import { WordsCard } from '@/components/cards/WordsCard';
import { ImageHighlightsCard } from '@/components/cards/ImageHighlightsCard';
import { YearActivityCard } from '@/components/cards/YearActivityCard';
import { TimeOfDayCard } from '@/components/cards/TimeOfDayCard';
import { QuickConversationsCard } from '@/components/cards/QuickConversationsCard';
import { PersonalityCard } from '@/components/cards/PersonalityCard';
import { PredictionCard } from '@/components/cards/PredictionCard';
import { PersonaLoadingCard } from '@/components/cards/PersonaLoadingCard';
// import { BusiestDayCard } from '@/components/cards/BusiestDayCard';
// import { PowerDaysCard } from '@/components/cards/PowerDaysCard';
import { RoastCard } from '@/components/cards/RoastCard';
import { SendOffCard } from '@/components/cards/SendOffCard';
import { ProviderContextProvider } from '@/components/providers/ProviderContext';
import { WRAPPED_STORAGE_KEY } from '@/lib/constants';
import type { WrappedStats } from '@/lib/types';

export default function ResultsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = () => {
      const statsJson = localStorage.getItem(WRAPPED_STORAGE_KEY);
      if (!statsJson) {
        router.push('/');
        return;
      }
      try {
        const parsedStats = JSON.parse(statsJson) as WrappedStats;
        setStats(parsedStats);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to parse stats:', error);
        router.push('/');
      }
    };

    loadStats();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === WRAPPED_STORAGE_KEY && event.newValue) {
        try {
          const nextStats = JSON.parse(event.newValue) as WrappedStats;
          setStats(nextStats);
        } catch (error) {
          console.error('Failed to parse updated stats:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('wrapped:persona-ready', loadStats as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('wrapped:persona-ready', loadStats as EventListener);
    };
  }, [router]);

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading your wrapped...</div>
      </div>
    );
  }

  // Array of card components to display
  const personaReady = Boolean(stats.persona && stats.persona.title);
  const hasImageHighlights =
    Boolean(stats.imageUsage && stats.imageUsage.totalImages >= 20);

  const cards = [
    { component: TimeSpanCard, name: 'TimeSpan' },
    { component: SessionsCard, name: 'Sessions' },
    { component: YearActivityCard, name: 'YearActivity' },
    ...(hasImageHighlights ? [{ component: ImageHighlightsCard, name: 'ImageHighlights' }] : []),
    { component: ThankYouCard, name: 'ThankYou' },
    { component: WordsCard, name: 'Words' },
    ...(personaReady
      ? [{ component: PersonalityCard, name: 'Personality' }, { component: PredictionCard, name: 'Prediction' }]
      : [{ component: PersonaLoadingCard, name: 'PersonaLoading' }]),
    { component: TimeOfDayCard, name: 'TimeOfDay' },
    { component: QuickConversationsCard, name: 'QuickConversations' },
    ...(personaReady ? [{ component: RoastCard, name: 'Roast' }] : []),
    { component: SendOffCard, name: 'SendOff' },
  ];

  return (
    <ProviderContextProvider provider={stats.provider}>
      <CardContainer cards={cards} stats={stats} />
    </ProviderContextProvider>
  );
}
