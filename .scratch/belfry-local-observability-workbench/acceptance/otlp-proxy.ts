const upstream = "http://127.0.0.1:14328";

const server = Bun.serve({
	hostname: "127.0.0.1",
	port: 14329,
	async fetch(request) {
		const url = new URL(request.url);
		const requestBody = new Uint8Array(await request.arrayBuffer());
		const response = await fetch(`${upstream}${url.pathname}`, {
			method: request.method,
			headers: request.headers,
			body: requestBody,
		});
		const body = new Uint8Array(await response.arrayBuffer());
		console.log(
			JSON.stringify({
				path: url.pathname,
				contentType: request.headers.get("content-type"),
				contentEncoding: request.headers.get("content-encoding"),
				request: new TextDecoder().decode(requestBody).slice(0, 2_000),
				status: response.status,
				response: new TextDecoder().decode(body),
			}),
		);
		return new Response(body, { status: response.status, headers: response.headers });
	},
});

console.log(`OTLP proxy listening at ${server.url}`);
