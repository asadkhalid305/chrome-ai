---
name: git-conventions
description: Apply this repository's branch naming, Conventional Commits, and pull request conventions when creating branches, committing changes, or preparing GitHub PRs.
---

# Git conventions

## Branch names

Use `<type>/<short-kebab-case-description>`. Never add `codex/` as a prefix to new branches. Choose a type that describes the work: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, or `chore`.

Examples: `feat/translator-selection`, `fix/session-cleanup`, `docs/git-conventions`, `chore/update-dependencies`.

This branch format is a repository convention. [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) specifies commit messages, not branch names.

Before branching, inspect the current status and intended base. Follow the user's requested base; otherwise use the repository's default branch. Fetch the base before starting new work when a remote is available. When starting from `main`, branch from the fetched `origin/main` without resetting local `main` or carrying unrelated changes into the branch.

When a separate worktree is requested, create it from the intended base and perform all task edits there. In Codex desktop, use `create_worktree` when available, then create the conventionally named branch in the returned checkout. Do not rename existing published branches just to apply this convention.

## Commits

Use `<type>[optional scope][optional !]: <description>` with a short, concrete description. Use lowercase types and scopes consistently in this repository.

- `feat`: new application functionality.
- `fix`: a bug fix.
- `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, and `style`: choose according to the actual change. These additional types are repository choices allowed by the specification.
- Add a scope only when it identifies a useful area, such as `fix(translator): destroy unused sessions`.
- Mark a breaking change with `!` before the colon or an uppercase `BREAKING CHANGE: <explanation>` footer. Explain the impact and migration when useful.
- Separate an optional body and footers with blank lines. Use the body to explain reasons or constraints that the diff does not make clear.

Keep each commit focused. Inspect the diff and stage only intended files or hunks, preserving unrelated work. Exclude credentials, environment secrets, build output, and temporary artifacts. Do not rewrite published history without explicit authorization.

## Pull requests

Use the same Conventional Commits format for the PR title so it can serve as a squash commit message. Describe the concrete change and its reason, and report the checks actually run with any relevant limitations.

Before publishing, review the complete diff against the target base and run checks proportionate to the change. For skill or documentation changes, validate the skill and run `git diff --check`; application tests are needed only when the changed surface warrants them.

Push the intended branch, verify its remote commit matches local `HEAD`, and open the PR against the requested base. Prefer the authenticated GitHub integration when it supports the operation; use Git or GitHub CLI for local operations or missing capabilities. Report the PR link. Opening a PR does not authorize merging it, publishing a release, or changing repository settings.
