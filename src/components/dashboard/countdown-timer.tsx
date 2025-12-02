
'use client';

import { useState, useEffect } from 'react';

const calculateTimeLeft = (expiryTimestamp: Date) => {
    const difference = +expiryTimestamp - +new Date();
    let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    };

    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    }
    
    return timeLeft;
}

interface CountdownTimerProps {
    expiryTimestamp: Date;
}

export default function CountdownTimer({ expiryTimestamp }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(expiryTimestamp));

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft(expiryTimestamp));
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
        if(value === 0 && interval !== 'seconds' && timeLeft.days === 0 && (interval !== 'minutes' || timeLeft.hours === 0)) return null;

        return (
            <span key={interval} className="tabular-nums">
                {String(value).padStart(2, '0')}{interval[0]}
            </span>
        );
    }).filter(Boolean);

    return (
        <div className="font-mono text-sm text-muted-foreground space-x-1">
            <span>Resets in:</span>
            {timerComponents.length ? timerComponents : <span>Time's up!</span>}
        </div>
    );
}
