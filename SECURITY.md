# Security policy

## Supported version

Security fixes are made for the latest published `@belfry/cli` version. Belfry
is pre-1.0 local development software; users should upgrade rather than expect
backports to older minor releases.

## Reporting a vulnerability

Please use GitHub's private security-advisory reporting flow for this repository
instead of opening a public issue with exploit details. Include the affected
version, operating system, reproduction steps, impact, and any suggested
mitigation. Ordinary bugs that do not expose local data or cross the local
process boundary can use the public issue tracker.

## Security boundary

Belfry is intentionally local-only. It binds only to a loopback address and
validates HTTP `Host` and browser `Origin`, but it does not authenticate users or
provide tenant isolation. Do not expose it through a proxy, tunnel, container
port publication, or remote bind workaround.

Telemetry can contain secrets and personal data. Belfry keeps local state
private to the current OS user and does not upload received records, but the
instrumented application remains responsible for redacting unsafe telemetry
before export. See [Operations, Privacy, and Security](docs/11-operations-security.md)
for retention, reset, and durability details.
