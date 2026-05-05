import { headers, cookies } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;

	try {
		// Try to get userId from session cookie first (set at checkout)
		const cookieStore = await cookies();
		let userId = cookieStore.get("whop_user_id")?.value;

		// If no session cookie, try to verify from Whop token in headers
		if (!userId) {
			const verified = await whopsdk.verifyUserToken(await headers());
			userId = verified.userId;
		}

		if (!userId) {
			throw new Error("No user authentication found");
		}

		// Verify user has access to Recon AI product
		const productId = process.env.NEXT_PUBLIC_WHOP_PRODUCT_ID || "prod_wnUBQEF08WxYE";
		const access = await whopsdk.users.checkAccess(productId, { id: userId });
		if (!access.has_access) {
			return (
				<div className="flex min-h-screen items-center justify-center p-8">
					<div className="max-w-lg rounded-xl border border-gray-a4 bg-gray-a2 p-6">
						<h1 className="text-8 font-bold mb-2">Access Required</h1>
						<p className="text-4 text-gray-11 mb-6">
							You do not currently have access to Recon AI. Purchase access to get started.
						</p>
						<a
							href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
						>
							Purchase Recon AI
						</a>
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
					<span
						style={{
							fontSize: "12px",
							color: "#888898",
							fontFamily: "'Plus Jakarta Sans', sans-serif",
						}}
					>
						ID: {userId.slice(0, 8)}...
					</span>
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
	} catch (error) {
		console.error(`[experiences] Auth error for ${experienceId}:`, error instanceof Error ? error.message : String(error));
		return (
			<div className="flex min-h-screen items-center justify-center p-8">
				<div className="max-w-lg rounded-xl border border-gray-a4 bg-gray-a2 p-6">
					<h1 className="text-8 font-bold mb-2">Waiting for Access</h1>
					<p className="text-4 text-gray-11 mb-6">
						We're setting up your account. This usually takes a few moments after purchase.
					</p>
					<p className="text-4 text-gray-11 mb-6">
						Try refreshing the page, or check back in a minute.
					</p>
					<div style={{ display: "flex", gap: "12px" }}>
						<button
							onClick={() => window.location.reload()}
							className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
						>
							Refresh Page
						</button>
						<a
							href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-block px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500"
						>
							Back to Whop
						</a>
					</div>
				</div>
			</div>
		);
	}
}
