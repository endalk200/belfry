import { Effect } from "effect";
import type { SqlClient as SqlClientType } from "effect/unstable/sql/SqlClient";
import * as SqlClient from "effect/unstable/sql/SqlClient";

export const query = <A extends object>(
	client: SqlClientType,
	statement: string,
	parameters: ReadonlyArray<unknown> = [],
) => client.unsafe<A>(statement, parameters).pipe(Effect.provideService(SqlClient.SafeIntegers, true));

export const execute = (client: SqlClientType, statement: string, parameters: ReadonlyArray<unknown> = []) =>
	query<Record<string, unknown>>(client, statement, parameters).pipe(Effect.asVoid);

export const executeRows = (
	client: SqlClientType,
	statement: string,
	rows: ReadonlyArray<ReadonlyArray<unknown>>,
	suffix = "",
) =>
	Effect.gen(function* () {
		const width = rows[0]?.length ?? 0;
		if (width === 0 || rows.some((row) => row.length !== width)) {
			if (rows.length === 0) return;
			return yield* Effect.die("Bulk SQL rows must have one or more consistently sized columns");
		}
		const rowsPerStatement = Math.max(1, Math.floor(16_000 / width));
		for (const chunk of chunks(rows, rowsPerStatement)) {
			const values = Array.from({ length: chunk.length }, () => `(${placeholders(width)})`).join(", ");
			yield* execute(
				client,
				`${statement} VALUES ${values}${suffix === "" ? "" : ` ${suffix}`}`,
				chunk.flatMap((row) => [...row]),
			);
		}
	});

export const deleteSpanProjections = (
	client: SqlClientType,
	table: "span_attributes" | "span_search",
	keys: ReadonlyArray<readonly [string, string]>,
) =>
	Effect.gen(function* () {
		for (const chunk of chunks(keys, 400)) {
			const tuples = Array.from({ length: chunk.length }, () => "(?, ?)").join(", ");
			yield* execute(client, `DELETE FROM ${table} WHERE (trace_id, span_id) IN (${tuples})`, chunk.flat());
		}
	});

export const chunks = <A>(values: ReadonlyArray<A>, size: number): ReadonlyArray<ReadonlyArray<A>> => {
	const result: Array<ReadonlyArray<A>> = [];
	for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
	return result;
};

export const placeholders = (length: number): string => Array.from({ length }, () => "?").join(", ");

export const escapeLike = (value: string): string =>
	value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");

export const ftsPhrase = (value: string): string => `"${value.trim().replaceAll('"', '""')}"`;
