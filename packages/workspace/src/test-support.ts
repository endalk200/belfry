import type { ServiceSummary } from "@belfry/query-api";
import type { LogDetail, LogSummary, TraceDetail, TraceSpanDetail, TraceSummary } from "@belfry/telemetry";

const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
const spanId = "00f067aa0ba902b7";
const childSpanId = "3333333333333333";
const logId = "01JYBelfryLog00000000000001";
const startNs = 1_781_420_000_000_000_001n;
const endNs = 1_781_420_000_009_000_001n;
const service = { namespace: "shop", name: "checkout", environment: "test" } as const;
const resource = {
	attributes: {
		"service.name": { type: "string", value: "checkout" },
		"deployment.environment.name": { type: "string", value: "test" },
	},
	droppedAttributesCount: 2,
} as const;
const scope = {
	name: "checkout-instrumentation",
	version: "1.2.3",
	attributes: { "scope.detail": { type: "boolean", value: true } },
	droppedAttributesCount: 3,
} as const;

const rootSpan: TraceSpanDetail = {
	traceId,
	spanId,
	depth: 0,
	traceState: "vendor=sampled",
	flags: 1,
	name: "GET /checkout",
	kind: 2,
	startTimeNs: startNs,
	endTimeNs: endNs,
	service,
	status: { code: 2, message: "payment declined" },
	attributes: {
		"http.route": { type: "string", value: "/checkout" },
		"http.method": { type: "string", value: "GET" },
		"cart.items": { type: "integer", value: 2n },
	},
	filterableAttributeKeys: ["http.route", "http.method", "cart.items"],
	droppedAttributesCount: 4,
	events: [
		{
			name: "checkout.authorized",
			timeNs: 1_781_420_000_004_000_001n,
			attributes: { approved: { type: "boolean", value: false } },
			droppedAttributesCount: 5,
		},
	],
	droppedEventsCount: 6,
	links: [
		{
			traceId: "11111111111111111111111111111111",
			spanId: "2222222222222222",
			traceState: "linked=true",
			flags: 1,
			attributes: { relation: { type: "string", value: "follows-from" } },
			droppedAttributesCount: 7,
		},
	],
	droppedLinksCount: 8,
	resource,
	scope,
	logCount: 1,
	warnings: [],
};

const childSpan: TraceSpanDetail = {
	...rootSpan,
	spanId: childSpanId,
	depth: 1,
	parentSpanId: spanId,
	name: "charge card",
	kind: 3,
	startTimeNs: 1_781_420_000_003_000_001n,
	endTimeNs: 1_781_420_000_007_000_001n,
	attributes: {},
	filterableAttributeKeys: [],
	droppedAttributesCount: 0,
	events: [],
	droppedEventsCount: 0,
	links: [],
	droppedLinksCount: 0,
	logCount: 0,
};

const traceSummary: TraceSummary = {
	traceId,
	rootSpanId: spanId,
	rootOperation: "GET /checkout",
	startTimeNs: startNs,
	endTimeNs: endNs,
	durationNs: 9_000_000n,
	active: false,
	spanCount: 2,
	errorCount: 1,
	services: [service],
	warnings: [],
};

const logSummary: LogSummary = {
	id: logId,
	timestampNs: 1_781_420_000_008_000_001n,
	observedTimeNs: 1_781_420_000_008_000_010n,
	service,
	severityNumber: 17,
	severityText: "ERROR",
	bodyPreview: "payment declined",
	traceId,
	spanId,
	truncated: false,
};

const logDetail: LogDetail = {
	...logSummary,
	traceFlags: 1,
	body: {
		type: "key-value-list",
		value: {
			message: { type: "string", value: "payment declined with complete context" },
			attempt: { type: "integer", value: 2n },
		},
	},
	attributes: {
		"request.user_agent": { type: "string", value: "belfry-e2e" },
		sampled: { type: "boolean", value: true },
	},
	filterableAttributeKeys: ["request.user_agent", "sampled"],
	droppedAttributesCount: 9,
	eventName: "payment.declined",
	resource,
	scope,
};

const traceDetail: TraceDetail = {
	...traceSummary,
	spans: [rootSpan, childSpan],
	logs: [logSummary],
};

const serviceSummary: ServiceSummary = {
	service,
	firstSeenNs: startNs,
	lastSeenNs: endNs,
	spanCount: 2,
	logCount: 150,
	errorCount: 1,
	unknownService: false,
};

export const workspaceScenario = {
	traceId,
	spanId,
	childSpanId,
	logId,
	startNs,
	endNs,
	service,
	traceSummary,
	traceDetail,
	logSummary,
	logDetail,
	serviceSummary,
	makeLogSummaries: (count: number): ReadonlyArray<LogSummary> =>
		Array.from({ length: Math.max(0, Math.trunc(count)) }, (_, index) => ({
			...logSummary,
			id: index === 0 ? logId : `${logId}-${index}`,
			bodyPreview: index === 0 ? logSummary.bodyPreview : `checkout log ${index}`,
		})),
} as const;
