"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function CheckoutSuccessContent() {
	const searchParams = useSearchParams();
	const status = searchParams.get("status");
	const [licenseKey, setLicenseKey] = useState<string | null>(null);
	const [verifyEmail, setVerifyEmail] = useState("");
	const [verifyCode, setVerifyCode] = useState("");
	const [verifyStep, setVerifyStep] = useState<"email" | "code" | null>(null);
	const [verifyLoading, setVerifyLoading] = useState(false);
	const [verifyError, setVerifyError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const fetchLicenseKey = async () => {
			try {
				const response = await fetch("/api/check-access", {
					credentials: "include",
					headers: { "Content-Type": "application/json" },
				});
				const data = await response.json();
				if (data.userId) {
					const licenseResponse = await fetch(`/api/get-license?product=prod_wnUBQEF08WxYE`, { credentials: "include" });
					const licenseData = await licenseResponse.json();
					if (licenseData.licenseKey) setLicenseKey(licenseData.licenseKey);
				}
			} catch (error) {
				console.log("License fetch failed, will use email verification");
			}
		};
		fetchLicenseKey();
	}, []);

	const handleSendVerificationCode = async () => {
		if (!verifyEmail) { setVerifyError("Please enter your email"); return; }
		setVerifyLoading(true);
		setVerifyError(null);
		try {
			const response = await fetch("/api/verify-email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: verifyEmail }),
			});
			const data = await response.json();
			if (!response.ok) { setVerifyError(data.error || "Failed to send code"); return; }
			setVerifyStep("code");
		} catch (err) {
			setVerifyError("Failed to send verification code");
		} finally {
			setVerifyLoading(false);
		}
	};

	const handleVerifyCode = async () => {
		if (!verifyCode) { setVerifyError("Please enter the code"); return; }
		setVerifyLoading(true);
		setVerifyError(null);
		try {
			const response = await fetch("/api/verify-code", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: verifyEmail, code: verifyCode }),
			});
			const data = await response.json();
			if (!response.ok) { setVerifyError(data.error || "Invalid code"); return; }
			setLicenseKey(data.licenseKey);
			setVerifyStep(null);
			setVerifyEmail("");
			setVerifyCode("");
		} catch (err) {
			setVerifyError("Failed to verify code");
		} finally {
			setVerifyLoading(false);
		}
	};

	const handleCopy = () => {
		if (licenseKey) {
			navigator.clipboard.writeText(licenseKey);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const inputStyle: React.CSSProperties = {
		width: "100%",
		padding: "13px 14px",
		background: "#0b0b0f",
		border: "1px solid #25252f",
		borderRadius: "8px",
		color: "#edeef2",
		fontFamily: "'Plus Jakarta Sans', sans-serif",
		fontSize: "16px",
		boxSizing: "border-box",
		marginBottom: "10px",
		outline: "none",
		WebkitAppearance: "none",
	};

	const btnStyle = (loading: boolean): React.CSSProperties => ({
		width: "100%",
		padding: "13px",
		background: loading ? "#888898" : "#f0a020",
		color: "#0b0b0f",
		border: "none",
		borderRadius: "8px",
		fontWeight: 700,
		cursor: loading ? "not-allowed" : "pointer",
		fontFamily: "'Plus Jakarta Sans', sans-serif",
		fontSize: "15px",
	});

	if (status === "error") {
		return (
			<div className="flex min-h-screen items-center justify-center p-4" style={{ background: "#0b0b0f" }}>
				<div className="w-full max-w-md rounded-2xl border p-6" style={{ background: "#17171e", border: "1px solid #25252f" }}>
					<h1 className="text-2xl font-bold mb-3" style={{ color: "#edeef2" }}>Payment Failed</h1>
					<p style={{ color: "#888898", marginBottom: "20px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px" }}>
						Your payment was declined. Please try again or contact support.
					</p>
					<a
						href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
						className="block w-full text-center font-semibold rounded-xl"
						style={{ background: "#f0a020", color: "#0b0b0f", textDecoration: "none", padding: "14px", fontSize: "15px" }}
					>
						Try Again
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-start justify-center p-4 pt-6 pb-10" style={{ background: "linear-gradient(135deg, #0b0b0f 0%, #1a1a23 100%)" }}>
			<div
				className="w-full rounded-2xl border text-center"
				style={{
					background: "rgba(23, 23, 30, 0.95)",
					border: "1px solid #25252f",
					maxWidth: "520px",
					padding: "clamp(20px, 6vw, 40px)",
					boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
				}}
			>
				{/* Emoji */}
				<div style={{ fontSize: "clamp(48px, 12vw, 72px)", marginBottom: "16px", animation: "pulse 1s ease-in-out" }}>✨</div>

				{/* Title */}
				<h1
					className="font-extrabold mb-2"
					style={{
						fontFamily: "'Plus Jakarta Sans', sans-serif",
						color: "#edeef2",
						letterSpacing: "-0.5px",
						fontSize: "clamp(22px, 6vw, 34px)",
					}}
				>
					Welcome to Recon <span style={{ color: "#f0a020" }}>AI</span>
				</h1>

				<p className="mb-6" style={{ color: "#888898", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: "1.6", fontSize: "clamp(13px, 3.5vw, 16px)" }}>
					Your purchase was successful! 🎉
				</p>

				{/* Description */}
				<div className="mb-6 p-4 rounded-xl text-left" style={{ background: "rgba(240,160,32,0.05)", border: "1px solid rgba(240,160,32,0.2)" }}>
					<p style={{ fontSize: "14px", color: "#aaaabc", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: "1.8", margin: 0 }}>
						You now have full access to AI-powered lead research, personalized cold calling scripts, and advanced pipeline tracking.
					</p>
				</div>

				{/* Features */}
				<div className="mb-6 space-y-2 text-left">
					{[
						"🔍 AI-Powered Lead Research",
						"📝 Personalized Cold Calling Scripts",
						"📊 Advanced Pipeline Tracking",
						"⚡ Real-Time Lead Insights",
					].map((feature, i) => (
						<div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
							<div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f0a020", flexShrink: 0 }} />
							<span style={{ color: "#aaaabc", fontSize: "14px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{feature}</span>
						</div>
					))}
				</div>

				{/* CTA */}
				<a
					href="/experiences/recon-ai"
					className="block w-full font-semibold rounded-xl mb-5"
					style={{
						background: "#f0a020",
						color: "#0b0b0f",
						fontFamily: "'Plus Jakarta Sans', sans-serif",
						fontSize: "clamp(14px, 3.5vw, 16px)",
						fontWeight: 700,
						padding: "15px",
						textDecoration: "none",
					}}
				>
					Launch Recon AI →
				</a>

				{/* License Key Section */}
				{!licenseKey ? (
					<div style={{ padding: "16px", background: "rgba(240,160,32,0.07)", border: "1px solid rgba(240,160,32,0.2)", borderRadius: "12px" }}>
						<p style={{ fontSize: "11px", color: "#888898", fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "14px", fontWeight: 600 }}>
							🔑 Get Your License Key
						</p>
						{verifyStep === "code" ? (
							<>
								<p style={{ fontSize: "13px", color: "#888898", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: "10px" }}>
									Code sent to {verifyEmail}
								</p>
								<input
									type="number"
									placeholder="Enter 4-digit code"
									value={verifyCode}
									onChange={(e) => setVerifyCode(e.target.value)}
									maxLength={4}
									onKeyPress={(e) => { if (e.key === "Enter") handleVerifyCode(); }}
									style={inputStyle}
								/>
								<button onClick={handleVerifyCode} disabled={verifyLoading} style={btnStyle(verifyLoading)}>
									{verifyLoading ? "Verifying..." : "Verify Code"}
								</button>
							</>
						) : (
							<>
								<input
									type="email"
									placeholder="Enter your email"
									value={verifyEmail}
									onChange={(e) => setVerifyEmail(e.target.value)}
									onKeyPress={(e) => { if (e.key === "Enter") handleSendVerificationCode(); }}
									style={inputStyle}
								/>
								<button onClick={handleSendVerificationCode} disabled={verifyLoading} style={btnStyle(verifyLoading)}>
									{verifyLoading ? "Sending..." : "Send Code"}
								</button>
							</>
						)}
						{verifyError && (
							<p style={{ fontSize: "13px", color: "#ef4444", fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: "8px" }}>{verifyError}</p>
						)}
					</div>
				) : (
					<div style={{ padding: "16px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "12px" }}>
						<p style={{ fontSize: "11px", color: "#22c55e", fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", fontWeight: 600 }}>
							✓ Your License Key
						</p>
						<div
							onClick={handleCopy}
							style={{
								background: "#0b0b0f",
								border: "1px solid #25252f",
								borderRadius: "8px",
								padding: "14px",
								marginBottom: "12px",
								cursor: "pointer",
								textAlign: "center",
							}}
						>
							<p style={{ fontSize: "11px", color: "#888898", margin: "0 0 8px 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
								{copied ? "✓ Copied!" : "Tap to copy"}
							</p>
							<p
								style={{
									fontSize: "clamp(13px, 3.5vw, 16px)",
									color: "#f0a020",
									fontFamily: "'DM Mono', monospace",
									margin: 0,
									wordBreak: "break-all",
									lineHeight: "1.6",
								}}
							>
								{licenseKey}
							</p>
						</div>
						<a
							href={`/experiences/recon-ai?license_key=${encodeURIComponent(licenseKey)}`}
							className="block w-full text-center font-semibold rounded-xl"
							style={{ background: "#22c55e", color: "#0b0b0f", padding: "13px", textDecoration: "none", fontSize: "14px", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
						>
							Access Recon AI with this key →
						</a>
					</div>
				)}
			</div>

			<style>{`
				@keyframes pulse {
					0%, 100% { opacity: 1; transform: scale(1); }
					50% { opacity: 0.7; transform: scale(1.1); }
				}
				* { -webkit-tap-highlight-color: transparent; }
			`}</style>
		</div>
	);
}

export default function CheckoutSuccessPage() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen items-center justify-center" style={{ background: "#0b0b0f" }}>
				<div style={{ color: "#888898" }}>Loading...</div>
			</div>
		}>
			<CheckoutSuccessContent />
		</Suspense>
	);
}
