# Telemetry Policy Skill

Use this card before adding telemetry or external reporting.

## Rules

- Telemetry is opt-in by default.
- CI telemetry is disabled by default.
- Publishing requires `publish_to_123charts=true`.
- Telemetry must not include secrets, environment values, logs, private repo data, founder private data, or raw request bodies.
- MCP telemetry can contain aggregate counters only.
- Telemetry must never change product behavior.

## Required Review

Any new telemetry task must reference `ops/contracts/telemetry.json` and include:

- data fields
- destination
- retention expectation
- opt-in mechanism
- failure mode
