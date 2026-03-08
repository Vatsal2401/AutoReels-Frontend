---
paths:
  - "**/*"
---

# Git Workflow

> Feature branches off main, conventional commits.

## Branch Naming
- Feature: `feat/<short-description>`
- Fix: `fix/<short-description>`
- Refactor: `refactor/<short-description>`

## Conventional Commits
Format: `<type>: <description>`

| Type | When |
|---|---|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `docs` | Documentation changes |
| `chore` | Build, tooling, dependency updates |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace (no logic change) |

- Keep subject under 72 characters, imperative mood, no period at end

## Commit Frequency
- Commit after each completed task
- Each commit leaves the app in a buildable state
- Don't bundle unrelated changes
