---
description: learned preferences, project conventions, and Do-Not-Repeat rules
budget_tokens: 2000
---
# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-09-16

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

## Key Learnings

- **Project:** document-processing-pipeline
- **Description:** - [Prerequisites & Runtimes](#prerequisites--runtimes)

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

- [2026-09-21] Never render `<TableBody>` as a sibling of `<Table>`. The browser drops the
  stray `<tbody>`, so header and body get their own column-width calculations and every
  cell drifts out of line with its header (measured 37px). Keep `<TableHeader>` and
  `<TableBody>` inside one `<Table>`.

- [2026-09-21] Suppressing hover with `hover:bg-transparent` is wrong: it cancels the
  element's own background, so the element still visibly changes on hover. Override the
  hover background to the element's own color instead (`hover:bg-sidebar`), and prove it
  with a browser test that hovers and compares computed background before/after.

- [2026-09-21] Table sections (`<thead>`/`<tbody>`/`<tfoot>`) may only contain `<tr>`. Never put a
  bare `<span>`/`<div>` inside them, and never put `flex`/`grid` on the section element: the note
  ends up outside the column model and perturbs the shared layout. Wrap content in a
  `<tr><td colSpan={n}>` and put the flex row on an inner div.

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->
