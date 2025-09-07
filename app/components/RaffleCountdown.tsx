"use client";

import { useState, useEffect } from 'react';

interface RaffleCountdownProps {
  endDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isFinished: boolean;
}

export function RaffleCountdown({ endDate }: RaffleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: false
  });

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const distance = end - now;

      if (distance < 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isFinished: true
        };
      }

      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
        isFinished: false
      };
    };

    // Update immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  if (timeLeft.isFinished) {
    return (
      <div className="text-2xl font-bold text-red-600 animate-pulse">
        🏁 ¡Sorteo Finalizado!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Large countdown display */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-amber-100 rounded-lg p-2">
          <div className="text-2xl font-bold text-amber-800">
            {timeLeft.days.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-amber-600">
            Días
          </div>
        </div>
        <div className="bg-amber-100 rounded-lg p-2">
          <div className="text-2xl font-bold text-amber-800">
            {timeLeft.hours.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-amber-600">
            Horas
          </div>
        </div>
        <div className="bg-amber-100 rounded-lg p-2">
          <div className="text-2xl font-bold text-amber-800">
            {timeLeft.minutes.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-amber-600">
            Minutos
          </div>
        </div>
        <div className="bg-amber-100 rounded-lg p-2">
          <div className="text-2xl font-bold text-amber-800">
            {timeLeft.seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-amber-600">
            Segundos
          </div>
        </div>
      </div>

      {/* Compact format for mobile */}
      <div className="text-lg font-mono text-amber-700 md:hidden">
        {timeLeft.days}d {timeLeft.hours.toString().padStart(2, '0')}:
        {timeLeft.minutes.toString().padStart(2, '0')}:
        {timeLeft.seconds.toString().padStart(2, '0')}
      </div>

      {/* Progress bar showing time progression */}
      <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
        <div 
          className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
          style={{ 
            width: `${Math.max(0, Math.min(100, 
              ((new Date().getTime() - new Date(Date.now() - 1*24*60*60*1000).getTime()) / 
               (new Date(endDate).getTime() - new Date(Date.now() - 1*24*60*60*1000).getTime())) * 100
            ))}%` 
          }}
        />
      </div>

      {/* Urgency indicator */}
      {timeLeft.days === 0 && timeLeft.hours < 6 && (
        <div className="text-red-600 font-semibold animate-pulse">
          ⚠️ ¡Últimas horas para participar!
        </div>
      )}
      
      {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 30 && (
        <div className="text-red-700 font-bold animate-bounce">
          🚨 ¡Últimos minutos!
        </div>
      )}
    </div>
  );
}