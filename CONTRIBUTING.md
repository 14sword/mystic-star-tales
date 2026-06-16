# Contributing Guide

Thank you for your interest in contributing to **Mystic Star Tales**! We welcome bug reports, pull requests, and creative ideas.

## Workflow

1. **Fork the Repository**: Create a fork of this project on your GitHub account.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feat/your-awesome-feature
   ```
3. **Commit your Changes**: Follow the commit convention described below.
4. **Push your Branch**:
   ```bash
   git push origin feat/your-awesome-feature
   ```
5. **Open a Pull Request**: Provide a detailed description of your changes, what bugs they resolve, or what features they add.

---

## Commit Message Conventions

We follow a semantic commit pattern to make changelog generation easy and automated. Please prefix your commit messages with one of the following:

- `feat:` for introducing new features (e.g., `feat: add swipe-down-to-close gesture`)
- `fix:` for bug fixes (e.g., `fix: resolve audio context initialization issue`)
- `docs:` for modifying repository documentation (e.g., `docs: update deployment instructions`)
- `style:` for changes to styling or formatting without impacting logic (e.g., `style: improve card alignment`)
- `refactor:` for code restructuring (e.g., `refactor: simplify database seed script`)
- `chore:` for updating dependencies or build tools (e.g., `chore: update sw caching version`)
