
'use client';

import { useState, useEffect, useRef } from 'react';

export default function ClockWidget() {
  const [time, setTime] = useState<Date | null>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const updateClock = () => {
      setTime(new Date());
      animationFrameId.current = requestAnimationFrame(updateClock);
    };

    // Start the animation frame loop
    animationFrameId.current = requestAnimationFrame(updateClock);

    // Clean up the animation frame when the component unmounts
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const seconds = time ? time.getSeconds() : 0;
  const minutes = time ? time.getMinutes() : 0;
  const hours = time ? time.getHours() : 0;

  const secondHandRotation = seconds * 6;
  const minuteHandRotation = minutes * 6 + seconds / 10;
  const hourHandRotation = hours * 30 + minutes / 2;

  // On the server, and during the initial client render before the effect runs,
  // this loading state will be shown, preventing the mismatch.
  if (time === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-5xl font-code font-bold text-glow tracking-widest">
          --:--:-- --
        </p>
        <p className="text-sm text-muted-foreground mt-2">Loading Chronometer...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-4">
        <div className="relative w-48 h-48 border-4 border-primary rounded-full flex items-center justify-center bg-background/50 neon-glow-primary">
            {/* Clock Face Markings */}
            {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${i * 30}deg)`}}>
                    <div className="absolute top-1 left-1/2 -ml-[1px] h-2 w-[2px] bg-primary/50"></div>
                </div>
            ))}
            {/* Hour Hand */}
            <div className="absolute w-1 h-16 bg-primary rounded-t-full origin-bottom" style={{ transform: `rotate(${hourHandRotation}deg)`, top: '2rem' }}></div>
             {/* Minute Hand */}
            <div className="absolute w-0.5 h-20 bg-primary rounded-t-full origin-bottom" style={{ transform: `rotate(${minuteHandRotation}deg)`, top: '1rem' }}></div>
             {/* Second Hand */}
            <div className="absolute w-0.5 h-20 bg-destructive rounded-t-full origin-bottom" style={{ transform: `rotate(${secondHandRotation}deg)`, top: '1rem' }}></div>
            {/* Center dot */}
            <div className="absolute w-3 h-3 bg-foreground rounded-full border-2 border-background"></div>
        </div>
        <p className="text-lg text-muted-foreground mt-2">{formatDate(time)}</p>
    </div>
  );
}
