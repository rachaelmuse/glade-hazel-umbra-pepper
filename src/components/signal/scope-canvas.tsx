"use client";

import { useEffect, useRef } from "react";
import { previewBeacon, type HomecomingLayers } from "@/lib/signal/homecoming-dsp";

type Props = {
  identity: "homecoming" | "schumann";
  live: boolean;
  homecoming: HomecomingLayers;
  analyser: AnalyserNode | null;
};

export function ScopeCanvas({ identity, live, homecoming, analyser }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const time = new Float32Array(2048);
    let raf = 0;
    const started = performance.now();
    let running = true;

    const draw = () => {
      if (!running) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.42;
      const stroke = getComputedStyle(canvas).getPropertyValue("--color-fg").trim() || "#e6e8ee";
      const muted = getComputedStyle(canvas).getPropertyValue("--color-subtle").trim() || "#6d7380";

      ctx.strokeStyle = muted;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.35;
      for (const ring of [0.33, 0.66, 1]) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * ring, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();
      ctx.globalAlpha = 1;

      const n = 360;
      ctx.beginPath();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;

      if (identity === "schumann" && analyser && live) {
        analyser.getFloatTimeDomainData(time);
        for (let i = 0; i < n; i++) {
          const idx = Math.floor((i / n) * analyser.fftSize);
          const v = time[idx] ?? 0;
          const a = (i / n) * Math.PI * 2;
          const r = radius * (0.38 + 0.55 * (0.5 + 0.5 * v));
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else {
        const t0 = (performance.now() - started) / 1000;
        const env = live || identity === "homecoming" ? 1 : 0.18;
        for (let i = 0; i < n; i++) {
          const t = t0 + i / 240;
          const v = previewBeacon(t, homecoming) * env;
          const a = (i / n) * Math.PI * 2 + t0 * 0.35;
          const r = radius * (0.34 + 0.52 * Math.abs(v));
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [identity, live, homecoming, analyser]);

  return (
    <canvas
      ref={ref}
      className="size-full"
      aria-label="Signal scope"
    />
  );
}
