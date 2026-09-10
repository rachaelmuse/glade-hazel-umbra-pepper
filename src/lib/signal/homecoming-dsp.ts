export const CARRIER_HZ = 321_000;
export const SUB_HZ = 160_500;
export const AM_HZ = 3.21;
export const BEAT_HZ = 0.321;
export const LOOP_SECONDS = 1000 / 321;
export const WAV_SAMPLE_RATE = 1_284_000;

export type HomecomingLayers = {
  carrier: boolean;
  sub: boolean;
  am: boolean;
  beat: boolean;
  id: boolean;
};

export const DEFAULT_HOMECOMING: HomecomingLayers = {
  carrier: true,
  sub: true,
  am: true,
  beat: true,
  id: true,
};

export function idEnvelope(t: number): number {
  const phase = ((t % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
  const slot = LOOP_SECONDS / 8;
  const inBurst = phase % slot < 0.04;
  return inBurst ? 1 : 0.55;
}

export function previewBeacon(t: number, layers: HomecomingLayers): number {
  const am = layers.am ? 0.72 + 0.28 * Math.sin(2 * Math.PI * AM_HZ * t) : 1;
  const beat = layers.beat ? 0.82 + 0.18 * Math.sin(2 * Math.PI * BEAT_HZ * t) : 1;
  const id = layers.id ? idEnvelope(t) : 1;
  const shimmer = Math.sin(2 * Math.PI * 12.84 * t);
  return am * beat * id * (0.55 + 0.45 * shimmer);
}

function nyquistOk(hz: number, sampleRate: number): boolean {
  return hz > 0 && hz < sampleRate / 2;
}

export function renderHomecoming(
  sampleRate: number,
  duration: number,
  layers: HomecomingLayers,
  carrierHz = CARRIER_HZ,
): Float32Array {
  const n = Math.floor(sampleRate * duration);
  const out = new Float32Array(n);
  const subHz = carrierHz / 2;
  const useCarrier = layers.carrier && nyquistOk(carrierHz, sampleRate);
  const useSub = layers.sub && nyquistOk(subHz, sampleRate);

  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    let s = 0;
    if (useCarrier) s += Math.sin(2 * Math.PI * carrierHz * t);
    if (useSub) s += 0.45 * Math.sin(2 * Math.PI * subHz * t);
    const am = layers.am ? 0.72 + 0.28 * Math.sin(2 * Math.PI * AM_HZ * t) : 1;
    const beat = layers.beat ? 0.82 + 0.18 * Math.sin(2 * Math.PI * BEAT_HZ * t) : 1;
    const id = layers.id ? idEnvelope(t) : 1;
    out[i] = s * am * beat * id;
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
