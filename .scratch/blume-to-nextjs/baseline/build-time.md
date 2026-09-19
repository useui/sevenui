# Baseline build time — `blume build` (pre-cutover)

Captured for §18.5. Stage 11 compares the Next.js build against these
numbers; a >3x regression is a signal the shape is wrong, not a failing gate.
This baseline stops existing the moment Blume is removed (Stage 10), which is
why it is captured here in Stage 0.

## Command

```bash
rm -rf apps/web/.blume apps/web/dist
/usr/bin/time -p pnpm --filter @sevenui/web build
```

## Measurements

| Run  | real (s) | user (s) | sys (s) | Notes |
|------|---------:|---------:|--------:|-------|
| Cold | 23.26 | 38.17 | 8.81 | Ran immediately after `rm -rf apps/web/.blume apps/web/dist` |
| Warm | 23.80 | 37.83 | 7.42 | Second consecutive run, `.blume`/`dist` from the cold run left in place (not cleared again) |

Both runs completed successfully (`[blume] ✔ Built to
/Users/oguzhanyilmaz/Documents/Projects/github@useui/sevenui/apps/web/dist`).
The cold and warm numbers are effectively identical (~23-24s) — this build
has no meaningful cache-warm speedup on this machine/toolchain.

## Machine

- CPU: Apple M1 Pro
- Cores: 10
- RAM: 32 GB (34359738368 bytes)
- OS: macOS 26.6.2 (build 25G83)
- Node: v24.20.0
- Package manager: pnpm (workspace filter `@sevenui/web`)

## Commit

`main` @ `865bb7706855330b9b4ded5805867a3d56030170` (short: `865bb77`) — the
commit confirmed live in production for this Stage 0 capture.

## Caveat

Three unrelated Vite dev servers were running on this machine during both
measurements, belonging to separate checkouts (`sevenui-pro`,
`sevenui-pro-2`), on ports 5173 and 5199 (plus a third ad hoc Vite config
process). They were **not** stopped — stopping any dev server requires a
human gate, and these belong to a different project entirely. They were left
running throughout both build runs. This is a stated caveat on the numbers
above, not a controlled/idle-machine measurement.

## Capture time

2026-09-19T12:11Z (approx.), on `main`.
