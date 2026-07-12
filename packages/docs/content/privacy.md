# Local telemetry and privacy

Belfry listens on loopback by default and does not upload telemetry. No login or
cloud account is involved. Local-only does not mean harmless: spans and logs may
contain secrets, personal data, prompts, SQL, headers, cookies, or source code.

Belfry does not promise automatic redaction. Instrumentation remains responsible
for safe data. Belfry avoids automatically indexing obviously sensitive keys,
but complete records are retained for detail inspection until retention or an
explicit reset removes them.

Default retention is seven days or one GiB of live database content, whichever
limit is reached first. Use the explicit database maintenance commands to view
the path and statistics, vacuum, or reset the store.
