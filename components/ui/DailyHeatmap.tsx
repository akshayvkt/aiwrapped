'use client';

import { format } from 'date-fns';
import type { DailyDataPoint } from '@/lib/types';

interface DailyHeatmapProps {
  dailyData: DailyDataPoint[];
}

export function DailyHeatmap({ dailyData }: DailyHeatmapProps) {
  // Find max sessions for color scaling
  const maxSessions = Math.max(...dailyData.map(d => d.sessions));

  // Get color intensity based on session count
  const getColor = (sessions: number) => {
    if (sessions === 0) return 'bg-gray-800';
    const intensity = sessions / maxSessions;
    if (intensity > 0.75) return 'bg-purple-500';
    if (intensity > 0.5) return 'bg-purple-600';
    if (intensity > 0.25) return 'bg-purple-700';
    return 'bg-purple-800';
  };

  return (
    <div className="w-full">
      <h3 className="text-lg text-gray-400 mb-4">Daily Activity</h3>
      <div className="flex gap-1 flex-wrap">
        {dailyData.map((point, index) => {
          const day = typeof point.day === 'string' ? new Date(point.day) : point.day;
          return (
            <div
              key={index}
              className={`w-3 h-3 rounded-sm ${getColor(point.sessions)} transition-colors`}
              title={`${format(day, 'MMM d, yyyy')}: ${point.sessions} sessions`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-800 rounded-sm" />
          <div className="w-3 h-3 bg-purple-800 rounded-sm" />
          <div className="w-3 h-3 bg-purple-700 rounded-sm" />
          <div className="w-3 h-3 bg-purple-600 rounded-sm" />
          <div className="w-3 h-3 bg-purple-500 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
