import { ColorTheme, BreathPattern } from '../types';

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'saffron-dawn',
    name: 'Warm Saffron Dawn',
    subtitle: 'Warm Ivory, Sand, & Radiant Saffron Gold',
    color1: [0.99, 0.98, 0.97], // Warm Ivory
    color2: [0.95, 0.92, 0.88], // Sand/Neutral
    color3: [1.0, 0.83, 0.31],  // Saffron/Gold
    accentHex: '#E5A93C',
    bgHex: '#FAF7F2',
    textHex: '#2E2721',
  },
  {
    id: 'amber-solstice',
    name: 'Golden Solstice',
    subtitle: 'Alabaster, Desert Linen, & Amber Glow',
    color1: [0.98, 0.96, 0.93],
    color2: [0.94, 0.88, 0.80],
    color3: [0.98, 0.67, 0.24],
    accentHex: '#D9771E',
    bgHex: '#F8F4ED',
    textHex: '#30261C',
  },
  {
    id: 'ethereal-sage',
    name: 'Sage Mist',
    subtitle: 'Pale Alabaster, Mountain Clay, & Wild Sage',
    color1: [0.98, 0.99, 0.98],
    color2: [0.91, 0.94, 0.91],
    color3: [0.65, 0.82, 0.68],
    accentHex: '#52825B',
    bgHex: '#F4F7F4',
    textHex: '#202B22',
  },
  {
    id: 'rose-quartz',
    name: 'Blush Horizon',
    subtitle: 'Ivory Silk, Cashmere, & Sunset Rose Quartz',
    color1: [0.99, 0.97, 0.97],
    color2: [0.95, 0.89, 0.89],
    color3: [0.95, 0.68, 0.72],
    accentHex: '#C96070',
    bgHex: '#FAF4F4',
    textHex: '#332225',
  },
  {
    id: 'celestial-pearl',
    name: 'Celestial Pearl',
    subtitle: 'Pure Alabaster, Fog Mist, & Platinum Sheen',
    color1: [0.99, 0.99, 1.0],
    color2: [0.92, 0.94, 0.96],
    color3: [0.72, 0.85, 0.96],
    accentHex: '#4D7D9A',
    bgHex: '#F3F6FA',
    textHex: '#1F2A33',
  },
  {
    id: 'midnight-embers',
    name: 'Midnight Embers',
    subtitle: 'Obsidian Velvet, Dark Clay, & Liquid Gold Glow',
    color1: [0.12, 0.11, 0.11],
    color2: [0.18, 0.16, 0.15],
    color3: [0.90, 0.62, 0.22],
    accentHex: '#E5A035',
    bgHex: '#141211',
    textHex: '#EDE6DD',
    isDark: true,
  },
];

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: 'coherent',
    name: 'Coherent Resonance (5.5s)',
    description: 'Optimal heart-rate variability & autonomic nervous system balance.',
    inhale: 5.5,
    holdIn: 0,
    exhale: 5.5,
    holdOut: 0,
    totalCycleTime: 11,
    tag: 'Heart Coherence',
  },
  {
    id: 'box',
    name: 'Box Breathing (4-4-4-4)',
    description: 'Used by mindfulness masters & Navy SEALs for supreme calm under stress.',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    totalCycleTime: 16,
    tag: 'Focus & Grounding',
  },
  {
    id: 'relax-478',
    name: '4-7-8 Deep Relaxation',
    description: 'Dr. Weil’s natural tranquilizer for the nervous system and deep sleep.',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    totalCycleTime: 19,
    tag: 'Deep Calm & Sleep',
  },
  {
    id: 'pranayama-energy',
    name: 'Prana Vitality (4-2-4-2)',
    description: 'Energizing rhythmic breathing for mental clarity and waking up focus.',
    inhale: 4,
    holdIn: 2,
    exhale: 4,
    holdOut: 2,
    totalCycleTime: 12,
    tag: 'Mental Clarity',
  },
];

export const DAILY_PROMPTS = [
  {
    prompt: "What subtle beauty or stillness have you noticed in this present moment?",
    author: "Mindful Contemplation",
    quote: "Silence is not the absence of something, but the presence of everything."
  },
  {
    prompt: "What thought or tension are you ready to gently release with your next exhale?",
    author: "Lao Tzu",
    quote: "To the mind that is still, the whole universe surrenders."
  },
  {
    prompt: "Name three small things that bring grounded gratitude into your space today.",
    author: "Marcus Aurelius",
    quote: "When you arise in the morning, think of what a precious privilege it is to be alive."
  },
  {
    prompt: "Where in your body is holding tension right now, and how can you soften it?",
    author: "Thich Nhat Hanh",
    quote: "Smile, breathe, and go slowly."
  },
  {
    prompt: "What is your single, heartfelt intention for the hours ahead?",
    author: "Rumi",
    quote: "The quiet whisper of the heart is louder than the noise of the world."
  }
];
