import { type ConfigValidationReport, validateBelfryConfig } from "@belfry/config";
import { Console, Effect } from "effect";
import { Command } from "effect/unstable/cli";
import { ConfigValidationFailed } from "../../../runtime/failures.js";

export const formatConfigValidationReport = (report: ConfigValidationReport): ReadonlyArray<string> => [
	report.file.message,
	report.env.message,
	report.effective.message,
];

export const configValidationHasFailures = (report: ConfigValidationReport): boolean =>
	[report.file, report.env, report.effective].some((status) => status._tag === "invalid");

export const validateCommand = Command.make("validate").pipe(
	Command.withDescription("Validate Belfry Configuration sources"),
	Command.withShortDescription("Validate config"),
	Command.withHandler(() =>
		Effect.gen(function* () {
			const report = yield* validateBelfryConfig;
			const hasFailures = configValidationHasFailures(report);

			const validationLogAttributes = {
				"belfry.config.path": report.path.path,
				"belfry.config.path_source": report.path.source,
				"belfry.config.valid": !hasFailures,
				"belfry.config.file_validation_status": report.file._tag,
				"belfry.config.env_validation_status": report.env._tag,
				"belfry.config.effective_validation_status": report.effective._tag,
			};

			if (hasFailures) {
				yield* Effect.logWarning("Belfry Configuration validation failed", validationLogAttributes);
			} else {
				yield* Effect.logInfo("Validated Belfry Configuration", validationLogAttributes);
			}

			for (const line of formatConfigValidationReport(report)) {
				yield* Console.log(line);
			}

			if (hasFailures) {
				return yield* Effect.fail(new ConfigValidationFailed());
			}
		}).pipe(
			Effect.withSpan("belfry.cli.config.validate", {
				attributes: {
					"cli.command": "config validate",
					"belfry.command": "config validate",
				},
			}),
			Effect.annotateLogs({
				"belfry.command": "config validate",
			}),
		),
	),
);
