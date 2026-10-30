/**
 * PixVerse Web Audio Soundscape Synthesizer
 * Generates relaxing ambient soundscapes procedurally using the Web Audio API
 */

class SoundscapeSynth {
  constructor() {
    this.ctx = null;
    this.currentTrack = null;
    this.gainNode = null;
    this.masterGain = null;
    this.activeNodes = [];
    this.activeTimers = [];
    this.volume = 0.5;
    this.isPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  stop() {
    // Clear any scheduled bird chirps or chord arpeggio timers
    this.activeTimers.forEach(timer => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    this.activeTimers = [];

    // Stop and disconnect all active Web Audio nodes
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
      } catch {
        // Node already stopped
      }
      try {
        if (node.disconnect) node.disconnect();
      } catch {
        // Node already disconnected
      }
    });
    this.activeNodes = [];

    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // Ignore
      }
      this.masterGain = null;
    }

    this.isPlaying = false;
    this.currentTrack = null;
  }

  play(trackName) {
    this.init();
    if (!this.ctx) return;

    this.stop();

    // Master gain node for overall volume control
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.currentTrack = trackName;
    this.isPlaying = true;

    try {
      switch (trackName) {
        case 'rain':
          this._generateRain();
          break;
        case 'waves':
          this._generateOceanWaves();
          break;
        case 'lofi':
          this._generateLofiChill();
          break;
        case 'forest':
          this._generateForest();
          break;
        default:
          this._generateRain();
      }
    } catch (err) {
      console.error('Error starting soundscape track:', trackName, err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. RAINY CAFE: Layered Pink Noise + Distant Rain Resonance
  // ─────────────────────────────────────────────────────────────
  _generateRain() {
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
      b6 = white * 0.115926;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    // Smooth lowpass filter for gentle rain
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1100, this.ctx.currentTime);

    // Subtle high shelf to tame harshness
    const highShelf = this.ctx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.setValueAtTime(4000, this.ctx.currentTime);
    highShelf.gain.setValueAtTime(-4, this.ctx.currentTime);

    rainSource.connect(lowpass);
    lowpass.connect(highShelf);
    highShelf.connect(this.masterGain);

    rainSource.start();
    this.activeNodes.push(rainSource, lowpass, highShelf);
  }

  // ─────────────────────────────────────────────────────────────
  // 2. OCEAN WAVES: Procedural Deep Surf Swells & Spray
  // ─────────────────────────────────────────────────────────────
  _generateOceanWaves() {
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Brown noise generator (deep rumble for ocean water)
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.025 * white)) / 1.025;
      lastOut = data[i];
      data[i] *= 3.8; // boost brown noise amplitude
    }

    const surfSource = this.ctx.createBufferSource();
    surfSource.buffer = buffer;
    surfSource.loop = true;

    // Resonant Lowpass Filter that sweeps with the wave cycle
    const surfFilter = this.ctx.createBiquadFilter();
    surfFilter.type = 'lowpass';
    surfFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    surfFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    // Wave swell gain envelope
    const surfGain = this.ctx.createGain();
    surfGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    // LFO to modulate filter frequency (Wave crash & pullback: ~8.5 second cycle)
    const lfoFilter = this.ctx.createOscillator();
    lfoFilter.type = 'sine';
    lfoFilter.frequency.setValueAtTime(0.11, this.ctx.currentTime); // ~9 sec period

    const lfoFilterGain = this.ctx.createGain();
    lfoFilterGain.gain.setValueAtTime(220, this.ctx.currentTime); // Sweeps between 100Hz and 540Hz

    lfoFilter.connect(lfoFilterGain);
    lfoFilterGain.connect(surfFilter.frequency);

    // LFO to modulate surf volume swell
    const lfoGain = this.ctx.createOscillator();
    lfoGain.type = 'sine';
    lfoGain.frequency.setValueAtTime(0.11, this.ctx.currentTime);

    const lfoVolumeGain = this.ctx.createGain();
    lfoVolumeGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    lfoGain.connect(lfoVolumeGain);
    lfoVolumeGain.connect(surfGain.gain);

    // High frequency foam/spray texture
    const sprayBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const sprayData = sprayBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      sprayData[i] = (Math.random() * 2 - 1) * 0.04;
    }
    const spraySource = this.ctx.createBufferSource();
    spraySource.buffer = sprayBuffer;
    spraySource.loop = true;

    const sprayFilter = this.ctx.createBiquadFilter();
    sprayFilter.type = 'bandpass';
    sprayFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    sprayFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    const sprayGain = this.ctx.createGain();
    sprayGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    lfoFilterGain.connect(sprayFilter.frequency);
    spraySource.connect(sprayFilter);
    sprayFilter.connect(sprayGain);
    sprayGain.connect(this.masterGain);

    surfSource.connect(surfFilter);
    surfFilter.connect(surfGain);
    surfGain.connect(this.masterGain);

    surfSource.start();
    spraySource.start();
    lfoFilter.start();
    lfoGain.start();

    this.activeNodes.push(
      surfSource, surfFilter, surfGain, lfoFilter, lfoFilterGain,
      lfoGain, lfoVolumeGain, spraySource, sprayFilter, sprayGain
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. LO-FI CHILL: Audible Electric Piano Chords + Melody & Vinyl
  // ─────────────────────────────────────────────────────────────
  _generateLofiChill() {
    const ctx = this.ctx;
    const sampleRate = ctx.sampleRate;

    // 1. Soft Warm Vinyl Crackle & Analog Tape Bed
    const bufferSize = sampleRate * 2;
    const vinylBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const vinylData = vinylBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.0015) {
        vinylData[i] = (Math.random() * 2 - 1) * 0.25; // Crackle pop
      } else {
        vinylData[i] = (Math.random() * 2 - 1) * 0.008; // Low surface noise
      }
    }

    const vinylSource = ctx.createBufferSource();
    vinylSource.buffer = vinylBuffer;
    vinylSource.loop = true;

    const vinylBandpass = ctx.createBiquadFilter();
    vinylBandpass.type = 'bandpass';
    vinylBandpass.frequency.setValueAtTime(1400, ctx.currentTime);
    vinylBandpass.Q.setValueAtTime(0.9, ctx.currentTime);

    const vinylGain = ctx.createGain();
    vinylGain.gain.setValueAtTime(0.18, ctx.currentTime);

    vinylSource.connect(vinylBandpass);
    vinylBandpass.connect(vinylGain);
    vinylGain.connect(this.masterGain);

    vinylSource.start();
    this.activeNodes.push(vinylSource, vinylBandpass, vinylGain);

    // 2. Beautiful Jazzy Lo-Fi Chord Progression:
    // Dm9 -> G13 -> Cmaj9 -> Am9
    const chordProgression = [
      {
        name: 'Dm9',
        bass: 73.42, // D2
        notes: [146.83, 174.61, 220.00, 261.63, 329.63] // D3, F3, A3, C4, E4
      },
      {
        name: 'G13',
        bass: 49.00, // G1
        notes: [98.00, 174.61, 246.94, 329.63] // G2, F3, B3, E4
      },
      {
        name: 'Cmaj9',
        bass: 65.41, // C2
        notes: [130.81, 164.81, 196.00, 246.94, 293.66] // C3, E3, G3, B3, D4
      },
      {
        name: 'Am9',
        bass: 55.00, // A1
        notes: [110.00, 164.81, 196.00, 261.63, 329.63] // A2, E3, G3, C4, E4
      }
    ];

    // Pentatonic lofi lead melody note pool (Hz)
    const melodyNotes = [329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

    let chordStep = 0;

    const playNextChord = () => {
      if (!this.isPlaying || this.currentTrack !== 'lofi') return;

      const now = ctx.currentTime;
      const currentChord = chordProgression[chordStep % chordProgression.length];
      chordStep++;

      const chordDuration = 3.6; // 3.6 seconds per chord for a steady chill tempo

      // Play Warm Sub-Bass Note
      const bassOsc = ctx.createOscillator();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(currentChord.bass, now);

      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(180, now);

      const bassGain = ctx.createGain();
      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(0.22, now + 0.12);
      bassGain.gain.exponentialRampToValueAtTime(0.08, now + chordDuration * 0.8);
      bassGain.gain.linearRampToValueAtTime(0.001, now + chordDuration);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.masterGain);

      bassOsc.start(now);
      bassOsc.stop(now + chordDuration + 0.1);
      this.activeNodes.push(bassOsc, bassFilter, bassGain);

      // Play Rhodes Piano Chords with subtle finger-strum stagger
      currentChord.notes.forEach((freq, noteIdx) => {
        const noteStart = now + (noteIdx * 0.035); // 35ms strum offset
        const noteDuration = chordDuration - (noteIdx * 0.035);

        // Rhodes fundamental (sine) + warm harmonic body (triangle)
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, noteStart);

        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2.002, noteStart); // soft bell overtone

        // Lowpass tone control filter
        const toneFilter = ctx.createBiquadFilter();
        toneFilter.type = 'lowpass';
        toneFilter.frequency.setValueAtTime(1200, noteStart);
        toneFilter.Q.setValueAtTime(1.0, noteStart);

        const chordGain = ctx.createGain();
        const noteVol = 0.07;

        chordGain.gain.setValueAtTime(0.0001, noteStart);
        chordGain.gain.linearRampToValueAtTime(noteVol, noteStart + 0.06); // snappy soft attack
        chordGain.gain.exponentialRampToValueAtTime(noteVol * 0.45, noteStart + 1.2);
        chordGain.gain.linearRampToValueAtTime(0.0001, noteStart + noteDuration);

        // Mix overtone softer
        const overtoneGain = ctx.createGain();
        overtoneGain.gain.setValueAtTime(0.2, noteStart);

        osc1.connect(toneFilter);
        osc2.connect(overtoneGain);
        overtoneGain.connect(toneFilter);

        toneFilter.connect(chordGain);
        chordGain.connect(this.masterGain);

        osc1.start(noteStart);
        osc2.start(noteStart);
        osc1.stop(noteStart + noteDuration + 0.1);
        osc2.stop(noteStart + noteDuration + 0.1);

        this.activeNodes.push(osc1, osc2, toneFilter, chordGain, overtoneGain);
      });

      // Play gentle lofi lead melody note occasionally
      if (Math.random() > 0.25) {
        const melodyStart = now + 1.2 + Math.random() * 0.8;
        const melodyFreq = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
        const melOsc = ctx.createOscillator();
        melOsc.type = 'sine';
        melOsc.frequency.setValueAtTime(melodyFreq, melodyStart);

        const melGain = ctx.createGain();
        melGain.gain.setValueAtTime(0.0001, melodyStart);
        melGain.gain.linearRampToValueAtTime(0.04, melodyStart + 0.04);
        melGain.gain.exponentialRampToValueAtTime(0.0001, melodyStart + 1.1);

        melOsc.connect(melGain);
        melGain.connect(this.masterGain);

        melOsc.start(melodyStart);
        melOsc.stop(melodyStart + 1.2);
        this.activeNodes.push(melOsc, melGain);
      }

      // Schedule next chord change smoothly
      const timer = setTimeout(playNextChord, chordDuration * 1000);
      this.activeTimers.push(timer);
    };

    // Trigger first chord immediately
    playNextChord();
  }

  // ─────────────────────────────────────────────────────────────
  // 4. FOREST BREEZE: Wind Through Pines & Gentle Bird Chirps
  // ─────────────────────────────────────────────────────────────
  _generateForest() {
    const ctx = this.ctx;
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 4;

    // 1. Wind in Leaves (Modulated Pink Noise)
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.0990460;
      b1 = 0.96300 * b1 + white * 0.2965164;
      b2 = 0.57000 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.08;
    }

    const windSource = ctx.createBufferSource();
    windSource.buffer = buffer;
    windSource.loop = true;

    // Dual bandpass filters that sweep with gentle breeze LFOs
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(520, ctx.currentTime);
    windFilter.Q.setValueAtTime(1.8, ctx.currentTime);

    const windLfo = ctx.createOscillator();
    windLfo.type = 'sine';
    windLfo.frequency.setValueAtTime(0.18, ctx.currentTime); // ~5.5 sec breeze swell

    const windLfoGain = ctx.createGain();
    windLfoGain.gain.setValueAtTime(180, ctx.currentTime);

    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.4, ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.masterGain);

    windSource.start();
    windLfo.start();
    this.activeNodes.push(windSource, windFilter, windGain, windLfo, windLfoGain);

    // 2. Procedural Sweet Woodland Bird Chirps
    const triggerBirdChirp = () => {
      if (!this.isPlaying || this.currentTrack !== 'forest') return;

      const now = ctx.currentTime;
      // Randomized realistic bird melody patterns (freqs in Hz)
      const baseFreq = 2400 + Math.random() * 1200;
      const chirpCount = 2 + Math.floor(Math.random() * 3);
      let chirpOffset = 0;

      for (let c = 0; c < chirpCount; c++) {
        const chirpStart = now + chirpOffset;
        const chirpDuration = 0.08 + Math.random() * 0.06;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        
        // Pitch bend upwards or down for authentic chirp
        const startP = baseFreq + (Math.random() * 400 - 200);
        const endP = startP + (Math.random() > 0.5 ? 600 : -500);

        osc.frequency.setValueAtTime(startP, chirpStart);
        osc.frequency.exponentialRampToValueAtTime(Math.max(400, endP), chirpStart + chirpDuration);

        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime(0.0001, chirpStart);
        chirpGain.gain.linearRampToValueAtTime(0.06, chirpStart + chirpDuration * 0.3);
        chirpGain.gain.linearRampToValueAtTime(0.0001, chirpStart + chirpDuration);

        osc.connect(chirpGain);
        chirpGain.connect(this.masterGain);

        osc.start(chirpStart);
        osc.stop(chirpStart + chirpDuration + 0.05);

        this.activeNodes.push(osc, chirpGain);
        chirpOffset += chirpDuration + 0.08 + Math.random() * 0.12;
      }

      // Schedule next bird chirp in 2.5 to 6 seconds
      const nextDelay = (2.5 + Math.random() * 4.0) * 1000;
      const birdTimer = setTimeout(triggerBirdChirp, nextDelay);
      this.activeTimers.push(birdTimer);
    };

    // First chirp after 1.5s
    const initialBirdTimer = setTimeout(triggerBirdChirp, 1500);
    this.activeTimers.push(initialBirdTimer);
  }
}

export const soundscape = new SoundscapeSynth();

