'use client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface TimeData {
  totalTime: number; // in seconds
  today: {
    date: string;
    time: number; // in seconds
  };
}

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
};

export default function TimeTrackerWidget() {
  const [timeData, setTimeData] = useState<TimeData | null>(null);

  useEffect(() => {
    // This effect runs only on the client
    const loadAndTrackTime = () => {
      let initialData: TimeData;
      try {
        const savedData = localStorage.getItem('timeTrackerData');
        const currentDate = new Date().toISOString().split('T')[0];
        
        if (savedData) {
          initialData = JSON.parse(savedData);
          // Reset today's time if the date has changed
          if (initialData.today.date !== currentDate) {
            initialData.today = { date: currentDate, time: 0 };
          }
        } else {
          initialData = {
            totalTime: 0,
            today: { date: currentDate, time: 0 },
          };
        }
      } catch (error) {
        console.error("Failed to parse time tracker data from localStorage", error);
        const currentDate = new Date().toISOString().split('T')[0];
        initialData = {
          totalTime: 0,
          today: { date: currentDate, time: 0 },
        };
      }
      setTimeData(initialData);

      const interval = setInterval(() => {
        setTimeData(prevData => {
          if (!prevData) return prevData;
          const newData = {
            ...prevData,
            totalTime: prevData.totalTime + 1,
            today: {
              ...prevData.today,
              time: prevData.today.time + 1,
            },
          };
          try {
            localStorage.setItem('timeTrackerData', JSON.stringify(newData));
          } catch (storageError) {
            console.error("Failed to save time tracker data to localStorage", storageError);
          }
          return newData;
        });
      }, 1000);

      return () => clearInterval(interval);
    };

    const cleanup = loadAndTrackTime();
    return cleanup;
  }, []);

  if (!timeData) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="ml-2">Loading session data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center h-full text-center gap-8" data-onboarding-id="playtime-card">
        <div>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">Time Today</p>
            <p className="text-5xl font-bold text-glow font-mono tracking-wider">{formatTime(timeData.today.time)}</p>
        </div>
         <div>
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">Total Time</p>
            <p className="text-5xl font-bold text-glow font-mono tracking-wider">{formatTime(timeData.totalTime)}</p>
        </div>
    </div>
  );
}
