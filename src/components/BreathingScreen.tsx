import React, { useState, useEffect, useRef } from 'react';
import { ColorTheme, BreathPattern } from '../types';
import { BREATH_PATTERNS } from '../data/presets';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface BreathingScreenProps {
  activeTheme: ColorTheme;
}

type Phase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

export const BreathingScreen: React.FC<BreathingScreenProps> = ({ activeTheme }) => {
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>(BREATH_PATTERNS[0]);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0); // 0 to 1
  const [cycleCount, setCycleCount] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [soundCuesEnabled, setSoundCuesEnabled] = useState(true);

  const phaseTimerRef = useRef<number | null>(null);
  const phaseStartTimeRef = useRef<number>(0);
  const currentPhaseRef = useRef<Phase>('inhale');
  const isDark = activeTheme.isDark;

  const getPhaseDuration = (p: Phase, pattern: BreathPattern): number => {
    switch (p) {
      case 'inhale': return pattern.inhale;
      case 'holdIn': return pattern.holdIn;
      case 'exhale': return pattern.exhale;
      case 'holdOut': return pattern.holdOut;
    }
  };

  const getNextPhase = (current: Phase, pattern: BreathPattern): Phase => {
    if (current === 'inhale') {
      return pattern.holdIn > 0 ? 'holdIn' : 'exhale';
    }
    if (current === 'holdIn') {
      return 'exhale';
    }
    if (current === 'exhale') {
      return pattern.holdOut > 0 ? 'holdOut' : 'inhale';
    }
    if (current === 'holdOut') {
      return 'inhale';
    }
    return 'inhale';
  };

  const playPhaseSound = (newPhase: Phase) => {
    if (!soundCuesEnabled) return;
    if (newPhase === 'inhale') {
      audioEngine.playSingingBowlChime(432, 2.5);
    } else if (newPhase === 'exhale') {
      audioEngine.playSingingBowlChime(324, 2.5);
    } else {
      audioEngine.playSingingBowlChime(540, 1.5);
    }
  };

  // Main breathing loop
  useEffect(() => {
    if (!isActive) {
      if (phaseTimerRef.current) cancelAnimationFrame(phaseTimerRef.current);
      return;
    }

    phaseStartTimeRef.current = performance.now();
    currentPhaseRef.current = 'inhale';
    setPhase('inhale');
    playPhaseSound('inhale');

    const updateLoop = () => {
      const now = performance.now();
      const durationMs = getPhaseDuration(currentPhaseRef.current, selectedPattern) * 1000;
      const elapsed = now - phaseStartTimeRef.current;
      const prog = Math.min(1, elapsed / durationMs);
      setPhaseProgress(prog);

      if (elapsed >= durationMs) {
        // Transition to next phase
        const next = getNextPhase(currentPhaseRef.current, selectedPattern);
        if (currentPhaseRef.current === 'exhale' && selectedPattern.holdOut === 0) {
          setCycleCount((c) => c + 1);
        } else if (currentPhaseRef.current === 'holdOut') {
          setCycleCount((c) => c + 1);
        }

        currentPhaseRef.current = next;
        setPhase(next);
        phaseStartTimeRef.current = performance.now();
        playPhaseSound(next);
      }

      phaseTimerRef.current = requestAnimationFrame(updateLoop);
    };

    phaseTimerRef.current = requestAnimationFrame(updateLoop);

    const secInterval = setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);

    return () => {
      if (phaseTimerRef.current) cancelAnimationFrame(phaseTimerRef.current);
      clearInterval(secInterval);
    };
  }, [isActive, selectedPattern, soundCuesEnabled]);

  const handleToggleActive = () => {
    if (!isActive) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setPhaseProgress(0);
    setCycleCount(0);
    setSessionSeconds(0);
  };

  // Calculate visual scale of the breathing sphere
  let sphereScale = 1.0;
  if (phase === 'inhale') {
    sphereScale = 1.0 + phaseProgress * 0.75;
  } else if (phase === 'holdIn') {
    sphereScale = 1.75;
  } else if (phase === 'exhale') {
    sphereScale = 1.75 - phaseProgress * 0.75;
  } else if (phase === 'holdOut') {
    sphereScale = 1.0;
  }

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In Deeply';
      case 'holdIn': return 'Retain & Be Still';
      case 'exhale': return 'Slowly Soften & Release';
      case 'holdOut': return 'Rest in Emptiness';
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="breathing-view-container"
      className="relative z-10 w-full h-full flex flex-col justify-between items-center px-4 sm:px-8 pt-20 sm:pt-24 pb-20 sm:pb-12 max-w-4xl mx-auto overflow-y-auto"
    >
      {/* Pattern Selector Pills */}
      <div className="w-full flex flex-col items-center">
        <div
          id="breath-pattern-selector"
          className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl sm:rounded-full shadow-sm max-w-2xl"
          style={{
            background: isDark ? 'rgba(28, 25, 23, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
          }}
        >
          {BREATH_PATTERNS.map((p) => {
            const isSelected = selectedPattern.id === p.id;
            return (
              <button
                key={p.id}
                id={`pattern-btn-${p.id}`}
                onClick={() => {
                  setSelectedPattern(p);
                  if (isActive) handleReset();
                }}
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
                {p.name}
              </button>
            );
          })}
        </div>
        <p
          className="text-xs text-center mt-2.5 opacity-70 max-w-md italic"
          style={{ color: activeTheme.textHex }}
        >
          {selectedPattern.description}
        </p>
      </div>

      {/* Main Breathing Orb & Geometric Harmonic Rings */}
      <div className="my-8 sm:my-10 relative flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px]">
        {/* Outer ambient wave rings */}
        <div
          className="absolute rounded-full transition-transform duration-1000 ease-out"
          style={{
            width: '280px',
            height: '280px',
            transform: `scale(${sphereScale * 1.15})`,
            border: `1px solid ${activeTheme.accentHex}33`,
            background: `radial-gradient(circle, ${activeTheme.accentHex}10 0%, transparent 70%)`,
          }}
        />

        <div
          className="absolute rounded-full transition-transform duration-700 ease-out"
          style={{
            width: '220px',
            height: '220px',
            transform: `scale(${sphereScale * 1.08})`,
            border: `1.5px dashed ${activeTheme.accentHex}55`,
          }}
        />

        {/* Central Breathing Sphere */}
        <div
          className="relative z-10 rounded-full flex flex-col items-center justify-center shadow-xl transition-transform duration-500 ease-out"
          style={{
            width: '170px',
            height: '170px',
            transform: `scale(${sphereScale})`,
            background: isDark
              ? `radial-gradient(circle at 35% 35%, rgba(55,48,44,0.9), rgba(28,24,22,0.95))`
              : `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95), rgba(245,240,235,0.85))`,
            backdropFilter: 'blur(20px)',
            border: `2px solid ${activeTheme.accentHex}88`,
            boxShadow: `0 10px 40px ${activeTheme.accentHex}33`,
          }}
        >
          <span
            className="text-xs uppercase tracking-[0.25em] font-semibold font-serif-luxury transition-all duration-300"
            style={{ color: activeTheme.accentHex }}
          >
            {isActive ? phase.toUpperCase() : 'READY'}
          </span>
          <span
            className="text-3xl font-light font-serif-luxury mt-1"
            style={{ color: activeTheme.textHex }}
          >
            {isActive
              ? Math.ceil(
                  getPhaseDuration(phase, selectedPattern) * (1 - phaseProgress)
                ) + 's'
              : 'BREATHE'}
          </span>
        </div>

        {/* Dynamic Phase Guidance */}
        <div className="mt-8 text-center">
          <h2
            className="text-base sm:text-lg font-medium font-serif-luxury tracking-wide"
            style={{ color: activeTheme.textHex }}
          >
            {isActive ? getPhaseInstruction() : 'Press Start to Center Yourself'}
          </h2>
        </div>
      </div>

      {/* Control Actions & Session Stats */}
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        {/* Controls Pill */}
        <div
          className="flex items-center gap-4 px-6 py-2.5 rounded-full shadow-md transition-all"
          style={{
            background: isDark ? 'rgba(28, 25, 23, 0.75)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
          }}
        >
          {/* Sound cue toggle */}
          <button
            id="btn-breath-sound-toggle"
            onClick={() => setSoundCuesEnabled(!soundCuesEnabled)}
            title={soundCuesEnabled ? 'Chime sound on' : 'Chime sound muted'}
            className="p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ color: activeTheme.textHex }}
          >
            {soundCuesEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Start / Pause Main Button */}
          <button
            id="btn-breath-toggle"
            onClick={handleToggleActive}
            className="flex items-center gap-2 px-6 py-2 rounded-full font-medium text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 shadow-sm cursor-pointer"
            style={{
              backgroundColor: activeTheme.accentHex,
              color: isDark ? '#141211' : '#FFFFFF',
            }}
          >
            {isActive ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Begin Flow</span>
              </>
            )}
          </button>

          {/* Reset button */}
          <button
            id="btn-breath-reset"
            onClick={handleReset}
            title="Reset Session"
            className="p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ color: activeTheme.textHex }}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Live Session Counter */}
        <div
          className="flex items-center justify-between w-full px-6 py-2 rounded-xl text-xs font-medium"
          style={{
            background: isDark ? 'rgba(28, 25, 23, 0.5)' : 'rgba(255, 255, 255, 0.5)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
            color: activeTheme.textHex,
          }}
        >
          <div className="flex items-center gap-1.5 opacity-80">
            <CheckCircle className="w-3.5 h-3.5" style={{ color: activeTheme.accentHex }} />
            <span>Cycles Completed: <strong className="font-semibold">{cycleCount}</strong></span>
          </div>
          <span className="opacity-80">
            Duration: <strong className="font-semibold">{formatTime(sessionSeconds)}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
