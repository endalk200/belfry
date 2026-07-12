import { BelfryConfig } from "@belfry/config";
import { DaemonManager, makeDaemonManager } from "@belfry/daemon/lifecycle";
import { BunServices } from "@effect/platform-bun";
import { Effect, Layer } from "effect";

import { runCli } from "./cli/run.js";
import { handleCliFailure, reportUnexpectedCliFailure } from "./runtime/failures.js";
import { telemetryLayer } from "./runtime/telemetry.js";

const BelfryConfigLayer = BelfryConfig.layer;
const DaemonManagerLayer = Layer.effect(
	DaemonManager,
	Effect.map(BelfryConfig, (configuration) => makeDaemonManager({ configuration })),
).pipe(Layer.provide(BelfryConfigLayer));
const TelemetryLayer = telemetryLayer.pipe(Layer.provide(BelfryConfigLayer));
const MainLayer = Layer.mergeAll(BelfryConfigLayer, DaemonManagerLayer, TelemetryLayer).pipe(
	Layer.provideMerge(BunServices.layer),
);

export const program = runCli.pipe(
	Effect.provide(MainLayer),
	Effect.scoped,
	Effect.catchTags(handleCliFailure),
	Effect.catchCause(reportUnexpectedCliFailure),
);
