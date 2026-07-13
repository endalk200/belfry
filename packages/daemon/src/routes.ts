import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	type IngestionAdmissionService,
	type IngestionError,
	IngestionInvalidPayload,
	IngestionOverloaded,
	IngestionPayloadTooLarge,
	IngestionUnavailable,
	IngestionUnsupportedEncoding,
	IngestionUnsupportedMediaType,
	makeOtlpErrorResponse,
	makeOtlpSuccessResponse,
} from "@belfry/ingestion";
import { Effect, Stream } from "effect";
import { HttpRouter, HttpServerResponse } from "effect/unstable/http";
import {
	HttpServerRequest as CurrentHttpServerRequest,
	type HttpServerRequest,
	fromWeb as httpServerRequestFromWeb,
} from "effect/unstable/http/HttpServerRequest";

class QueryRequestBodyTooLarge extends Error {}

export const makeDaemonRequestBoundary = (queryBodyLimitBytes: number) =>
	HttpRouter.middleware(
		(httpEffect) =>
			Effect.flatMap(CurrentHttpServerRequest, (request) => {
				const host = request.headers.host;
				const origin = request.headers.origin;
				if (!isLoopbackHostHeader(host) || (origin !== undefined && !isLoopbackOrigin(origin))) {
					return Effect.succeed(
						HttpServerResponse.text("Belfry only accepts requests from this machine.", {
							status: 403,
							headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" },
						}),
					);
				}
				if (!isQueryApiPost(request)) return httpEffect;
				const source = request.source;
				if (!(source instanceof Request)) return Effect.succeed(queryBodyReadFailureResponse);

				const declaredLength = Number(request.headers["content-length"] ?? "0");
				if (Number.isFinite(declaredLength) && declaredLength > queryBodyLimitBytes) {
					return Effect.succeed(queryBodyLimitResponse(queryBodyLimitBytes));
				}

				return readQueryRequestBody(request, queryBodyLimitBytes).pipe(
					Effect.result,
					Effect.flatMap((result) => {
						if (result._tag === "Failure") {
							return Effect.succeed(
								result.failure instanceof QueryRequestBodyTooLarge
									? queryBodyLimitResponse(queryBodyLimitBytes)
									: queryBodyReadFailureResponse,
							);
						}

						const replayedRequest = httpServerRequestFromWeb(
							new Request(source.url, {
								method: source.method,
								headers: source.headers,
								body: result.success.buffer as ArrayBuffer,
								signal: source.signal,
							}),
						);
						return httpEffect.pipe(Effect.provideService(CurrentHttpServerRequest, replayedRequest));
					}),
				);
			}),
		{ global: true },
	);

const isQueryApiPost = (request: HttpServerRequest): boolean =>
	request.method === "POST" && new URL(request.url, "http://127.0.0.1").pathname.startsWith("/api/");

const queryBodyLimitResponse = (limitBytes: number) =>
	HttpServerResponse.text(`The Query API request body exceeds Belfry's ${limitBytes}-byte limit.`, {
		status: 413,
		headers: {
			"cache-control": "no-store",
			connection: "close",
			"x-content-type-options": "nosniff",
		},
	});

const queryBodyReadFailureResponse = HttpServerResponse.text("The Query API request body could not be read.", {
	status: 400,
	headers: {
		"cache-control": "no-store",
		connection: "close",
		"x-content-type-options": "nosniff",
	},
});

const readQueryRequestBody = (request: HttpServerRequest, limitBytes: number): Effect.Effect<Uint8Array, unknown> => {
	if (request.headers["content-length"] === "0") return Effect.succeed(new Uint8Array());
	return Stream.runFoldEffect(
		request.stream,
		(): BodyAccumulator => ({ chunks: [], bytes: 0 }),
		(accumulator, chunk) => {
			const bytes = accumulator.bytes + chunk.byteLength;
			if (bytes > limitBytes) {
				return Effect.fail(
					new QueryRequestBodyTooLarge(`The Query API request body exceeds the ${limitBytes}-byte limit.`),
				);
			}
			accumulator.chunks.push(chunk);
			return Effect.succeed({ chunks: accumulator.chunks, bytes });
		},
	).pipe(Effect.map(({ bytes, chunks }) => concatenateBytes(chunks, bytes)));
};

