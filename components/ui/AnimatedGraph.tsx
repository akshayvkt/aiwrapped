'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { format } from 'date-fns';
import type { MonthlyDataPoint, PeakMonth } from '@/lib/types';

// Custom tooltip component
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      date: number;
      sessions: number;
      displayDate: string;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3">
        <p className="text-gray-300 text-sm font-semibold mb-1">
          {format(new Date(data.payload.date), 'MMM yyyy')}
        </p>
        <p className="text-white text-base">
          {data.value} sessions
        </p>
      </div>
    );
  }
  return null;
};

interface AnimatedGraphProps {
  monthlyData: MonthlyDataPoint[];
  peakMonth: PeakMonth;
}

export function AnimatedGraph({ monthlyData, peakMonth }: AnimatedGraphProps) {
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    // Animate the graph drawing over 1 second
    const startTime = Date.now();
    const duration = 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, []);

  // Format data for Recharts
  const chartData = monthlyData.map(point => {
    // Convert monthStart to Date if it's a string (from localStorage)
    const monthStartDate = typeof point.monthStart === 'string'
      ? new Date(point.monthStart)
      : point.monthStart;

    return {
      date: monthStartDate.getTime(),
      sessions: point.sessions,
      displayDate: format(monthStartDate, 'MMM yy'),
    };
  });

  // Find peak month in chart data
  const peakMonthStartDate = typeof peakMonth.monthStart === 'string'
    ? new Date(peakMonth.monthStart)
    : peakMonth.monthStart;

  const peakDataPoint = chartData.find(
    d => d.date === peakMonthStartDate.getTime()
  );

  // Calculate ticks for every 3 months
  const minDate = Math.min(...chartData.map(d => d.date));
  const maxDate = Math.max(...chartData.map(d => d.date));
  const ticks: number[] = [];
  const threeMonthsInMs = 90 * 24 * 60 * 60 * 1000; // ~3 months in milliseconds

  for (let tick = minDate; tick <= maxDate; tick += threeMonthsInMs) {
    ticks.push(tick);
  }
  ticks.push(maxDate); // Always include the last point

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
      >
        <defs>
          <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="date"
          type="number"
          domain={['dataMin', 'dataMax']}
          ticks={ticks}
          tickFormatter={(timestamp) => {
            const date = new Date(timestamp);
            return format(date, 'MMM yy');
          }}
          stroke="#666"
          tick={{ fill: '#999', fontSize: 12 }}
        />

        <YAxis
          stroke="#666"
          tick={{ fill: '#999', fontSize: 12 }}
          label={{ value: 'Sessions', angle: -90, position: 'insideLeft', fill: '#999' }}
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          type="monotone"
          dataKey="sessions"
          stroke="#a855f7"
          strokeWidth={3}
          fill="url(#colorSessions)"
          animationDuration={1000}
          isAnimationActive={true}
        />

        {/* Highlight peak month - appears right after line finishes */}
        {peakDataPoint && animationProgress > 0.95 && (
          <ReferenceDot
            x={peakDataPoint.date}
            y={peakDataPoint.sessions}
            r={8}
            fill="#fbbf24"
            stroke="#fff"
            strokeWidth={2}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
