# Blog Layout Refactor Log

This file tracks every layout-related change so the refactor can stay controlled and reversible.

## Working Rules

1. Every layout change gets a unique ID (`L-001`, `L-002`, ...).
2. Each ID records goal, touched files, risk, and validation result.
3. Validate with `hugo -D` after each change batch.
4. If a change affects behavior, add a short rollback note.

## Baseline Snapshot

- Timestamp: `2026-02-17 14:50:03 +09:00`
- Branch: `master`
- Commit: `90a0650`
- Hugo: `v0.152.2 extended`
- Theme: `PaperMod`
- Custom layout entry points:
  - `layouts/_default/baseof.html`
  - `layouts/partials/extend_head.html`
  - `layouts/partials/extend_footer.html`
  - `layouts/notes/list.html`
  - `layouts/tools/list.html`

## Change Register

| ID | Status | Scope | Files | Validation | Rollback |
|---|---|---|---|---|---|
| L-000 | Done | Baseline recorded before refactor starts | `LAYOUT_REFACTOR_LOG.md` | N/A | Remove this file if unused |
| L-001 | Done | Homepage menu visibility upgrade with direct quick-navigation panel rendered from `menu.main` | `layouts/partials/home_info.html`, `assets/css/extended/home-quick-nav.css`, `LAYOUT_REFACTOR_LOG.md` | `hugo -D` passed on 2026-02-17 | Delete the two added files to restore theme-default homepage |
| L-002 | Done | Home page now works as navigation hub only (no post list rendered on `/`) | `layouts/index.html`, `LAYOUT_REFACTOR_LOG.md` | `hugo -D` passed on 2026-02-17 | Remove `layouts/index.html` to restore PaperMod default home-post listing |
| L-003 | Done | Replace "Quick Navigation" card section with sketch-style vertical menu bars and remove extra homepage intro rendering | `layouts/index.html`, `layouts/partials/home_info.html`, `assets/css/extended/home-quick-nav.css`, `LAYOUT_REFACTOR_LOG.md` | `hugo -D` passed on 2026-02-17 | Restore prior versions of those three files to get quick-nav heading/card layout back |
| L-004 | Done | Add descriptions to homepage menu items and limit homepage menu hub to `about`, `notes`, `tools` | `hugo.yaml`, `layouts/partials/home_info.html`, `assets/css/extended/home-quick-nav.css`, `LAYOUT_REFACTOR_LOG.md` | `hugo -D` passed on 2026-02-17 | Revert those files to restore full-menu homepage list without descriptions |
| L-005 | Done | Restore homepage intro block (`Hephaestus' Forge` section) above the simplified 3-item menu hub | `layouts/partials/home_info.html`, `LAYOUT_REFACTOR_LOG.md` | `hugo -D` passed on 2026-02-17 | Remove intro block in `layouts/partials/home_info.html` to return to menu-only homepage |
| L-006 | Done | Replace right-side index numbers with content counts for `notes` and `tools` only (`N articles`) | `layouts/partials/home_info.html`, `assets/css/extended/home-quick-nav.css`, `LAYOUT_REFACTOR_LOG.md` | `hugo -D` passed on 2026-02-17 | Restore `home-menu-index` rendering/styles to revert back to numeric labels |
| L-007 | Done | Split top header and homepage menu responsibilities: header keeps `categories` + `archives`, homepage uses dedicated `home` menu (`about`/`notes`/`tools`) | `hugo.yaml`, `layouts/partials/home_info.html`, `LAYOUT_REFACTOR_LOG.md` | `hugo -D` passed on 2026-02-17 | Merge `menu.home` back into `menu.main` and restore previous homepage fallback-only logic |
| L-008 | Done | Add homepage `Eureka` entry and wire posts into a dedicated `series/eureka` aggregation page | `hugo.yaml`, `content/posts/尤里卡-函数的平方的积分到底是什么/index.md`, `LAYOUT_REFACTOR_LOG.md` | `hugo -D` passed on 2026-02-17 | Remove `menu.home.eureka`, remove `series: [\"Eureka\"]` from post front matter, and remove `series` from taxonomies if unused |
| L-009 | Done | Add compact `Recent Updates` strip on homepage (3 latest items across configured sections) between intro and menu hub | `hugo.yaml`, `layouts/partials/home_info.html`, `layouts/partials/home_recent.html`, `assets/css/extended/home-recent.css`, `LAYOUT_REFACTOR_LOG.md` | `hugo -D` passed on 2026-02-17 | Disable via `params.homeRecent.enabled: false` or remove the new partial/style and include call |
| L-010 | Done | Design polish pass: unified home accent color tokens, added menu icons, and standardized home surfaces (radius/border/hover) across intro-recent-menu blocks | `layouts/partials/home_info.html`, `assets/css/extended/home-quick-nav.css`, `assets/css/extended/home-recent.css`, `LAYOUT_REFACTOR_LOG.md` | `hugo -D` passed on 2026-02-17 | Revert these three files to restore previous no-icon and neutral styling |
| L-011 | Done | Switch homepage accent palette from cool blue to warm amber (light/dark variants) while keeping structure unchanged | `assets/css/extended/home-quick-nav.css`, `LAYOUT_REFACTOR_LOG.md` | `hugo -D` passed on 2026-02-17 | Restore prior `--home-accent` and shadow values in `home-quick-nav.css` |
| L-012 | Done | Reorganize Eureka under a new parent hub `Thinking` with sibling tracks and description prompt on homepage menu | `hugo.yaml`, `content/thinking/_index.md`, `content/thinking/eureka/index.md`, `content/thinking/life-reflections/index.md`, `content/thinking/philosophy/index.md`, `LAYOUT_REFACTOR_LOG.md` | `hugo -D` passed on 2026-02-17 | Replace `Thinking` back to `Eureka` in `menu.home` and remove `content/thinking/` if not needed |

## Next Queue

- L-013: Add optional homepage image-gradient background layer (behind intro/recent/menu) with mobile-safe fallback.