export const makeOtlpRoutes = (admission: IngestionAdmissionService, maxCompressedBytes: number) =>
	HttpRouter.addAll([
		HttpRouter.route("POST", "/v1/traces", (request) =>
			handleOtlpRequest(request, "traces", admission, maxCompressedBytes),
		),
		HttpRouter.route("POST", "/v1/logs", (request) =>
			handleOtlpRequest(request, "logs", admission, maxCompressedBytes),
		),
		HttpRouter.route("OPTIONS", "/v1/traces", (request) =>
			Effect.succeed(HttpServerResponse.empty({ status: 204, headers: otlpCorsHeaders(request) })),
		),
		HttpRouter.route("OPTIONS", "/v1/logs", (request) =>
			Effect.succeed(HttpServerResponse.empty({ status: 204, headers: otlpCorsHeaders(request) })),
		),
	]);

export type WebInterfacePreferences = {
	readonly refreshIntervalMs: number;
	readonly defaultRangeMinutes: number;
	readonly queryMaxResults: number;
	readonly queryMaxLookbackMinutes: number;
};

const defaultWebInterfacePreferences: WebInterfacePreferences = {
	refreshIntervalMs: 2_000,
	defaultRangeMinutes: 15,
	queryMaxResults: 500,
	queryMaxLookbackMinutes: 10_080,
};

export const makeWebRoutes = (
	configuredRoot?: string,
	preferences: WebInterfacePreferences = defaultWebInterfacePreferences,
) => {
	const webRoot = resolveWebRoot(configuredRoot);
	if (webRoot === undefined) {
		return HttpRouter.add(
			"GET",
			"/*",
			HttpServerResponse.text(
				`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Belfry web assets unavailable</title></head><body><main><h1>Web assets unavailable</h1><p>Run <code>bun run build</code> or reinstall Belfry. The Daemon and Query API are still available.</p><p><a href="/api/health">Health</a> · <a href="/openapi.json">OpenAPI</a></p></main></body></html>`,
				{ status: 503, contentType: "text/html; charset=utf-8" },
			),
		);
	}

	return HttpRouter.addAll([
		HttpRouter.route("GET", "/assets/*", (request) => serveWebAsset(webRoot, request)),
		HttpRouter.route("GET", "/*", (request) => serveWebIndex(webRoot, request, preferences)),
	]);
};

export const resolveWebRoot = (configuredRoot?: string): string | undefined => {
	const candidates = [
		configuredRoot,
		process.env.BELFRY_WEB_ROOT,
		fileURLToPath(new URL("./web", import.meta.url)),
		fileURLToPath(new URL("../../../apps/web/dist", import.meta.url)),
	];
	return candidates.find(
		(candidate): candidate is string => candidate !== undefined && existsSync(join(candidate, "index.html")),
	);
};

const serveWebAsset = (webRoot: string, request: HttpServerRequest) => {
	const path = new URL(request.url, "http://127.0.0.1").pathname;
	const fileName = path.match(/^\/assets\/([A-Za-z0-9][A-Za-z0-9._-]*)$/u)?.[1];
	if (fileName === undefined) return Effect.succeed(HttpServerResponse.text("Not found", { status: 404 }));
	return readWebFile(join(webRoot, "assets", fileName), contentTypeFor(fileName), true);
};

const serveWebIndex = (webRoot: string, request: HttpServerRequest, preferences: WebInterfacePreferences) => {
	const path = new URL(request.url, "http://127.0.0.1").pathname;
	if (!isWorkspacePath(path)) return Effect.succeed(HttpServerResponse.text("Not found", { status: 404 }));
	return Effect.tryPromise({
		try: () => readFile(join(webRoot, "index.html"), "utf8"),
		catch: (cause) => cause,
	}).pipe(
		Effect.map((html) =>
			HttpServerResponse.text(injectWebPreferences(html, preferences), {
				contentType: "text/html; charset=utf-8",
				headers: webResponseHeaders(false),
			}),
		),
		Effect.catch(() => Effect.succeed(HttpServerResponse.text("Not found", { status: 404 }))),
	);
};

