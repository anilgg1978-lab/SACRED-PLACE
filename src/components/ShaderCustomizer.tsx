import React from 'react';
import { ColorTheme, ShaderSettings } from '../types';
import { COLOR_THEMES } from '../data/presets';
import { X, Sliders, RotateCcw, Sparkles } from 'lucide-react';

interface ShaderCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ColorTheme;
  onThemeSelect: (theme: ColorTheme) => void;
  settings: ShaderSettings;
  onSettingsChange: (settings: ShaderSettings) => void;
  onResetSettings: () => void;
}

export const ShaderCustomizer: React.FC<ShaderCustomizerProps> = ({
  isOpen,
  onClose,
  activeTheme,
  onThemeSelect,
  settings,
  onSettingsChange,
  onResetSettings,
}) => {
  if (!isOpen) return null;

  const isDark = activeTheme.isDark;

  return (
    <div
      id="atmosphere-customizer-drawer"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg p-6 rounded-3xl shadow-2xl transition-all duration-300 flex flex-col gap-5 overflow-y-auto max-h-[90vh]"
        style={{
          background: isDark ? 'rgba(24, 21, 20, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px)',
          border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0, 0, 0, 0.08)'}`,
          color: activeTheme.textHex,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5" style={{ color: activeTheme.accentHex }} />
            <div>
              <h2 className="text-base font-semibold font-serif-luxury tracking-wide">
                Atmosphere & Shader Tuning
              </h2>
              <p className="text-[11px] opacity-60">
                Sculpt the fluid dynamics, gold glow, and peaceful canvas palettes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Themes Grid */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold opacity-70">
            Ethereal Color Palette
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {COLOR_THEMES.map((th) => {
              const isSelected = activeTheme.id === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => onThemeSelect(th)}
                  className={`p-2.5 rounded-2xl flex flex-col gap-1.5 text-left transition-all duration-300 cursor-pointer shadow-sm ${
                    isSelected ? 'ring-2 scale-[1.02]' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    background: isDark ? 'rgba(40, 35, 33, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                    borderColor: isSelected ? activeTheme.accentHex : undefined,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-inner"
                      style={{ backgroundColor: th.accentHex }}
                    />
                    <span className="text-xs font-semibold tracking-tight">{th.name}</span>
                  </div>
                  <span className="text-[10px] opacity-60 line-clamp-1 leading-tight">
                    {th.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shader Sliders */}
        <div className="flex flex-col gap-4 pt-2 border-t border-black/5 dark:border-white/5">
          {/* Flow Speed */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium opacity-80">Flow Speed</span>
              <span className="font-semibold opacity-70">{settings.speed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.5"
              step="0.05"
              value={settings.speed}
              onChange={(e) =>
                onSettingsChange({ ...settings, speed: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-black/10 dark:bg-white/10"
            />
          </div>

          {/* Wave Scale / Frequency */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium opacity-80">Wave Scale & Complexity</span>
              <span className="font-semibold opacity-70">{settings.waveScale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.05"
              value={settings.waveScale}
              onChange={(e) =>
                onSettingsChange({ ...settings, waveScale: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-black/10 dark:bg-white/10"
            />
          </div>

          {/* Glow / Saffron Intensity */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium opacity-80">Saffron & Gold Radiant Glow</span>
              <span className="font-semibold opacity-70">{settings.glowIntensity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.05"
              value={settings.glowIntensity}
              onChange={(e) =>
                onSettingsChange({ ...settings, glowIntensity: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-black/10 dark:bg-white/10"
            />
          </div>

          {/* Mouse / Touch Ripple */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium opacity-80">Interactive Mouse Ripple</span>
              <span className="font-semibold opacity-70">{settings.mouseInfluence.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.05"
              value={settings.mouseInfluence}
              onChange={(e) =>
                onSettingsChange({ ...settings, mouseInfluence: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-black/10 dark:bg-white/10"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
          <button
            onClick={onResetSettings}
            className="flex items-center gap-1.5 text-xs opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-transform hover:scale-105 cursor-pointer shadow-sm"
            style={{
              backgroundColor: activeTheme.accentHex,
              color: isDark ? '#141211' : '#FFFFFF',
            }}
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
