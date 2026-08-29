// Web Audio API Procedural Sound Engine

class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private activeNodes: Map<string, { gain: GainNode; stop: () => void }> = new Map();

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
  }

  // Play a soft meditative chime / singing bowl bell
  public playSingingBowlChime(freq: number = 432, duration: number = 3.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const chimeGain = this.ctx.createGain();
    chimeGain.gain.setValueAtTime(0, now);
    chimeGain.gain.linearRampToValueAtTime(0.3, now + 0.08);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    chimeGain.connect(this.masterGain);

    // Fundamental + 3 rich harmonic partials for singing bowl chime
    const partials = [1, 2.76, 5.4, 8.93];
    const partialGains = [1, 0.4, 0.2, 0.08];

    partials.forEach((mult, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * mult, now);

      const pGain = this.ctx.createGain();
      pGain.gain.setValueAtTime(partialGains[i], now);
      pGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * (1 / (i * 0.5 + 1)));

      osc.connect(pGain);
      pGain.connect(chimeGain);
      osc.start(now);
      osc.stop(now + duration);
    });
  }

  // Pure Solfeggio / Harmonic Drone Tone
  public startTone(id: string, frequency: number, volume: number = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.activeNodes.has(id)) {
      this.setTrackVolume(id, volume);
      return;
    }

    const now = this.ctx.currentTime;
    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(0.001, now);
    trackGain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume * 0.4), now + 1.2);
    trackGain.connect(this.masterGain);

    // Warm multi-oscillator sine cluster
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(frequency, now);
    osc2.frequency.setValueAtTime(frequency * 1.5, now); // Fifth harmonic

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.2, now);
    osc2.connect(osc2Gain);
    osc2Gain.connect(trackGain);
    osc1.connect(trackGain);

    osc1.start();
    osc2.start();

    this.activeNodes.set(id, {
      gain: trackGain,
      stop: () => {
        if (!this.ctx) return;
        const stopTime = this.ctx.currentTime;
        trackGain.gain.setValueAtTime(trackGain.gain.value, stopTime);
        trackGain.gain.exponentialRampToValueAtTime(0.0001, stopTime + 1.0);
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
            trackGain.disconnect();
          } catch {
            // ignore
          }
        }, 1100);
      }
    });
  }

  // Binaural Beats (Stereo Split with Frequency Delta)
  public startBinauralBeats(id: string, carrierFreq: number = 216, delta: number = 10, volume: number = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.activeNodes.has(id)) {
      this.setTrackVolume(id, volume);
      return;
    }

    const now = this.ctx.currentTime;
    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(0.001, now);
    trackGain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume * 0.35), now + 1.5);
    trackGain.connect(this.masterGain);

    // Left Ear
    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(carrierFreq, now);
    const pannerL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (pannerL) pannerL.pan.setValueAtTime(-1.0, now);

    // Right Ear
    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(carrierFreq + delta, now);
    const pannerR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (pannerR) pannerR.pan.setValueAtTime(1.0, now);

    if (pannerL && pannerR) {
      oscL.connect(pannerL);
      pannerL.connect(trackGain);
      oscR.connect(pannerR);
      pannerR.connect(trackGain);
    } else {
      oscL.connect(trackGain);
      oscR.connect(trackGain);
    }

    oscL.start();
    oscR.start();

    this.activeNodes.set(id, {
      gain: trackGain,
      stop: () => {
        if (!this.ctx) return;
        const stopTime = this.ctx.currentTime;
        trackGain.gain.setValueAtTime(trackGain.gain.value, stopTime);
        trackGain.gain.exponentialRampToValueAtTime(0.0001, stopTime + 1.0);
        setTimeout(() => {
          try {
            oscL.stop();
            oscR.stop();
            trackGain.disconnect();
          } catch {
            // ignore
          }
        }, 1100);
      }
    });
  }

  // Nature Noise (Rain / Ocean / Wind)
  public startNatureSound(id: string, type: 'rain' | 'ocean' | 'wind' | 'pink_noise', volume: number = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.activeNodes.has(id)) {
      this.setTrackVolume(id, volume);
      return;
    }

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink/Brown noise approximation
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(0.001, now);
    trackGain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume * 0.4), now + 1.5);
    trackGain.connect(this.masterGain);

    let lfo: OscillatorNode | null = null;
    let lfoGain: GainNode | null = null;

    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
    } else if (type === 'ocean') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      // Ocean wave swell LFO
      lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, now); // slow rhythmic wave
      lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(250, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
    } else if (type === 'wind') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, now);
      filter.Q.setValueAtTime(3.0, now);
      lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.2, now);
      lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(180, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
    }

    noiseSource.connect(filter);
    filter.connect(trackGain);
    noiseSource.start();

    this.activeNodes.set(id, {
      gain: trackGain,
      stop: () => {
        if (!this.ctx) return;
        const stopTime = this.ctx.currentTime;
        trackGain.gain.setValueAtTime(trackGain.gain.value, stopTime);
        trackGain.gain.exponentialRampToValueAtTime(0.0001, stopTime + 1.0);
        setTimeout(() => {
          try {
            noiseSource.stop();
            if (lfo) lfo.stop();
            trackGain.disconnect();
          } catch {
            // ignore
          }
        }, 1100);
      }
    });
  }

  public setTrackVolume(id: string, vol: number) {
    const node = this.activeNodes.get(id);
    if (node && this.ctx) {
      node.gain.gain.setTargetAtTime(Math.max(0.0001, vol * 0.45), this.ctx.currentTime, 0.08);
    }
  }

  public stopTrack(id: string) {
    const node = this.activeNodes.get(id);
    if (node) {
      node.stop();
      this.activeNodes.delete(id);
    }
  }

  public stopAll() {
    this.activeNodes.forEach(node => node.stop());
    this.activeNodes.clear();
  }
}

export const audioEngine = new ProceduralAudioEngine();
