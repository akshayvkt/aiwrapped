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
import { RoastCard } from '@/components/cards/RoastCard';
import { SendOffCard } from '@/components/cards/SendOffCard';
import { ProviderContextProvider } from '@/components/providers/ProviderContext';
import { getSharedWrap } from '@/lib/sharing';
import { notFound } from 'next/navigation';

export default async function SharedWrapPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  // Await params (Next.js 15 requirement)
  const { id } = await params;

  // Fetch the shared wrap from Supabase
  const stats = await getSharedWrap(id);

  if (!stats) {
    notFound();
  }

  // Array of card components to display (same as results page)
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
      : []),
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
