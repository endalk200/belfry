#!/usr/bin/env bun
import { BunRuntime } from "@effect/platform-bun";

import { program } from "./program.js";

BunRuntime.runMain(program, {
	disableErrorReporting: true,
});
