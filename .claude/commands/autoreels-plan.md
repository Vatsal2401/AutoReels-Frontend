# Auto Reels Plan

Kick off the full feature lifecycle for the Auto Reels frontend — from idea to merge-ready branch.

## Workflow

1. **Branch**: create feature branch (`feat/<name>`) from current branch — never work directly on main
2. Invoke `superpowers:brainstorming` — clarify requirements, propose approaches, write spec
3. Invoke `superpowers:writing-plans` — create detailed implementation plan with acceptance criteria
4. Dispatch `task-coverage-reviewer` agent — validate tasks cover the plan exactly (no more, no less)
5. If GAPS_FOUND: fix plan and re-validate (loop step 4)
6. If APPROVED: hand off to `superpowers:subagent-driven-development` for execution
7. Dispatch `code-reviewer` agent — full feature branch review against spec + plan
8. If BLOCK: fix issues and re-review (loop step 7)
9. Invoke `capture-learnings` skill — extract reusable knowledge to learning.md
10. Invoke `superpowers:finishing-a-development-branch` — merge, PR, or cleanup

## Usage

```
/autoreels-plan [description of what you want to build]
```

## Context

This is the **Next.js 14 frontend** for Auto Reels. Features typically involve:
- New pages under `app/(dashboard)/` or `app/(marketing)/`
- New components in `components/` organized by feature area
- API calls via axios client in `lib/api/`
- TanStack Query hooks for data fetching and mutations
- shadcn/ui + Tailwind CSS for styling
- Auth-gated routes using middleware or layout guards
- User credits, feature flags, video status polling
