import { context, type SpanContext, SpanKind, SpanStatusCode, TraceFlags, trace } from "@opentelemetry/api";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { LoggerProvider, type LogRecordExporter, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import {
	BasicTracerProvider,
	type IdGenerator,
	SimpleSpanProcessor,
	type SpanExporter,
} from "@opentelemetry/sdk-trace-base";

const TRACE_ID = "11111111111111111111111111111111";
const ROOT_SPAN_ID = "2222222222222222";
const CHILD_SPAN_ID = "3333333333333333";
const LINK_TRACE_ID = "44444444444444444444444444444444";
const LINK_SPAN_ID = "5555555555555555";

const endpoint = (process.argv[2] ?? "http://127.0.0.1:4318").replace(/\/$/u, "");

const resource = (name: string) =>
	resourceFromAttributes({
		"service.namespace": "belfry-acceptance",
		"service.name": name,
		"deployment.environment.name": "test",
		"service.version": "1.0.0",
	});

const idGenerator = (spanId: string): IdGenerator => ({
	generateTraceId: () => TRACE_ID,
	generateSpanId: () => spanId,
});

const exportFailures: Array<string> = [];
const reportTraceExport = (delegate: SpanExporter, label: string): SpanExporter => ({
	export: (spans, callback) =>
		delegate.export(spans, (result) => {
			if (result.code !== 0) exportFailures.push(`${label}: ${result.error?.message ?? "export failed"}`);
			callback(result);
		}),
	shutdown: () => delegate.shutdown(),
});
const reportLogExport = (delegate: LogRecordExporter, label: string): LogRecordExporter => ({
	export: (logs, callback) =>
		delegate.export(logs, (result) => {
			if (result.code !== 0) exportFailures.push(`${label}: ${result.error?.message ?? "export failed"}`);
			callback(result);
		}),
	forceFlush: () => delegate.forceFlush(),
	shutdown: () => delegate.shutdown(),
});
const traceExporter = (label: string) =>
	reportTraceExport(new OTLPTraceExporter({ url: `${endpoint}/v1/traces` }), label);
const frontendProvider = new BasicTracerProvider({
	resource: resource("frontend"),
	idGenerator: idGenerator(ROOT_SPAN_ID),
	spanProcessors: [new SimpleSpanProcessor(traceExporter("frontend trace"))],
});
const inventoryProvider = new BasicTracerProvider({
	resource: resource("inventory"),
	idGenerator: idGenerator(CHILD_SPAN_ID),
	spanProcessors: [new SimpleSpanProcessor(traceExporter("inventory trace"))],
});
const logProvider = new LoggerProvider({
	resource: resource("inventory"),
	processors: [
		new SimpleLogRecordProcessor({
			exporter: reportLogExport(new OTLPLogExporter({ url: `${endpoint}/v1/logs` }), "inventory log"),
		}),
	],
});

const frontend = frontendProvider.getTracer("belfry.acceptance.frontend", "1.0.0");
const inventory = inventoryProvider.getTracer("belfry.acceptance.inventory", "1.0.0");
const logger = logProvider.getLogger("belfry.acceptance.inventory", "1.0.0");

const root = frontend.startSpan("POST /checkout", {
	kind: SpanKind.SERVER,
	attributes: {
		"http.request.method": "POST",
		"http.route": "/checkout",
		"checkout.cart.items": 3,
	},
});
const rootContext = trace.setSpan(context.active(), root);
const linkedContext: SpanContext = {
	traceId: LINK_TRACE_ID,
	spanId: LINK_SPAN_ID,
	traceFlags: TraceFlags.SAMPLED,
};
const child = inventory.startSpan(
	"reserve inventory",
	{
		kind: SpanKind.CLIENT,
		attributes: {
			"inventory.sku": "BELFRY-42",
			"inventory.available": false,
		},
		links: [{ context: linkedContext, attributes: { reason: "retry" } }],
	},
	rootContext,
);
child.addEvent("inventory.declined", {
	available: 0,
	requested: 3,
});
child.setStatus({ code: SpanStatusCode.ERROR, message: "inventory unavailable" });

logger.emit({
	context: trace.setSpan(context.active(), child),
	eventName: "inventory.reservation.declined",
	severityNumber: SeverityNumber.ERROR,
	severityText: "ERROR",
	body: {
		message: "inventory reservation declined",
		sku: "BELFRY-42",
		requested: 3,
		retryable: false,
		evidence: ["warehouse-a", 0, false],
		fingerprint: new Uint8Array([0xbe, 0x1f, 0x42]),
	},
	attributes: {
		"inventory.sku": "BELFRY-42",
		"exception.type": "InventoryUnavailable",
		retryable: false,
	},
});

child.end();
root.setStatus({ code: SpanStatusCode.ERROR, message: "checkout failed" });
root.end();

await Promise.all([frontendProvider.forceFlush(), inventoryProvider.forceFlush(), logProvider.forceFlush()]);
await Promise.all([frontendProvider.shutdown(), inventoryProvider.shutdown(), logProvider.shutdown()]);
if (exportFailures.length > 0) throw new Error(`OTLP SDK export failed: ${exportFailures.join("; ")}`);

console.log(
	JSON.stringify({
		endpoint,
		traceId: TRACE_ID,
		rootSpanId: ROOT_SPAN_ID,
		childSpanId: CHILD_SPAN_ID,
		services: ["belfry-acceptance/frontend/test", "belfry-acceptance/inventory/test"],
	}),
);
