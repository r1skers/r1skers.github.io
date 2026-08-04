# Content taxonomy

The site uses four different fields because storage location, editorial form, series membership, and concepts are different questions.

## `categories`

Use one content-area category:

- `Notes`
- `Posts`
- `Artifacts`
- `Tools`
- `Thinking`

Legacy `Crucible` values should not be added to new content.

## `note_kind`

For content under `notes`, use one editorial form:

- `foundation` — canonical subject knowledge;
- `topic` — a problem-driven chapter combining theory, implementation, or experiments;
- `research` — part of an active research thread;
- `exercise` — problem collections and worked exercises;
- `topic-index` — a dossier or series landing page;
- `compatibility` — a retained migration/redirect page.

## `series`

`series` records the stable reading sequence or dossier membership across Notes, Posts, and Artifacts. It is a Hugo taxonomy and may contain one value, for example:

```yaml
series: ["IO-Aware Attention"]
```

Do not imitate series membership by adding many near-duplicate tags.

## `tags`

Tags are reusable concepts that cut across directories and series. Prefer two to four tags per article.

Good tags connect several pages, such as `Numerical Stability`, `Regularization`, `PCA`, `Softmax`, or `KL Divergence`. Avoid section labels (`Artifact`, `Tool`), workflow labels (`Summary`, `Map`, `Reproduction`), editorial labels (`Proof`, `Advanced`), libraries (`PyTorch`, `Matplotlib`), and one-off section headings.

Use existing English spelling and capitalization before introducing a new term. A new tag should normally be expected to connect at least two articles in the same language.

## Storage and presentation

Filesystem paths keep one canonical subject home. Topic dossiers under `content/notes/topics/` create cross-disciplinary reading paths by linking canonical Notes and relevant Artifacts; they do not duplicate the source article.