const readWebFile = (path: string, contentType: string, immutable: boolean) =>
	Effect.tryPromise({
		try: () => readFile(path),
		catch: (cause) => cause,
	}).pipe(
		Effect.map((bytes) =>
			HttpServerResponse.uint8Array(bytes, {
				contentType,
				headers: webResponseHeaders(immutable),
			}),
		),
		Effect.catch(() => Effect.succeed(HttpServerResponse.text("Not found", { status: 404 }))),
	);

const injectWebPreferences = (html: string, preferences: WebInterfacePreferences): string =>
	html.replace(
		'<div id="root"></div>',
		`<div id="root" data-refresh-interval-ms="${Math.max(1, Math.trunc(preferences.refreshIntervalMs))}" data-default-range-minutes="${Math.max(1, Math.trunc(preferences.defaultRangeMinutes))}" data-query-max-results="${Math.max(1, Math.trunc(preferences.queryMaxResults))}" data-query-max-lookback-minutes="${Math.max(1, Math.trunc(preferences.queryMaxLookbackMinutes))}"></div>`,
	);

const webResponseHeaders = (immutable: boolean) => ({
	"cache-control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
	"content-security-policy":
		"default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'",
	"x-content-type-options": "nosniff",
	"referrer-policy": "no-referrer",
});

const isWorkspacePath = (path: string): boolean =>
	path === "/" || path === "/traces" || path === "/logs" || /^\/traces\/[0-9a-f]{32}$/u.test(path);

const contentTypeFor = (fileName: string): string => {
	if (fileName.endsWith(".css")) return "text/css; charset=utf-8";
	if (fileName.endsWith(".js")) return "text/javascript; charset=utf-8";
	if (fileName.endsWith(".svg")) return "image/svg+xml";
	if (fileName.endsWith(".png")) return "image/png";
	if (fileName.endsWith(".woff2")) return "font/woff2";
	return "application/octet-stream";
};

const handleOtlpRequest = (
	request: HttpServerRequest,
	signal: "traces" | "logs",
	admission: IngestionAdmissionService,
	maxCompressedBytes: number,
) => {
	const contentType = request.headers["content-type"] ?? "";
	const declaredLength = Number(request.headers["content-length"] ?? "0");
	if (Number.isFinite(declaredLength) && declaredLength > maxCompressedBytes) {
		const message = "The compressed OTLP request exceeds Belfry's configured limit.";
		return admission
			.recordRejected({
				signal,
				code: "compressed_payload_too_large",
				message,
			})
			.pipe(
				Effect.as(
					otlpErrorResponse(
						request,
						contentType,
						new IngestionPayloadTooLarge({
							stage: "compressed",
							limitBytes: maxCompressedBytes,
							actualBytes: declaredLength,
							message,
						}),
					),
				),
			);
	}

	return admission
		.reserve(
			{
				signal,
				contentType,
				contentEncoding: request.headers["content-encoding"],
			},
			maxCompressedBytes,
		)
		.pipe(
			Effect.flatMap((reservation) =>
				readCompressedBody(request, signal, maxCompressedBytes).pipe(
					Effect.flatMap(reservation.submit),
					Effect.ensuring(reservation.release),
				),
			),
			Effect.map(() => {
				const response = makeOtlpSuccessResponse(signal, contentType);
				return HttpServerResponse.uint8Array(response.body, {
					status: 200,
					contentType: response.contentType,
					headers: otlpCorsHeaders(request),
				});
			}),
			Effect.catch((error) => {
				const response = isIngestionError(error)
					? otlpErrorResponse(request, contentType, error)
					: otlpErrorResponse(
							request,
							contentType,
							new IngestionUnavailable({
								code: "writer_unavailable",
								message: "The request body could not be read.",
							}),
						);
				return error instanceof IngestionPayloadTooLarge
					? admission
							.recordRejected({ signal, code: "compressed_payload_too_large", message: error.message })
							.pipe(Effect.as(response))
					: Effect.succeed(response);
			}),
		);
};

