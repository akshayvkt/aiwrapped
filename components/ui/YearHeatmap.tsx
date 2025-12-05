'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface YearHeatmapProps {
  activeDates: string[]; // ISO date strings (yyyy-MM-dd)
  year: number;
  exportMode?: boolean;
  endDate?: Date; // optional cutoff; defaults to today
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Generate calendar grid for a month, optionally clipping days after a cutoff date
 * Returns a 2D array where each cell is:
 * - true: active day
 * - false: inactive day
 * - null: empty cell (before first day or after last day)
 */
function getMonthGrid(
  year: number,
  month: number,
  activeDatesSet: Set<string>,
  cutoffDate?: Date
): (boolean | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay(); // 0=Sun, 6=Sat
  const daysInMonth = lastDay.getDate();

  const isCutoffMonth =
    cutoffDate &&
    cutoffDate.getFullYear() === year &&
    cutoffDate.getMonth() === month;
  const cutoffDay = isCutoffMonth ? cutoffDate.getDate() : null;

  const grid: (boolean | null)[][] = [];
  let day = 1;

  for (let week = 0; week < 6; week++) {
    const row: (boolean | null)[] = [];
    for (let dow = 0; dow < 7; dow++) {
      if ((week === 0 && dow < startOffset) || day > daysInMonth) {
        row.push(null); // Empty cell
      } else {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isFutureDay = isCutoffMonth && cutoffDay !== null && day > cutoffDay;
        row.push(isFutureDay ? null : activeDatesSet.has(dateStr)); // true = active, false = inactive
        day++;
      }
    }
    grid.push(row);
    if (day > daysInMonth && row.every(cell => cell === null || cell !== null)) {
      // Only break if we've filled all days
      if (day > daysInMonth) break;
    }
  }

  // Remove trailing empty rows
  while (grid.length > 0 && grid[grid.length - 1].every(cell => cell === null)) {
    grid.pop();
  }

  return grid;
}

export function YearHeatmap({ activeDates, year, exportMode = false, endDate }: YearHeatmapProps) {
  const activeDatesSet = useMemo(() => new Set(activeDates), [activeDates]);

  // Use provided cutoff date, or default to today when the displayed year matches the current year.
  const effectiveCutoff = useMemo(() => {
    if (endDate) return endDate;
    const now = new Date();
    return now.getFullYear() === year ? now : new Date(year, 11, 31);
  }, [endDate, year]);

  const lastMonthToShow =
    effectiveCutoff.getFullYear() === year ? effectiveCutoff.getMonth() : 11;

  const monthGrids = useMemo(() => {
    return MONTH_NAMES.map((_, monthIndex) => {
      if (monthIndex > lastMonthToShow) return null; // Hide months beyond the cutoff
      return {
        name: MONTH_NAMES[monthIndex],
        grid: getMonthGrid(year, monthIndex, activeDatesSet, effectiveCutoff),
        monthIndex,
      };
    }).filter((month): month is { name: string; grid: (boolean | null)[][]; monthIndex: number } => Boolean(month));
  }, [year, activeDatesSet, effectiveCutoff, lastMonthToShow]);

  return (
    <div className="grid grid-cols-4 gap-x-3 gap-y-4 sm:gap-x-4 sm:gap-y-5 w-full">
      {monthGrids.map((month, monthIdx) => (
        <motion.div
          key={month.name}
          initial={exportMode ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: exportMode ? 0 : 2.0 + monthIdx * 0.05,
            duration: 0.3,
          }}
          className="flex flex-col items-center"
        >
          {/* Month label */}
          <span className="text-[clamp(0.55rem,1.8vw,0.75rem)] text-[#f8f5f2]/60 uppercase tracking-wider mb-1.5 font-medium">
            {month.name}
          </span>

          {/* Calendar grid */}
          <div className="flex flex-col gap-[2px] sm:gap-[3px]">
            {month.grid.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-[2px] sm:gap-[3px]">
                {row.map((isActive, colIdx) => {
                  if (isActive === null) {
                    // Empty cell - invisible placeholder
                    return (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className="w-[8px] h-[8px] sm:w-[10px] sm:h-[10px]"
                      />
                    );
                  }

                  const delay = exportMode
                    ? 0
                    : 2.2 + monthIdx * 0.06 + rowIdx * 0.015 + colIdx * 0.008;

                  return (
                    <motion.div
                      key={`${rowIdx}-${colIdx}`}
                      initial={exportMode ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay,
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                      }}
                      className={`w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-full ${
                        isActive
                          ? 'bg-[#a3e635] shadow-[0_0_4px_#a3e635]'
                          : 'border border-[#f8f5f2]/20'
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
