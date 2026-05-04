"use client";

import { useEffect, useState } from "react";

export default function Page() {
	const [userId, setUserId] = useState<string | null>(null);
	const [hasAccess, setHasAccess] = useState<boolean | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if user has access via Whop API
		const checkAccess = async () => {
			try {
				const response = await fetch("/api/check-access", {
					method: "GET",
					headers: { "Content-Type": "application/json" },
				});
				const data = await response.json();
				setUserId(data.userId);
				setHasAccess(data.hasAccess);
			} catch (error) {
				console.error("Error checking access:", error);
				setHasAccess(false);
			} finally {
				setLoading(false);
			}
		};
		checkAccess();
	}, []);

	// Show full app if authenticated and has access
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

	// Show blurred preview with login overlay
	return (
		<div className="relative w-screen h-screen overflow-hidden bg-black">
			{/* Blurred background preview */}
			<div className="absolute inset-0 w-full h-full">
				<iframe
					title="Preview"
					src="/lead-tool.html"
					className="w-full h-full border-0 blur-sm"
					style={{ pointerEvents: "none" }}
				/>
			</div>

			{/* Dark overlay */}
			<div className="absolute inset-0 bg-black/70" />

			{/* Auth overlay */}
			<div className="absolute inset-0 flex items-center justify-center p-4">
				<div className="w-full max-w-md rounded-2xl border border-gray-a4 bg-gray-a2 p-8 backdrop-blur-xl">
					<h1 className="text-8 font-bold mb-2 text-gray-12">Recon AI</h1>
					<p className="text-4 text-gray-11 mb-8">
						AI-powered lead research & cold calling scripts
					</p>

					{loading ? (
						<div className="text-center py-8">
							<div className="inline-block animate-spin">
								<div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
							</div>
							<p className="text-4 text-gray-11 mt-4">Checking access...</p>
						</div>
					) : (
						<div className="space-y-4">
							<p className="text-4 text-gray-10 mb-6">
								Purchase access to unlock the full Recon AI platform
							</p>
							<a
								href="https://whop.com/recon-lead-systems/recon-lead-systems-a8/"
								className="block w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 text-center transition"
							>
								Get Access Now
							</a>
							<a
								href="/experiences/test"
								className="block w-full px-6 py-3 bg-gray-a6 text-gray-12 rounded-lg font-semibold hover:bg-gray-a7 text-center transition"
							>
								Try Demo
							</a>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
