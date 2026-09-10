import { SCHUMANN_MODES, type SchumannLayers } from "@/lib/signal/schumann-dsp";

export type SchumannGraph = {
  ctx: AudioContext;
  analyser: AnalyserNode;
  master: GainNode;
  osc: Map<string, OscillatorNode>;
  gains: Map<string, GainNode>;
};

export async function startSchumann(
  layers: SchumannLayers,
  volume: number,
): Promise<SchumannGraph> {
  const ctx = new AudioContext();
  if (ctx.state === "suspended") await ctx.resume();
  const master = ctx.createGain();
  master.gain.value = volume;
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.7;
  master.connect(analyser);
  analyser.connect(ctx.destination);

  const osc = new Map<string, OscillatorNode>();
  const gains = new Map<string, GainNode>();
  for (const mode of SCHUMANN_MODES) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = mode.hz;
    const g = ctx.createGain();
    g.gain.value = layers[mode.id] ? modeGain(mode.id) : 0;
    o.connect(g);
    g.connect(master);
    o.start();
    osc.set(mode.id, o);
    gains.set(mode.id, g);
  }

  return { ctx, analyser, master, osc, gains };
}

export function setSchumannLayers(graph: SchumannGraph, layers: SchumannLayers) {
  for (const mode of SCHUMANN_MODES) {
    const g = graph.gains.get(mode.id);
    if (!g) continue;
    g.gain.setTargetAtTime(
      layers[mode.id] ? modeGain(mode.id) : 0,
      graph.ctx.currentTime,
      0.04,
    );
  }
}

export function setSchumannVolume(graph: SchumannGraph, volume: number) {
  graph.master.gain.setTargetAtTime(volume, graph.ctx.currentTime, 0.04);
}

export async function stopSchumann(graph: SchumannGraph | null) {
  if (!graph) return;
  for (const o of graph.osc.values()) {
    try {
      o.stop();
    } catch {
      /* already stopped */
    }
  }
  await graph.ctx.close();
}

function modeGain(id: string): number {
  if (id === "f1") return 0.35;
  if (id === "f2") return 0.28;
  if (id === "f3") return 0.22;
  if (id === "f4") return 0.16;
  return 0.12;
}
