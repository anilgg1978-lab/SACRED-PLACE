import React from 'react';
import { ViewMode, ColorTheme } from '../types';
import {
  Wind,
  Clock,
  Music,
  BookOpen,
  Sparkles,
  Sliders,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react';

interface HeaderNavProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  activeTheme: ColorTheme;
  isCustomizerOpen: boolean;
  onToggleCustomizer: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentView,
  onViewChange,
  activeTheme,
  isCustomizerOpen,
  onToggleCustomizer,
  isZenMode,
  onToggleZenMode,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const isDark = activeTheme.isDark;

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'ambient', label: 'Sanctuary', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'breath', label: 'Breathwork', icon: <Wind className="w-4 h-4" /> },
    { id: 'timer', label: 'Focus Timer', icon: <Clock className="w-4 h-4" /> },
    { id: 'soundscapes', label: 'Soundscapes', icon: <Music className="w-4 h-4" /> },
    { id: 'journal', label: 'Wisdom & Notes', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header
      id="app-header-nav"
      className={`fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all duration-700 ${
        isZenMode ? 'opacity-0 -translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Brand Logo & Name */}
      <button
        id="btn-brand-home"
        onClick={() => onViewChange('ambient')}
        className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105 shadow-sm"
          style={{
            background: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          <div
            className="w-3.5 h-3.5 rounded-full transition-all duration-500 group-hover:rotate-45"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${activeTheme.accentHex}, ${activeTheme.accentHex}88)`,
            }}
          />
        </div>
        <div className="flex flex-col">
          <span
            className="font-serif-luxury text-sm tracking-[0.2em] uppercase font-semibold"
            style={{ color: activeTheme.textHex }}
          >
            Ethereal
          </span>
          <span
            className="text-[10px] tracking-widest uppercase opacity-60 font-medium"
            style={{ color: activeTheme.textHex }}
          >
            Sanctuary
          </span>
        </div>
      </button>

      {/* Main Navigation Segmented Pills */}
      <nav
        id="main-nav-pill-group"
        className="hidden md:flex items-center gap-1 p-1 rounded-full shadow-sm transition-all duration-300"
        style={{
          background: isDark ? 'rgba(28, 25, 23, 0.6)' : 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
        }}
      >
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'shadow-sm scale-[1.02]'
                  : 'opacity-70 hover:opacity-100 hover:scale-[1.01]'
              }`}
              style={{
                background: isActive
                  ? isDark
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.9)'
                  : 'transparent',
                color: activeTheme.textHex,
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Action Controls (Sound, Atmosphere, Zen, Fullscreen) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Atmosphere / Shader Settings Toggle */}
        <button
          id="btn-toggle-customizer"
          onClick={onToggleCustomizer}
          title="Adjust Atmosphere & Shaders"
          className="p-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-105 shadow-sm"
          style={{
            background: isCustomizerOpen
              ? isDark
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(255, 255, 255, 0.9)'
              : isDark
              ? 'rgba(28, 25, 23, 0.6)'
              : 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
            color: activeTheme.textHex,
          }}
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Audio Mute / Unmute */}
        <button
          id="btn-toggle-mute"
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="p-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-105 shadow-sm"
          style={{
            background: isDark ? 'rgba(28, 25, 23, 0.6)' : 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
            color: activeTheme.textHex,
          }}
        >
          {isMuted ? <VolumeX className="w-4 h-4 opacity-60" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Zen Mode */}
        <button
          id="btn-toggle-zen"
          onClick={onToggleZenMode}
          title="Zen Immersion Mode (Hides UI)"
          className="p-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-105 shadow-sm"
          style={{
            background: isDark ? 'rgba(28, 25, 23, 0.6)' : 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
            color: activeTheme.textHex,
          }}
        >
          {isZenMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Fullscreen */}
        <button
          id="btn-toggle-fullscreen"
          onClick={onToggleFullscreen}
          title="Toggle Fullscreen"
          className="p-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-105 shadow-sm hidden sm:flex"
          style={{
            background: isDark ? 'rgba(28, 25, 23, 0.6)' : 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
            color: activeTheme.textHex,
          }}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
