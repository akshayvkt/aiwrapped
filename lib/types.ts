// Shared data model for AI conversation exports
export type AiProvider = 'claude' | 'chatgpt';

export interface AiAttachment {
  type: 'image' | 'file' | 'link';
  count: number;
  asset_pointers?: string[];
  description?: string;
}

export interface AiMessage {
  uuid: string;
  text: string;
  sender: 'human' | 'assistant';
  created_at: string;
  content?: Array<{
    type: string;
    text?: string;
    thinking?: string;
  }>;
  attachments?: AiAttachment[];
}

export interface AiSession {
  uuid: string;
  name: string;
  summary: string;
  created_at: string;
  updated_at: string;
  chat_messages: AiMessage[];
  account: {
    uuid: string;
  };
}

// Calculated Statistics
export interface DailyDataPoint {
  date: string;
  day: Date;
  sessions: number;
  messages: number;
}

export interface WeeklyDataPoint {
  week: string;
  weekStart: Date;
  sessions: number;
}

export interface MonthlyDataPoint {
  month: string;
  monthStart: Date;
  sessions: number;
}

export interface PeakWeek {
  date: string;
  count: number;
  weekStart: Date;
}

export interface PeakMonth {
  date: string;
  count: number;
  monthStart: Date;
}

export interface LongestSession {
  name: string;
  duration: string;
  durationSeconds: number;
  messages: number;
  date: string;
}

export interface TopSession {
  name: string;
  messages: number;
  date: string;
  tokens: number;
}

export interface ImageUsageSummary {
  totalImages: number;
  sessionsWithImages: number;
  topSession?: {
    name: string;
    date: string;
    imageCount: number;
  };
}

export interface ConversationStreak {
  length: number;
  startDate: string;
  endDate: string;
  sessionCount: number;
}

export interface ConversationStreakSummary {
  longest: ConversationStreak;
  current: {
    length: number;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    sessionCount?: number;
  };
  totalActiveDays: number;
  daysSinceLastConversation: number | null;
}

export interface MessageDistribution {
  label: string;
  count: number;
  percentage: number;
}

export interface DurationDistribution {
  label: string;
  count: number;
  percentage: number;
}

export interface DayOfWeekData {
  day: string;
  count: number;
}

export interface PowerDaysInsight {
  topDays: string[];
}

export interface TimeOfDayPeriod {
  period: string;
  emoji: string;
  count: number;
  percentage: number;
}

export interface TimeOfDayData {
  periods: TimeOfDayPeriod[];
}

export interface WrappedStats {
  // Basic counts
  totalSessions: number;
  totalMessages: number;
  totalTokens: number;
  estimatedWords: number;

  // Comparison metrics
  harryPotterMultiple: number; // Total words / Harry Potter series length

  // Time range
  earliestDate: string;
  latestDate: string;
  accountAge: string; // Human-readable format like "2 years, 5 months"

  // Raw arrays for analytics (privacy-safe - just numbers)
  sessionDurationsMinutes: number[];
  sessionMessageCounts: number[];
  firstMessageTokens: number[];
  messagesByHour: Record<number, number>;
  sessionsByDayOfWeek: Record<string, number>;

  // Daily and Weekly aggregation (HEATMAP DATA)
  dailyData: DailyDataPoint[];
  weeklyData: WeeklyDataPoint[];
  monthlyData: MonthlyDataPoint[];
  peakWeek: PeakWeek;
  peakMonth: PeakMonth;

  // Session durations
  longestSession: LongestSession;
  medianDuration: string;

  // Turn-taking
  turnTakingRatio: number; // How many times more Claude writes vs user
  humanMessages: number;
  claudeMessages: number;
  humanTokens: number;
  claudeTokens: number;

  // Top conversations
  topSessions: TopSession[];

  // Distributions
  messageDistribution: MessageDistribution[];
  durationDistribution: DurationDistribution[];

  // Activity metrics
  sessionsPerWeek: number; // Average
  messagesPerSession: number; // Average

  // Politeness metrics
  thankYouCount: number;
  thankYouPercentage: number;
  apologyCount: number;

  // Power Days
  powerDays: PowerDaysInsight;

  // Time of Day
  timeOfDay: TimeOfDayData;

  // Provider metadata
  provider: AiProvider;

  // Persona (LLM-generated)
  persona?: PersonalityBlurb;

  // ChatGPT vision usage
  imageUsage?: ImageUsageSummary;

  // Peak day activity
  busiestDay?: BusiestDay;

  // Conversation streaks
  streaks?: ConversationStreakSummary;

  // First ever message sent to AI
  firstMessage?: {
    text: string;
    date: string;
  };

  // Most recent message sent to AI
  latestMessage?: {
    text: string;
    date: string;
  };

  // Share ID (for shareable links)
  shareId?: string;

  // Active dates for current year (for year heatmap)
  activeDatesThisYear?: string[]; // Array of ISO date strings (yyyy-MM-dd)
}

export interface PersonalityBlurb {
  title: string;
  summary: string;
  roast: string;
  prediction: string;
}

export interface BusiestDay {
  date: string; // ISO string (yyyy-MM-dd)
  sessions: number;
  messages: number;
}

// Backwards compatibility exports (to be removed once callers migrate)
export type ClaudeSession = AiSession;
export type ClaudeStats = WrappedStats;
