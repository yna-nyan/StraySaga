// Web Audio API Synthesizer for Stray Saga sound effects
// Does not require external audio assets. Gracefully handles user interaction constraints.

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    } else if (!muted && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getMuted() {
    return this.isMuted;
  }

  playMeow(pitchMultiplier: number = 1.0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Create oscillators
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    // Frequency envelope (me-ow curve)
    const baseFreq = 400 * pitchMultiplier;
    const peakFreq = 700 * pitchMultiplier;
    const endFreq = 450 * pitchMultiplier;

    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.15);
    osc1.frequency.exponentialRampToValueAtTime(endFreq, now + 0.45);

    osc2.frequency.setValueAtTime(baseFreq * 1.01, now);
    osc2.frequency.exponentialRampToValueAtTime(peakFreq * 1.01, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(endFreq * 1.01, now + 0.45);

    // Formant/nasal bandpass filter
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800 * pitchMultiplier, now);
    filter.frequency.exponentialRampToValueAtTime(1200 * pitchMultiplier, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(900 * pitchMultiplier, now + 0.45);
    filter.Q.setValueAtTime(3.0, now);

    // Volume envelope
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.1, now + 0.25);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    // Connections
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  }

  playPurr() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 1.2;

    const osc = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const mainGain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(25, now); // low purr frequency

    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(22, now); // AM frequency for purr vibration
    modGain.gain.setValueAtTime(10, now);

    mainGain.gain.setValueAtTime(0.001, now);
    mainGain.gain.linearRampToValueAtTime(0.12, now + 0.1);
    mainGain.gain.setValueAtTime(0.12, now + duration - 0.2);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Connect FM synthesis
    modulator.connect(modGain);
    modGain.connect(osc.frequency);
    osc.connect(mainGain);
    mainGain.connect(this.ctx.destination);

    modulator.start(now);
    osc.start(now);
    modulator.stop(now + duration);
    osc.stop(now + duration);
  }

  playHiss() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.8;

    // Generate white noise buffer
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4500, now);
    filter.Q.setValueAtTime(2.0, now);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.06, now + 0.4);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  playWaterLap() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.6;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + duration);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  playCarHorn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(320, now); // dual tone
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(370, now);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.06, now + 0.05);
    gainNode.gain.setValueAtTime(0.06, now + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  playFireplace() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Crackle sounds (multiple quick ticks)
    const now = this.ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const delay = Math.random() * 0.8;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2000 + Math.random() * 3000, now + delay);

      gainNode.gain.setValueAtTime(0.008, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.015);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.02);
    }
  }

  playDoorCreak() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.8;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Frequency fluctuates slowly to mimic creak friction
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(240, now + duration * 0.5);
    osc.frequency.linearRampToValueAtTime(150, now + duration);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.03, now + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.02, now + duration - 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  playTrafficAmbience() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 3.0;

    // Create low rumble of traffic
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(45, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, now);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.07, now + 0.5);
    gainNode.gain.linearRampToValueAtTime(0.05, now + 2.0);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }
}

export const audio = new AudioManager();
