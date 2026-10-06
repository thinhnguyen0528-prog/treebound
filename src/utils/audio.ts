// Web Audio API Synthesizer for high-fidelity game sound effects

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Soft UI click
  public playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio not supported or blocked
    }
  }

  // Node select / visit sound (melodic blip)
  public playNodeSelect(freq: number = 520) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, this.ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {
      // Audio fallback
    }
  }

  // Correct answer chime (two-tone harmonious chord)
  public playCorrect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.06);
        
        gain.gain.setValueAtTime(0.14, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.25);
      });
    } catch {
      // Audio fallback
    }
  }

  // Mistake / Error buzz
  public playError() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 0.16);
      
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch {
      // Audio fallback
    }
  }

  // Level Complete / Victory Fanfare
  public playVictory() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [
        { f: 523.25, d: 0.1, t: 0.0 },   // C5
        { f: 659.25, d: 0.1, t: 0.12 },  // E5
        { f: 783.99, d: 0.1, t: 0.24 },  // G5
        { f: 1046.50, d: 0.4, t: 0.36 }, // C6
      ];

      notes.forEach(({ f, d, t }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + t);
        
        gain.gain.setValueAtTime(0.2, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + t);
        osc.stop(now + t + d);
      });
    } catch {
      // Audio fallback
    }
  }

  // Node created / branch connected sound (gentle pop swoosh)
  public playNodeCreated() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(740, this.ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // Fallback
    }
  }

  public playLevelComplete() {
    this.playVictory();
  }
}

export const sound = new SoundManager();
