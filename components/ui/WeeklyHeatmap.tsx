'use client';

import { format } from 'date-fns';
import type { WeeklyDataPoint } from '@/lib/types';

interface WeeklyHeatmapProps {
  weeklyData: WeeklyDataPoint[];
}

export function WeeklyHeatmap({ weeklyData }: WeeklyHeatmapProps) {
  // Find max sessions for color scaling
  const maxSessions = Math.max(...weeklyData.map(d => d.sessions));

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
      <h3 className="text-lg text-gray-400 mb-4">Weekly Activity</h3>
      <div className="flex gap-2 flex-wrap">
        {weeklyData.map((point, index) => {
          const week = typeof point.weekStart === 'string' ? new Date(point.weekStart) : point.weekStart;
          return (
            <div
              key={index}
              className={`w-8 h-8 rounded ${getColor(point.sessions)} transition-colors flex items-center justify-center text-xs text-white font-bold`}
              title={`Week of ${format(week, 'MMM d, yyyy')}: ${point.sessions} sessions`}
            >
              {point.sessions > 0 && point.sessions}
            </div>
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
