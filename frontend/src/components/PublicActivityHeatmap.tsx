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

// Prop interface for the component
interface ActivityHeatmapProps {
  userId: string; // The ID of the user whose activity to display
}

const getSquareColor = (count: number) => {
  if (count === 0) return 'bg-gray-200';
  if (count < 5) return 'bg-green-100';
  if (count < 10) return 'bg-green-300';
  if (count < 15) return 'bg-green-500';
  return 'bg-green-700';
};

// Renamed component for clarity as requested previously
const PublicActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ userId }) => {
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
        setLoading(false);
        return;
    }
    
    const fetchActivity = async () => {
      setLoading(true);
      try {
        // NOTE: Keeping your API endpoint as provided: /api/activity/public/:userId
        const res = await axios.get(`/api/activity/public/${userId}`);
        
        console.log(`Fetched activity for user ${userId}:`, res.data);
        setActivityData(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error(`Failed to load activity data for user ${userId}`, error);
        setActivityData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [userId]); 

  const today = new Date();
  const oneYearAgo = subYears(today, 1);

  // Normalize data for quick lookup
  const normalizedData = activityData.reduce((acc, item) => {
    const dateStr = item.date ? format(new Date(item.date), 'yyyy-MM-dd') : null;
    if (dateStr) {
      acc[dateStr] = item.num_of_activities;
    }
    return acc;
  }, {} as Record<string, number>);

  // Dynamically include latest activity date
  const latestActivityDate = activityData.length
    ? new Date(activityData[activityData.length - 1].date)
    : today;

  // startOfWeek with weekStartsOn: 0 (Sunday) is used
  const allDays = eachDayOfInterval({
    start: startOfWeek(oneYearAgo, { weekStartsOn: 0 }),
    end: latestActivityDate > today ? latestActivityDate : today,
  });

  // Build weeks
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

  // Month labels
  const monthLabels: { name: string; index: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0];
    if (firstDay && getMonth(firstDay) !== lastMonth) {
      monthLabels.push({ name: format(firstDay, 'MMM'), index: weekIndex });
      lastMonth = getMonth(firstDay);
    }
  });

  // Helper component for aligning day labels to grid rows
  const DayLabel = ({ text, visible }: { text: string; visible: boolean }) => (
    // w-8 is used here to match the grid cell width (w-3) + gap (gap-1) + mr-2 (for container)
    // The h-3.5 and my-0.5 help align the text to the grid row height.
    <span className={`h-3.5 text-xs text-gray-500 my-0.5 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {visible ? text : '\u00A0'} {/* Use non-breaking space for hidden labels */}
    </span>
  );

  return (
    // Card styling to match the profile screenshot
    <div className="p-6 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 font-sans">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        {/* Removed Clock2 icon to match the plain text header in the screenshot */}
        Activity Heatmap
      </h3>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading activity data...</div>
      ) : activityData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No activity recorded for this user in the last one year.</div>
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
                  <span className="font-semibold text-gray-600 w-fit">{month.name}</span>
                </React.Fragment>
              );
            })}
          </div>

          {/* Heatmap Grid */}
          <div className="flex overflow-x-auto scrollbar-hide mt-1">
            {/* MODIFICATION: Day of week labels (Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6) */}
            <div className="flex flex-col text-xs text-gray-500 mr-2 whitespace-nowrap">
              <DayLabel text="Sun" visible={false} /> {/* Row 0: Hidden */}
              <DayLabel text="Mon" visible={true} />  {/* Row 1: Visible */}
              <DayLabel text="Tue" visible={false} /> {/* Row 2: Hidden */}
              <DayLabel text="Wed" visible={true} />  {/* Row 3: Visible */}
              <DayLabel text="Thu" visible={false} /> {/* Row 4: Hidden */}
              <DayLabel text="Fri" visible={true} />  {/* Row 5: Visible */}
              <DayLabel text="Sat" visible={false} /> {/* Row 6: Hidden */}
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
                        className={`w-3 h-3 rounded-sm ${getSquareColor(count)} ${
                          isToday ? 'border border-gray-900 ring-1 ring-offset-1 ring-gray-900' : ''
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

      {/* Legend - Moved up slightly and removed border to match screenshot */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-sm bg-gray-200"></div>
          <div className="w-3 h-3 rounded-sm bg-green-100"></div>
          <div className="w-3 h-3 rounded-sm bg-green-300"></div>
          <div className="w-3 h-3 rounded-sm bg-green-500"></div>
          <div className="w-3 h-3 rounded-sm bg-green-700"></div>
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

export default PublicActivityHeatmap;