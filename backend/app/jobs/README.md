# Background Jobs

This directory contains background tasks and scheduled jobs.

## Pattern

Each job module exposes an async function that can be scheduled
via APScheduler, Celery, or Azure Functions triggers.

## Planned Jobs (Phase 1+)

| Job | Schedule | Purpose |
|-----|----------|---------|
| `digest_notifications` | Daily 08:00 | Email digest of new ideas |
| `sync_org_hierarchy` | Every 6h | Pull org chart from Graph API |
| `archive_stale_ideas` | Weekly | Move aged drafts to archived state |
