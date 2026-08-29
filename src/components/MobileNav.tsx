import React from 'react';
import { ViewMode, ColorTheme } from '../types';
import { Wind, Clock, Music, BookOpen, Sparkles } from 'lucide-react';

interface MobileNavProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  activeTheme: ColorTheme;
  isZenMode: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onViewChange,
  activeTheme,
  isZenMode,
}) => {
  const isDark = activeTheme.isDark;

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'ambient', label: 'Sanctuary', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'breath', label: 'Breath', icon: <Wind className="w-4 h-4" /> },
    { id: 'timer', label: 'Timer', icon: <Clock className="w-4 h-4" /> },
    { id: 'soundscapes', label: 'Sound', icon: <Music className="w-4 h-4" /> },
    { id: 'journal', label: 'Wisdom', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <div
      id="mobile-bottom-nav"
      className={`md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-around p-1.5 rounded-full transition-all duration-500 shadow-lg ${
        isZenMode ? 'opacity-0 translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
      style={{
        background: isDark ? 'rgba(28, 25, 23, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0, 0, 0, 0.08)'}`,
      }}
    >
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            id={`mobile-nav-item-${item.id}`}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-[11px] font-medium transition-all duration-200 cursor-pointer ${
              isActive ? 'scale-105 font-semibold' : 'opacity-65 hover:opacity-100'
            }`}
            style={{
              background: isActive
                ? isDark
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(0, 0, 0, 0.06)'
                : 'transparent',
              color: activeTheme.textHex,
            }}
          >
            {item.icon}
            <span className="mt-0.5 text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
