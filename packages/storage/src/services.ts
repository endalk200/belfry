import { Context, Effect, Layer } from "effect";

import { openTelemetryReader, TelemetryStorage, type TelemetryStorageOptions } from "./storage.js";
import type { TelemetryReaderService, TelemetryStorageService } from "./types.js";

export type TelemetryWriterService = Pick<TelemetryStorageService, "information" | "write">;
export type TelemetryRetentionService = Pick<TelemetryStorageService, "retain" | "checkpoint" | "vacuum" | "reset">;
export type TelemetryDiagnosticsService = Pick<
	TelemetryStorageService,
	"health" | "ingestionStats" | "listDiagnostics" | "recordIngestionFailure"
>;

export class TelemetryWriter extends Context.Service<TelemetryWriter, TelemetryWriterService>()(
	"@belfry/storage/TelemetryWriter",
) {
	static readonly layer = Layer.effect(TelemetryWriter)(
		TelemetryStorage.pipe(Effect.map(({ information, write }) => ({ information, write }))),
	);
}

export class TelemetryQuery extends Context.Service<TelemetryQuery, TelemetryReaderService>()(
	"@belfry/storage/TelemetryQuery",
) {
	static readonly layer = Layer.effect(TelemetryQuery)(
		TelemetryStorage.pipe(
			Effect.map(
				({
					information,
					searchTraces,
					getTrace,
					getSpan,
					listTraceLogs,
					searchLogs,
					getLog,
					listServices,
					listDiagnostics,
					facets,
					health,
					ingestionStats,
				}) => ({
					information,
					searchTraces,
					getTrace,
					getSpan,
					listTraceLogs,
					searchLogs,
					getLog,
					listServices,
					listDiagnostics,
					facets,
					health,
					ingestionStats,
				}),
			),
		),
	);

	static readonly readerLayer = (options: TelemetryStorageOptions) =>
		Layer.effect(TelemetryQuery)(openTelemetryReader(options));
}

export class TelemetryRetention extends Context.Service<TelemetryRetention, TelemetryRetentionService>()(
	"@belfry/storage/TelemetryRetention",
) {
	static readonly layer = Layer.effect(TelemetryRetention)(
		TelemetryStorage.pipe(
			Effect.map(({ retain, checkpoint, vacuum, reset }) => ({ retain, checkpoint, vacuum, reset })),
		),
	);
}

export class TelemetryDiagnostics extends Context.Service<TelemetryDiagnostics, TelemetryDiagnosticsService>()(
	"@belfry/storage/TelemetryDiagnostics",
) {
	static readonly layer = Layer.effect(TelemetryDiagnostics)(
		TelemetryStorage.pipe(
			Effect.map(({ health, ingestionStats, listDiagnostics, recordIngestionFailure }) => ({
				health,
				ingestionStats,
				listDiagnostics,
				recordIngestionFailure,
			})),
		),
	);
}

export const telemetryWriterRuntimeLayer = (options: TelemetryStorageOptions) =>
	Layer.mergeAll(TelemetryWriter.layer, TelemetryRetention.layer, TelemetryDiagnostics.layer).pipe(
		Layer.provide(TelemetryStorage.layer(options)),
	);
