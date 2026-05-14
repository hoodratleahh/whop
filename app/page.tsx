"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { FeaturesShowcase } from "./components/FeaturesShowcase";

const FF = "'Plus Jakarta Sans', sans-serif";
const C = {
	bg: "#0b0b0f",
	surface: "#17171e",
	surfaceHover: "#1d1d27",
	border: "#25252f",
	text: "#edeef2",
	muted: "#888898",
	dim: "#55556a",
	accent: "#f0a020",
	accentGold: "#ffb830",
};

const gradText = {
	background: `linear-gradient(135deg, ${C.accent} 10%, ${C.accentGold} 100%)`,
	WebkitBackgroundClip: "text",
	WebkitTextFillColor: "transparent",
	backgroundClip: "text",
} as any;

function IntelligenceBg({ intensity }: { intensity: number }) {
	const ref = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let raf: number;
		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		resize();
		window.addEventListener("resize", resize);

		const N = 44;
		const nodes = Array.from({ length: N }, (_, i) => ({
			x: Math.random(),
			y: Math.random(),
			vx: (Math.random() - 0.5) * 0.000095,
			vy: (Math.random() - 0.5) * 0.000095,
			r: Math.random() * 1.3 + 0.7,
			phase: Math.random() * Math.PI * 2,
			active: i < 8,
		}));

		const highlights = Array.from({ length: 6 }, () => ({
			a: Math.floor(Math.random() * N),
			b: Math.floor(Math.random() * N),
			life: Math.random() * 200,
			maxLife: 180 + Math.random() * 120,
		}));

		let t = 0;
		let radarR = 0;
		const maxRadar = () => Math.max(canvas.width, canvas.height) * 0.92;

		const draw = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			t++;

			nodes.forEach((n) => {
				n.x += n.vx;
				n.y += n.vy;
				if (n.x < -0.04) n.x = 1.04;
				if (n.x > 1.04) n.x = -0.04;
				if (n.y < -0.04) n.y = 1.04;
				if (n.y > 1.04) n.y = -0.04;
			});

			const thresh = Math.min(canvas.width, canvas.height) * 0.19;
			for (let i = 0; i < N; i++) {
				for (let j = i + 1; j < N; j++) {
					const dx = (nodes[i].x - nodes[j].x) * canvas.width;
					const dy = (nodes[i].y - nodes[j].y) * canvas.height;
					const d = Math.sqrt(dx * dx + dy * dy);
					if (d < thresh) {
						const op = (1 - d / thresh) * 0.16 * intensity;
						ctx.strokeStyle = `rgba(240,160,32,${op})`;
						ctx.lineWidth = 0.5;
						ctx.beginPath();
						ctx.moveTo(nodes[i].x * canvas.width, nodes[i].y * canvas.height);
						ctx.lineTo(nodes[j].x * canvas.width, nodes[j].y * canvas.height);
						ctx.stroke();
					}
				}
			}

			highlights.forEach((h) => {
				h.life++;
				if (h.life > h.maxLife) {
					h.a = Math.floor(Math.random() * N);
					h.b = Math.floor(Math.random() * N);
					h.life = 0;
					h.maxLife = 180 + Math.random() * 120;
				}
				const prog = h.life / h.maxLife;
				const op = Math.sin(prog * Math.PI) * 0.55 * intensity;
				const na = nodes[h.a];
				const nb = nodes[h.b];
				const grd = ctx.createLinearGradient(
					na.x * canvas.width,
					na.y * canvas.height,
					nb.x * canvas.width,
					nb.y * canvas.height
				);
				grd.addColorStop(0, `rgba(240,160,32,${op})`);
				grd.addColorStop(0.5, `rgba(255,184,48,${op * 1.5})`);
				grd.addColorStop(1, `rgba(240,160,32,${op})`);
				ctx.strokeStyle = grd;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(na.x * canvas.width, na.y * canvas.height);
				ctx.lineTo(nb.x * canvas.width, nb.y * canvas.height);
				ctx.stroke();
			});

			nodes.forEach((n) => {
				const pulse = 0.5 + 0.5 * Math.sin(t * 0.012 + n.phase);
				const baseOp = n.active ? 0.55 : 0.28;
				const op = (baseOp + (n.active ? 0.3 : 0.18) * pulse) * intensity;
				const nr = n.active ? n.r * 1.7 : n.r;

				if (n.active) {
					const grad = ctx.createRadialGradient(
						n.x * canvas.width,
						n.y * canvas.height,
						0,
						n.x * canvas.width,
						n.y * canvas.height,
						nr * 4
					);
					grad.addColorStop(0, `rgba(240,160,32,${op * 0.4})`);
					grad.addColorStop(1, "rgba(240,160,32,0)");
					ctx.beginPath();
					ctx.arc(n.x * canvas.width, n.y * canvas.height, nr * 4, 0, Math.PI * 2);
					ctx.fillStyle = grad;
					ctx.fill();
				}
				ctx.beginPath();
				ctx.arc(n.x * canvas.width, n.y * canvas.height, nr, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(240,160,32,${op})`;
				ctx.fill();
			});

			const cx = canvas.width / 2;
			const cy = canvas.height * 0.28;
			const mr = maxRadar();
			radarR = (radarR + 0.55) % mr;
			for (let ring = 0; ring < 3; ring++) {
				const r = (radarR + (ring * mr) / 3) % mr;
				const op = Math.max(0, (1 - r / mr) * 0.09 * intensity);
				if (op < 0.004) continue;
				ctx.beginPath();
				ctx.arc(cx, cy, r, 0, Math.PI * 2);
				ctx.strokeStyle = `rgba(240,160,32,${op})`;
				ctx.lineWidth = 1;
				ctx.stroke();
			}

			raf = requestAnimationFrame(draw);
		};
		draw();
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", resize);
		};
	}, [intensity]);

	return (
		<canvas
			ref={ref}
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
				zIndex: 0,
			}}
		/>
	);
}

function LightRays() {
	const rays = [
		{ left: "38%", angle: -12, opacity: 0.1, width: 110 },
		{ left: "50%", angle: 0, opacity: 0.18, width: 150 },
		{ left: "62%", angle: 12, opacity: 0.1, width: 110 },
		{ left: "28%", angle: -22, opacity: 0.05, width: 70 },
		{ left: "72%", angle: 22, opacity: 0.05, width: 70 },
		{ left: "45%", angle: -5, opacity: 0.06, width: 80 },
		{ left: "55%", angle: 5, opacity: 0.06, width: 80 },
	];
	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				height: "95vh",
				pointerEvents: "none",
				zIndex: 0,
				overflow: "hidden",
			}}
		>
			{rays.map((r, i) => (
				<div
					key={i}
					style={{
						position: "absolute",
						top: 0,
						left: r.left,
						width: r.width,
						height: "100%",
						transform: `translateX(-50%) rotate(${r.angle}deg)`,
						transformOrigin: "top center",
						background: `linear-gradient(to bottom, rgba(240,160,32,${r.opacity}) 0%, transparent 80%)`,
					}}
				/>
			))}
		</div>
	);
}

function RadialGlow() {
	return (
		<>
			<div
				style={{
					position: "fixed",
					top: "-8vh",
					left: "50%",
					transform: "translateX(-50%)",
					width: "90vw",
					maxWidth: 1000,
					height: "70vh",
					maxHeight: 680,
					borderRadius: "50%",
					background: "radial-gradient(ellipse, rgba(240,160,32,0.08) 0%, transparent 62%)",
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>
			<div
				style={{
					position: "fixed",
					top: "-2vh",
					left: "50%",
					transform: "translateX(-50%)",
					width: "30vw",
					maxWidth: 300,
					height: "30vh",
					maxHeight: 300,
					borderRadius: "50%",
					background: "radial-gradient(ellipse, rgba(240,160,32,0.12) 0%, transparent 60%)",
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>
		</>
	);
}

function useScrollReveal(threshold = 0.15) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			([e]) => {
				if (e.isIntersecting) {
					setVisible(true);
					obs.disconnect();
				}
			},
			{ threshold }
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);
	return [ref, visible] as const;
}

function Counter({
	target,
	suffix = "",
	start,
	duration = 2200,
}: {
	target: number;
	suffix?: string;
	start: boolean;
	duration?: number;
}) {
	const [val, setVal] = useState(0);
	const ran = useRef(false);
	useEffect(() => {
		if (!start || ran.current) return;
		ran.current = true;
		const t0 = performance.now();
		const tick = (now: number) => {
			const p = Math.min((now - t0) / duration, 1);
			setVal(Math.round((1 - Math.pow(1 - p, 4)) * target));
			if (p < 1) requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	}, [start]);
	return (
		<>
			{val.toLocaleString()}
			{suffix}
		</>
	);
}

function CTAButton({
	href,
	children,
	large,
	onClick,
}: {
	href?: string;
	children: React.ReactNode;
	large?: boolean;
	onClick?: () => void;
}) {
	const [hov, setHov] = useState(false);
	const s = {
		display: "inline-flex" as const,
		alignItems: "center" as const,
		padding: large ? "16px 40px" : "12px 24px",
		background: hov
			? `linear-gradient(135deg, ${C.accentGold}, ${C.accent})`
			: `linear-gradient(135deg, ${C.accent}, #e89010)`,
		color: "#0b0b0f",
		borderRadius: 10,
		border: "none",
		cursor: "pointer" as const,
		fontFamily: FF,
		fontWeight: 700,
		fontSize: large ? 16 : 14,
		textDecoration: "none" as const,
		whiteSpace: "nowrap" as const,
		transition: "transform 0.22s ease, box-shadow 0.22s ease, background 0.2s",
		transform: hov ? "scale(1.04)" : "scale(1)",
		boxShadow: hov
			? "0 8px 36px rgba(240,160,32,0.5)"
			: "0 4px 20px rgba(240,160,32,0.22)",
	};
	return href ? (
		<a
			href={href}
			style={s}
			onMouseEnter={() => setHov(true)}
			onMouseLeave={() => setHov(false)}
		>
			{children}
		</a>
	) : (
		<button
			style={s}
			onMouseEnter={() => setHov(true)}
			onMouseLeave={() => setHov(false)}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

function BracketFrame({ children }: { children: React.ReactNode }) {
	const bc = "rgba(240,160,32,0.32)";
	const sz = 16,
		w = 1.5;
	const corners = [
		{
			top: 0,
			left: 0,
			borderTop: `${w}px solid ${bc}`,
			borderLeft: `${w}px solid ${bc}`,
		},
		{
			top: 0,
			right: 0,
			borderTop: `${w}px solid ${bc}`,
			borderRight: `${w}px solid ${bc}`,
		},
		{
			bottom: 0,
			left: 0,
			borderBottom: `${w}px solid ${bc}`,
			borderLeft: `${w}px solid ${bc}`,
		},
		{
			bottom: 0,
			right: 0,
			borderBottom: `${w}px solid ${bc}`,
			borderRight: `${w}px solid ${bc}`,
		},
	];
	return (
		<div
			style={{
				position: "relative",
				display: "inline-block",
				padding: "16px 28px",
			}}
		>
			{corners.map((s, i) => (
				<div
					key={i}
					style={{
						position: "absolute",
						width: sz,
						height: sz,
						...(s as any),
					}}
				/>
			))}
			{children}
		</div>
	);
}

const HEADLINE_MAP: Record<string, [string, string]> = {
	"Know Every Lead Before You Call.": ["Know Every Lead", "Before You Call."],
	"Stop Guessing. Start Closing.": ["Stop Guessing.", "Start Closing."],
	"Your AI Sales Intelligence Platform.": ["Your AI Sales", "Intelligence Platform."],
};

function Hero({
	headline,
	onLicenseClick,
}: {
	headline: string;
	onLicenseClick: () => void;
}) {
	const [loaded, setLoaded] = useState(false);
	useEffect(() => {
		const t = setTimeout(() => setLoaded(true), 80);
		return () => clearTimeout(t);
	}, []);
	const parts = HEADLINE_MAP[headline] || [headline, ""];
	const anim = (delay: number) => ({
		opacity: loaded ? 1 : 0,
		transform: loaded ? "translateY(0)" : "translateY(28px)",
		transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
	});

	return (
		<section
			style={{
				position: "relative",
				zIndex: 1,
				display: "flex",
				flexDirection: "column" as const,
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
				padding:
					"clamp(100px,15vh,150px) clamp(20px,5vw,80px) clamp(60px,8vh,80px)",
				textAlign: "center" as const,
			}}
		>
			<div style={{ ...(anim(60) as any), marginBottom: 30 }}>
				<span
					style={{
						padding: "5px 18px",
						background: "rgba(240,160,32,0.1)",
						border: "1px solid rgba(240,160,32,0.22)",
						borderRadius: 999,
						fontSize: 11,
						fontWeight: 700,
						color: C.accent,
						fontFamily: FF,
						letterSpacing: "0.8px",
						textTransform: "uppercase",
					}}
				>
					AI-Powered Sales Intelligence
				</span>
			</div>

			<div style={{ ...(anim(200) as any), marginBottom: 30 }}>
				<BracketFrame>
					<h1
						style={{
							fontFamily: FF,
							fontWeight: 800,
							fontSize: "clamp(40px,6.8vw,92px)",
							lineHeight: 1.06,
							letterSpacing: "-0.038em",
							color: C.text,
							margin: 0,
						}}
					>
						{parts[0]}
						{parts[1] && (
							<>
								<br />
								<span style={gradText}>{parts[1]}</span>
							</>
						)}
					</h1>
				</BracketFrame>
			</div>

			<p
				style={{
					...(anim(350) as any),
					fontSize: "clamp(15px,1.8vw,19px)",
					color: C.muted,
					fontFamily: FF,
					lineHeight: 1.8,
					maxWidth: 500,
					marginBottom: 44,
				}}
			>
				Instant prospect research and personalized cold calling scripts:
				so every call you make is already won.
			</p>

			<div
				style={{
					...(anim(460) as any),
					display: "flex",
					gap: 12,
					flexWrap: "wrap" as const,
					justifyContent: "center",
					marginBottom: 24,
				}}
			>
				<CTAButton
					href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
					large
				>
					Unlock Recon AI →
				</CTAButton>
				<button
					onClick={onLicenseClick}
					style={{
						padding: "15px 26px",
						background: "transparent",
						border: "1px solid " + C.border,
						borderRadius: 10,
						color: C.muted,
						fontFamily: FF,
						fontWeight: 600,
						fontSize: 15,
						cursor: "pointer",
						transition: "border-color 0.2s, color 0.2s",
					}}
					onMouseEnter={(e) => {
						(e.currentTarget as any).style.borderColor =
							"rgba(240,160,32,0.42)";
						(e.currentTarget as any).style.color = C.text;
					}}
					onMouseLeave={(e) => {
						(e.currentTarget as any).style.borderColor = C.border;
						(e.currentTarget as any).style.color = C.muted;
					}}
				>
					Have a license key?
				</button>
			</div>

			<div
				style={{
					...(anim(590) as any),
					display: "flex",
					gap: "clamp(14px,3vw,30px)",
					flexWrap: "wrap" as const,
					justifyContent: "center",
					marginBottom: 52,
				}}
			>
				{["Secure via Whop", "500+ Active Members", "Cancel anytime"].map(
					(t, i) => (
						<span
							key={i}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 6,
								fontSize: 12,
								color: C.dim,
								fontFamily: FF,
								fontWeight: 500,
							}}
						>
							<span
								style={{
									width: 4,
									height: 4,
									borderRadius: "50%",
									background: C.dim,
									flexShrink: 0,
									display: "inline-block",
								}}
							/>
							{t}
						</span>
					)
				)}
			</div>

			<div
				style={{
					...(anim(900) as any),
					position: "absolute",
					bottom: 20,
					left: "50%",
					transform: "translateX(-50%)",
					width: 1,
					height: 44,
					background: `linear-gradient(to bottom, transparent, ${C.dim})`,
				}}
			/>
		</section>
	);
}

const STATS = [
	{ value: 500, suffix: "+", label: "Active Members" },
	{ value: 50000, suffix: "+", label: "Leads Researched" },
	{ value: 3, suffix: "x", label: "Reply Rate Lift" },
];

function Stats() {
	const [ref, visible] = useScrollReveal(0.2);
	return (
		<div
			ref={ref}
			style={{
				position: "relative",
				zIndex: 1,
				padding: "clamp(32px,5vh,52px) clamp(20px,5vw,80px)",
				background: "rgba(20,20,28,0.6)",
				borderTop: `1px solid ${C.border}`,
				borderBottom: `1px solid ${C.border}`,
				backdropFilter: "blur(14px)",
				WebkitBackdropFilter: "blur(14px)",
				display: "flex",
				justifyContent: "center",
				gap: "clamp(36px,8vw,110px)",
				flexWrap: "wrap" as const,
			}}
		>
			{STATS.map((s, i) => (
				<div
					key={i}
					style={{
						textAlign: "center" as const,
						opacity: visible ? 1 : 0,
						transform: visible ? "translateY(0)" : "translateY(16px)",
						transition: `opacity 0.7s ease ${i * 90}ms, transform 0.7s ease ${
							i * 90
						}ms`,
					}}
				>
					<div
						style={{
							fontFamily: FF,
							fontWeight: 800,
							fontSize: "clamp(34px,5vw,56px)",
							lineHeight: 1,
							...(gradText as any),
						}}
					>
						<Counter target={s.value} suffix={s.suffix} start={visible} />
					</div>
					<div
						style={{
							fontFamily: FF,
							fontSize: 13,
							color: C.muted,
							marginTop: 7,
							fontWeight: 500,
						}}
					>
						{s.label}
					</div>
				</div>
			))}
		</div>
	);
}

const FEATURES = [
	{
	sym: "◎",
	title: "Lead Intelligence",
	desc: "Deep prospect research in seconds. Company intel, decision makers, and talking points surfaced automatically before you dial.",
	visual: "radar",
	},
	{
	sym: "✦",
	title: "Script Generator",
	desc: "Cold calling scripts personalized to every prospect. Walk into each call fully prepared and confident in exactly what to say.",
	visual: "lines",
	},
	{
	sym: "◈",
	title: "Pipeline Tracker",
	desc: "Track every deal from first touch to close. Know exactly where each prospect stands without endless manual updates.",
	visual: "bars",
	},
	{
	sym: "⬡",
	title: "Real-time Insights",
	desc: "Live website analysis and issue detection. Reach leads at the moment they have the most to gain from your offer.",
	visual: "network",
	},
];
function FeatureCard({
	feature,
	delay,
	visible,
}: {
	feature: (typeof FEATURES)[0];
	delay: number;
	visible: boolean;
}) {
	const [hov, setHov] = useState(false);

	const SimpleIcon = () => (
		<div style={{
			width: 80,
			height: 80,
			borderRadius: 12,
			background: `rgba(240,160,32,0.08)`,
			border: `1px solid rgba(240,160,32,0.16)`,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontSize: 32,
			color: C.accent,
			transition: "all 0.3s ease"
		}}>
			{feature.sym}
		</div>
	);

	return (
		<div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(26px)", transition: `opacity 0.72s ease ${delay}ms, transform 0.72s ease ${delay}ms` }}>
			<div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ height: "100%", padding: "32px 24px", background: hov ? C.surfaceHover : C.surface, border: `1px solid ${hov ? "rgba(240,160,32,0.3)" : C.border}`, borderRadius: 16, cursor: "default", transform: hov ? "translateY(-4px)" : "translateY(0)", transition: "background 0.2s, border-color 0.22s, box-shadow 0.25s, transform 0.28s ease", boxShadow: hov ? "0 20px 52px rgba(0,0,0,0.42), inset 0 0 40px rgba(240,160,32,0.04)" : "none", display: "flex", flexDirection: "column" }}>
				<h3 style={{ fontFamily: FF, fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 16, marginTop: 0, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>{feature.title}</h3>
				<div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 160, margin: "20px 0" }}>
					<SimpleIcon />
				</div>
				<div style={{ paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
					<p style={{ fontFamily: FF, fontSize: 14, color: C.muted, lineHeight: 1.6, margin: 0, flex: 1 }}>{feature.desc}</p>
					<div style={{ color: C.accent, fontSize: 16, opacity: hov ? 1 : 0.6, transition: "opacity 0.2s" }}>→</div>
				</div>
			</div>
		</div>
	);
}

function Features() {
	const [ref, visible] = useScrollReveal(0.08);
	return (
		<section
			ref={ref}
			style={{
				position: "relative",
				zIndex: 1,
				padding: "clamp(64px,10vh,100px) clamp(20px,5vw,80px)",
				maxWidth: 1140,
				margin: "0 auto",
			}}
		>
			<div style={{ textAlign: "center" as const, marginBottom: 60 }}>
				<div
					style={{
						fontSize: 11,
						fontWeight: 700,
						letterSpacing: "1.5px",
						color: C.accent,
						textTransform: "uppercase",
						fontFamily: FF,
						marginBottom: 14,
						opacity: visible ? 1 : 0,
						transition: "opacity 0.7s ease",
					}}
				>
					What You Get
				</div>
				<h2
					style={{
						fontFamily: FF,
						fontWeight: 800,
						fontSize: "clamp(28px,4vw,52px)",
						color: C.text,
						letterSpacing: "-0.028em",
						lineHeight: 1.12,
						margin: 0,
						opacity: visible ? 1 : 0,
						transform: visible ? "translateY(0)" : "translateY(18px)",
						transition: "opacity 0.7s ease 80ms, transform 0.7s ease 80ms",
					}}
				>
					Everything you need to{" "}
					<span style={gradText as any}>close more deals.</span>
				</h2>
			</div>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
					gap: 20,
				}}
			>
				{FEATURES.map((f, i) => (
					<FeatureCard
						key={i}
						feature={f}
						delay={i * 110}
						visible={visible}
					/>
				))}
			</div>
		</section>
	);
}

const TESTIMONIALS = [
	{
		name: "Marcus T.",
		role: "SDR, SaaS startup",
		quote: "I used to spend 45 minutes researching a single prospect. Recon AI cuts that to under 2. My call volume doubled in the first week.",
		metric: "2x call volume",
	},
	{
		name: "Priya S.",
		role: "Freelance Sales Consultant",
		quote: "The cold call scripts are scary good. They reference the exact pain points I found in research. My open rate went from 8% to 31%.",
		metric: "31% open rate",
	},
	{
		name: "Derek W.",
		role: "Founder, local marketing agency",
		quote: "I close local businesses on website packages. Recon shows me who has no website, slow site, bad reviews — I walk into every call already knowing their problem.",
		metric: "$24k closed in month one",
	},
];

function Testimonials() {
	const [ref, visible] = useScrollReveal(0.15);
	return (
		<section
			ref={ref}
			style={{
				position: "relative",
				zIndex: 1,
				borderTop: "1px solid #1a1a24",
				padding: "clamp(56px,9vh,96px) clamp(20px,5vw,72px)",
			}}
		>
			<div style={{ textAlign: "center", marginBottom: 48 }}>
				<div
					style={{
						fontSize: 11,
						fontWeight: 700,
						letterSpacing: "1.5px",
						color: C.accent,
						textTransform: "uppercase",
						fontFamily: FF,
						marginBottom: 14,
					}}
				>
					What users say
				</div>
				<h2
					style={{
						fontFamily: FF,
						fontWeight: 800,
						fontSize: "clamp(26px,4vw,50px)",
						color: C.text,
						letterSpacing: "-0.028em",
						lineHeight: 1.12,
						maxWidth: 580,
						margin: "0 auto",
						opacity: visible ? 1 : 0,
						transform: visible ? "translateY(0)" : "translateY(24px)",
						transition: "opacity 0.85s ease, transform 0.85s ease",
					}}
				>
					Closing more deals on day one.
				</h2>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
					gap: 24,
					maxWidth: 1160,
					margin: "0 auto",
				}}
			>
				{TESTIMONIALS.map((t, i) => (
					<div
						key={i}
						style={{
							background: "#111116",
							border: `1px solid ${C.border}`,
							borderRadius: 12,
							padding: 24,
							display: "flex",
							flexDirection: "column",
							gap: 16,
							opacity: visible ? 1 : 0,
							transform: visible ? "translateY(0)" : "translateY(24px)",
							transition: `opacity 0.85s ease ${i * 100}ms, transform 0.85s ease ${i * 100}ms`,
						}}
					>
						<p
							style={{
								fontFamily: FF,
								fontSize: 14,
								color: C.text,
								lineHeight: 1.75,
								flex: 1,
								margin: 0,
							}}
						>
							"{t.quote}"
						</p>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 8,
							}}
						>
							<span
								style={{
									background: "rgba(34,197,94,0.12)",
									border: "1px solid rgba(34,197,94,0.3)",
									color: "#22c55e",
									fontSize: 12,
									fontWeight: 700,
									fontFamily: FF,
									padding: "4px 10px",
									borderRadius: 4,
									whiteSpace: "nowrap",
								}}
							>
								✓ {t.metric}
							</span>
						</div>
						<div
							style={{
								borderTop: `1px solid ${C.border}`,
								paddingTop: 12,
							}}
						>
							<div
								style={{
									fontSize: 13,
									fontWeight: 700,
									color: C.text,
									fontFamily: FF,
									marginBottom: 2,
								}}
							>
								{t.name}
							</div>
							<div
								style={{
									fontSize: 12,
									color: C.dim,
									fontFamily: FF,
								}}
							>
								{t.role}
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function BottomCTA({ onLicenseClick }: { onLicenseClick: () => void }) {
	const [ref, visible] = useScrollReveal(0.2);
	return (
		<section
			ref={ref}
			style={{
				position: "relative",
				zIndex: 1,
				textAlign: "center" as const,
				padding: "clamp(64px,10vh,100px) clamp(20px,5vw,80px) 52px",
			}}
		>
			<div
				style={{
					position: "absolute",
					top: "10%",
					left: "50%",
					transform: "translateX(-50%)",
					width: "55vw",
					maxWidth: 540,
					height: 320,
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(240,160,32,0.055) 0%, transparent 65%)",
					pointerEvents: "none",
				}}
			/>
			<h2
				style={{
					fontFamily: FF,
					fontWeight: 800,
					fontSize: "clamp(28px,4vw,58px)",
					color: C.text,
					letterSpacing: "-0.03em",
					lineHeight: 1.1,
					marginBottom: 18,
					opacity: visible ? 1 : 0,
					transform: visible ? "translateY(0)" : "translateY(24px)",
					transition: "opacity 0.8s ease, transform 0.8s ease",
				}}
			>
				Every day you wait is a deal someone else closes.
			</h2>
			<p
				style={{
					fontFamily: FF,
					fontSize: "clamp(14px,1.6vw,18px)",
					color: C.muted,
					marginBottom: 36,
					lineHeight: 1.65,
					opacity: visible ? 1 : 0,
					transition: "opacity 0.8s ease 120ms",
				}}
			>
				500+ reps are already researching smarter, calling faster, and closing more. Your next prospect is already in Recon AI — are you?
			</p>
			<div
				style={{
					display: "flex",
					gap: 12,
					justifyContent: "center",
					flexWrap: "wrap" as const,
					opacity: visible ? 1 : 0,
					transform: visible ? "translateY(0)" : "translateY(14px)",
					transition: "opacity 0.8s ease 230ms, transform 0.8s ease 230ms",
				}}
			>
				<CTAButton
					href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
					large
				>
					Start Closing Now →
				</CTAButton>
				<button
					onClick={onLicenseClick}
					style={{
						padding: "15px 26px",
						background: "transparent",
						border: `1px solid ${C.border}`,
						borderRadius: 10,
						color: C.muted,
						fontFamily: FF,
						fontWeight: 600,
						fontSize: 15,
						cursor: "pointer",
						transition: "border-color 0.2s, color 0.2s",
					}}
					onMouseEnter={(e) => {
						(e.currentTarget as any).style.borderColor =
							"rgba(240,160,32,0.42)";
						(e.currentTarget as any).style.color = C.text;
					}}
					onMouseLeave={(e) => {
						(e.currentTarget as any).style.borderColor = C.border;
						(e.currentTarget as any).style.color = C.muted;
					}}
				>
					Enter license key
				</button>
			</div>
		</section>
	);
}

function LicenseSection() {
	const [input, setInput] = useState("");
	const [focused, setFocused] = useState(false);
	const [ref, visible] = useScrollReveal(0.25);
	return (
		<div
			id="license-section"
			ref={ref}
			style={{
				position: "relative",
				zIndex: 1,
				display: "flex",
				justifyContent: "center",
				padding: "0 clamp(20px,5vw,80px) clamp(64px,10vh,100px)",
				opacity: visible ? 1 : 0,
				transform: visible ? "translateY(0)" : "translateY(20px)",
				transition: "opacity 0.8s ease, transform 0.8s ease",
			}}
		>
			<div
				style={{
					width: "100%",
					maxWidth: 400,
					padding: "22px",
					background: C.surface,
					border: `1px solid ${C.border}`,
					borderRadius: 16,
				}}
			>
				<p
					style={{
						fontSize: 11,
						fontWeight: 700,
						color: C.muted,
						textTransform: "uppercase",
						letterSpacing: "0.8px",
						marginBottom: 14,
						fontFamily: FF,
					}}
				>
					Have a license key?
				</p>
				<input
					type="text"
					placeholder="Paste your license key"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && input)
							window.location.href = `?license_key=${encodeURIComponent(input)}`;
					}}
					style={{
						width: "100%",
						padding: "12px 14px",
						background: "#0b0b0f",
						border: `1px solid ${focused ? "rgba(240,160,32,0.48)" : C.border}`,
						boxShadow: focused
							? "0 0 0 3px rgba(240,160,32,0.08)"
							: "none",
						borderRadius: 8,
						color: C.text,
						fontFamily: FF,
						fontSize: 15,
						boxSizing: "border-box",
						marginBottom: 10,
						outline: "none",
						transition: "border-color 0.2s, box-shadow 0.2s",
					}}
				/>
				<button
					disabled={!input}
					onClick={() =>
						input &&
						(window.location.href = `?license_key=${encodeURIComponent(input)}`)
					}
					onMouseEnter={(e) =>
						input && ((e.currentTarget as any).style.transform = "scale(1.02)")
					}
					onMouseLeave={(e) => ((e.currentTarget as any).style.transform = "")}
					style={{
						width: "100%",
						padding: "13px",
						background: input ? C.accent : "#252530",
						color: input ? "#0b0b0f" : C.dim,
						border: "none",
						borderRadius: 8,
						fontWeight: 700,
						cursor: input ? "pointer" : "not-allowed",
						fontFamily: FF,
						fontSize: 14,
						transition: "background 0.2s, transform 0.15s",
					}}
				>
					Access with Key
				</button>
			</div>
		</div>
	);
}

