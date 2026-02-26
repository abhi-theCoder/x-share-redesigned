import React, { useEffect, useState } from 'react';
import axios from '../api';
import { Tooltip } from 'react-tooltip';
import {
  format,
  subYears,
  eachDayOfInterval,
  getWeek,
  getMonth,
  isSameDay,
  startOfWeek
} from 'date-fns';
import { Clock2 } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

const getSquareColor = (count: number, theme: string) => {
  if (count === 0) return theme === 'dark' ? 'bg-white/5' : 'bg-gray-200';
  if (count < 5) return theme === 'dark' ? 'bg-brand-cyan/30' : 'bg-green-100';
  if (count < 10) return theme === 'dark' ? 'bg-brand-cyan/50' : 'bg-green-300';
  if (count < 15) return theme === 'dark' ? 'bg-brand-cyan/70' : 'bg-green-500';
  return theme === 'dark' ? 'bg-brand-cyan' : 'bg-green-700';
};

const ActivityHeatmap = () => {
  const { theme } = useTheme();
  const [activityData, setActivityData] = useState<any[]>([]);
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      try {
        // This component is currently fetching *authenticated* user data
        const res = await axios.get(`/api/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched activity:', res.data);
        setActivityData(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Failed to load activity data', error);
        setActivityData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [token]); // Added token dependency

  const today = new Date();
  const oneYearAgo = subYears(today, 1);

  // ✅ Normalize data for quick lookup
  const normalizedData = activityData.reduce((acc, item) => {
    // Ensure item.date is formatted correctly
    const dateStr = item.date ? format(new Date(item.date), 'yyyy-MM-dd') : null;
    if (dateStr) {
      acc[dateStr] = item.num_of_activities;
    }
    return acc;
  }, {} as Record<string, number>);

  // ✅ Dynamically include latest activity date
  const latestActivityDate = activityData.length
    ? new Date(activityData[activityData.length - 1].date)
    : today;

  // startOfWeek with weekStartsOn: 0 (Sunday) is crucial for layout alignment
  const allDays = eachDayOfInterval({
    start: startOfWeek(oneYearAgo, { weekStartsOn: 0 }),
    end: latestActivityDate > today ? latestActivityDate : today,
  });

  // ✅ Build weeks
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  let lastWeekIdentifier = `${getWeek(allDays[0], { weekStartsOn: 0 })}-${allDays[0].getFullYear()}`;

  allDays.forEach((day) => {
    const weekIdentifier = `${getWeek(day, { weekStartsOn: 0 })}-${day.getFullYear()}`;
    if (weekIdentifier !== lastWeekIdentifier) {
      weeks.push([...currentWeek]);
      currentWeek = [];
      lastWeekIdentifier = weekIdentifier;
    }
    currentWeek.push(day);
  });
  weeks.push(currentWeek);

  // ✅ Month labels
  const monthLabels: { name: string; index: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0];
    if (firstDay && getMonth(firstDay) !== lastMonth) {
      monthLabels.push({ name: format(firstDay, 'MMM'), index: weekIndex });
      lastMonth = getMonth(firstDay);
    }
  });

  // Helper function to render a day label span for vertical alignment
  const DayLabelSpan = ({ text, row, visible }: { text: string; row: number; visible: boolean }) => (
    <span
      className={`h-3.5 text-xs text-gray-500 font-medium ${visible ? 'opacity-100' : 'opacity-0'
        }`}
      style={{
        // Rows are 0-indexed (Sunday = 0, Monday = 1, etc.).
        // Grid CSS would be better, but using Tailwind classes for basic layout:
        lineHeight: '1.25rem' // Adjust this if needed for better alignment
      }}
    >
      {visible ? text : '...'}
    </span>
  );


  return (
    // ✅ MODIFICATION 1: Apply glassmorphism styling
    <div className={`p-6 rounded-3xl shadow-xl border font-sans ${theme === 'dark' ? 'glass border-white/10' : 'bg-white/60 backdrop-blur-xl border-white/30'}`}>

      {/* ✅ MODIFICATION 2: Updated Header */}
      <h3 className={`text-xl font-bold mb-4 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        <Clock2 className={`w-6 h-6 mr-2 ${theme === 'dark' ? 'text-brand-cyan' : 'text-indigo-500'}`} />
        Activity Heatmap
      </h3>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading activity data...</div>
      ) : (
        <div className="flex flex-col">
          {/* Month labels */}
          <div className="flex pl-8 ml-2 text-xs text-gray-500 mb-2 whitespace-nowrap">
            {monthLabels.map((month, index) => {
              const prevMonth = index > 0 ? monthLabels[index - 1] : { index: -1 };
              const weeksToSkip = month.index - (prevMonth.index + 1);
              return (
                <React.Fragment key={month.name + month.index}>
                  {Array.from({ length: weeksToSkip }).map((_, i) => (
                    <span key={`spacer-${index}-${i}`} className="w-4"></span>
                  ))}
                  <span className={`font-semibold w-fit ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{month.name}</span>
                </React.Fragment>
              );
            })}
          </div>

          {/* Heatmap Grid */}
          <div className="flex overflow-x-auto scrollbar-thin pb-4 mt-1">

            {/* ✅ MODIFICATION 3: Day Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col text-xs text-gray-500 mr-2 whitespace-nowrap">
              {/* Day rows (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat) */}
              <DayLabelSpan text="" row={0} visible={false} /> {/* Sun (hidden) */}
              <DayLabelSpan text="Mon" row={1} visible={true} />
              <DayLabelSpan text="" row={2} visible={false} /> {/* Tue (hidden) */}
              <DayLabelSpan text="Wed" row={3} visible={true} />
              <DayLabelSpan text="" row={4} visible={false} /> {/* Thu (hidden) */}
              <DayLabelSpan text="Fri" row={5} visible={true} />
              <DayLabelSpan text="" row={6} visible={false} /> {/* Sat (hidden) */}
            </div>

            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-1">
                  {week.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const count = normalizedData[dateStr] || 0;
                    const isToday = isSameDay(day, today);
                    if (day > today && day > latestActivityDate) return null;

                    return (
                      <div
                        key={dateStr}
                        className={`w-3 h-3 rounded-sm ${getSquareColor(count, theme)} ${isToday ? `border ring-1 ring-offset-1 ${theme === 'dark' ? 'border-white ring-white ring-offset-space-950' : 'border-gray-900 ring-gray-900'}` : ''
                          }`}
                        data-tooltip-id="heatmap-tooltip"
                        data-tooltip-content={
                          count > 0
                            ? `${count} activit${count === 1 ? 'y' : 'ies'} on ${format(
                              day,
                              'MMM d, yyyy'
                            )}`
                            : `No activity on ${format(day, 'MMM d, yyyy')}`
                        }
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className={`flex justify-between items-center mt-4 text-xs pt-4 border-t ${theme === 'dark' ? 'text-gray-400 border-white/10' : 'text-gray-500 border-white/30'}`}>
        <span>Less</span>
        <div className="flex space-x-1">
          <div className={`w-3 h-3 rounded-sm ${getSquareColor(0, theme)}`}></div>
          <div className={`w-3 h-3 rounded-sm ${getSquareColor(1, theme)}`}></div>
          <div className={`w-3 h-3 rounded-sm ${getSquareColor(6, theme)}`}></div>
          <div className={`w-3 h-3 rounded-sm ${getSquareColor(11, theme)}`}></div>
          <div className={`w-3 h-3 rounded-sm ${getSquareColor(20, theme)}`}></div>
        </div>
        <span>More</span>
      </div>

      <Tooltip
        id="heatmap-tooltip"
        className="bg-gray-800 text-white text-sm rounded-md px-2 py-1 z-50 opacity-100"
      />
    </div>
  );
};

export default ActivityHeatmap;