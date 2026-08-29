import React, { useState, useEffect, useRef } from 'react';
import { ColorTheme } from '../types';
import { Play, Pause, RotateCcw, Sparkles, CheckCircle, Bell } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface FocusTimerScreenProps {
  activeTheme: ColorTheme;
}

const PRESET_DURATIONS = [
  { label: '5m Reset', minutes: 5 },
  { label: '15m Calm', minutes: 15 },
  { label: '25m Focus', minutes: 25 },
  { label: '45m Flow', minutes: 45 },
  { label: '60m Deep', minutes: 60 },
];

export const FocusTimerScreen: React.FC<FocusTimerScreenProps> = ({ activeTheme }) => {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [intention, setIntention] = useState('');
  const [totalMinutesToday, setTotalMinutesToday] = useState(() => {
    try {
      const saved = localStorage.getItem('ethereal_today_minutes');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [sessionsToday, setSessionsToday] = useState(() => {
    try {
      const saved = localStorage.getItem('ethereal_today_sessions');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const totalDuration = selectedMinutes * 60;
  const progress = (totalDuration - timeLeft) / totalDuration;
  const isDark = activeTheme.isDark;
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Session Completed
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          audioEngine.playSingingBowlChime(528, 5.0);

          const newTotal = totalMinutesToday + selectedMinutes;
          const newSessions = sessionsToday + 1;
          setTotalMinutesToday(newTotal);
          setSessionsToday(newSessions);
          try {
            localStorage.setItem('ethereal_today_minutes', newTotal.toString());
            localStorage.setItem('ethereal_today_sessions', newSessions.toString());
          } catch {
            // ignore
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, selectedMinutes, totalMinutesToday, sessionsToday]);

  const handleSelectPreset = (mins: number) => {
    setSelectedMinutes(mins);
    setTimeLeft(mins * 60);
    setIsRunning(false);
  };

  const handleToggleTimer = () => {
    if (!isRunning) {
      if (timeLeft === 0) {
        setTimeLeft(selectedMinutes * 60);
      }
      setIsRunning(true);
      audioEngine.playSingingBowlChime(432, 3.0);
    } else {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedMinutes * 60);
  };

  const formatDisplay = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // SVG Circular progress math
  const size = 260;
  const strokeWidth = 5;
  const center = size / 2;
  const radius = center - strokeWidth * 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div
      id="focus-timer-container"
      className="relative z-10 w-full h-full flex flex-col justify-between items-center px-4 sm:px-8 pt-20 sm:pt-24 pb-20 sm:pb-12 max-w-4xl mx-auto overflow-y-auto"
    >
      {/* Top Presets Switcher */}
      <div className="w-full flex flex-col items-center">
        <div
          id="timer-presets-group"
          className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-full shadow-sm max-w-lg"
          style={{
            background: isDark ? 'rgba(28, 25, 23, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
          }}
        >
          {PRESET_DURATIONS.map((preset) => {
            const isSelected = selectedMinutes === preset.minutes;
            return (
              <button
                key={preset.minutes}
                id={`preset-btn-${preset.minutes}`}
                onClick={() => handleSelectPreset(preset.minutes)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                  isSelected ? 'shadow-sm font-semibold scale-105' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  background: isSelected
                    ? isDark
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.95)'
                    : 'transparent',
                  color: activeTheme.textHex,
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Circular Timer & Intention */}
      <div className="my-6 sm:my-8 flex flex-col items-center justify-center relative">
        <div className="relative flex items-center justify-center">
          {/* Circular SVG Progress */}
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Active Progress */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke={activeTheme.accentHex}
              strokeWidth={strokeWidth + 1}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: 'stroke-dashoffset 1s linear',
              }}
            />
          </svg>

          {/* Time Display Inside Circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className="text-xs uppercase tracking-[0.25em] font-semibold opacity-70 font-serif-luxury"
              style={{ color: activeTheme.textHex }}
            >
              {isRunning ? 'FLOWING' : timeLeft === 0 ? 'COMPLETED' : 'SANCTUARY'}
            </span>
            <h2
              className="text-5xl sm:text-6xl font-light font-serif-luxury tracking-tight mt-1"
              style={{ color: activeTheme.textHex }}
            >
              {formatDisplay(timeLeft)}
            </h2>
            <button
              onClick={() => audioEngine.playSingingBowlChime(432, 2.5)}
              title="Ring Meditation Bell"
              className="mt-2 flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ color: activeTheme.accentHex }}
            >
              <Bell className="w-3 h-3" />
              <span>Singing Bowl</span>
            </button>
          </div>
        </div>

        {/* Intention Input Field */}
        <div className="mt-5 w-full max-w-sm">
          <input
            id="input-timer-intention"
            type="text"
            placeholder="Focus intention: e.g., deep writing, clarity, serene calm..."
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            className="w-full text-center text-xs px-4 py-2 rounded-xl focus:outline-none transition-all shadow-sm"
            style={{
              background: isDark ? 'rgba(28, 25, 23, 0.6)' : 'rgba(255, 255, 255, 0.7)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
              color: activeTheme.textHex,
            }}
          />
        </div>
      </div>

      {/* Timer Controls & Summary Stats */}
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        <div
          className="flex items-center gap-4 px-6 py-2.5 rounded-full shadow-md"
          style={{
            background: isDark ? 'rgba(28, 25, 23, 0.75)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
          }}
        >
          {/* Main Play / Pause */}
          <button
            id="btn-timer-toggle"
            onClick={handleToggleTimer}
            className="flex items-center gap-2 px-6 py-2 rounded-full font-medium text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 shadow-sm cursor-pointer"
            style={{
              backgroundColor: activeTheme.accentHex,
              color: isDark ? '#141211' : '#FFFFFF',
            }}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          {/* Reset */}
          <button
            id="btn-timer-reset"
            onClick={handleReset}
            title="Reset Timer"
            className="p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ color: activeTheme.textHex }}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Daily Stats Summary */}
        <div
          className="flex items-center justify-between w-full px-6 py-2 rounded-xl text-xs font-medium"
          style={{
            background: isDark ? 'rgba(28, 25, 23, 0.5)' : 'rgba(255, 255, 255, 0.5)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
            color: activeTheme.textHex,
          }}
        >
          <div className="flex items-center gap-1.5 opacity-80">
            <Sparkles className="w-3.5 h-3.5" style={{ color: activeTheme.accentHex }} />
            <span>Today's Sanctuary: <strong className="font-semibold">{totalMinutesToday}m</strong></span>
          </div>
          <div className="flex items-center gap-1.5 opacity-80">
            <CheckCircle className="w-3.5 h-3.5" style={{ color: activeTheme.accentHex }} />
            <span>Sessions: <strong className="font-semibold">{sessionsToday}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
