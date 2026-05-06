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

	return (
		<div className="relative min-h-screen flex items-center justify-center p-4" style={{ background: "#0b0b0f" }}>
			<div
				className="w-full rounded-2xl border p-6"
				style={{
					background: "#17171e",
					border: "1px solid #25252f",
					maxWidth: "420px",
				}}
			>
				{/* Logo & Title */}
				<div className="mb-6">
					<h1
						className="font-extrabold mb-1"
						style={{
							fontFamily: "'Plus Jakarta Sans', sans-serif",
							color: "#edeef2",
							letterSpacing: "-0.4px",
							fontSize: "clamp(24px, 6vw, 30px)",
						}}
					>
						Recon <span style={{ color: "#f0a020" }}>AI</span>
					</h1>
					<p style={{ fontSize: "13px", fontWeight: 500, color: "#888898", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
						AI-powered lead research & cold calling scripts
					</p>
				</div>

				<p
					className="mb-5"
					style={{ fontSize: "13px", color: "#55556a", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: "1.6" }}
				>
					Get instant access to research leads, generate personalized cold calling scripts, and track your pipeline.
				</p>

				<a
					href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
					className="block w-full text-center font-semibold rounded-xl mb-4"
					style={{
						background: "#f0a020",
						color: "#0b0b0f",
						fontFamily: "'Plus Jakarta Sans', sans-serif",
						fontSize: "15px",
						fontWeight: 600,
						padding: "14px",
						textDecoration: "none",
					}}
				>
					Unlock Recon AI
				</a>

				{/* License Key Input */}
				<div
					style={{
						padding: "14px",
						background: "#1e1e27",
						border: "1px solid #25252f",
						borderRadius: "12px",
					}}
				>
					<p
						style={{
							fontSize: "11px",
							color: "#888898",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
							textTransform: "uppercase",
							letterSpacing: "0.5px",
							marginBottom: "10px",
							fontWeight: 600,
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
							padding: "12px",
							background: "#0b0b0f",
							border: "1px solid #25252f",
							borderRadius: "8px",
							color: "#edeef2",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
							fontSize: "16px",
							boxSizing: "border-box",
							marginBottom: "10px",
							outline: "none",
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
							padding: "13px",
							background: licenseInput ? "#f0a020" : "#2a2a35",
							color: licenseInput ? "#0b0b0f" : "#555565",
							border: "none",
							borderRadius: "8px",
							fontWeight: 600,
							cursor: licenseInput ? "pointer" : "not-allowed",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
							fontSize: "14px",
							transition: "background 0.2s",
						}}
						disabled={!licenseInput}
					>
						Access with Key
					</button>
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
