import type { RetentionResult } from "@belfry/storage";
import { Effect } from "effect";

export const runRetentionUntilCurrent = <E>(
	runBatch: Effect.Effect<RetentionResult, E>,
): Effect.Effect<RetentionResult, E> =>
	Effect.gen(function* () {
		let result: RetentionResult;
		do {
			result = yield* runBatch;
			if (result.needsMore) yield* Effect.yieldNow;
		} while (result.needsMore);
		return result;
	});
