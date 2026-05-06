"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PageContent() {
	const searchParams = useSearchParams();
	const licenseKey = searchParams?.get("license_key");
	const [userId, setUserId] = useState<string | null>(null);
	const [hasAccess, setHasAccess] = useState<boolean | null>(null);
	const [loading, setLoading] = useState(true);
	const [licenseInput, setLicenseInput] = useState("");

	useEffect(() => {
		const checkAccess = async () => {
			try {
				const url = licenseKey
					? `/api/check-access?license_key=${encodeURIComponent(licenseKey)}`
					: "/api/check-access";

				const response = await fetch(url, {
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
						...(licenseKey && { "x-license-key": licenseKey }),
					},
				});
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
	}, [licenseKey]);

	if (hasAccess && userId) {
		return (
			<div className="w-screen h-screen overflow-hidden">
				<iframe
					title="Recon Lead Tool"
					src={`/api/tool?uid=${encodeURIComponent(userId)}`}
					className="w-full h-full border-0"
					allow="clipboard-read; clipboard-write"
				/>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center" style={{ background: "#0b0b0f" }}>
				<div style={{ color: "#888898", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Loading...</div>
			</div>
		);
	}

	// Show blurred preview with purchase CTA (no iframe - just static content)
	return (
		<div
			className="relative w-screen h-screen overflow-hidden"
			style={{ background: "#0b0b0f" }}
		>
			{/* Static blurred background instead of loading app */}
			<div className="absolute inset-0 w-full h-full" style={{
				background: "radial-gradient(circle at center, rgba(11,11,15,0.5) 0%, rgba(11,11,15,0.95) 100%)",
				backdropFilter: "blur(4px)"
			}} />

			{/* Dark gradient overlay */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(circle at center, rgba(11,11,15,0.75) 0%, rgba(11,11,15,0.95) 100%)",
				}}
			/>

			{/* CTA card */}
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
							className="block w-full py-3 px-4 rounded-[10px] text-center font-semibold transition-all mb-4"
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

						{/* License Key Input */}
						<div
							style={{
								padding: "12px",
								background: "#1e1e27",
								border: "1px solid #25252f",
								borderRadius: "10px",
								marginTop: "12px",
							}}
						>
							<p
								style={{
									fontSize: "11px",
									color: "#888898",
									fontFamily: "'Plus Jakarta Sans', sans-serif",
									textTransform: "uppercase",
									letterSpacing: "0.5px",
									marginBottom: "8px",
									fontWeight: 600,
									margin: "0 0 8px 0",
								}}
							>
								Have a license key?
							</p>
							<input
								type="text"
								placeholder="Paste your license key"
								value={licenseInput}
								onChange={(e) => setLicenseInput(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === "Enter" && licenseInput) {
										window.location.href = `?license_key=${encodeURIComponent(licenseInput)}`;
									}
								}}
								style={{
									width: "100%",
									padding: "8px",
									background: "#0b0b0f",
									border: "1px solid #25252f",
									borderRadius: "6px",
									color: "#edeef2",
									fontFamily: "'Plus Jakarta Sans', sans-serif",
									fontSize: "12px",
									boxSizing: "border-box",
									marginBottom: "8px",
								}}
							/>
							<button
								onClick={() => {
									if (licenseInput) {
										window.location.href = `?license_key=${encodeURIComponent(licenseInput)}`;
									}
								}}
								style={{
									width: "100%",
									padding: "8px",
									background: licenseInput ? "#f0a020" : "#555565",
									color: "#0b0b0f",
									border: "none",
									borderRadius: "6px",
									fontWeight: 600,
									cursor: licenseInput ? "pointer" : "not-allowed",
									fontFamily: "'Plus Jakarta Sans', sans-serif",
									fontSize: "12px",
								}}
								disabled={!licenseInput}
							>
								Access with Key
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function Page() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen items-center justify-center" style={{ background: "#0b0b0f" }}>
				<div style={{ color: "#888898", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Loading...</div>
			</div>
		}>
			<PageContent />
		</Suspense>
	);
}
