# Sample incident: one event created two jobs

## Status

This is a constructed incident for investigating evidence. All observations below belong to the sample scenario. They are not production metrics, a customer incident, or an account of the portfolio owner's employment.

## Observed sequence

At 10:02:00, delivery A arrived for tenant atlas with provider event evt_104. At 10:02:01, the handler queued job job_701. Its acknowledgement was lost. At 10:02:05, the provider retried the same event; delivery B queued job job_702. Both jobs described the same underlying event, but the old implementation used a newly generated job ID as its only uniqueness check.

## Diagnosis

The incident's evidence points to event identity being discarded at the enqueue boundary. Checking whether job_702 already existed could not detect job_701 as the same event. The missing invariant was uniqueness of tenant_id plus provider_event_id across deliveries. A queue job ID alone was insufficient in this sample implementation.

## Remediation and observed verification

The sample patch persisted the original event identity in an inbox with a unique database constraint and created an outbox entry in the same transaction. In the constructed regression scenario, replaying both deliveries accepted one logical event and classified the second as a duplicate. This result concerns inbox acceptance only; external side effects still require their own idempotency strategy.

## Missing evidence

The incident record contains no production p95 latency, financial loss estimate, or guarantee of exactly-once delivery. If asked for those values, an answer should explicitly state that the selected documents do not supply them. Removing this incident document also removes the concrete event ID, job IDs, and observed sequence from the available evidence.
