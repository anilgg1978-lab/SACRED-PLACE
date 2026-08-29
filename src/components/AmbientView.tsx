import React, { useState, useEffect } from 'react';
import { ColorTheme, ViewMode } from '../types';
import { COLOR_THEMES, DAILY_PROMPTS } from '../data/presets';
import { Wind, Clock, Sparkles, Play, Volume2, ArrowRight } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface AmbientViewProps {
  activeTheme: ColorTheme;
  onThemeSelect: (theme: ColorTheme) => void;
  onViewChange: (view: ViewMode) => void;
  onToggleZen: () => void;
}

export const AmbientView: React.FC<AmbientViewProps> = ({
  activeTheme,
  onThemeSelect,
  onViewChange,
  onToggleZen,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [greeting, setGreeting] = useState('');
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
      );

      const hour = now.getHours();
      if (hour >= 5 && hour < 12) setGreeting('Morning Stillness');
      else if (hour >= 12 && hour < 17) setGreeting('Afternoon Flow');
      else if (hour >= 17 && hour < 21) setGreeting('Evening Serenity');
      else setGreeting('Night Sanctuary');
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const isDark = activeTheme.isDark;
  const currentPrompt = DAILY_PROMPTS[activePromptIndex % DAILY_PROMPTS.length];

  const handleStartCalmBell = () => {
    audioEngine.playSingingBowlChime(432, 4.0);
  };

  return (
    <div
      id="ambient-sanctuary-view"
      className="relative z-10 w-full h-full flex flex-col justify-between items-center px-4 sm:px-8 pt-20 sm:pt-24 pb-20 sm:pb-12 max-w-5xl mx-auto overflow-y-auto"
    >
      {/* Top Center: Digital Clock & Serene Greeting */}
      <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2 mt-2 sm:mt-6 animate-fade-in">
        <span
          className="text-xs uppercase tracking-[0.28em] font-medium opacity-70"
          style={{ color: activeTheme.textHex }}
        >
          {dateStr} • {greeting}
        </span>
        <h1
          className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight font-serif-luxury transition-all duration-500"
          style={{ color: activeTheme.textHex }}
        >
          {timeStr || '12:00'}
        </h1>
        <p
          className="text-xs sm:text-sm font-light max-w-md opacity-80 italic transition-all duration-300"
          style={{ color: activeTheme.textHex }}
        >
          "{currentPrompt.quote}" — {currentPrompt.author}
        </p>
      </div>

      {/* Center Interactive Mindful Focus Orb */}
      <div className="my-6 sm:my-8 flex flex-col items-center justify-center relative">
        <div
          onClick={handleStartCalmBell}
          className="group relative cursor-pointer flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full transition-transform duration-700 hover:scale-105"
        >
          {/* Animated Glow Rings */}
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-25"
            style={{
              background: `radial-gradient(circle, ${activeTheme.accentHex}66 0%, transparent 75%)`,
              animationDuration: '4s',
            }}
          />
          <div
            className="absolute -inset-3 rounded-full opacity-40 blur-md transition-opacity duration-500 group-hover:opacity-80"
            style={{
              background: `radial-gradient(circle, ${activeTheme.accentHex} 0%, transparent 70%)`,
            }}
          />
          <div
            className="relative z-10 w-full h-full rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-500"
            style={{
              background: isDark
                ? 'rgba(35, 30, 28, 0.7)'
                : 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(20px)',
              border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255, 255, 255, 0.9)'}`,
            }}
          >
            <Sparkles
              className="w-6 h-6 mb-1.5 transition-transform duration-500 group-hover:rotate-45"
              style={{ color: activeTheme.accentHex }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-widest font-serif-luxury"
              style={{ color: activeTheme.textHex }}
            >
              Sound Bell
            </span>
            <span
              className="text-[10px] opacity-60 mt-0.5 tracking-wider uppercase font-medium"
              style={{ color: activeTheme.textHex }}
            >
              432 Hz Sing
            </span>
          </div>
        </div>

        {/* Ethereal Prompt / Intention Card */}
        <div
          id="sanctuary-prompt-card"
          className="mt-6 px-5 py-3.5 rounded-2xl max-w-md w-full text-center transition-all duration-500 shadow-sm"
          style={{
            background: isDark ? 'rgba(28, 24, 22, 0.65)' : 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
          }}
        >
          <p
            className="text-xs sm:text-sm font-medium leading-relaxed"
            style={{ color: activeTheme.textHex }}
          >
            {currentPrompt.prompt}
          </p>
          <div className="mt-2.5 flex items-center justify-center gap-3">
            <button
              id="btn-next-prompt"
              onClick={() => setActivePromptIndex((prev) => prev + 1)}
              className="text-[11px] uppercase tracking-wider font-semibold opacity-70 hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1"
              style={{ color: activeTheme.accentHex }}
            >
              <span>Next reflection</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Grid & Theme Swatches */}
      <div className="w-full flex flex-col items-center gap-4">
        {/* Quick Sanctuary Launchers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
          {/* Quick Breathwork */}
          <button
            id="card-quick-breath"
            onClick={() => onViewChange('breath')}
            className="group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer text-left shadow-sm"
            style={{
              background: isDark ? 'rgba(28, 25, 23, 0.6)' : 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors group-hover:scale-105"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                  color: activeTheme.accentHex,
                }}
              >
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <h2
                  className="text-xs font-semibold tracking-wide"
                  style={{ color: activeTheme.textHex }}
                >
                  Resonance Breath
                </h2>
                <span
                  className="text-[10px] opacity-65 font-medium"
                  style={{ color: activeTheme.textHex }}
                >
                  5.5s Heart Calm
                </span>
              </div>
            </div>
            <Play className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: activeTheme.textHex }} />
          </button>

          {/* Quick Focus Timer */}
          <button
            id="card-quick-timer"
            onClick={() => onViewChange('timer')}
            className="group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer text-left shadow-sm"
            style={{
              background: isDark ? 'rgba(28, 25, 23, 0.6)' : 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors group-hover:scale-105"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                  color: activeTheme.accentHex,
                }}
              >
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2
                  className="text-xs font-semibold tracking-wide"
                  style={{ color: activeTheme.textHex }}
                >
                  Sanctuary Focus
                </h2>
                <span
                  className="text-[10px] opacity-65 font-medium"
                  style={{ color: activeTheme.textHex }}
                >
                  25m Deep Flow
                </span>
              </div>
            </div>
            <Play className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: activeTheme.textHex }} />
          </button>

          {/* Quick Soundscapes */}
          <button
            id="card-quick-soundscapes"
            onClick={() => onViewChange('soundscapes')}
            className="group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer text-left shadow-sm"
            style={{
              background: isDark ? 'rgba(28, 25, 23, 0.6)' : 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors group-hover:scale-105"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                  color: activeTheme.accentHex,
                }}
              >
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h2
                  className="text-xs font-semibold tracking-wide"
                  style={{ color: activeTheme.textHex }}
                >
                  Solfeggio Sound
                </h2>
                <span
                  className="text-[10px] opacity-65 font-medium"
                  style={{ color: activeTheme.textHex }}
                >
                  528Hz & Nature
                </span>
              </div>
            </div>
            <Play className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: activeTheme.textHex }} />
          </button>
        </div>

        {/* Quick Palette Pills */}
        <div className="flex items-center gap-2 pt-1">
          <span
            className="text-[10px] uppercase tracking-wider font-semibold opacity-60 mr-1 hidden sm:inline"
            style={{ color: activeTheme.textHex }}
          >
            Ethereal Mood:
          </span>
          <div className="flex items-center gap-1.5">
            {COLOR_THEMES.map((theme) => {
              const isSelected = activeTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  id={`theme-pill-${theme.id}`}
                  onClick={() => onThemeSelect(theme)}
                  title={theme.name}
                  className={`w-6 h-6 rounded-full transition-all duration-300 cursor-pointer ${
                    isSelected ? 'ring-2 ring-offset-2 scale-110 shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: theme.accentHex,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Spacebar Zen Hint */}
        <div
          onClick={onToggleZen}
          className="text-[10px] tracking-widest uppercase font-medium opacity-50 hover:opacity-90 transition-opacity cursor-pointer pb-2"
          style={{ color: activeTheme.textHex }}
        >
          Click here or press [Space] to enter Zen Mode
        </div>
      </div>
    </div>
  );
};
