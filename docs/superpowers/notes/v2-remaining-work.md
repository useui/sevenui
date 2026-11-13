# v2 remaining work

Parked on 2026-11-13. Pick this up when the owner asks what is left to do for
v2. `feat/v2` (projects 1 and 2) is already merged into `main`; the work below
is still to come. Neither project has a spec yet: each starts with a spec, then a plan.

"v2" is the program's working name. The release it produces is version 1.1
(owner's decision, 2026-11-13), not 2.0.

Order is fixed: project 3, then project 4, then the release (project 5).

## Project 3: agent channel without MCP

Static content that lets a coding agent use SevenUI correctly with nothing
installed. It works in any agent that can read a file or a URL.

Scope as agreed on 2026-11-03:

- A "For agents" tab on the site.
- A rules file the user drops into their own project.
- Markdown versions of the pages.

Already in the repo, contents not yet reviewed against that scope:

- `apps/web/app/llms.txt` and `apps/web/app/llms-full.txt` (routes).
- `apps/web/app/index.md` (route) and `apps/web/scripts/build-md-mirrors.ts`
  (markdown mirrors of the pages).
- `apps/web/app/agent-readability.json` (route).
- The agent positioning sentence in the site summary.

Not there yet: the "For agents" tab (`apps/web/lib/site-tabs.ts` has no such
entry) and the rules file.

First step: inventory what the existing surfaces serve, decide what is
missing, and settle the scope with the owner before writing the spec.

## Project 4: MCP server

A running server an agent connects to and calls tools on (search primitives,
fetch a source, install). Deliberately last: it needs setup and only helps
clients that support MCP, while project 3 reaches every agent.

Nothing exists yet. Tool list, hosting and auth are all undecided.

## Release constraint

Owner's requirement, 2026-11-13: before v2 is merged, deploy `feat/v2` to the
production environment on Vercel once, as a trial, so the owner can check it
on the real domain. `main` stays the production branch for good. If the trial
is fine, `feat/v2` is merged into `main` and production deploys from `main` as
usual; if not, production is rolled back to the previous `main` deployment.

This is a one-off, so do not change the project's production branch. Promote
the `feat/v2` deployment or run a single production deploy from the branch;
confirm the exact mechanism in Vercel's docs and with the owner first. While
the trial is live, a push to `main` would redeploy `main` over it. The pro
deployment and the `/previews/*` rewrite must work during the trial: block
previews following the customizer is one of the things to check there.

## Also parked

- Project 5, the v2 release, follows project 4 and must honour the release
  constraint above.
- Toys section: named and approved on 2026-10-23, waiting for the owner's go.
- Block previews following the customizer can only be checked on a deployed
  build (`/previews/*` rewrites to the pro deployment on Vercel only). The
  owner will look once v2 is in production.
- Open design notes from project 2: `docs/superpowers/notes/v2-followups.md`.
