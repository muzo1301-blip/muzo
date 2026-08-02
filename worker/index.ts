// Export the Workflow and Durable Object classes
export { MyWorkflow } from "./workflow";
export { WorkflowStatusDO } from "./durable-object";

/**
 * Main Worker fetch handler
 *
 * Handles API routes and WebSocket upgrade requests for workflow management:
 * - POST /api/workflow/start - Create new workflow instance
 * - GET /api/workflow/status/:id - Get workflow status
 * - POST /api/workflow/event/:id - Send events to workflow
 * - GET /ws - WebSocket connection for real-time updates
 */
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// API: Start a new workflow instance
		if (url.pathname === "/api/workflow/start" && request.method === "POST") {
			try {
				const instance = await env.MY_WORKFLOW.create({
					params: {
						timestamp: Date.now(),
					},
				});

				return Response.json({
					instanceId: instance.id,
					message: "Workflow started successfully",
				});
			} catch {
				return Response.json(
					{ error: "Failed to start workflow" },
					{ status: 500 },
				);
			}
		}

		// API: Get workflow status
		if (url.pathname.startsWith("/api/workflow/status/")) {
			const instanceId = url.pathname.split("/").pop();
			if (!instanceId) {
				return Response.json(
					{ error: "Instance ID required" },
					{ status: 400 },
				);
			}

			try {
				const instance = await env.MY_WORKFLOW.get(instanceId);
				const status = await instance.status();
				return Response.json(status);
			} catch {
				return Response.json(
					{ error: "Failed to get workflow status" },
					{ status: 500 },
				);
			}
		}

		// API: Send event to workflow instance
		if (
			url.pathname.startsWith("/api/workflow/event/") &&
			request.method === "POST"
		) {
			const instanceId = url.pathname.split("/").pop();
			if (!instanceId) {
				return Response.json(
					{ error: "Instance ID required" },
					{ status: 400 },
				);
			}

			try {
				const body = (await request.json()) as {
					approved: boolean;
					comment?: string;
				};
				const instance = await env.MY_WORKFLOW.get(instanceId);

				await instance.sendEvent({
					type: "user-approval",
					payload: body,
				});

				return Response.json({
					success: true,
					message: "Event sent successfully",
				});
			} catch {
				return Response.json(
					{ error: "Failed to send event" },
					{ status: 500 },
				);
			}
		}
		// MUZO API: Profil ve banka bilgilerini getir
		if (
			url.pathname === "/api/profile" &&
			request.method === "GET"
		) {
			try {
				const profile = await env.DB.prepare(
					`
					SELECT
						id,
						phone,
						whatsapp,
						email,
						instagram,
						location
					FROM profiles
					ORDER BY id
					LIMIT 1
					`,
				).first<{
					id: number;
					phone: string | null;
					whatsapp: string | null;
					email: string | null;
					instagram: string | null;
					location: string | null;
				}>();

				if (!profile) {
					return Response.json(
						{
							error: "Profil bulunamadı",
						},
						{
							status: 404,
						},
					);
				}

				const bankResult = await env.DB.prepare(
					`
					SELECT
						id,
						profile_id,
						bank_name,
						iban
					FROM bank_accounts
					WHERE profile_id = ?
					ORDER BY id
					`,
				)
					.bind(profile.id)
					.all<{
						id: number;
						profile_id: number;
						bank_name: string;
						iban: string;
					}>();

				return Response.json({
					profile: {
						id: profile.id,
						phone: profile.phone ?? "",
						whatsapp: profile.whatsapp ?? "",
						email: profile.email ?? "",
						instagram: profile.instagram ?? "",
						location: profile.location ?? "",
						banks: bankResult.results.map((bank) => ({
							id: bank.id,
							bankName: bank.bank_name,
							iban: bank.iban,
						})),
					},
				});
			} catch (error) {
				console.error("MUZO profil okuma hatası:", error);

				return Response.json(
					{
						error: "Profil bilgileri okunamadı",
					},
					{
						status: 500,
					},
				);
			}
		}
		// WebSocket: Connect to workflow status updates
		if (url.pathname === "/ws") {
			const instanceId = url.searchParams.get("instanceId");
			if (!instanceId) {
				return new Response("instanceId query parameter required", {
					status: 400,
				});
			}

			const upgradeHeader = request.headers.get("Upgrade");
			if (upgradeHeader !== "websocket") {
				return new Response("Expected Upgrade: websocket", { status: 426 });
			}

			try {
				const doId = env.WORKFLOW_STATUS.idFromName(instanceId);
				const stub = env.WORKFLOW_STATUS.get(doId);
				return stub.fetch(request);
			} catch {
				return new Response("Failed to establish WebSocket connection", {
					status: 500,
				});
			}
		}

		return Response.json({ error: "Not Found" }, { status: 404 });
	},
} satisfies ExportedHandler<Env>;
