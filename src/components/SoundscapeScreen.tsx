import React, { useState, useEffect } from 'react';
import { ColorTheme, SoundTrack } from '../types';
import { Play, Pause, Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface SoundscapeScreenProps {
  activeTheme: ColorTheme;
}

const INITIAL_TRACKS: SoundTrack[] = [
  {
    id: 'tone-432',
    name: '432 Hz Harmonic Alpha',
    category: 'frequency',
    frequency: 432,
    description: 'Natural mathematical resonance for calm alpha brainwaves and ease.',
    volume: 0.5,
    isPlaying: false,
  },
  {
    id: 'tone-528',
    name: '528 Hz Solfeggio Gold',
    category: 'frequency',
    frequency: 528,
    description: 'The ancient frequency of transformation, clarity, and inner warmth.',
    volume: 0.5,
    isPlaying: false,
  },
  {
    id: 'tone-396',
    name: '396 Hz Root Grounding',
    category: 'frequency',
    frequency: 396,
    description: 'Deep grounding vibration releasing mental tension and doubt.',
    volume: 0.45,
    isPlaying: false,
  },
  {
    id: 'binaural-alpha',
    name: '10 Hz Binaural Alpha Beat',
    category: 'frequency',
    frequency: 216,
    binauralDelta: 10,
    description: 'Stereo entrainment for focused flow state and mindful awareness.',
    volume: 0.4,
    isPlaying: false,
  },
  {
    id: 'nature-rain',
    name: 'Warm Gentle Rain',
    category: 'nature',
    description: 'Continuous soothing soft acoustic precipitation filter.',
    volume: 0.5,
    isPlaying: false,
  },
  {
    id: 'nature-ocean',
    name: 'Ocean Tidal Swell',
    category: 'nature',
    description: 'Rhythmic, slow rolling sea waves for deep relaxation.',
    volume: 0.5,
    isPlaying: false,
  },
  {
    id: 'nature-wind',
    name: 'Serene Sanctuary Wind',
    category: 'nature',
    description: 'Gentle mountain breeze whispering through tranquil space.',
    volume: 0.45,
    isPlaying: false,
  },
];

const PRESET_MIXES = [
  {
    name: 'Zen Temple',
    trackIds: ['tone-528', 'nature-wind'],
  },
  {
    name: 'Deep Flow',
    trackIds: ['tone-432', 'binaural-alpha', 'nature-rain'],
  },
  {
    name: 'Ocean Rest',
    trackIds: ['tone-396', 'nature-ocean'],
  },
  {
    name: 'Harmonic Light',
    trackIds: ['tone-432', 'tone-528'],
  },
];

export const SoundscapeScreen: React.FC<SoundscapeScreenProps> = ({ activeTheme }) => {
  const [tracks, setTracks] = useState<SoundTrack[]>(INITIAL_TRACKS);
  const [masterVol, setMasterVol] = useState(0.8);
  const isDark = activeTheme.isDark;

  const anyPlaying = tracks.some((t) => t.isPlaying);

  const toggleTrack = (id: string) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextPlaying = !t.isPlaying;
          if (nextPlaying) {
            startAudioNode(t);
          } else {
            audioEngine.stopTrack(t.id);
          }
          return { ...t, isPlaying: nextPlaying };
        }
        return t;
      })
    );
  };

  const startAudioNode = (t: SoundTrack) => {
    if (t.category === 'frequency') {
      if (t.binauralDelta) {
        audioEngine.startBinauralBeats(t.id, t.frequency || 216, t.binauralDelta, t.volume);
      } else {
        audioEngine.startTone(t.id, t.frequency || 432, t.volume);
      }
    } else if (t.category === 'nature') {
      if (t.id === 'nature-rain') audioEngine.startNatureSound(t.id, 'rain', t.volume);
      else if (t.id === 'nature-ocean') audioEngine.startNatureSound(t.id, 'ocean', t.volume);
      else if (t.id === 'nature-wind') audioEngine.startNatureSound(t.id, 'wind', t.volume);
    }
  };

  const updateVolume = (id: string, vol: number) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          if (t.isPlaying) audioEngine.setTrackVolume(t.id, vol);
          return { ...t, volume: vol };
        }
        return t;
      })
    );
  };

  const applyPreset = (trackIds: string[]) => {
    // Stop all active tracks first
    audioEngine.stopAll();

    setTracks((prev) =>
      prev.map((t) => {
        const willPlay = trackIds.includes(t.id);
        if (willPlay) {
          startAudioNode(t);
        }
        return { ...t, isPlaying: willPlay };
      })
    );
  };

  const handleStopAll = () => {
    audioEngine.stopAll();
    setTracks((prev) => prev.map((t) => ({ ...t, isPlaying: false })));
  };

  const handleMasterVolChange = (val: number) => {
    setMasterVol(val);
    audioEngine.setMasterVolume(val);
  };

  return (
    <div
      id="soundscapes-view-container"
      className="relative z-10 w-full h-full flex flex-col justify-between items-center px-4 sm:px-8 pt-20 sm:pt-24 pb-20 sm:pb-12 max-w-4xl mx-auto overflow-y-auto"
    >
      {/* Top Presets Switcher */}
      <div className="w-full flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[11px] uppercase tracking-widest font-semibold opacity-70"
            style={{ color: activeTheme.textHex }}
          >
            Acoustic Atmosphere Presets:
          </span>
        </div>
        <div
          id="soundscape-preset-group"
          className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl sm:rounded-full shadow-sm"
          style={{
            background: isDark ? 'rgba(28, 25, 23, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
          }}
        >
          {PRESET_MIXES.map((preset) => (
            <button
              key={preset.name}
              id={`preset-mix-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => applyPreset(preset.trackIds)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm"
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                color: activeTheme.textHex,
              }}
            >
              <Sparkles className="w-3 h-3 inline-block mr-1" style={{ color: activeTheme.accentHex }} />
              <span>{preset.name}</span>
            </button>
          ))}

          {anyPlaying && (
            <button
              id="btn-stop-all-sound"
              onClick={handleStopAll}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium opacity-80 hover:opacity-100 transition-all cursor-pointer"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
              }}
            >
              Stop All
            </button>
          )}
        </div>
      </div>

      {/* Multi-Track Channel Grid */}
      <div className="my-6 w-full grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-3xl">
        {tracks.map((track) => {
          return (
            <div
              key={track.id}
              id={`track-card-${track.id}`}
              className={`p-4 rounded-2xl transition-all duration-300 shadow-sm flex flex-col justify-between ${
                track.isPlaying ? 'ring-1' : 'opacity-85'
              }`}
              style={{
                background: isDark ? 'rgba(28, 25, 23, 0.65)' : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0, 0, 0, 0.05)'}`,
                borderColor: track.isPlaying ? activeTheme.accentHex : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <button
                    id={`btn-track-play-${track.id}`}
                    onClick={() => toggleTrack(track.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-sm"
                    style={{
                      backgroundColor: track.isPlaying ? activeTheme.accentHex : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                      color: track.isPlaying ? (isDark ? '#141211' : '#FFFFFF') : activeTheme.textHex,
                    }}
                  >
                    {track.isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                  <div>
                    <h3
                      className="text-xs font-semibold tracking-wide font-serif-luxury"
                      style={{ color: activeTheme.textHex }}
                    >
                      {track.name}
                    </h3>
                    <span
                      className="text-[10px] opacity-60 uppercase tracking-wider font-medium"
                      style={{ color: activeTheme.textHex }}
                    >
                      {track.category}
                    </span>
                  </div>
                </div>

                {/* Animated Wave Indicator if playing */}
                {track.isPlaying && (
                  <div className="flex items-center gap-0.5">
                    <span className="w-0.5 h-3 animate-pulse rounded-full" style={{ backgroundColor: activeTheme.accentHex }} />
                    <span className="w-0.5 h-5 animate-pulse rounded-full" style={{ backgroundColor: activeTheme.accentHex, animationDelay: '0.2s' }} />
                    <span className="w-0.5 h-4 animate-pulse rounded-full" style={{ backgroundColor: activeTheme.accentHex, animationDelay: '0.4s' }} />
                  </div>
                )}
              </div>

              <p
                className="text-[11px] opacity-70 leading-relaxed mb-3"
                style={{ color: activeTheme.textHex }}
              >
                {track.description}
              </p>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 pt-1 border-t border-black/5 dark:border-white/5">
                <Volume2 className="w-3 h-3 opacity-50" style={{ color: activeTheme.textHex }} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.volume}
                  onChange={(e) => updateVolume(track.id, parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-black/10 dark:bg-white/10"
                />
                <span className="text-[10px] opacity-60 w-7 text-right font-medium" style={{ color: activeTheme.textHex }}>
                  {Math.round(track.volume * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Master Volume Bar */}
      <div
        className="w-full max-w-md flex items-center justify-between px-6 py-2.5 rounded-full shadow-md"
        style={{
          background: isDark ? 'rgba(28, 25, 23, 0.75)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
        }}
      >
        <span
          className="text-xs uppercase tracking-widest font-semibold opacity-75 font-serif-luxury"
          style={{ color: activeTheme.textHex }}
        >
          Master Sound
        </span>
        <div className="flex items-center gap-3 w-44">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVol}
            onChange={(e) => handleMasterVolChange(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-black/10 dark:bg-white/10"
          />
          <span className="text-xs font-semibold opacity-75 w-8" style={{ color: activeTheme.textHex }}>
            {Math.round(masterVol * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
