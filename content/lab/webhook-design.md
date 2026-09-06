# Sample design: processing duplicate webhook deliveries

## Status and assumptions

This document is a synthetic engineering example for the workbench. It is not a claim about a deployed customer system or a specific open-source contribution. The example provider can deliver the same event more than once, and queue workers can retry jobs after interruption.

## Event identity and acceptance

Identify an event by the pair tenant_id and provider_event_id. Verify the provider signature before accepting the event. Insert the event into an inbox table with a unique constraint on that pair. A conflicting insert identifies a duplicate; acknowledge it without creating another logical job. Distinct tenants may legitimately have equal provider event IDs.

## Durable scheduling

Write the inbox row and an outbox scheduling record in the same database transaction. A dispatcher publishes pending outbox records to the queue and records delivery. If publishing is repeated after a crash, the worker still uses the original event identity. An atomic database constraint protects concurrent arrivals; a separate check followed by an insert would leave a race.

## Worker retries and external effects

Before applying a database change, a worker checks and updates durable processing state in the same transaction as that change. External effects require another boundary: pass a stable idempotency key to a provider that supports it. Without provider support or reconciliation, a timeout after an external effect can leave its outcome unknown. Inbox deduplication alone does not guarantee exactly-once external effects.

## Verification strategy

Test simultaneous duplicate deliveries, worker interruption before commit, queue redelivery, and timeout after an external effect. Assert that one logical event is accepted per tenant and provider event ID. The sample design has no production throughput or latency measurements.
