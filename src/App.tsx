import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode, ColorTheme, ShaderSettings } from './types';
import { COLOR_THEMES } from './data/presets';
import { EtherealShaderCanvas } from './components/EtherealShaderCanvas';
import { HeaderNav } from './components/HeaderNav';
import { MobileNav } from './components/MobileNav';
import { AmbientView } from './components/AmbientView';
import { BreathingScreen } from './components/BreathingScreen';
import { FocusTimerScreen } from './components/FocusTimerScreen';
import { SoundscapeScreen } from './components/SoundscapeScreen';
import { JournalScreen } from './components/JournalScreen';
import { ShaderCustomizer } from './components/ShaderCustomizer';
import { audioEngine } from './utils/audioEngine';
import { Sparkles } from 'lucide-react';

const DEFAULT_SHADER_SETTINGS: ShaderSettings = {
  speed: 1.0,
  waveScale: 1.0,
  glowIntensity: 1.0,
  mouseInfluence: 1.0,
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('ambient');
  const [activeTheme, setActiveTheme] = useState<ColorTheme>(() => {
    try {
      const savedThemeId = localStorage.getItem('ethereal_theme_id');
      const found = COLOR_THEMES.find((t) => t.id === savedThemeId);
      return found || COLOR_THEMES[0];
    } catch {
      return COLOR_THEMES[0];
    }
  });

  const [shaderSettings, setShaderSettings] = useState<ShaderSettings>(() => {
    try {
      const saved = localStorage.getItem('ethereal_shader_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SHADER_SETTINGS;
    } catch {
      return DEFAULT_SHADER_SETTINGS;
    }
  });

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showZenHint, setShowZenHint] = useState(false);

  const handleThemeSelect = useCallback((theme: ColorTheme) => {
    setActiveTheme(theme);
    try {
      localStorage.setItem('ethereal_theme_id', theme.id);
    } catch {
      // ignore
    }
  }, []);

  const handleSettingsChange = useCallback((settings: ShaderSettings) => {
    setShaderSettings(settings);
    try {
      localStorage.setItem('ethereal_shader_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, []);

  const handleResetSettings = useCallback(() => {
    setShaderSettings(DEFAULT_SHADER_SETTINGS);
    try {
      localStorage.setItem('ethereal_shader_settings', JSON.stringify(DEFAULT_SHADER_SETTINGS));
    } catch {
      // ignore
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      audioEngine.toggleMute(next);
      return next;
    });
  }, []);

  const toggleZenMode = useCallback(() => {
    setIsZenMode((prev) => {
      const next = !prev;
      if (next) {
        setShowZenHint(true);
        setTimeout(() => setShowZenHint(false), 3000);
      }
      return next;
    });
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when focused in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        toggleZenMode();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === '1') {
        setCurrentView('ambient');
      } else if (e.key === '2') {
        setCurrentView('breath');
      } else if (e.key === '3') {
        setCurrentView('timer');
      } else if (e.key === '4') {
        setCurrentView('soundscapes');
      } else if (e.key === '5') {
        setCurrentView('journal');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleZenMode, toggleFullscreen, toggleMute]);

  return (
    <main
      id="ethereal-app-root"
      className="relative w-screen h-screen overflow-hidden select-none"
      style={{
        backgroundColor: activeTheme.bgHex,
        color: activeTheme.textHex,
      }}
    >
      {/* Background WebGL Shader Canvas matching the provided Stitch Shader */}
      <EtherealShaderCanvas
        theme={activeTheme}
        settings={shaderSettings}
        onCanvasClick={() => {
          if (isZenMode) setIsZenMode(false);
        }}
      />

      {/* Header Navigation */}
      <HeaderNav
        currentView={currentView}
        onViewChange={setCurrentView}
        activeTheme={activeTheme}
        isCustomizerOpen={isCustomizerOpen}
        onToggleCustomizer={() => setIsCustomizerOpen((prev) => !prev)}
        isZenMode={isZenMode}
        onToggleZenMode={toggleZenMode}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Main View Container */}
      <div
        id="view-viewport"
        className={`relative z-10 w-full h-full transition-all duration-700 ${
          isZenMode ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {currentView === 'ambient' && (
          <AmbientView
            activeTheme={activeTheme}
            onThemeSelect={handleThemeSelect}
            onViewChange={setCurrentView}
            onToggleZen={toggleZenMode}
          />
        )}

        {currentView === 'breath' && <BreathingScreen activeTheme={activeTheme} />}

        {currentView === 'timer' && <FocusTimerScreen activeTheme={activeTheme} />}

        {currentView === 'soundscapes' && <SoundscapeScreen activeTheme={activeTheme} />}

        {currentView === 'journal' && <JournalScreen activeTheme={activeTheme} />}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentView={currentView}
        onViewChange={setCurrentView}
        activeTheme={activeTheme}
        isZenMode={isZenMode}
      />

      {/* Atmosphere Customizer Drawer */}
      <ShaderCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        activeTheme={activeTheme}
        onThemeSelect={handleThemeSelect}
        settings={shaderSettings}
        onSettingsChange={handleSettingsChange}
        onResetSettings={handleResetSettings}
      />

      {/* Zen Mode Quick Notification Toast */}
      {showZenHint && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full shadow-lg text-xs font-medium uppercase tracking-wider animate-bounce pointer-events-none"
          style={{
            background: activeTheme.isDark ? 'rgba(28, 25, 23, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            color: activeTheme.textHex,
            border: `1px solid ${activeTheme.accentHex}66`,
          }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: activeTheme.accentHex }} />
            <span>Zen Mode Active • Press [Space] or Click to Exit</span>
          </div>
        </div>
      )}
    </main>
  );
}
