import React, { useEffect, useState } from 'react';
import axios from '../api';
import { Tooltip } from 'react-tooltip';
import { format, subYears, eachDayOfInterval, getWeek, getMonth, isSameDay, startOfWeek } from 'date-fns';

const getSquareColor = (count: number) => {
  if (count === 0) return 'bg-gray-200';
  if (count < 5) return 'bg-blue-100';
  if (count < 10) return 'bg-blue-300';
  if (count < 15) return 'bg-blue-500';
  return 'bg-blue-700';
};

const ActivityHeatmap = () => {
  const [activityData, setActivityData] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await axios.get(`/api/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res)
        setActivityData(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load activity data", error);
        setActivityData([]);
      }
    };
    fetchActivity();
  }, []);

  const today = new Date();
  const oneYearAgo = subYears(today, 1);

  // Normalize data
  const normalizedData = activityData.reduce((acc, item) => {
    acc[item.date] = item.num_of_activities; // use correct field
    return acc;
  }, {} as Record<string, number>);

  const allDays = eachDayOfInterval({
    start: startOfWeek(oneYearAgo, { weekStartsOn: 0 }),
    end: today,
  });

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  let lastWeekNumber = getWeek(allDays[0], { weekStartsOn: 0 });

  allDays.forEach(day => {
    const weekNumber = getWeek(day, { weekStartsOn: 0 });
    if (weekNumber !== lastWeekNumber) {
      weeks.push([...currentWeek]);
      currentWeek = [];
      lastWeekNumber = weekNumber;
    }
    currentWeek.push(day);
  });
  weeks.push(currentWeek);

  const monthLabels: { name: string; index: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0];
    if (firstDay && getMonth(firstDay) !== lastMonth) {
      monthLabels.push({ name: format(firstDay, 'MMM'), index: weekIndex });
      lastMonth = getMonth(firstDay);
    }
  });

  return (
    <div className="p-4 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 font-sans">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Activity Heatmap</h3>
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
                <span className="font-semibold text-gray-600 w-fit">{month.name}</span>
              </React.Fragment>
            );
          })}
        </div>

        {/* Heatmap Grid */}
        <div className="flex overflow-x-auto scrollbar-hide mt-1">
          <div className="flex flex-col text-xs text-gray-500 mr-2 whitespace-nowrap mt-2">
            <span className="h-4"></span>
            <span className="my-0.5">Mon</span>
            <span className="my-0.5"></span>
            <span className="my-0.5">Wed</span>
            <span className="my-0.5"></span>
            <span className="my-0.5">Fri</span>
            <span className="my-0.5"></span>
          </div>

          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-1">
                {week.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const count = normalizedData[dateStr] || 0;
                  const isToday = isSameDay(day, today);

                  if (day > today) return null;

                  return (
                    <div
                      key={dateStr}
                      className={`w-3 h-3 rounded-sm ${getSquareColor(count)} ${isToday ? 'border border-blue-900' : ''}`}
                      data-tooltip-id="heatmap-tooltip"
                      data-tooltip-content={`${count} activities on ${format(day, 'MMM d, yyyy')}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-sm bg-gray-200"></div>
          <div className="w-3 h-3 rounded-sm bg-blue-100"></div>
          <div className="w-3 h-3 rounded-sm bg-blue-300"></div>
          <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
          <div className="w-3 h-3 rounded-sm bg-blue-700"></div>
        </div>
        <span>More</span>
      </div>
      <Tooltip id="heatmap-tooltip" className="bg-gray-800 text-white text-sm rounded-md px-2 py-1" />
    </div>
  );
};

export default ActivityHeatmap;