export interface ColorTheme {
  id: string;
  name: string;
  subtitle: string;
  color1: [number, number, number]; // RGB 0-1
  color2: [number, number, number];
  color3: [number, number, number];
  accentHex: string;
  bgHex: string;
  textHex: string;
  isDark?: boolean;
}

export interface ShaderSettings {
  speed: number;
  waveScale: number;
  glowIntensity: number;
  mouseInfluence: number;
}

export type ViewMode = 'ambient' | 'breath' | 'timer' | 'soundscapes' | 'journal' | 'customizer';

export interface BreathPattern {
  id: string;
  name: string;
  description: string;
  inhale: number; // seconds
  holdIn: number;
  exhale: number;
  holdOut: number;
  totalCycleTime: number;
  tag: string;
}

export interface SoundTrack {
  id: string;
  name: string;
  category: 'frequency' | 'nature' | 'noise';
  frequency?: number;
  binauralDelta?: number;
  description: string;
  volume: number; // 0 to 1
  isPlaying: boolean;
}

export interface ReflectionEntry {
  id: string;
  date: string;
  prompt: string;
  content: string;
  mood: 'peaceful' | 'focused' | 'grateful' | 'reflective' | 'energized';
  sessionMinutes?: number;
}
