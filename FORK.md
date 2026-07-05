# Fork allocation ledger — xtls-sdk

This fork (`kirisame-meguru/xtls-sdk`) carries the **per-user-per-inbound traffic stats** feature directly
on **`main`** (`main` is the feature branch). See `../FORK-RESILIENCE.md` for the sync playbook.

## Branch base: upstream 0.17.0 for node 3.4.4

Rebased onto upstream **0.17.0**, with fork version **0.17.1**. This matches node 3.4.4's SDK
dependency while preserving `getAllUsersInboundsStats`. The historical 0.12.4 pin is gone:
node 2.8.0 deleted the Vision/IP-block module, so nothing needs the old router API.

## Allocation table

| Namespace | Symbol | File | Fork value | Upstream-conventional (PR-time) |
|-----------|--------|------|-----------|----------------------------------|
| error code | `GET_ALL_USERS_INBOUNDS_STATS_ERROR` | `src/common/errors/stats/stats.errors.ts` | **F900** | A011 |
| own package version | xtls-sdk | `package.json` | 0.17.0 → 0.17.1 | revert for PR |
| stats query pattern | `getAllUsersInboundsStats` pattern `useri>>>` | `src/stats/stats.service.ts` | reserved prefix `useri>>>` | (unchanged) |

Error codes use a reserved **F-prefix band** (independent namespace from node; reuse of `F900` across
repos is fine). The query pattern `useri>>>` matches the counter emitted by xray-core and is parsed
with a strict 6-segment guard (`useri / {email} / inbound / {tag} / traffic / {uplink|downlink}`) —
disjoint from the legacy 4-segment `user>>>` counters, documented only. `getAllUsersInboundsStats`
calls `this.client.queryStats({ pattern: 'useri>>>', reset })`, mirroring the sibling stats methods.

## CI note

`.github/workflows/deploy-lib.yml` is disabled to `workflow_dispatch` ([remnawave-fork] marker) — the
inherited workflow publishes `@remnawave/xtls-sdk` to public npm, which the fork can't do. The SDK is
vendored into node as `node/vendor/remnawave-xtls-sdk-0.17.1.tgz` instead.

## For PR / version handling

- Revert the own `version` bump (0.17.0 → 0.17.1) — the maintainer owns releases.
- Map error code **F900 → A011** at PR time.
- A real PR targets current upstream directly; the old 0.12.x deployment constraint no longer applies.
