"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function ExperiencePage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const experienceId = params?.experienceId as string;
	const licenseKey = searchParams?.get("license_key");

	const [userId, setUserId] = useState<string | null>(null);
	const [hasAccess, setHasAccess] = useState<boolean | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [displayLicenseKey, setDisplayLicenseKey] = useState<string | null>(null);
	const [verifyEmail, setVerifyEmail] = useState("");
	const [verifyCode, setVerifyCode] = useState("");
	const [verifyStep, setVerifyStep] = useState<"email" | "code" | null>(null);
	const [verifyLoading, setVerifyLoading] = useState(false);
	const [verifyError, setVerifyError] = useState<string | null>(null);
	const [licenseInput, setLicenseInput] = useState("");

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
			setDisplayLicenseKey(data.licenseKey);
			setVerifyStep(null);
			setVerifyEmail("");
			setVerifyCode("");
		} catch (err) {
			setVerifyError("Failed to verify code");
		} finally {
			setVerifyLoading(false);
		}
	};

	useEffect(() => {
		const checkAccess = async () => {
			try {
				if (licenseKey) {
					setDisplayLicenseKey(licenseKey);
					const response = await fetch(`/api/verify-license?license=${encodeURIComponent(licenseKey)}`);
					if (!response.ok) {
						setError("Invalid or revoked license key");
						setHasAccess(false);
					} else {
						const data = await response.json();
						setUserId(data.userId);
						setHasAccess(true);
					}
				} else {
					const response = await fetch("/api/check-access", {
						credentials: "include",
						headers: { "Content-Type": "application/json" },
					});
					if (!response.ok) {
						if (response.status === 401) setError("Please log in with Whop or use a valid license key.");
						else if (response.status === 429) setError("Too many requests. Please try again in a moment.");
						else setError(`Access check failed (${response.status})`);
						setHasAccess(false);
					} else {
						const data = await response.json();
						setUserId(data.userId);
						setHasAccess(data.hasAccess);
						if (!data.hasAccess) setError("No active purchase. Please try again in a moment.");
					}
				}
			} catch (err) {
				setError("Failed to verify access");
				setHasAccess(false);
			} finally {
				setLoading(false);
			}
		};
		const timer = setTimeout(checkAccess, 200);
		return () => clearTimeout(timer);
	}, [licenseKey]);

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

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center" style={{ background: "#0b0b0f" }}>
				<div style={{ color: "#888898", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Loading...</div>
			</div>
		);
	}

	if (!hasAccess || !userId || error) {
		return (
			<div className="min-h-screen flex items-start justify-center p-4 pt-8 pb-8" style={{ background: "#0b0b0f" }}>
				<div
					className="w-full rounded-2xl border"
					style={{
						background: "#17171e",
						border: "1px solid #25252f",
						maxWidth: "480px",
						padding: "clamp(20px, 5vw, 32px)",
					}}
				>
					<h1
						className="font-bold mb-3"
						style={{ color: "#edeef2", fontSize: "clamp(20px, 5vw, 24px)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
					>
						Access Required
					</h1>
					<p
						className="mb-5"
						style={{ color: "#888898", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px", lineHeight: "1.6" }}
					>
						{error || "You do not currently have access to Recon AI. Purchase access to get started."}
					</p>

					{!licenseKey && (
						<div className="mb-5 space-y-3">
							{/* License Key Input */}
							<div style={{ background: "#1e1e27", border: "1px solid #25252f", borderRadius: "12px", padding: "14px" }}>
								<label style={{ display: "block", fontSize: "13px", color: "#aaaabc", marginBottom: "10px", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
									Have a license key?
								</label>
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
									style={inputStyle}
								/>
								<button
									onClick={() => {
										if (licenseInput) window.location.href = `?license_key=${encodeURIComponent(licenseInput)}`;
									}}
									disabled={!licenseInput}
									style={{
										...btnStyle(false),
										background: licenseInput ? "#f0a020" : "#2a2a35",
										color: licenseInput ? "#0b0b0f" : "#555565",
										cursor: licenseInput ? "pointer" : "not-allowed",
									}}
								>
									Access with Key
								</button>
							</div>

							{/* Email Verification */}
							<div style={{ background: "#1e1e27", border: "1px solid #25252f", borderRadius: "12px", padding: "14px" }}>
								<label style={{ display: "block", fontSize: "13px", color: "#aaaabc", marginBottom: "10px", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
									Forgot your key? Retrieve it via email
								</label>
								{verifyStep === "code" ? (
									<>
										<p style={{ fontSize: "12px", color: "#888898", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: "10px" }}>
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
									<p style={{ fontSize: "13px", color: "#ef4444", fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: "8px" }}>
										{verifyError}
									</p>
								)}
							</div>
						</div>
					)}

					<div style={{ display: "flex", gap: "10px" }}>
						<button
							onClick={() => window.location.reload()}
							style={{ padding: "13px", background: "#f0a020", color: "#0b0b0f", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px", flex: 1 }}
						>
							Retry
						</button>
						<a
							href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
							target="_blank"
							rel="noopener noreferrer"
							style={{ padding: "13px", background: "#25252f", color: "#edeef2", border: "1px solid #2f2f3d", borderRadius: "8px", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}
						>
							Purchase
						</a>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col w-screen h-screen overflow-hidden">
			{/* Auth Header */}
			<div
				style={{
					background: "linear-gradient(90deg, rgba(240,160,32,0.1) 0%, rgba(240,160,32,0.05) 100%)",
					borderBottom: "1px solid rgba(240,160,32,0.2)",
					padding: "10px 16px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexShrink: 0,
					gap: "8px",
					flexWrap: "wrap",
					minHeight: "48px",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f0a020", animation: "pulse 2s infinite", flexShrink: 0 }} />
					<span style={{ color: "#f0a020", fontSize: "12px", fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" }}>
						✓ Premium Access Active
					</span>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
					{displayLicenseKey && (
						<div
							onClick={() => navigator.clipboard.writeText(displayLicenseKey)}
							title="Tap to copy"
							style={{
								padding: "5px 10px",
								background: "rgba(240,160,32,0.15)",
								border: "1px solid rgba(240,160,32,0.3)",
								borderRadius: "4px",
								fontSize: "11px",
								color: "#f0a020",
								fontFamily: "'DM Mono', monospace",
								cursor: "pointer",
								maxWidth: "180px",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{displayLicenseKey.slice(0, 12)}...
						</div>
					)}
					<span style={{ fontSize: "11px", color: "#888898", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" }}>
						ID: {userId.slice(0, 8)}...
					</span>
				</div>
			</div>

			{/* App Content */}
			<div className="flex-1 overflow-hidden">
				<iframe
					title="Recon Lead Tool"
					src={`/api/tool?uid=${encodeURIComponent(userId)}`}
					className="w-full h-full border-0"
					allow="clipboard-read; clipboard-write"
				/>
			</div>

			<style>{`
				@keyframes pulse {
					0%, 100% { opacity: 1; }
					50% { opacity: 0.5; }
				}
				* { -webkit-tap-highlight-color: transparent; }
				input { -webkit-appearance: none; }
			`}</style>
		</div>
	);
}
