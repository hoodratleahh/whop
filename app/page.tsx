"use client";

import { useEffect, useState } from "react";

export default function Page() {
	const [userId, setUserId] = useState<string | null>(null);
	const [hasAccess, setHasAccess] = useState<boolean | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAccess = async () => {
			try {
				const response = await fetch("/api/check-access");
				const data = await response.json();
				setUserId(data.userId);
				setHasAccess(data.hasAccess);
			} catch (error) {
				setHasAccess(false);
			} finally {
				setLoading(false);
			}
		};
		checkAccess();
	}, []);

	if (hasAccess && userId) {
		return (
			<div className="w-screen h-screen overflow-hidden">
				<iframe
					title="Recon Lead Tool"
					src={`/lead-tool.html?uid=${userId}`}
					className="w-full h-full border-0"
					allow="clipboard-read; clipboard-write"
				/>
			</div>
		);
	}

	return (
		<div
			className="relative w-screen h-screen overflow-hidden"
			style={{ background: "#0b0b0f" }}
		>
			{/* Blurred preview */}
			<div className="absolute inset-0 w-full h-full">
				<iframe
					title="Preview"
					src="/lead-tool.html"
					className="w-full h-full border-0 blur-md"
					style={{ pointerEvents: "none" }}
				/>
			</div>

			{/* Dark gradient overlay */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(circle at center, rgba(11,11,15,0.75) 0%, rgba(11,11,15,0.95) 100%)",
				}}
			/>

			{/* Auth card */}
			<div className="absolute inset-0 flex items-center justify-center p-4">
				<div
					className="w-full max-w-md rounded-[10px] border p-8 backdrop-blur-xl"
					style={{
						background: "#17171e",
						border: "1px solid #25252f",
					}}
				>
					{/* Logo & Title */}
					<div className="mb-8">
						<h1
							className="text-3xl font-extrabold mb-2 tracking-tight"
							style={{
								fontFamily: "'Plus Jakarta Sans', sans-serif",
								color: "#edeef2",
								letterSpacing: "-0.4px",
							}}
						>
							Recon <span style={{ color: "#f0a020" }}>AI</span>
						</h1>
						<p
							style={{
								fontSize: "13px",
								fontWeight: 500,
								color: "#888898",
								fontFamily: "'Plus Jakarta Sans', sans-serif",
							}}
						>
							AI-powered lead research & cold calling scripts
						</p>
					</div>

					{/* Content */}
					{loading ? (
						<div className="text-center py-8">
							<div className="inline-block animate-spin">
								<div
									className="w-5 h-5 border-2 border-t-transparent rounded-full"
									style={{
										borderColor: "#25252f",
										borderTopColor: "#f0a020",
									}}
								/>
							</div>
							<p
								className="mt-3"
								style={{
									fontSize: "12px",
									color: "#888898",
									fontFamily: "'Plus Jakarta Sans', sans-serif",
								}}
							>
								Checking access...
							</p>
						</div>
					) : (
						<div>
							<p
								className="mb-6"
								style={{
									fontSize: "13px",
									color: "#55556a",
									fontFamily: "'Plus Jakarta Sans', sans-serif",
									lineHeight: "1.6",
								}}
							>
								Get instant access to research leads, generate personalized cold
								calling scripts, and track your pipeline.
							</p>

							<a
								href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
								className="block w-full py-3 px-4 rounded-[10px] text-center font-semibold transition-all"
								style={{
									background: "#f0a020",
									color: "#0b0b0f",
									fontFamily: "'Plus Jakarta Sans', sans-serif",
									fontSize: "13px",
									fontWeight: 600,
									cursor: "pointer",
									border: "none",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = "#fbbf24";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = "#f0a020";
								}}
							>
								Unlock Recon AI
							</a>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
