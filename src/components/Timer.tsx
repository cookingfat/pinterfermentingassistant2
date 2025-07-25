import React, { useState, useEffect } from 'react';

const Timer = ({ expiryTimestamp, onExpire, title }) => {
  const calculateTimeLeft = () => {
    const difference = +expiryTimestamp - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (Object.values(newTimeLeft).every(val => val === 0) && +expiryTimestamp - +new Date() < 1000) {
        onExpire();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }); 

  const timerComponents = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  return (
    <div className="text-center bg-slate-900/50 rounded-xl p-4 border border-slate-700">
      <p className="text-lg font-semibold text-slate-300 mb-3">{title || 'Ready to drink in...'}</p>
      <div className="flex justify-center space-x-2 md:space-x-3">
        {timerComponents.map(part => (
          <div key={part.label} className="text-center p-2 bg-slate-900/70 rounded-lg w-16 flex-shrink-0">
            <span className="text-4xl font-bold text-cyan-400">
              {String(part.value).padStart(2, '0')}
            </span>
            <span className="block text-sm font-semibold text-slate-400 uppercase tracking-wider">{part.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timer;