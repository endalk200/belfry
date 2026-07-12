import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { assert, describe, it } from "@effect/vitest";

describe("OpenTUI PTY lifecycle", () => {
	it("renders and restores the real alternate screen through a pseudo-terminal", async () => {
		const directory = mkdtempSync(join(tmpdir(), "belfry-tui-pty-"));
		const transcriptPath = join(directory, "typescript");
		const harness = fileURLToPath(new URL("./pty.test-harness.ts", import.meta.url));
		const expectProgram = `
			proc fail_and_stop {code} {
				set child [exp_pid]
				catch {exec kill -TERM $child}
				catch {close}
				catch {wait}
				exit $code
			}
			log_file -noappend {${transcriptPath}}
			set timeout 20
			spawn -noecho bun --conditions=development run {${harness}}
			expect {
				-re {BELFRY} {}
				timeout {fail_and_stop 124}
				eof {
					set result [wait]
					exit [lindex $result 3]
				}
			}
			after 100
			send -- "q"
			expect {
				eof {}
				timeout {fail_and_stop 124}
			}
			set result [wait]
			exit [lindex $result 3]
		`;
		const child = spawnSync("/usr/bin/expect", ["-c", expectProgram], {
			cwd: process.cwd(),
			encoding: "utf8",
			env: { ...process.env, NO_COLOR: "1", TERM: "xterm-256color" },
			timeout: 25_000,
		});
		const transcript = readFileSync(transcriptPath, "utf8");

		assert.strictEqual(child.status, 0, `${child.stdout}\n${child.stderr}`);
		assert.include(transcript, "BELFRY");
		assert.include(transcript, "BELFRY_PTY_COMPLETE");
		assert.include(transcript, "\u001b[?1049h");
		assert.include(transcript, "\u001b[?1049l");
	});
});
