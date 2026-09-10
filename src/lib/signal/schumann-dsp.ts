export const SCHUMANN_MODES = [
  { id: "f1", hz: 7.83, label: "7.83 Hz" },
  { id: "f2", hz: 14.1, label: "14.1 Hz" },
  { id: "f3", hz: 20.8, label: "20.8 Hz" },
  { id: "f4", hz: 27.3, label: "27.3 Hz" },
  { id: "f5", hz: 33.8, label: "33.8 Hz" },
] as const;

export type SchumannId = (typeof SCHUMANN_MODES)[number]["id"];

export type SchumannLayers = Record<SchumannId, boolean>;

export const DEFAULT_SCHUMANN: SchumannLayers = {
  f1: true,
  f2: true,
  f3: true,
  f4: true,
  f5: true,
};

export const SCHUMANN_SAMPLE_RATE = 48_000;
export const SCHUMANN_SECONDS = 8;

export function renderSchumann(
  sampleRate: number,
  duration: number,
  layers: SchumannLayers,
): Float32Array {
  const n = Math.floor(sampleRate * duration);
  const out = new Float32Array(n);
  const gains = [0.35, 0.28, 0.22, 0.16, 0.12];
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    let s = 0;
    SCHUMANN_MODES.forEach((mode, idx) => {
      if (!layers[mode.id]) return;
      if (mode.hz >= sampleRate / 2) return;
      s += (gains[idx] ?? 0.1) * Math.sin(2 * Math.PI * mode.hz * t);
    });
    out[i] = s;
  }
  let peak = 1e-9;
  for (let i = 0; i < n; i++) {
    const a = Math.abs(out[i] ?? 0);
    if (a > peak) peak = a;
  }
  const g = 0.89 / peak;
  for (let i = 0; i < n; i++) out[i] = (out[i] ?? 0) * g;
  return out;
}
