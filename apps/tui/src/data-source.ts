import type { ServiceIdentity } from "@belfry/telemetry";
import { formatService } from "@belfry/workspace";

export { makeWorkspaceDataSource, type WorkspaceDataSource } from "@belfry/workspace";

export const serviceFilterLabel = (services: ReadonlyArray<ServiceIdentity>): string =>
	services.length === 0 ? "all Services" : services.map(formatService).join(", ");
