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
  - `notes`: `categories: ["Notes"]`
  - `tools`: `categories: ["Automata"]`, `layout: "tool"`
  - `artifacts`: `categories: ["Projects"]`
  - `thinking`: `categories: ["Thinking"]`

## Recommended Checklist Before Publish

1. Fill `summary` and `description`.
2. Review `tags` and `categories`.
3. Set `draft: false`.
