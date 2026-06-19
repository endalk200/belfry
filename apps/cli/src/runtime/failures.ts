import { formatConfigError } from "@belfry/config";
import { Cause, Console, Data, Effect } from "effect";

export class ConfigValidationFailed extends Data.TaggedError("ConfigValidationFailed") {}

const printAndFail = <E>(error: E, message: string) => Console.error(message).pipe(Effect.andThen(Effect.fail(error)));

export const handleCliFailure = {
	ConfigFileAlreadyExists: (error: Parameters<typeof formatConfigError>[0]) =>
		printAndFail(error, formatConfigError(error)),
	ConfigFileParseError: (error: Parameters<typeof formatConfigError>[0]) =>
		printAndFail(error, formatConfigError(error)),
	ConfigFileWriteError: (error: Parameters<typeof formatConfigError>[0]) =>
		printAndFail(error, formatConfigError(error)),
	ConfigValidationFailed: (error: ConfigValidationFailed) => Effect.fail(error),
	ExplicitConfigFileNotFound: (error: Parameters<typeof formatConfigError>[0]) =>
		printAndFail(error, formatConfigError(error)),
	InvalidConfigPath: (error: Parameters<typeof formatConfigError>[0]) =>
		printAndFail(error, formatConfigError(error)),
	InvalidTelemetryEndpoint: (error: Parameters<typeof formatConfigError>[0]) =>
		printAndFail(error, formatConfigError(error)),
	InvalidTelemetryEnvironment: (error: Parameters<typeof formatConfigError>[0]) =>
		printAndFail(error, formatConfigError(error)),
} as const;

const handledCliFailureTags = new Set(Object.keys(handleCliFailure));

const isHandledCliFailure = (error: unknown): boolean =>
	typeof error === "object" &&
	error !== null &&
	"_tag" in error &&
	typeof (error as { readonly _tag: unknown })._tag === "string" &&
	handledCliFailureTags.has((error as { readonly _tag: string })._tag);

const isAlreadyReportedCliFailure = (cause: Cause.Cause<unknown>): boolean =>
	cause.reasons.length > 0 &&
	cause.reasons.every((reason) => Cause.isFailReason(reason) && isHandledCliFailure(reason.error));

export const reportUnexpectedCliFailure = (cause: Cause.Cause<unknown>) =>
	isAlreadyReportedCliFailure(cause)
		? Effect.failCause(cause)
		: Console.error(`Unexpected Belfry failure:\n${Cause.pretty(cause)}`).pipe(
				Effect.andThen(Effect.failCause(cause)),
			);
