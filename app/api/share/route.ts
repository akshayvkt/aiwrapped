import { NextResponse } from 'next/server';
import type { WrappedStats } from '@/lib/types';
import { generateShareId } from '@/lib/sharing';

/**
 * Sanitize wrapped data before storing - only keep data we actually display
 * Reduces storage from ~150-200KB to ~5-10KB (95% reduction)
 */
function sanitizeForSharing(stats: WrappedStats): Partial<WrappedStats> {
  // Only keep QuickConversationsCard buckets (Quick Q&A and Short)
  const relevantDistribution = stats.messageDistribution.filter(d =>
    d.label.includes('Quick Q&A') || d.label.includes('Short')
  );

  return {
    // Provider
    provider: stats.provider,

    // Basic counts (shown on multiple cards)
    totalSessions: stats.totalSessions,
    totalMessages: stats.totalMessages,
    totalTokens: stats.totalTokens,
    estimatedWords: stats.estimatedWords,
    harryPotterMultiple: stats.harryPotterMultiple,

    // Time range (shown on TimeSpanCard)
    earliestDate: stats.earliestDate,
    latestDate: stats.latestDate,
    accountAge: stats.accountAge,

    // First and latest messages (shown on TimeSpanCard "How it Started / How it's Going")
    firstMessage: stats.firstMessage,
    latestMessage: stats.latestMessage,

    // Activity metrics (shown on SessionsCard)
    sessionsPerWeek: stats.sessionsPerWeek,
    messagesPerSession: stats.messagesPerSession,

    // Longest session (shown on cards, but remove name - not displayed)
    longestSession: {
      duration: stats.longestSession.duration,
      durationSeconds: stats.longestSession.durationSeconds,
      messages: stats.longestSession.messages,
      date: stats.longestSession.date,
      name: '', // Remove for privacy - not displayed anyway
    },

    // Politeness (shown on ThankYouCard seesaw)
    thankYouCount: stats.thankYouCount,
    thankYouPercentage: stats.thankYouPercentage,
    apologyCount: stats.apologyCount,

    // Streaks (shown on StreaksCard and YearActivityCard)
    streaks: stats.streaks,

    // Active dates for calendar heatmap (shown on YearActivityCard)
    activeDatesThisYear: stats.activeDatesThisYear,

    // Time of day (shown on TimeOfDayCard)
    timeOfDay: stats.timeOfDay,

    // Message distribution (only relevant buckets for QuickConversationsCard)
    messageDistribution: relevantDistribution,

    // Top session (only first one - shown in QuickConversationsCard)
    topSessions: stats.topSessions.slice(0, 1),

    // Image usage (shown on ImageHighlightsCard - ChatGPT only)
    imageUsage: stats.imageUsage,

    // Persona (shown on PersonalityCard, PersonaSummaryCard, RoastCard, PredictionCard)
    persona: stats.persona,

    // Share ID (for the Share button)
    shareId: stats.shareId,

    // ❌ REMOVED - All bloat fields not needed for display:
    // - sessionDurationsMinutes (1000+ numbers)
    // - sessionMessageCounts (1000+ numbers)
    // - firstMessageTokens (1000+ numbers)
    // - dailyData (730 entries)
    // - weeklyData (104 entries)
    // - monthlyData (24 entries)
    // - messagesByHour
    // - sessionsByDayOfWeek
    // - peakWeek
    // - peakMonth
    // - durationDistribution
    // - turnTakingRatio
    // - humanMessages/claudeMessages
    // - humanTokens/claudeTokens
    // - medianDuration
    // - apologyCount
    // - powerDays
    // - busiestDay
  } as WrappedStats;
}

export async function POST(request: Request) {
  try {
    const { wrappedData } = await request.json() as { wrappedData: WrappedStats };

    if (!wrappedData) {
      return NextResponse.json(
        { error: 'Missing wrapped data' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured');
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    // Generate unique share ID
    const shareId = generateShareId();

    // Sanitize data before storing
    const sanitizedData = sanitizeForSharing(wrappedData);

    // Insert into Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/shared_wraps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        id: shareId,
        wrapped_data: sanitizedData,
        provider: sanitizedData.provider,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to insert into Supabase:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to create share link' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const insertedId = data[0]?.id;

    if (!insertedId) {
      console.error('No ID returned from Supabase');
      return NextResponse.json(
        { error: 'Failed to create share link' },
        { status: 500 }
      );
    }

    // Return share ID and full URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/${insertedId}`;

    return NextResponse.json({
      shareId: insertedId,
      url: shareUrl,
    });

  } catch (error) {
    console.error('Error in share API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
