const SOUND_KEY = "maintech_sound_enabled";

let audioCtx = null;
let shakeAudioUnlocked = false;
let mediaElement = null;
let mediaSourceNode = null;
let mediaSourceConnected = false;
let sfxUrl = null;

export const isSoundEnabled = () => {
  try {
    const stored = localStorage.getItem(SOUND_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
};

export const setSoundEnabled = (enabled) => {
  localStorage.setItem(SOUND_KEY, String(enabled));
};

export const toggleSound = () => {
  const next = !isSoundEnabled();
  setSoundEnabled(next);
  return next;
};

export const initSoundUnlock = () => {
  if (typeof window === "undefined") return;
  const unlock = () => {
    const ctx = getOrCreateContext();
    if (ctx?.state === "suspended") ctx.resume().catch(() => {});
  };
  window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
};

const getOrCreateContext = () => {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
};

const writeWav = (samples, sampleRate = 22050) => {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i += 1) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i += 1) {
    view.setInt16(44 + i * 2, samples[i], true);
  }

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
};

const getSilentLoopUrl = () => {
  const sampleRate = 8000;
  const samples = new Int16Array(sampleRate);
  return writeWav(samples, sampleRate);
};

const connectFilter = (ctx, type, freq, Q = 8) => {
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = Q;
  return filter;
};

const env = (gain, t0, attack, peak, releaseEnd) => {
  gain.gain.setValueAtTime(0.001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, releaseEnd);
};

const addFmBell = (ctx, dest, freq, start, panValue, modIndex = 7) => {
  const carrier = ctx.createOscillator();
  const mod = ctx.createOscillator();
  const modGain = ctx.createGain();
  const bellGain = ctx.createGain();
  const pan = ctx.createStereoPanner();

  carrier.type = "sine";
  mod.type = "sine";
  carrier.frequency.value = freq;
  mod.frequency.value = freq * 2.76;

  modGain.gain.setValueAtTime(freq * modIndex, start);
  modGain.gain.exponentialRampToValueAtTime(0.8, start + 0.045);
  modGain.gain.exponentialRampToValueAtTime(0.001, start + 0.38);

  env(bellGain, start, 0.004, 0.26, start + 0.42);
  pan.pan.value = panValue;

  mod.connect(modGain).connect(carrier.frequency);
  carrier.connect(bellGain).connect(pan).connect(dest);

  carrier.start(start);
  mod.start(start);
  carrier.stop(start + 0.45);
  mod.stop(start + 0.45);
};

/** Bright theatrical reveal — airy swell → ascending bells → luminous chord */
const playWebAudioSynth = (ctx) => {
  const t = ctx.currentTime + 0.005;
  const master = ctx.createGain();
  master.gain.value = 0.68;
  master.connect(ctx.destination);

  const bus = ctx.createGain();
  bus.gain.value = 1;
  bus.connect(master);

  // ── Layer 1: Celestial pad swell (C major) ──
  [261.63, 329.63, 392.0].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * (1 + (i - 1) * 0.004);
    const padGain = ctx.createGain();
    env(padGain, t, 0.11 + i * 0.02, 0.14, t + 0.58);
    const lp = connectFilter(ctx, "lowpass", 1800, 0.7);
    lp.frequency.setValueAtTime(1200, t);
    lp.frequency.exponentialRampToValueAtTime(6200, t + 0.28);
    lp.frequency.exponentialRampToValueAtTime(2400, t + 0.55);
    osc.connect(lp).connect(padGain).connect(bus);
    osc.start(t);
    osc.stop(t + 0.6);
  });

  // ── Layer 2: Soft ascending air (theatrical lift) ──
  const airLen = Math.floor(ctx.sampleRate * 0.35);
  const airBuf = ctx.createBuffer(1, airLen, ctx.sampleRate);
  const airData = airBuf.getChannelData(0);
  for (let i = 0; i < airLen; i += 1) airData[i] = (Math.random() * 2 - 1) * 0.35;

  const air = ctx.createBufferSource();
  air.buffer = airBuf;
  const airFilter = ctx.createBiquadFilter();
  airFilter.type = "bandpass";
  airFilter.Q.value = 4.5;
  airFilter.frequency.setValueAtTime(900, t);
  airFilter.frequency.exponentialRampToValueAtTime(5200, t + 0.22);
  const airGain = ctx.createGain();
  env(airGain, t, 0.06, 0.07, t + 0.32);
  air.connect(airFilter).connect(airGain).connect(bus);
  air.start(t);
  air.stop(t + 0.34);

  // ── Layer 3: Ascending glass bells (major ascent) ──
  const bells = [
    { f: 523.25, p: -0.55, at: 0.1 },
    { f: 659.25, p: 0.5, at: 0.155 },
    { f: 783.99, p: -0.35, at: 0.21 },
    { f: 987.77, p: 0.45, at: 0.265 },
    { f: 1046.5, p: 0, at: 0.32 },
  ];
  bells.forEach(({ f, p, at }) => addFmBell(ctx, bus, f, t + at, p, 6.5));

  // ── Layer 4: Grand luminous chord (theatrical resolution) ──
  [1046.5, 1318.51, 1567.98].forEach((freq, i) => {
    const hit = t + 0.34;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, hit);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.002, hit + 0.15);

    const hitGain = ctx.createGain();
    env(hitGain, hit, 0.018, 0.22 - i * 0.03, hit + 0.52);

    const pan = ctx.createStereoPanner();
    pan.pan.value = [-0.42, 0, 0.42][i];

    const hp = connectFilter(ctx, "highpass", 420, 0.8);
    osc.connect(hp).connect(hitGain).connect(pan).connect(bus);
    osc.start(hit);
    osc.stop(hit + 0.54);
  });

  // ── Layer 5: High sparkle tail ──
  const sparkle = ctx.createOscillator();
  sparkle.type = "sine";
  sparkle.frequency.setValueAtTime(3520, t + 0.36);
  sparkle.frequency.exponentialRampToValueAtTime(5280, t + 0.44);
  sparkle.frequency.exponentialRampToValueAtTime(2640, t + 0.58);
  const sparkleGain = ctx.createGain();
  env(sparkleGain, t + 0.36, 0.006, 0.11, t + 0.6);
  sparkle.connect(sparkleGain).connect(bus);
  sparkle.start(t + 0.36);
  sparkle.stop(t + 0.62);
};

