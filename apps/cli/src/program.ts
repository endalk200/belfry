import { BelfryConfig } from "@belfry/config";
import { NodeServices } from "@effect/platform-node";
import { Effect, Layer } from "effect";

import { runCli } from "./cli/run.js";
import { handleCliFailure } from "./runtime/failures.js";
import { telemetryLayer } from "./runtime/telemetry.js";

const BelfryConfigLayer = BelfryConfig.layer;
const TelemetryLayer = telemetryLayer.pipe(Layer.provide(BelfryConfigLayer));
const MainLayer = Layer.mergeAll(BelfryConfigLayer, TelemetryLayer).pipe(Layer.provideMerge(NodeServices.layer));

export const program = runCli.pipe(Effect.provide(MainLayer), Effect.catchTags(handleCliFailure));
