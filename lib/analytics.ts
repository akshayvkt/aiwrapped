import type { WrappedStats, AiSession } from './types';
import { differenceInCalendarDays, parseISO } from 'date-fns';

/**
 * Helper to make authenticated Supabase requests
 */
async function supabaseFetch(endpoint: string, options: RequestInit): Promise<Response | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not configured - skipping request');
    return null;
  }

  return fetch(`${supabaseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      ...options.headers,
    },
  });
}

/**
 * Insert anonymous analytics data into Supabase
 * Only stores aggregate stats - no personal info or session titles
 * Returns the row ID for later updates (e.g., adding persona data)
 */
export async function insertAnalytics(stats: WrappedStats, sessions: AiSession[]): Promise<string | null> {

  try {
    // Calculate account age in days from raw session dates
    const dates = sessions.map(s => parseISO(s.created_at));
    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const accountAgeDays = differenceInCalendarDays(latestDate, earliestDate);

    // Prepare analytics payload (all anonymous aggregate data)
    const payload = {
      provider: stats.provider,
      total_sessions: stats.totalSessions,
      total_messages: stats.totalMessages,
      total_tokens: stats.totalTokens,
      estimated_words: stats.estimatedWords,
      harry_potter_multiple: stats.harryPotterMultiple,
      account_age_days: accountAgeDays,

      // Raw arrays
      session_durations_minutes: stats.sessionDurationsMinutes,
      session_message_counts: stats.sessionMessageCounts,
      first_message_tokens: stats.firstMessageTokens,
      messages_by_hour: stats.messagesByHour,
      sessions_by_day_of_week: stats.sessionsByDayOfWeek,

      // Aggregates
      turn_taking_ratio: stats.turnTakingRatio,
      human_messages: stats.humanMessages,
      assistant_messages: stats.claudeMessages,
      human_tokens: stats.humanTokens,
      assistant_tokens: stats.claudeTokens,

      // Politeness
      thank_you_count: stats.thankYouCount,
      thank_you_percentage: stats.thankYouPercentage,
      apology_count: stats.apologyCount,

      // Activity
      sessions_per_week: stats.sessionsPerWeek,
      messages_per_session: stats.messagesPerSession,

      // Peak activity
      peak_week_count: stats.peakWeek.count,
      peak_month_count: stats.peakMonth.count,
      busiest_day_sessions: stats.busiestDay?.sessions,
      busiest_day_messages: stats.busiestDay?.messages,

      // Streaks
      longest_streak_days: stats.streaks?.longest.length,
      longest_streak_sessions: stats.streaks?.longest.sessionCount,
      current_streak_days: stats.streaks?.current.length,
      current_streak_active: stats.streaks?.current.isActive,
      total_active_days: stats.streaks?.totalActiveDays,

      // Image usage
      total_images: stats.imageUsage?.totalImages,
      sessions_with_images: stats.imageUsage?.sessionsWithImages,

      // Persona
      persona_generated: Boolean(stats.persona),
    };

    const response = await supabaseFetch('/rest/v1/analytics_runs', {
      method: 'POST',
      headers: {
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (!response || !response.ok) {
      if (response) {
        console.error('Failed to insert analytics:', response.status, await response.text());
      }
      return null;
    }

    const data = await response.json();
    const rowId = data[0]?.id;

    if (rowId) {
      console.log('✅ Analytics data saved with ID:', rowId);
      return rowId;
    }

    return null;
  } catch (error) {
    console.error('Error inserting analytics:', error);
    // Don't throw - analytics failure shouldn't break user experience
    return null;
  }
}

