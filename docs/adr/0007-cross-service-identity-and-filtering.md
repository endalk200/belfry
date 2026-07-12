# Cross-Service Identity and Filtering

Status: Accepted

Belfry identifies a Service by the combination of its OpenTelemetry service
namespace, service name, and deployment environment instead of by service name
alone. Service Filters default to all Services, allow multi-selection, match a
trace when any participating span belongs to a selected Service, and never
remove other Services from the opened trace. Log records match the Service on
their resource. This prevents root-span ownership from hiding distributed work
and gives the web and terminal interfaces the same filtering semantics.
