import React, { useState, useEffect } from 'react';
import { ColorTheme, ReflectionEntry } from '../types';
import { DAILY_PROMPTS } from '../data/presets';
import { Plus, Trash2, Sparkles, Heart, Smile, Sun, Moon, Check } from 'lucide-react';

interface JournalScreenProps {
  activeTheme: ColorTheme;
}

export const JournalScreen: React.FC<JournalScreenProps> = ({ activeTheme }) => {
  const [entries, setEntries] = useState<ReflectionEntry[]>(() => {
    try {
      const saved = localStorage.getItem('ethereal_reflections');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [promptIdx, setPromptIdx] = useState(0);
  const [reflectionText, setReflectionText] = useState('');
  const [selectedMood, setSelectedMood] = useState<ReflectionEntry['mood']>('peaceful');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isDark = activeTheme.isDark;
  const currentPrompt = DAILY_PROMPTS[promptIdx % DAILY_PROMPTS.length];

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;

    const newEntry: ReflectionEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      prompt: currentPrompt.prompt,
      content: reflectionText.trim(),
      mood: selectedMood,
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    try {
      localStorage.setItem('ethereal_reflections', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setReflectionText('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    try {
      localStorage.setItem('ethereal_reflections', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const moods: { id: ReflectionEntry['mood']; label: string; icon: React.ReactNode }[] = [
    { id: 'peaceful', label: 'Peaceful', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'focused', label: 'Focused', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'grateful', label: 'Grateful', icon: <Smile className="w-3.5 h-3.5" /> },
    { id: 'reflective', label: 'Reflective', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'energized', label: 'Energized', icon: <Sun className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      id="journal-view-container"
      className="relative z-10 w-full h-full flex flex-col items-center px-4 sm:px-8 pt-20 sm:pt-24 pb-20 sm:pb-12 max-w-4xl mx-auto overflow-y-auto"
    >
      {/* Top Daily Wisdom Card */}
      <div
        id="daily-wisdom-card"
        className="w-full max-w-2xl p-5 rounded-2xl transition-all duration-300 shadow-sm text-center mb-6"
        style={{
          background: isDark ? 'rgba(28, 25, 23, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.06)'}`,
        }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.25em] font-semibold opacity-60"
          style={{ color: activeTheme.accentHex }}
        >
          Daily Mindful Inquiry
        </span>
        <h2
          className="text-sm sm:text-base font-medium font-serif-luxury mt-1 mb-2 leading-relaxed"
          style={{ color: activeTheme.textHex }}
        >
          "{currentPrompt.prompt}"
        </h2>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPromptIdx((prev) => prev + 1)}
            className="text-[11px] uppercase tracking-wider font-semibold opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ color: activeTheme.accentHex }}
          >
            Different Prompt ↺
          </button>
        </div>
      </div>

      {/* Note Creation Form */}
      <form
        onSubmit={handleSaveEntry}
        className="w-full max-w-2xl p-5 rounded-2xl shadow-sm mb-8 flex flex-col gap-3.5"
        style={{
          background: isDark ? 'rgba(28, 25, 23, 0.65)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0, 0, 0, 0.05)'}`,
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-xs uppercase tracking-wider font-semibold opacity-75 font-serif-luxury"
            style={{ color: activeTheme.textHex }}
          >
            Write Reflection
          </span>

          {/* Mood Selector Pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {moods.map((m) => {
              const isSelected = selectedMood === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setSelectedMood(m.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all cursor-pointer ${
                    isSelected ? 'font-semibold scale-105' : 'opacity-65 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isSelected
                      ? activeTheme.accentHex
                      : isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.04)',
                    color: isSelected
                      ? isDark
                        ? '#141211'
                        : '#FFFFFF'
                      : activeTheme.textHex,
                  }}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <textarea
          id="textarea-reflection-entry"
          rows={3}
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="Capture your thoughts, stillness, and gratitude in this moment..."
          className="w-full text-xs p-3 rounded-xl focus:outline-none resize-none transition-all"
          style={{
            background: isDark ? 'rgba(15, 13, 12, 0.5)' : 'rgba(255, 255, 255, 0.8)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
            color: activeTheme.textHex,
          }}
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] opacity-60" style={{ color: activeTheme.textHex }}>
            {savedSuccess ? (
              <span className="text-emerald-500 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved to Sanctuary
              </span>
            ) : (
              'Saved locally on your device'
            )}
          </span>

          <button
            type="submit"
            disabled={!reflectionText.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shadow-sm"
            style={{
              backgroundColor: activeTheme.accentHex,
              color: isDark ? '#141211' : '#FFFFFF',
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Store Note</span>
          </button>
        </div>
      </form>

      {/* History Timeline */}
      <div className="w-full max-w-2xl flex flex-col gap-3">
        <h2
          className="text-xs uppercase tracking-widest font-semibold opacity-70 font-serif-luxury"
          style={{ color: activeTheme.textHex }}
        >
          Mindful Journal History ({entries.length})
        </h2>

        {entries.length === 0 ? (
          <div
            className="p-8 text-center rounded-2xl opacity-60 text-xs italic"
            style={{
              background: isDark ? 'rgba(28, 25, 23, 0.3)' : 'rgba(255, 255, 255, 0.3)',
              color: activeTheme.textHex,
            }}
          >
            Your sacred space is quiet. Write your first intention or reflection above.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-2xl transition-all duration-300 shadow-sm flex flex-col gap-2 relative group"
              style={{
                background: isDark ? 'rgba(28, 25, 23, 0.65)' : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0, 0, 0, 0.05)'}`,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] uppercase tracking-wider font-semibold opacity-60"
                  style={{ color: activeTheme.accentHex }}
                >
                  {entry.date} • {entry.mood}
                </span>

                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  title="Delete Entry"
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-1 cursor-pointer text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p
                className="text-xs font-light leading-relaxed whitespace-pre-wrap"
                style={{ color: activeTheme.textHex }}
              >
                {entry.content}
              </p>

              <div
                className="text-[10px] opacity-50 italic pt-1 border-t border-black/5 dark:border-white/5"
                style={{ color: activeTheme.textHex }}
              >
                In response to: "{entry.prompt}"
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
