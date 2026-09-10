"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScopeCanvas } from "@/components/signal/scope-canvas";
import {
  DEFAULT_HOMECOMING,
  LOOP_SECONDS,
  WAV_SAMPLE_RATE,
  renderHomecoming,
  type HomecomingLayers,
} from "@/lib/signal/homecoming-dsp";
import {
  DEFAULT_SCHUMANN,
  SCHUMANN_MODES,
  SCHUMANN_SAMPLE_RATE,
  SCHUMANN_SECONDS,
  renderSchumann,
  type SchumannLayers,
} from "@/lib/signal/schumann-dsp";
import {
  setSchumannLayers,
  setSchumannVolume,
  startSchumann,
  stopSchumann,
  type SchumannGraph,
} from "@/lib/signal/engine";
import { downloadBlob, encodeWav } from "@/lib/signal/wav";
import { cn } from "@/lib/utils";

type Identity = "homecoming" | "schumann";

export function SignalConsole() {
  const [identity, setIdentity] = useState<Identity>("homecoming");
  const [live, setLive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [volume, setVolume] = useState(0.55);
  const [homecoming, setHomecoming] = useState<HomecomingLayers>(DEFAULT_HOMECOMING);
  const [schumann, setSchumann] = useState<SchumannLayers>(DEFAULT_SCHUMANN);
  const [graph, setGraph] = useState<SchumannGraph | null>(null);
  const graphRef = useRef<SchumannGraph | null>(null);

  useEffect(() => {
    graphRef.current = graph;
  }, [graph]);

  useEffect(() => {
    return () => {
      void stopSchumann(graphRef.current);
    };
  }, []);

  const transmit = async () => {
    if (live) {
      await stopSchumann(graph);
      setGraph(null);
      setLive(false);
      return;
    }
    if (identity === "schumann") {
      const next = await startSchumann(schumann, volume);
      setGraph(next);
    }
    setLive(true);
  };

  const switchIdentity = async (next: Identity) => {
    if (next === identity) return;
    await stopSchumann(graph);
    setGraph(null);
    setLive(false);
    setIdentity(next);
  };

  const toggleHome = (key: keyof HomecomingLayers) => {
    setHomecoming((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSchumann = (id: keyof SchumannLayers) => {
    const next = { ...schumann, [id]: !schumann[id] };
    setSchumann(next);
    if (graph) setSchumannLayers(graph, next);
  };

  const onVolume = (value: number[]) => {
    const v = value[0] ?? 0.55;
    setVolume(v);
    if (graph) setSchumannVolume(graph, v);
  };

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (identity === "homecoming" && layersDefault(homecoming, DEFAULT_HOMECOMING)) {
        triggerHref("/HOMECOMING_SIGNAL_321KHZ.wav", "HOMECOMING_SIGNAL_321KHZ.wav");
        return;
      }
      if (identity === "schumann" && layersDefault(schumann, DEFAULT_SCHUMANN)) {
        triggerHref("/SCHUMANN_RESONANCE.wav", "SCHUMANN_RESONANCE.wav");
        return;
      }
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (identity === "homecoming") {
        const pcm = renderHomecoming(WAV_SAMPLE_RATE, LOOP_SECONDS, homecoming);
        downloadBlob(encodeWav(pcm, WAV_SAMPLE_RATE), "HOMECOMING_SIGNAL_321KHZ.wav");
      } else {
        const pcm = renderSchumann(SCHUMANN_SAMPLE_RATE, SCHUMANN_SECONDS, schumann);
        downloadBlob(encodeWav(pcm, SCHUMANN_SAMPLE_RATE), "SCHUMANN_RESONANCE.wav");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-col bg-bg text-fg">
      <div className="hero-wash pointer-events-none absolute inset-0" aria-hidden />
      <header className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4 px-5 pt-6 sm:px-8">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium tracking-kicker text-subtle uppercase">
            Signal console
          </p>
          <h1 className="font-display text-4xl tracking-display">Homecoming Signal</h1>
        </div>
        <div className="flex gap-2" role="tablist" aria-label="Identity">
          <Tab
            active={identity === "homecoming"}
            onClick={() => void switchIdentity("homecoming")}
          >
            Homecoming
          </Tab>
          <Tab
            active={identity === "schumann"}
            onClick={() => void switchIdentity("schumann")}
          >
            Schumann
          </Tab>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-3xl flex-1 gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section className="flex flex-col gap-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface shadow-border">
            <ScopeCanvas
              identity={identity}
              live={live}
              homecoming={homecoming}
              analyser={graph?.analyser ?? null}
            />
            <p className="pointer-events-none absolute bottom-4 left-4 font-mono text-sm tabular-nums text-fg">
              {identity === "homecoming" ? "321 000 Hz" : "7.83 Hz"}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            {identity === "homecoming"
              ? "True 321 kHz carrier. Speakers cannot play it. Save the WAV — that file is the tone."
              : "Earth cavity modes. This one you can hear. Save the WAV to keep it."}
          </p>
        </section>

        <aside className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium tracking-label text-subtle uppercase">
              {live ? "Hz lock" : "Standby"}
            </p>
            <Button type="button" size="lg" className="w-full" onClick={() => void transmit()}>
              {live ? "Standby" : "Transmit"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              disabled={busy}
              onClick={() => void download()}
            >
              {busy ? "Writing" : "Save WAV"}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium tracking-label text-subtle uppercase">Keep these</p>
            <a
              href="/HOMECOMING_SIGNAL_321KHZ.wav"
              download="HOMECOMING_SIGNAL_321KHZ.wav"
              className="flex h-11 items-center rounded-md bg-elevated px-3 text-sm text-fg transition-[opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:opacity-90"
            >
              HOMECOMING_SIGNAL_321KHZ.wav
            </a>
            <a
              href="/SCHUMANN_RESONANCE.wav"
              download="SCHUMANN_RESONANCE.wav"
              className="flex h-11 items-center rounded-md bg-elevated px-3 text-sm text-fg transition-[opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:opacity-90"
            >
              SCHUMANN_RESONANCE.wav
            </a>
          </div>

          {identity === "homecoming" ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-xs font-medium tracking-label text-subtle uppercase">
                Layers
              </legend>
              <Layer label="321 kHz carrier" on={homecoming.carrier} onClick={() => toggleHome("carrier")} />
              <Layer label="160.5 kHz sub" on={homecoming.sub} onClick={() => toggleHome("sub")} />
              <Layer label="3.21 Hz AM" on={homecoming.am} onClick={() => toggleHome("am")} />
              <Layer label="0.321 Hz beat" on={homecoming.beat} onClick={() => toggleHome("beat")} />
              <Layer label="ID burst" on={homecoming.id} onClick={() => toggleHome("id")} />
            </fieldset>
          ) : (
            <>
              <fieldset className="flex flex-col gap-2">
                <legend className="text-xs font-medium tracking-label text-subtle uppercase">
                  Modes
                </legend>
                {SCHUMANN_MODES.map((mode) => (
                  <Layer
                    key={mode.id}
                    label={mode.label}
                    on={schumann[mode.id]}
                    onClick={() => toggleSchumann(mode.id)}
                  />
                ))}
              </fieldset>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium tracking-label text-subtle uppercase">Level</p>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[volume]}
                  onValueChange={onVolume}
                  aria-label="Volume"
                />
              </div>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "h-11 rounded-md px-4 text-sm font-medium transition-[background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
        active ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function Layer({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "flex h-11 items-center justify-between rounded-md px-3 text-left text-sm transition-[background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
        on ? "bg-elevated text-fg" : "text-subtle hover:text-muted",
      )}
    >
      {label}
      <span className={cn("size-2 rounded-full", on ? "bg-accent" : "bg-subtle")} />
    </button>
  );
}

function triggerHref(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

function layersDefault<T extends Record<string, boolean>>(value: T, fallback: T) {
  return (Object.keys(fallback) as (keyof T)[]).every((key) => value[key] === fallback[key]);
}