/** Offline approximation for HTML5 fallback */
const synthesizeRevealWav = () => {
  const sampleRate = 44100;
  const duration = 0.62;
  const n = Math.floor(sampleRate * duration);
  const samples = new Int16Array(n);

  const padFreqs = [261.63, 329.63, 392.0];
  const bellFreqs = [523.25, 659.25, 783.99, 987.77, 1046.5];
  const chordFreqs = [1046.5, 1318.51, 1567.98];

  for (let i = 0; i < n; i += 1) {
    const time = i / sampleRate;
    const padEnv = (1 - Math.exp(-time * 9)) * Math.exp(-Math.max(0, time - 0.15) * 3.2);

    let pad = 0;
    padFreqs.forEach((f) => {
      pad += Math.sin(2 * Math.PI * f * time) * 0.09;
    });

    const airEnv = Math.exp(-time * 10) * (time < 0.32 ? 1 : 0);
    const air = (Math.random() * 2 - 1) * 0.04 * airEnv;

    let bells = 0;
    bellFreqs.forEach((f, idx) => {
      const start = 0.1 + idx * 0.055;
      const local = Math.max(0, time - start);
      const mod = Math.sin(2 * Math.PI * f * 2.76 * local) * Math.exp(-local * 28) * 4.5;
      bells += Math.sin(2 * Math.PI * f * local + mod) * Math.exp(-local * 7) * 0.11;
    });

    let chord = 0;
    if (time >= 0.34) {
      const local = time - 0.34;
      chordFreqs.forEach((f) => {
        chord += Math.sin(2 * Math.PI * f * time) * Math.exp(-local * 5.5) * 0.1;
      });
    }

    const sparkle =
      time >= 0.36
        ? Math.sin(2 * Math.PI * (3520 + (time - 0.36) * 2200) * time) *
          Math.exp(-(time - 0.36) * 14) *
          0.07
        : 0;

    const mix = (pad * padEnv + air + bells + chord + sparkle) * 0.9;
    samples[i] = Math.max(-32767, Math.min(32767, mix * 32767));
  }

  return writeWav(samples, sampleRate);
};

const getSfxUrl = () => {
  if (sfxUrl) return sfxUrl;
  sfxUrl = synthesizeRevealWav();
  return sfxUrl;
};

const ensureMediaBridge = () => {
  const ctx = getOrCreateContext();
  if (!ctx) return null;

  if (!mediaElement) {
    mediaElement = document.createElement("audio");
    mediaElement.src = getSilentLoopUrl();
    mediaElement.loop = true;
    mediaElement.volume = 0.001;
    mediaElement.playsInline = true;
    mediaElement.setAttribute("playsinline", "true");
    mediaElement.preload = "auto";
  }

  if (!mediaSourceConnected) {
    try {
      mediaSourceNode = ctx.createMediaElementSource(mediaElement);
      mediaSourceNode.connect(ctx.destination);
      mediaSourceConnected = true;
    } catch {
      /* already connected in hot reload */
    }
  }

  return ctx;
};

/**
 * Safari/iOS: must run synchronously inside tap on "Enable Shake Mode".
 * Starts inaudible media loop + bridges it into Web Audio so shake can trigger sounds.
 */
export const unlockShakeAudio = () => {
  const ctx = ensureMediaBridge();
  if (!ctx || !mediaElement) return;

  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const playPromise = mediaElement.play();
  if (playPromise?.catch) playPromise.catch(() => {});

  shakeAudioUnlocked = true;
};

export const lockShakeAudio = () => {
  if (mediaElement) {
    mediaElement.pause();
    mediaElement.currentTime = 0;
  }
  shakeAudioUnlocked = false;
};

const playSfxElement = () => {
  try {
    const audio = new Audio(getSfxUrl());
    audio.volume = 0.75;
    audio.playsInline = true;
    audio.play().catch(() => false);
    return true;
  } catch {
    return false;
  }
};

/** ~620ms luminous reveal — fromShake uses media-bridge + Web Audio (Safari) */
export const playNodeSelectSound = ({ fromShake = false } = {}) => {
  if (!isSoundEnabled()) return;

  const ctx = getOrCreateContext();

  if (fromShake && shakeAudioUnlocked && ctx) {
    if (mediaElement?.paused) {
      mediaElement.play().catch(() => {});
    }
    if (ctx.state === "suspended") {
      ctx.resume().then(() => {
        try {
          playWebAudioSynth(ctx);
        } catch {
          playSfxElement();
        }
      }).catch(() => playSfxElement());
      return;
    }
    try {
      playWebAudioSynth(ctx);
    } catch {
      playSfxElement();
    }
    return;
  }

  if (ctx) {
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    try {
      playWebAudioSynth(ctx);
      return;
    } catch {
      /* fall through */
    }
  }

  playSfxElement();
};
