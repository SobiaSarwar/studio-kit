# studio-kit

Reusable tools for an email marketing studio. Version 0.1.0.

## What's inside

| Part | What it does |
|---|---|
| `skills/personalize` | Writes one version of each campaign email for every lead group. Run it as `/studio-kit:personalize <campaign folder>`. |
| `hooks/send-guard.mjs` | A guard on the Resend tools. It blocks bulk sends and only lets email go to `@resend.dev` addresses and your own `MY_EMAIL`. |
| `agents/email-reviewer.md` | A read-only agent. It checks email files against the project's brand voice and email rules. |
| `scripts/review.mjs` | Runs a headless review of a campaign folder and writes `review/findings.json`. Exits 1 if any finding is high severity. |
| `review/findings.schema.json` | The shape of each finding: file, line, severity, problem, fix. |

## Install

1. In Claude Code, add the folder as a marketplace: `/plugin marketplace add C:\Users\sobia\Documents\studio-kit`
2. Install it: `/plugin install studio-kit@studio-kit`
3. In each client's repo, set `MY_EMAIL` in `.claude/settings.local.json` under `env`.

To try it without installing: `claude --plugin-dir C:\Users\sobia\Documents\studio-kit`

To run the review script, from the client's repo:

```
node C:\Users\sobia\Documents\studio-kit\scripts\review.mjs campaigns\<campaign-name>
```

## What each client repo needs

The kit does not include the client's content. Each client repo must have:

- `brand/voice.md`: the voice, words to avoid and claims never to make
- `.claude/rules/emails.md`: what every email file must contain (subject, link, sign-off, footer)
- `leads/leads.csv` with a `group` column, plus audience notes in `leads/` that describe each group
- `campaigns/<name>/emails/`: the drafts

## Why brand voice, leads and campaigns stay in each client's repo

- **They belong to one client.** Voice, audience and drafts are different for every business. Mixing them into a shared kit would leak one client's work into another's.
- **Leads are private.** Contact lists should never be copied into something you reuse or share.
- **The kit stays small and safe to update.** It holds only tools that work the same for everyone. You can improve it without touching any client's work.
- **Rules need to sit with the work.** Claude loads the email rules for files in that client's `emails/` folders. Plugins can't ship those rules, so each repo keeps its own.

## Limits

- The send guard only covers the Resend tools. It does not cover Gmail, Klaviyo, HubSpot or other ways to send.
- If `MY_EMAIL` is not set, only `@resend.dev` addresses are allowed.
- `scripts/review.mjs` needs the `claude` command on your PATH. It is written for Windows. It may need a small change on Mac or Linux.
- If you also keep a send-guard hook in a project's `.claude/settings.json`, remove it. Otherwise the guard runs twice.
