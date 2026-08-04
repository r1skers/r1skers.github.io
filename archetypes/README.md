# Archetypes

These templates are auto-applied when creating new content with `hugo new`.

## Commands

- Notes: `hugo new notes/<name>/index.md`
- Tools: `hugo new tools/<name>/index.md`
- Artifacts: `hugo new artifacts/<name>/index.md`
- Thinking: `hugo new thinking/<name>/index.md`
- Posts (generic): `hugo new posts/<name>/index.md`

## What Gets Auto-Filled

- Common fields: `title`, `date`, `draft`, `summary`, `description`, `tags`
- Section-specific defaults:
  - `notes`: `categories: ["Notes"]`, `series`, `note_kind`
  - `posts`: `categories: ["Posts"]`, `series`
  - `tools`: `categories: ["Tools"]`, `layout: "tool"`
  - `artifacts`: `categories: ["Artifacts"]`, `series`
  - `thinking`: `categories: ["Thinking"]`

## Recommended Checklist Before Publish

1. Fill `summary` and `description`.
2. Add two to four reusable concept `tags`; put a reading sequence or project family in `series`.
3. Set `draft: false`.