type BodyAccumulator = { readonly chunks: Array<Uint8Array>; readonly bytes: number };

const readCompressedBody = (
	request: HttpServerRequest,
	signal: "traces" | "logs",
	limitBytes: number,
): Effect.Effect<Uint8Array, unknown> => {
	if (request.headers["content-length"] === "0") return Effect.succeed(new Uint8Array());
	return Stream.runFoldEffect(
		request.stream,
		(): BodyAccumulator => ({ chunks: [], bytes: 0 }),
		(accumulator, chunk) => {
			const bytes = accumulator.bytes + chunk.byteLength;
			if (bytes > limitBytes) {
				return Effect.fail(
					new IngestionPayloadTooLarge({
						stage: "compressed",
						limitBytes,
						actualBytes: bytes,
						message: `The streamed ${signal} OTLP request exceeds Belfry's configured compressed limit.`,
					}),
				);
			}
			accumulator.chunks.push(chunk);
			return Effect.succeed({ chunks: accumulator.chunks, bytes });
		},
	).pipe(Effect.map(({ bytes, chunks }) => concatenateBytes(chunks, bytes)));
};

const concatenateBytes = (chunks: ReadonlyArray<Uint8Array>, length: number): Uint8Array => {
	const result = new Uint8Array(length);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return result;
};

const otlpErrorResponse = (request: HttpServerRequest, contentType: string, error: IngestionError) => {
	const status =
		error instanceof IngestionInvalidPayload
			? 400
			: error instanceof IngestionPayloadTooLarge
				? 413
				: error instanceof IngestionUnsupportedMediaType || error instanceof IngestionUnsupportedEncoding
					? 415
					: error instanceof IngestionOverloaded
						? 429
						: 503;
	const rpcCode = status === 400 ? 3 : status === 413 || status === 429 ? 8 : status === 415 ? 12 : 14;
	const response = makeOtlpErrorResponse(contentType, rpcCode, error.message);
	const headers = otlpCorsHeaders(request);
	return HttpServerResponse.uint8Array(response.body, {
		status,
		contentType: response.contentType,
		headers:
			status === 413
				? { ...headers, connection: "close" }
				: status === 429
					? { ...headers, "retry-after": "1" }
					: headers,
	});
};

const otlpCorsHeaders = (request: HttpServerRequest) => {
	const origin = request.headers.origin;
	return {
		...(origin === undefined ? {} : { "access-control-allow-origin": origin, vary: "Origin" }),
		"access-control-allow-methods": "POST, OPTIONS",
		"access-control-allow-headers": "content-type, content-encoding",
		"access-control-max-age": "600",
	} as const;
};

const isLoopbackHostHeader = (host: string | undefined): boolean => {
	if (host === undefined) return false;
	const match = /^(?:localhost|127\.0\.0\.1)(?::\d{1,5})?$|^\[::1\](?::\d{1,5})?$/u.exec(host);
	if (match === null) return false;
	const port = host.match(/:(\d+)$/u)?.[1];
	return port === undefined || Number(port) <= 65_535;
};

const isLoopbackOrigin = (origin: string): boolean => {
	try {
		const parsed = new URL(origin);
		return (
			(parsed.protocol === "http:" || parsed.protocol === "https:") &&
			parsed.origin === origin &&
			(parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1" || parsed.hostname === "[::1]")
		);
	} catch {
		return false;
	}
};

const isIngestionError = (error: unknown): error is IngestionError =>
	error instanceof IngestionInvalidPayload ||
	error instanceof IngestionOverloaded ||
	error instanceof IngestionPayloadTooLarge ||
	error instanceof IngestionUnavailable ||
	error instanceof IngestionUnsupportedEncoding ||
	error instanceof IngestionUnsupportedMediaType;