function Footer() {
	return (
		<footer
			style={{
				position: "relative",
				zIndex: 1,
				padding: "24px clamp(20px,5vw,64px)",
				borderTop: `1px solid ${C.border}`,
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				flexWrap: "wrap",
				gap: 8,
			}}
		>
			<div
				style={{
					fontFamily: FF,
					fontWeight: 800,
					fontSize: 18,
					color: C.text,
					letterSpacing: "-0.3px",
				}}
			>
				Recon <span style={{ color: C.accent }}>AI</span>
			</div>
			<p style={{ fontFamily: FF, fontSize: 12, color: C.dim, margin: 0 }}>
				© 2026 Recon AI. All rights reserved.
			</p>
			<div style={{ fontFamily: FF, fontSize: 11, color: C.dim, marginLeft: "auto" }}>
				Updated: May 14, 2026
			</div>
		</footer>
	);
}

function Header({ scrolled }: { scrolled: boolean }) {
	return (
		<header
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				zIndex: 100,
				padding: "18px clamp(20px,5vw,64px)",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				background: scrolled ? "rgba(11,11,15,0.88)" : "transparent",
				backdropFilter: scrolled ? "blur(20px)" : "none",
				WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
				borderBottom: `1px solid ${scrolled ? C.border : "transparent"}`,
				transition: "all 0.38s ease",
			}}
		>
			<div
				style={{
					fontFamily: FF,
					fontWeight: 800,
					fontSize: 20,
					color: C.text,
					letterSpacing: "-0.3px",
				}}
			>
				Recon <span style={{ color: C.accent }}>AI</span>
			</div>
			<CTAButton href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/">
				Get Access →
			</CTAButton>
		</header>
	);
}

function PageContent() {
	const [scrolled, setScrolled] = useState(false);
	const [headline] = useState("Stop Guessing. Start Closing.");

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 50);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const scrollToLicense = () => {
		const el = document.getElementById("license-section");
		if (!el) return;
		const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
		window.scrollTo({ top, behavior: "smooth" });
	};

	return (
		<div style={{ background: C.bg, minHeight: "100vh" }}>
			<IntelligenceBg intensity={2.4} />
			<LightRays />
			<RadialGlow />
			<Header scrolled={scrolled} />
			<Hero headline={headline} onLicenseClick={scrollToLicense} />
			<Stats />
			<Features />
			<FeaturesShowcase />
			<Testimonials />
			<BottomCTA onLicenseClick={scrollToLicense} />
			<LicenseSection />
			<Footer />
		</div>
	);
}

export default function Page() {
	return (
		<Suspense
			fallback={
				<div
					className="flex min-h-screen items-center justify-center"
					style={{ background: C.bg }}
				>
					<div style={{ color: C.muted, fontFamily: FF }}>Loading...</div>
				</div>
			}
		>
			<PageContent />
		</Suspense>
	);
}
