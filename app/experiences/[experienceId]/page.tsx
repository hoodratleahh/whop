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

	const handleSendVerificationCode = async () => {
		if (!verifyEmail) {
			setVerifyError("Please enter your email");
			return;
		}

		setVerifyLoading(true);
		setVerifyError(null);

		try {
			const response = await fetch("/api/verify-email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: verifyEmail }),
			});
			const data = await response.json();

			if (!response.ok) {
				setVerifyError(data.error || "Failed to send code");
				return;
			}

			setVerifyStep("code");
		} catch (err) {
			setVerifyError("Failed to send verification code");
		} finally {
			setVerifyLoading(false);
		}
	};

	const handleVerifyCode = async () => {
		if (!verifyCode) {
			setVerifyError("Please enter the code");
			return;
		}

		setVerifyLoading(true);
		setVerifyError(null);

		try {
			const response = await fetch("/api/verify-code", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: verifyEmail, code: verifyCode }),
			});
			const data = await response.json();

			if (!response.ok) {
				setVerifyError(data.error || "Invalid code");
				return;
			}

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
				// If license key provided, verify it
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
					// Fall back to old auth method (from check-access endpoint)
					const response = await fetch("/api/check-access", {
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
						},
					});

					if (!response.ok) {
						if (response.status === 401) {
							setError("Please log in with Whop or use a valid license key.");
						} else if (response.status === 429) {
							setError("Too many requests. Please try again in a moment.");
						} else {
							setError(`Access check failed (${response.status})`);
						}
						setHasAccess(false);
					} else {
						const data = await response.json();
						setUserId(data.userId);
						setHasAccess(data.hasAccess);
						if (!data.hasAccess) {
							setError("No active purchase. Please try again in a moment.");
						}
					}
				}
			} catch (err) {
				console.error("Access check error:", err);
				setError("Failed to verify access");
				setHasAccess(false);
			} finally {
				setLoading(false);
			}
		};

		const timer = setTimeout(checkAccess, 200);
		return () => clearTimeout(timer);
	}, [licenseKey]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center" style={{ background: "#0b0b0f" }}>
				<div style={{ color: "#888898", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Loading...</div>
			</div>
		);
	}

	if (!hasAccess || !userId || error) {
		return (
			<div className="flex min-h-screen items-center justify-center p-8" style={{ background: "#0b0b0f" }}>
				<div className="max-w-lg rounded-xl border p-8" style={{ background: "#17171e", border: "1px solid #25252f" }}>
					<h1 className="text-2xl font-bold mb-4" style={{ color: "#edeef2" }}>
						Access Required
					</h1>
					<p
						className="mb-6"
						style={{
							color: "#888898",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
							fontSize: "14px",
							lineHeight: "1.6",
						}}
					>
						{error || "You do not currently have access to Recon AI. Purchase access to get started."}
					</p>

					{/* License Key Options */}
					{!licenseKey && (
						<div className="mb-6 space-y-4">
							{/* Manual License Key Input */}
							<div className="p-4 rounded-lg" style={{ background: "#1e1e27", border: "1px solid #25252f" }}>
								<label
									style={{
										display: "block",
										fontSize: "13px",
										color: "#aaaabc",
										marginBottom: "8px",
										fontWeight: 600,
										fontFamily: "'Plus Jakarta Sans', sans-serif",
									}}
								>
									Have a license key?
								</label>
								<input
									type="text"
									placeholder="Paste your license key"
									onKeyPress={(e) => {
										if (e.key === "Enter") {
											const key = (e.target as HTMLInputElement).value;
											if (key) {
												window.location.href = `?license_key=${encodeURIComponent(key)}`;
											}
										}
									}}
									style={{
										width: "100%",
										padding: "10px",
										background: "#0b0b0f",
										border: "1px solid #25252f",
										borderRadius: "6px",
										color: "#edeef2",
										fontFamily: "'Plus Jakarta Sans', sans-serif",
										fontSize: "13px",
										boxSizing: "border-box",
									}}
								/>
							</div>

							{/* Email Verification */}
							<div className="p-4 rounded-lg" style={{ background: "#1e1e27", border: "1px solid #25252f" }}>
								<label
									style={{
										display: "block",
										fontSize: "13px",
										color: "#aaaabc",
										marginBottom: "8px",
										fontWeight: 600,
										fontFamily: "'Plus Jakarta Sans', sans-serif",
									}}
								>
									Forgot your key? Retrieve it
								</label>
								{verifyStep === "code" ? (
									<>
										<input
											type="text"
											placeholder="Enter 4-digit code"
											value={verifyCode}
											onChange={(e) => setVerifyCode(e.target.value)}
											maxLength={4}
											onKeyPress={(e) => {
												if (e.key === "Enter") handleVerifyCode();
											}}
											style={{
												width: "100%",
												padding: "10px",
												background: "#0b0b0f",
												border: "1px solid #25252f",
												borderRadius: "6px",
												color: "#edeef2",
												fontFamily: "'Plus Jakarta Sans', sans-serif",
												fontSize: "13px",
												boxSizing: "border-box",
												marginBottom: "8px",
											}}
										/>
										<button
											onClick={handleVerifyCode}
											disabled={verifyLoading}
											style={{
												width: "100%",
												padding: "10px",
												background: verifyLoading ? "#888898" : "#f0a020",
												color: "#0b0b0f",
												border: "none",
												borderRadius: "6px",
												fontWeight: 600,
												cursor: verifyLoading ? "not-allowed" : "pointer",
												fontFamily: "'Plus Jakarta Sans', sans-serif",
												fontSize: "13px",
											}}
										>
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
											onKeyPress={(e) => {
												if (e.key === "Enter") handleSendVerificationCode();
											}}
											style={{
												width: "100%",
												padding: "10px",
												background: "#0b0b0f",
												border: "1px solid #25252f",
												borderRadius: "6px",
												color: "#edeef2",
												fontFamily: "'Plus Jakarta Sans', sans-serif",
												fontSize: "13px",
												boxSizing: "border-box",
												marginBottom: "8px",
											}}
										/>
										<button
											onClick={handleSendVerificationCode}
											disabled={verifyLoading}
											style={{
												width: "100%",
												padding: "10px",
												background: verifyLoading ? "#888898" : "#f0a020",
												color: "#0b0b0f",
												border: "none",
												borderRadius: "6px",
												fontWeight: 600,
												cursor: verifyLoading ? "not-allowed" : "pointer",
												fontFamily: "'Plus Jakarta Sans', sans-serif",
												fontSize: "13px",
											}}
										>
											{verifyLoading ? "Sending..." : "Send Code"}
										</button>
									</>
								)}
								{verifyError && (
									<p
										style={{
											fontSize: "12px",
											color: "#ef4444",
											fontFamily: "'Plus Jakarta Sans', sans-serif",
											marginTop: "8px",
										}}
									>
										{verifyError}
									</p>
								)}
							</div>
						</div>
					)}

					<div style={{ display: "flex", gap: "12px" }}>
						<button
							onClick={() => window.location.reload()}
							style={{
								padding: "10px 16px",
								background: "#f0a020",
								color: "#0b0b0f",
								border: "none",
								borderRadius: "6px",
								fontWeight: 600,
								cursor: "pointer",
								fontFamily: "'Plus Jakarta Sans', sans-serif",
								fontSize: "14px",
								flex: 1,
							}}
						>
							Retry
						</button>
						<a
							href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
							target="_blank"
							rel="noopener noreferrer"
							style={{
								padding: "10px 16px",
								background: "#25252f",
								color: "#edeef2",
								border: "1px solid #25252f",
								borderRadius: "6px",
								fontWeight: 600,
								cursor: "pointer",
								fontFamily: "'Plus Jakarta Sans', sans-serif",
								fontSize: "14px",
								textDecoration: "none",
								display: "inline-block",
								flex: 1,
								textAlign: "center",
							}}
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
			{/* Auth Status Header */}
			<div
				style={{
					background: "linear-gradient(90deg, rgba(240, 160, 32, 0.1) 0%, rgba(240, 160, 32, 0.05) 100%)",
					borderBottom: "1px solid rgba(240, 160, 32, 0.2)",
					padding: "12px 20px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexShrink: 0,
					flexWrap: "wrap",
					gap: "12px",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
					<div
						style={{
							width: "8px",
							height: "8px",
							borderRadius: "50%",
							background: "#f0a020",
							animation: "pulse 2s infinite",
						}}
					/>
					<span
						style={{
							color: "#f0a020",
							fontSize: "13px",
							fontWeight: 600,
							fontFamily: "'Plus Jakarta Sans', sans-serif",
						}}
					>
						✓ Authenticated • Premium Access Active
					</span>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
					{displayLicenseKey && (
						<div
							onClick={() => navigator.clipboard.writeText(displayLicenseKey)}
							style={{
								padding: "6px 12px",
								background: "rgba(240, 160, 32, 0.15)",
								border: "1px solid rgba(240, 160, 32, 0.3)",
								borderRadius: "4px",
								fontSize: "12px",
								color: "#f0a020",
								fontFamily: "'DM Mono', monospace",
								cursor: "pointer",
								whiteSpace: "nowrap",
							}}
							title="Click to copy"
						>
							License: {displayLicenseKey}
						</div>
					)}
					<span
						style={{
							fontSize: "12px",
							color: "#888898",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
							whiteSpace: "nowrap",
						}}
					>
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
			`}</style>
		</div>
	);
}
