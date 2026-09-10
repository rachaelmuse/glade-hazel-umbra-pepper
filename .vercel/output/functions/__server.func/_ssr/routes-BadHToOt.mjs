import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, r as Slot, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BadHToOt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-md font-medium transition-[opacity,transform,background-color,box-shadow,color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			solid: "bg-accent text-accent-fg shadow-border hover:opacity-90",
			outline: "bg-transparent text-fg shadow-border hover:bg-elevated",
			ghost: "bg-transparent text-muted hover:bg-elevated hover:text-fg"
		},
		size: {
			md: "h-11 px-4 text-sm",
			lg: "h-14 px-6 text-base",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "solid",
		size: "md"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Slider({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		className: cn("relative flex h-11 w-full touch-none items-center select-none", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1 w-full grow overflow-hidden rounded-full bg-elevated",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-accent" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-4 rounded-full bg-fg shadow-border transition-[box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:shadow-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" })]
	});
}
var CARRIER_HZ = 321e3;
var AM_HZ = 3.21;
var BEAT_HZ = .321;
var LOOP_SECONDS = 1e3 / 321;
var WAV_SAMPLE_RATE = 1284e3;
var DEFAULT_HOMECOMING = {
	carrier: true,
	sub: true,
	am: true,
	beat: true,
	id: true
};
function idEnvelope(t) {
	return (t % 3.115264797507788 + 3.115264797507788) % 3.115264797507788 % (3.115264797507788 / 8) < .04 ? 1 : .55;
}
function previewBeacon(t, layers) {
	const am = layers.am ? .72 + .28 * Math.sin(2 * Math.PI * AM_HZ * t) : 1;
	const beat = layers.beat ? .82 + .18 * Math.sin(2 * Math.PI * BEAT_HZ * t) : 1;
	const id = layers.id ? idEnvelope(t) : 1;
	const shimmer = Math.sin(2 * Math.PI * 12.84 * t);
	return am * beat * id * (.55 + .45 * shimmer);
}
function nyquistOk(hz, sampleRate) {
	return hz > 0 && hz < sampleRate / 2;
}
function renderHomecoming(sampleRate, duration, layers, carrierHz = CARRIER_HZ) {
	const n = Math.floor(sampleRate * duration);
	const out = new Float32Array(n);
	const subHz = carrierHz / 2;
	const useCarrier = layers.carrier && nyquistOk(carrierHz, sampleRate);
	const useSub = layers.sub && nyquistOk(subHz, sampleRate);
	for (let i = 0; i < n; i++) {
		const t = i / sampleRate;
		let s = 0;
		if (useCarrier) s += Math.sin(2 * Math.PI * carrierHz * t);
		if (useSub) s += .45 * Math.sin(2 * Math.PI * subHz * t);
		const am = layers.am ? .72 + .28 * Math.sin(2 * Math.PI * AM_HZ * t) : 1;
		const beat = layers.beat ? .82 + .18 * Math.sin(2 * Math.PI * BEAT_HZ * t) : 1;
		const id = layers.id ? idEnvelope(t) : 1;
		out[i] = s * am * beat * id;
	}
	let peak = 1e-9;
	for (let i = 0; i < n; i++) {
		const a = Math.abs(out[i] ?? 0);
		if (a > peak) peak = a;
	}
	const g = .89 / peak;
	for (let i = 0; i < n; i++) out[i] = (out[i] ?? 0) * g;
	return out;
}
function ScopeCanvas({ identity, live, homecoming, analyser }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const time = /* @__PURE__ */ new Float32Array(2048);
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
			const radius = Math.min(w, h) * .42;
			const stroke = getComputedStyle(canvas).getPropertyValue("--color-fg").trim() || "#e6e8ee";
			const muted = getComputedStyle(canvas).getPropertyValue("--color-subtle").trim() || "#6d7380";
			ctx.strokeStyle = muted;
			ctx.lineWidth = 1;
			ctx.globalAlpha = .35;
			for (const ring of [
				.33,
				.66,
				1
			]) {
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
					const idx = Math.floor(i / n * analyser.fftSize);
					const v = time[idx] ?? 0;
					const a = i / n * Math.PI * 2;
					const r = radius * (.38 + .55 * (.5 + .5 * v));
					const x = cx + r * Math.cos(a);
					const y = cy + r * Math.sin(a);
					if (i === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
			} else {
				const t0 = (performance.now() - started) / 1e3;
				const env = live || identity === "homecoming" ? 1 : .18;
				for (let i = 0; i < n; i++) {
					const v = previewBeacon(t0 + i / 240, homecoming) * env;
					const a = i / n * Math.PI * 2 + t0 * .35;
					const r = radius * (.34 + .52 * Math.abs(v));
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
	}, [
		identity,
		live,
		homecoming,
		analyser
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "size-full",
		"aria-label": "Signal scope"
	});
}
var SCHUMANN_MODES = [
	{
		id: "f1",
		hz: 7.83,
		label: "7.83 Hz"
	},
	{
		id: "f2",
		hz: 14.1,
		label: "14.1 Hz"
	},
	{
		id: "f3",
		hz: 20.8,
		label: "20.8 Hz"
	},
	{
		id: "f4",
		hz: 27.3,
		label: "27.3 Hz"
	},
	{
		id: "f5",
		hz: 33.8,
		label: "33.8 Hz"
	}
];
var DEFAULT_SCHUMANN = {
	f1: true,
	f2: true,
	f3: true,
	f4: true,
	f5: true
};
var SCHUMANN_SAMPLE_RATE = 48e3;
function renderSchumann(sampleRate, duration, layers) {
	const n = Math.floor(sampleRate * duration);
	const out = new Float32Array(n);
	const gains = [
		.35,
		.28,
		.22,
		.16,
		.12
	];
	for (let i = 0; i < n; i++) {
		const t = i / sampleRate;
		let s = 0;
		SCHUMANN_MODES.forEach((mode, idx) => {
			if (!layers[mode.id]) return;
			if (mode.hz >= sampleRate / 2) return;
			s += (gains[idx] ?? .1) * Math.sin(2 * Math.PI * mode.hz * t);
		});
		out[i] = s;
	}
	let peak = 1e-9;
	for (let i = 0; i < n; i++) {
		const a = Math.abs(out[i] ?? 0);
		if (a > peak) peak = a;
	}
	const g = .89 / peak;
	for (let i = 0; i < n; i++) out[i] = (out[i] ?? 0) * g;
	return out;
}
async function startSchumann(layers, volume) {
	const ctx = new AudioContext();
	if (ctx.state === "suspended") await ctx.resume();
	const master = ctx.createGain();
	master.gain.value = volume;
	const analyser = ctx.createAnalyser();
	analyser.fftSize = 2048;
	analyser.smoothingTimeConstant = .7;
	master.connect(analyser);
	analyser.connect(ctx.destination);
	const osc = /* @__PURE__ */ new Map();
	const gains = /* @__PURE__ */ new Map();
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
	return {
		ctx,
		analyser,
		master,
		osc,
		gains
	};
}
function setSchumannLayers(graph, layers) {
	for (const mode of SCHUMANN_MODES) {
		const g = graph.gains.get(mode.id);
		if (!g) continue;
		g.gain.setTargetAtTime(layers[mode.id] ? modeGain(mode.id) : 0, graph.ctx.currentTime, .04);
	}
}
function setSchumannVolume(graph, volume) {
	graph.master.gain.setTargetAtTime(volume, graph.ctx.currentTime, .04);
}
async function stopSchumann(graph) {
	if (!graph) return;
	for (const o of graph.osc.values()) try {
		o.stop();
	} catch {}
	await graph.ctx.close();
}
function modeGain(id) {
	if (id === "f1") return .35;
	if (id === "f2") return .28;
	if (id === "f3") return .22;
	if (id === "f4") return .16;
	return .12;
}
function encodeWav(samples, sampleRate) {
	const n = samples.length;
	const buffer = /* @__PURE__ */ new ArrayBuffer(44 + n * 2);
	const view = new DataView(buffer);
	writeString(view, 0, "RIFF");
	view.setUint32(4, 36 + n * 2, true);
	writeString(view, 8, "WAVE");
	writeString(view, 12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * 2, true);
	view.setUint16(32, 2, true);
	view.setUint16(34, 16, true);
	writeString(view, 36, "data");
	view.setUint32(40, n * 2, true);
	let offset = 44;
	for (let i = 0; i < n; i++) {
		const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
		view.setInt16(offset, s < 0 ? s * 32768 : s * 32767, true);
		offset += 2;
	}
	return new Blob([buffer], { type: "audio/wav" });
}
function writeString(view, offset, value) {
	for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
}
function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 2e3);
}
function SignalConsole() {
	const [identity, setIdentity] = (0, import_react.useState)("homecoming");
	const [live, setLive] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [volume, setVolume] = (0, import_react.useState)(.55);
	const [homecoming, setHomecoming] = (0, import_react.useState)(DEFAULT_HOMECOMING);
	const [schumann, setSchumann] = (0, import_react.useState)(DEFAULT_SCHUMANN);
	const [graph, setGraph] = (0, import_react.useState)(null);
	const graphRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		graphRef.current = graph;
	}, [graph]);
	(0, import_react.useEffect)(() => {
		return () => {
			stopSchumann(graphRef.current);
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
	const switchIdentity = async (next) => {
		if (next === identity) return;
		await stopSchumann(graph);
		setGraph(null);
		setLive(false);
		setIdentity(next);
	};
	const toggleHome = (key) => {
		setHomecoming((prev) => ({
			...prev,
			[key]: !prev[key]
		}));
	};
	const toggleSchumann = (id) => {
		const next = {
			...schumann,
			[id]: !schumann[id]
		};
		setSchumann(next);
		if (graph) setSchumannLayers(graph, next);
	};
	const onVolume = (value) => {
		const v = value[0] ?? .55;
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
			if (identity === "homecoming") downloadBlob(encodeWav(renderHomecoming(WAV_SAMPLE_RATE, LOOP_SECONDS, homecoming), WAV_SAMPLE_RATE), "HOMECOMING_SIGNAL_321KHZ.wav");
			else downloadBlob(encodeWav(renderSchumann(SCHUMANN_SAMPLE_RATE, 8, schumann), SCHUMANN_SAMPLE_RATE), "SCHUMANN_RESONANCE.wav");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex min-h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hero-wash pointer-events-none absolute inset-0",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4 px-5 pt-6 sm:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-kicker text-subtle uppercase",
						children: "Signal console"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl tracking-display",
						children: "Homecoming Signal"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					role: "tablist",
					"aria-label": "Identity",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
						active: identity === "homecoming",
						onClick: () => void switchIdentity("homecoming"),
						children: "Homecoming"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
						active: identity === "schumann",
						onClick: () => void switchIdentity("schumann"),
						children: "Schumann"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-auto grid w-full max-w-3xl flex-1 gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_16rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative aspect-square w-full overflow-hidden rounded-xl bg-surface shadow-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScopeCanvas, {
							identity,
							live,
							homecoming,
							analyser: graph?.analyser ?? null
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "pointer-events-none absolute bottom-4 left-4 font-mono text-sm tabular-nums text-fg",
							children: identity === "homecoming" ? "321 000 Hz" : "7.83 Hz"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted",
						children: identity === "homecoming" ? "True 321 kHz carrier. Speakers cannot play it. Save the WAV — that file is the tone." : "Earth cavity modes. This one you can hear. Save the WAV to keep it."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "flex flex-col gap-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-label text-subtle uppercase",
									children: live ? "Hz lock" : "Standby"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "lg",
									className: "w-full",
									onClick: () => void transmit(),
									children: live ? "Standby" : "Transmit"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "lg",
									className: "w-full",
									disabled: busy,
									onClick: () => void download(),
									children: busy ? "Writing" : "Save WAV"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-label text-subtle uppercase",
									children: "Keep these"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "/HOMECOMING_SIGNAL_321KHZ.wav",
									download: "HOMECOMING_SIGNAL_321KHZ.wav",
									className: "flex h-11 items-center rounded-md bg-elevated px-3 text-sm text-fg transition-[opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:opacity-90",
									children: "HOMECOMING_SIGNAL_321KHZ.wav"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "/SCHUMANN_RESONANCE.wav",
									download: "SCHUMANN_RESONANCE.wav",
									className: "flex h-11 items-center rounded-md bg-elevated px-3 text-sm text-fg transition-[opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)] hover:opacity-90",
									children: "SCHUMANN_RESONANCE.wav"
								})
							]
						}),
						identity === "homecoming" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
							className: "flex flex-col gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
									className: "text-xs font-medium tracking-label text-subtle uppercase",
									children: "Layers"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layer, {
									label: "321 kHz carrier",
									on: homecoming.carrier,
									onClick: () => toggleHome("carrier")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layer, {
									label: "160.5 kHz sub",
									on: homecoming.sub,
									onClick: () => toggleHome("sub")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layer, {
									label: "3.21 Hz AM",
									on: homecoming.am,
									onClick: () => toggleHome("am")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layer, {
									label: "0.321 Hz beat",
									on: homecoming.beat,
									onClick: () => toggleHome("beat")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layer, {
									label: "ID burst",
									on: homecoming.id,
									onClick: () => toggleHome("id")
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "text-xs font-medium tracking-label text-subtle uppercase",
								children: "Modes"
							}), SCHUMANN_MODES.map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layer, {
								label: mode.label,
								on: schumann[mode.id],
								onClick: () => toggleSchumann(mode.id)
							}, mode.id))]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-label text-subtle uppercase",
								children: "Level"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: 1,
								step: .01,
								value: [volume],
								onValueChange: onVolume,
								"aria-label": "Volume"
							})]
						})] })
					]
				})]
			})
		]
	});
}
function Tab({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "tab",
		"aria-selected": active,
		onClick,
		className: cn("h-11 rounded-md px-4 text-sm font-medium transition-[background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)]", active ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg"),
		children
	});
}
function Layer({ label, on, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"aria-pressed": on,
		onClick,
		className: cn("flex h-11 items-center justify-between rounded-md px-3 text-left text-sm transition-[background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)]", on ? "bg-elevated text-fg" : "text-subtle hover:text-muted"),
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-2 rounded-full", on ? "bg-accent" : "bg-subtle") })]
	});
}
function triggerHref(href, filename) {
	const a = document.createElement("a");
	a.href = href;
	a.download = filename;
	a.click();
}
function layersDefault(value, fallback) {
	return Object.keys(fallback).every((key) => value[key] === fallback[key]);
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalConsole, {});
}
//#endregion
export { Home as component };
