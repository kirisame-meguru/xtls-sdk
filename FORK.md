# Fork allocation ledger — xtls-sdk

This fork (`kirisame-meguru/xtls-sdk`) carries the **per-user-per-inbound traffic stats** feature on
branch `per-user-per-inbound-traffic-stats`. See `../FORK-RESILIENCE.md` for the sync playbook.

## Branch base: current upstream (0.16.x)

Rebased onto upstream **0.16.0**. The historical 0.12.4 pin is **gone**: it existed because node's
Vision/IP-block module called `router.addSrcIpRule()` (removed upstream in xtls-sdk 0.13.0), but
**node 2.8.0 deleted the entire Vision module**, so nothing needs the 0.12.x router API anymore.
node 2.8.0 depends on `@remnawave/xtls-sdk` 0.16.0 → this feature tracks the same line. Rebase
forward with upstream normally now (no pin).

## Allocation table

| Namespace | Symbol | File | Fork value | Upstream-conventional (PR-time) |
|-----------|--------|------|-----------|----------------------------------|
| error code | `GET_ALL_USERS_INBOUNDS_STATS_ERROR` | `src/common/errors/stats/stats.errors.ts` | **F900** | A011 |
| own package version | xtls-sdk | `package.json` | 0.16.0 → 0.16.1 | revert for PR |
| stats query pattern | `getAllUsersInboundsStats` pattern `useri>>>` | `src/stats/stats.service.ts` | reserved prefix `useri>>>` | (unchanged) |

Error codes use a reserved **F-prefix band** (independent namespace from node; reuse of `F900` across
repos is fine). The query pattern `useri>>>` matches the counter emitted by xray-core and is parsed
with a strict 6-segment guard (`useri / {email} / inbound / {tag} / traffic / {uplink|downlink}`) —
disjoint from the legacy 4-segment `user>>>` counters, documented only. `getAllUsersInboundsStats`
calls `this.client.queryStats({ pattern: 'useri>>>', reset })`, mirroring the sibling stats methods.

## CI note

`.github/workflows/deploy-lib.yml` is disabled to `workflow_dispatch` ([remnawave-fork] marker) — the
inherited workflow publishes `@remnawave/xtls-sdk` to public npm, which the fork can't do. The SDK is
vendored into node as a `npm pack` tarball (`node/vendor/remnawave-xtls-sdk-0.16.1.tgz`) instead. This
edit never fires in the fork flow (no tags are pushed to origin) but is kept to match fork intent.

## For PR / version handling

- Revert the own `version` bump (0.16.0 → 0.16.1) — the maintainer owns releases. This repo has no
  lockfile, so the version line is the only release-coupled change.
- Map error code **F900 → A011** at PR time.
- A real PR targets current upstream directly; the old 0.12.x deployment constraint no longer applies.
