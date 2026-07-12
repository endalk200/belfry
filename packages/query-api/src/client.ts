import { Effect } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";

import { BelfryApi } from "./api.js";

export type BelfryClient = HttpApiClient.ForApi<typeof BelfryApi>;

export const makeBelfryClient = (endpoint: string): Effect.Effect<BelfryClient> =>
	HttpApiClient.make(BelfryApi, { baseUrl: endpoint }).pipe(Effect.provide(FetchHttpClient.layer));
