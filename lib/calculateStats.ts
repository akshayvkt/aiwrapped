import {
  startOfWeek,
  startOfDay,
  startOfMonth,
  format,
  differenceInMonths,
  differenceInYears,
  differenceInCalendarDays,
  parseISO,
  getDay,
  getHours,
} from 'date-fns';
import type {
  AiSession,
  WrappedStats,
  DailyDataPoint,
  WeeklyDataPoint,
  MonthlyDataPoint,
  PeakWeek,
  PeakMonth,
  LongestSession,
  TopSession,
  MessageDistribution,
  DurationDistribution,
  PowerDaysInsight,
  TimeOfDayData,
  TimeOfDayPeriod,
  AiProvider,
  BusiestDay,
  ConversationStreakSummary,
} from './types';

const HARRY_POTTER_WORDS = 1084170; // Total words in all 7 Harry Potter books

/**
 * Estimate tokens from text (rough approximation: 1 token ≈ 4 characters)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Format duration in human-readable form
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  } else if (seconds < 3600) {
    const minutes = Math.round(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return minutes > 0
      ? `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} min`
      : `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return hours > 0
      ? `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`
      : `${days} day${days !== 1 ? 's' : ''}`;
  }
}

/**
 * Calculate account age in human-readable form
 */
function calculateAccountAge(earliestDate: Date, latestDate: Date): string {
  const years = differenceInYears(latestDate, earliestDate);
  const months = differenceInMonths(latestDate, earliestDate) % 12;

  if (years > 0) {
    return months > 0
      ? `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`
      : `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
}

function calculateConversationStreaks(sessions: AiSession[]): ConversationStreakSummary | undefined {
  if (sessions.length === 0) {
    return undefined;
  }

  const dayMap = new Map<string, { date: Date; sessionCount: number }>();

  sessions.forEach(session => {
    const parsed = parseISO(session.created_at);
    if (Number.isNaN(parsed.getTime())) {
      return;
    }
    const dayStart = startOfDay(parsed);
    const dayKey = format(dayStart, 'yyyy-MM-dd');
    const entry = dayMap.get(dayKey);
    if (entry) {
      entry.sessionCount += 1;
    } else {
      dayMap.set(dayKey, { date: dayStart, sessionCount: 1 });
    }
  });

  const days = Array.from(dayMap.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  if (days.length === 0) {
    return undefined;
  }

  let longestLength = 1;
  let longestStart = days[0].date;
  let longestEnd = days[0].date;
  let longestSessions = days[0].sessionCount;

  let currentLength = 1;
  let currentStart = days[0].date;
  let currentEnd = days[0].date;
  let currentSessionsTotal = days[0].sessionCount;

  const commitLongestIfNeeded = () => {
    if (
      currentLength > longestLength ||
      (currentLength === longestLength && currentSessionsTotal > longestSessions)
    ) {
      longestLength = currentLength;
      longestStart = currentStart;
      longestEnd = currentEnd;
      longestSessions = currentSessionsTotal;
    }
  };

  for (let i = 1; i < days.length; i++) {
    const prev = days[i - 1];
    const curr = days[i];
    const gap = differenceInCalendarDays(curr.date, prev.date);

    if (gap === 1) {
      currentLength += 1;
      currentSessionsTotal += curr.sessionCount;
    } else {
      commitLongestIfNeeded();
      currentLength = 1;
      currentStart = curr.date;
      currentSessionsTotal = curr.sessionCount;
    }

    currentEnd = curr.date;
  }

  commitLongestIfNeeded();

  const today = startOfDay(new Date());
  const mostRecent = days[days.length - 1];
  const daysSinceLast = differenceInCalendarDays(today, mostRecent.date);

  let activeStreakLength = 0;
  let activeStart: Date | undefined;
  let activeEnd: Date | undefined;
  let activeSessions = 0;
  const isActive = daysSinceLast <= 1;

  if (isActive) {
    activeStreakLength = 1;
    activeStart = mostRecent.date;
    activeEnd = mostRecent.date;
    activeSessions = mostRecent.sessionCount;

    for (let i = days.length - 2; i >= 0; i--) {
      const next = days[i + 1];
      const current = days[i];
      if (differenceInCalendarDays(next.date, current.date) === 1) {
        activeStreakLength += 1;
        activeStart = current.date;
        activeSessions += current.sessionCount;
      } else {
        break;
      }
    }
  }

  return {
    longest: {
      length: longestLength,
      startDate: format(longestStart, 'yyyy-MM-dd'),
      endDate: format(longestEnd, 'yyyy-MM-dd'),
      sessionCount: longestSessions,
    },
    current: {
      length: isActive ? activeStreakLength : 0,
      isActive,
      startDate: isActive && activeStart ? format(activeStart, 'yyyy-MM-dd') : undefined,
      endDate: isActive && activeEnd ? format(activeEnd, 'yyyy-MM-dd') : undefined,
      sessionCount: isActive ? activeSessions : undefined,
    },
    totalActiveDays: days.length,
    daysSinceLastConversation: daysSinceLast,
  };
}

/**
 * Main stats calculation function - ports Python logic from notebooks
 */
export function calculateStats(provider: AiProvider, sessions: AiSession[]): WrappedStats {
  console.log(`📊 Calculating stats for ${sessions.length} sessions (${provider})...`);

  // Filter out empty sessions (sessions with no messages)
  const nonEmptySessions = sessions.filter(s => s.chat_messages && s.chat_messages.length > 0);

  // 1. BASIC COUNTS (from notebook cells 11, 16, 32, 33)
  let totalMessages = 0;
  let totalTokens = 0;
  let humanMessages = 0;
  let claudeMessages = 0;
  let humanTokens = 0;
  let claudeTokens = 0;

  let totalImages = 0;
  let sessionsWithImages = 0;
  let topImageSession: { name: string; date: string; imageCount: number } | null = null;

  // Raw arrays for analytics
  const sessionMessageCounts: number[] = [];
  const firstMessageTokens: number[] = [];
  const messagesByHour: Record<number, number> = {};
  const sessionsByDayOfWeek: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };

  sessions.forEach(session => {
    // Track message count per session
    const messageCount = session.chat_messages.length;
    sessionMessageCounts.push(messageCount);

    // Track first message tokens
    if (messageCount > 0) {
      const firstMsgTokens = estimateTokens(session.chat_messages[0].text);
      firstMessageTokens.push(firstMsgTokens);
    }

    // Track day of week
    const sessionDate = parseISO(session.created_at);
    const dayOfWeek = getDay(sessionDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    sessionsByDayOfWeek[dayNames[dayOfWeek]]++;

    let sessionImageTotal = 0;
    session.chat_messages.forEach(msg => {
      totalMessages++;
      const tokens = estimateTokens(msg.text);
      totalTokens += tokens;

      // Track hour of day
      const msgDate = parseISO(msg.created_at);
      const hour = getHours(msgDate);
      messagesByHour[hour] = (messagesByHour[hour] || 0) + 1;

      if (msg.sender === 'human') {
        humanMessages++;
        humanTokens += tokens;
      } else {
        claudeMessages++;
        claudeTokens += tokens;
      }

      if (provider === 'chatgpt') {
        const attachments = Array.isArray(msg.attachments) && msg.attachments.length > 0
          ? msg.attachments
          : Array.isArray((msg as unknown as { artifacts?: typeof msg.attachments }).artifacts)
            ? ((msg as unknown as { artifacts?: typeof msg.attachments }).artifacts ?? [])
            : [];

        if (attachments.length > 0) {
          const imageCount = attachments
            .filter(attachment => attachment?.type === 'image')
            .reduce((acc, attachment) => acc + (attachment?.count ?? 0), 0);

          if (imageCount > 0) {
            totalImages += imageCount;
            sessionImageTotal += imageCount;
          }
        }
      }
    });

    if (provider === 'chatgpt' && sessionImageTotal > 0) {
      sessionsWithImages++;
      if (!topImageSession || sessionImageTotal > topImageSession.imageCount) {
        topImageSession = {
          name: session.name || '(unnamed)',
          date: session.created_at,
          imageCount: sessionImageTotal,
        };
      }
    }
  });

  const estimatedWords = Math.round(totalTokens * 0.75); // 1 token ≈ 0.75 words
  const harryPotterMultiple = Number((estimatedWords / HARRY_POTTER_WORDS).toFixed(1));

  const imageUsage = provider === 'chatgpt' && totalImages > 0
    ? {
        totalImages,
        sessionsWithImages,
        topSession: topImageSession ?? undefined,
      }
    : undefined;

  const streaks = calculateConversationStreaks(nonEmptySessions);

  // FIRST MESSAGE - Find the earliest session and its first human message
  const sortedByDate = [...nonEmptySessions].sort(
    (a, b) => parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime()
  );
  let firstMessage: { text: string; date: string } | undefined;
  for (const session of sortedByDate) {
    const firstHuman = session.chat_messages.find(m => m.sender === 'human');
    if (firstHuman && firstHuman.text.trim().length > 0) {
      // Truncate to first sentence OR 20 words, whichever is shorter
      const fullText = firstHuman.text.trim();
      const sentenceMatch = fullText.match(/^[^.!?]+[.!?]/);
      const firstSentence = sentenceMatch ? sentenceMatch[0].trim() : fullText;
      const words = fullText.split(/\s+/);
      const first20Words = words.slice(0, 20).join(' ') + (words.length > 20 ? '...' : '');

      const truncatedText = firstSentence.length <= first20Words.length ? firstSentence : first20Words;

      firstMessage = {
        text: truncatedText,
        date: format(parseISO(session.created_at), 'MMM d, yyyy'),
      };
      break;
    }
  }

  // LATEST MESSAGE - Find the most recent session and its first human message
  const sortedByDateDesc = [...nonEmptySessions].sort(
    (a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()
  );
  let latestMessage: { text: string; date: string } | undefined;
  for (const session of sortedByDateDesc) {
    const firstHuman = session.chat_messages.find(m => m.sender === 'human');
    if (firstHuman && firstHuman.text.trim().length > 0) {
      // Truncate to first 30 words (allow longer for recent complex prompts)
      const fullText = firstHuman.text.trim();
      const words = fullText.split(/\s+/);
      const first30Words = words.slice(0, 30).join(' ') + (words.length > 30 ? '...' : '');

      latestMessage = {
        text: first30Words,
        date: format(parseISO(session.created_at), 'MMM d, yyyy'),
      };
      break;
    }
  }

  // 2. TIME RANGE
  const dates = sessions.map(s => parseISO(s.created_at));
  const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const accountAge = calculateAccountAge(earliestDate, latestDate);

  // 3. WEEKLY AGGREGATION (from notebook cell 8)
  const weeklyMap = new Map<string, { weekStart: Date; sessions: number }>();

  sessions.forEach(session => {
    const date = parseISO(session.created_at);
    const weekStart = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
    const weekKey = format(weekStart, 'yyyy-MM-dd');

    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, { weekStart, sessions: 0 });
    }
    weeklyMap.get(weekKey)!.sessions++;
  });

  const weeklyData: WeeklyDataPoint[] = Array.from(weeklyMap.entries())
    .map(([week, data]) => ({
      week,
      weekStart: data.weekStart,
      sessions: data.sessions,
    }))
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

  // Find peak week
  const peakWeekData = weeklyData.reduce((max, current) =>
    current.sessions > max.sessions ? current : max
  );

  const peakWeek: PeakWeek = {
    date: format(peakWeekData.weekStart, 'MMM d, yyyy'),
    count: peakWeekData.sessions,
    weekStart: peakWeekData.weekStart,
  };

  // 3b. DAILY AGGREGATION (for heatmap)
  const dailyMap = new Map<string, { day: Date; sessions: number; messages: number }>();

  sessions.forEach(session => {
    const date = parseISO(session.created_at);
    const dayStart = startOfDay(date);
    const dayKey = format(dayStart, 'yyyy-MM-dd');
    const messageCount = session.chat_messages.length;

    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, { day: dayStart, sessions: 0, messages: 0 });
    }
    const entry = dailyMap.get(dayKey)!;
    entry.sessions++;
    entry.messages += messageCount;
  });

  const dailyData: DailyDataPoint[] = Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      day: data.day,
      sessions: data.sessions,
      messages: data.messages,
    }))
    .sort((a, b) => a.day.getTime() - b.day.getTime());

  const busiestDayEntry = dailyData.reduce<DailyDataPoint | null>((best, current) => {
    if (!best) return current;
    if (current.sessions > best.sessions) return current;
    if (current.sessions === best.sessions && current.messages > best.messages) return current;
    return best;
  }, null);
  const busiestDay: BusiestDay | undefined = busiestDayEntry
    ? {
        date: format(busiestDayEntry.day, 'yyyy-MM-dd'),
        sessions: busiestDayEntry.sessions,
        messages: busiestDayEntry.messages,
      }
    : undefined;

  // 3c. MONTHLY AGGREGATION (for graph)
  const monthlyMap = new Map<string, { monthStart: Date; sessions: number }>();

  sessions.forEach(session => {
    const date = parseISO(session.created_at);
    const monthStart = startOfMonth(date);
    const monthKey = format(monthStart, 'yyyy-MM');

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { monthStart, sessions: 0 });
    }
    monthlyMap.get(monthKey)!.sessions++;
  });

  const monthlyData: MonthlyDataPoint[] = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      monthStart: data.monthStart,
      sessions: data.sessions,
    }))
    .sort((a, b) => a.monthStart.getTime() - b.monthStart.getTime());

  // Find peak month
  const peakMonthData = monthlyData.reduce((max, current) =>
    current.sessions > max.sessions ? current : max
  );

  const peakMonth: PeakMonth = {
    date: format(peakMonthData.monthStart, 'MMM yyyy'),
    count: peakMonthData.sessions,
    monthStart: peakMonthData.monthStart,
  };

  // 4. SESSION DURATION ANALYSIS (from notebook cell 13)
  const sessionDurations: number[] = [];
  let longestSessionData: LongestSession | null = null;
  let maxDuration = 0;

  nonEmptySessions.forEach(session => {
    const messages = session.chat_messages;
    if (messages.length < 2) return;

    const firstMessageTime = parseISO(messages[0].created_at);
    const lastMessageTime = parseISO(messages[messages.length - 1].created_at);
    const durationSeconds = Math.abs(
      (lastMessageTime.getTime() - firstMessageTime.getTime()) / 1000
    );
    const durationMinutes = Math.round(durationSeconds / 60);

    // Store minutes for analytics (smaller numbers)
    sessionDurations.push(durationMinutes);

    if (durationSeconds > maxDuration) {
      maxDuration = durationSeconds;
      longestSessionData = {
        name: session.name || '(unnamed)',
        duration: formatDuration(durationSeconds),
        durationSeconds,
        messages: messages.length,
        date: format(parseISO(session.created_at), 'MMM d, yyyy'),
      };
    }
  });

  // Calculate median duration (convert minutes back to seconds for display)
  const sortedDurations = [...sessionDurations].sort((a, b) => a - b);
  const medianDuration = sortedDurations.length > 0
    ? formatDuration(sortedDurations[Math.floor(sortedDurations.length / 2)] * 60)
    : '0 seconds';

  // 5. TURN-TAKING RATIO (from notebook cell 12)
  const turnTakingRatio = humanTokens > 0
    ? Number((claudeTokens / humanTokens).toFixed(1))
    : 0;

  // 6. TOP 10 SESSIONS BY MESSAGE COUNT (from notebook cell 12)
  const topSessions: TopSession[] = sessions
    .map(session => {
      const messageCount = session.chat_messages.length;
      const sessionTokens = session.chat_messages.reduce(
        (sum, msg) => sum + estimateTokens(msg.text),
        0
      );
      return {
        name: session.name || '(unnamed)',
        messages: messageCount,
        date: format(parseISO(session.created_at), 'MMM d, yyyy'),
        tokens: sessionTokens,
      };
    })
    .sort((a, b) => b.messages - a.messages)
    .slice(0, 10);

  // 7. MESSAGE DISTRIBUTION (from notebook cell 12)
  const messageCounts = sessions.map(s => s.chat_messages.length);
  const messageDistribution: MessageDistribution[] = [
    {
      label: 'Empty (0)',
      count: messageCounts.filter(c => c === 0).length,
      percentage: 0,
    },
    {
      label: 'Quick Q&A (1-4)',
      count: messageCounts.filter(c => c >= 1 && c <= 4).length,
      percentage: 0,
    },
    {
      label: 'Short (5-10)',
      count: messageCounts.filter(c => c >= 5 && c <= 10).length,
      percentage: 0,
    },
    {
      label: 'Medium (11-25)',
      count: messageCounts.filter(c => c >= 11 && c <= 25).length,
      percentage: 0,
    },
    {
      label: 'Long (26-50)',
      count: messageCounts.filter(c => c >= 26 && c <= 50).length,
      percentage: 0,
    },
    {
      label: 'Deep Dive (50+)',
      count: messageCounts.filter(c => c > 50).length,
      percentage: 0,
    },
  ];

  // Calculate percentages
  messageDistribution.forEach(item => {
    item.percentage = Number(((item.count / sessions.length) * 100).toFixed(1));
  });

  // 8. DURATION DISTRIBUTION (sessionDurations is in minutes now)
  const durationDistribution: DurationDistribution[] = [
    {
      label: 'Under 1 minute',
      count: sessionDurations.filter(d => d < 1).length,
      percentage: 0,
    },
    {
      label: '1-10 minutes',
      count: sessionDurations.filter(d => d >= 1 && d < 10).length,
      percentage: 0,
    },
    {
      label: '10-60 minutes',
      count: sessionDurations.filter(d => d >= 10 && d < 60).length,
      percentage: 0,
    },
    {
      label: '1-4 hours',
      count: sessionDurations.filter(d => d >= 60 && d < 240).length,
      percentage: 0,
    },
    {
      label: '4-24 hours',
      count: sessionDurations.filter(d => d >= 240 && d < 1440).length,
      percentage: 0,
    },
    {
      label: 'Multi-day (24+ hours)',
      count: sessionDurations.filter(d => d >= 1440).length,
      percentage: 0,
    },
  ];

  // Calculate percentages
  durationDistribution.forEach(item => {
    item.percentage = sessionDurations.length > 0
      ? Number(((item.count / sessionDurations.length) * 100).toFixed(1))
      : 0;
  });

  // 9. THANK YOU COUNTER
  let thankYouCount = 0;
  let apologyCount = 0;
  const thankPatterns = /\b(thank|thanks|thx|ty|appreciate)\b/i;
  const apologyPatterns = /\b(pardon me)\b/i;

  sessions.forEach(session => {
    session.chat_messages.forEach(msg => {
      const text = msg.text || '';
      if (msg.sender === 'human' && thankPatterns.test(text)) {
        thankYouCount++;
      }
      if (msg.sender === 'assistant') {
        const normalizedText = text.toLowerCase();
        if (
          normalizedText.includes('sorry') ||
          normalizedText.includes('apolog') ||
          apologyPatterns.test(text)
        ) {
          apologyCount++;
        }
      }
    });
  });

  const thankYouPercentage = humanMessages > 0
    ? Number(((thankYouCount / humanMessages) * 100).toFixed(2))
    : 0;

  // 10. POWER DAYS - Top 4 days by usage
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCountMap = new Map<string, number>();

  // Initialize all days with 0
  dayNames.forEach(day => dayCountMap.set(day, 0));

  // Count sessions by day of week
  sessions.forEach(session => {
    const date = parseISO(session.created_at);
    const dayIndex = getDay(date); // 0 = Sunday, 1 = Monday, etc.
    const dayName = dayNames[dayIndex];
    dayCountMap.set(dayName, (dayCountMap.get(dayName) || 0) + 1);
  });

  // Get top 4 days
  const sortedDays = Array.from(dayCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const topDays = sortedDays.map(([day]) => day);

  const powerDays: PowerDaysInsight = {
    topDays,
  };

  // 11. TIME OF DAY ANALYSIS
  const timeOfDayMap = new Map<string, { period: string; emoji: string; count: number }>();

  // Initialize periods
  timeOfDayMap.set('morning', { period: 'Morning', emoji: '☀️', count: 0 });
  timeOfDayMap.set('afternoon', { period: 'Afternoon', emoji: '🌤️', count: 0 });
  timeOfDayMap.set('evening', { period: 'Evening', emoji: '🌆', count: 0 });
  timeOfDayMap.set('midnight', { period: 'Midnight', emoji: '🌙', count: 0 });

  // Count messages by time of day
  let totalMessagesForTimeOfDay = 0;
  sessions.forEach(session => {
    session.chat_messages.forEach(msg => {
      const date = parseISO(msg.created_at);
      const hour = getHours(date);

      totalMessagesForTimeOfDay++;

      if (hour >= 6 && hour < 12) {
        timeOfDayMap.get('morning')!.count++;
      } else if (hour >= 12 && hour < 18) {
        timeOfDayMap.get('afternoon')!.count++;
      } else if (hour >= 18 && hour < 24) {
        timeOfDayMap.get('evening')!.count++;
      } else {
        timeOfDayMap.get('midnight')!.count++;
      }
    });
  });

  // Convert to array and calculate percentages
  const timeOfDayPeriods: TimeOfDayPeriod[] = Array.from(timeOfDayMap.values())
    .map(({ period, emoji, count }) => ({
      period,
      emoji,
      count,
      percentage: totalMessagesForTimeOfDay > 0
        ? Number(((count / totalMessagesForTimeOfDay) * 100).toFixed(1))
        : 0,
    }));

  const timeOfDay: TimeOfDayData = {
    periods: timeOfDayPeriods,
  };

  // 11b. ACTIVE DATES THIS YEAR (for year heatmap)
  const currentYear = new Date().getFullYear();
  const activeDatesThisYear = dailyData
    .filter(d => d.date.startsWith(String(currentYear)))
    .map(d => d.date);

  // 12. ACTIVITY METRICS
  const totalWeeks = weeklyData.length;
  const sessionsPerWeek = totalWeeks > 0 ? Number((sessions.length / totalWeeks).toFixed(1)) : 0;
  const messagesPerSession = sessions.length > 0
    ? Number((totalMessages / sessions.length).toFixed(1))
    : 0;

  console.log(`✅ Stats calculated successfully`);
  console.log(`   Sessions: ${sessions.length}`);
  console.log(`   Messages: ${totalMessages}`);
  console.log(`   Tokens: ${totalTokens.toLocaleString()}`);
  console.log(`   Peak week: ${peakWeek.count} sessions`);

  return {
    provider,
    totalSessions: sessions.length,
    totalMessages,
    totalTokens,
    estimatedWords,
    harryPotterMultiple,
    earliestDate: format(earliestDate, 'MMM yyyy'),
    latestDate: format(latestDate, 'MMM yyyy'),
    accountAge,
    // Raw arrays for analytics
    sessionDurationsMinutes: sessionDurations,
    sessionMessageCounts,
    firstMessageTokens,
    messagesByHour,
    sessionsByDayOfWeek,
    dailyData,
    weeklyData,
    monthlyData,
    peakWeek,
    peakMonth,
    longestSession: longestSessionData || {
      name: 'N/A',
      duration: '0 seconds',
      durationSeconds: 0,
      messages: 0,
      date: 'N/A',
    },
    medianDuration,
    turnTakingRatio,
    humanMessages,
    claudeMessages,
    humanTokens,
    claudeTokens,
    topSessions,
    messageDistribution,
    durationDistribution,
    sessionsPerWeek,
    messagesPerSession,
    thankYouCount,
    thankYouPercentage,
    apologyCount,
    powerDays,
    timeOfDay,
    imageUsage,
    busiestDay,
    streaks,
    firstMessage,
    latestMessage,
    activeDatesThisYear,
  };
}
