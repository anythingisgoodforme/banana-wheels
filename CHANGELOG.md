# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial game development project setup
- GitHub Actions CI/CD workflows
- ESLint and Prettier configuration
- Jest testing setup
- Comprehensive documentation

### Changed

- Project structure for best practices

### Fixed

- N/A

## [1.0.0] - 2026-04-30

### Added

- Initial project setup
- Banana Wheels starter game
- Complete documentation (README, CONTRIBUTING, BEST_PRACTICES)
- GitHub Actions workflows (CI and Publishing)
- Code quality tools (ESLint, Prettier)
- Testing framework (Jest)
- Utility functions for game development
- Sample HTML5 Canvas implementation

### Features

- Player movement (left/right with arrow keys)
- Jumping mechanic
- Collision detection
- Obstacle spawning
- Score tracking
- Level progression
- Game pause functionality
- Visual game UI

---

## How to Release a New Version

1. Update this file with changes
2. Update version in `package.json`
3. Commit with: `git commit -m "chore: release v1.x.x"`
4. Create tag: `git tag -a v1.x.x -m "Release v1.x.x"`
5. Push: `git push origin v1.x.x`

## Version Levels

- **Major (X.0.0)**: Large game updates, new features
- **Minor (1.X.0)**: New features, improvements
- **Patch (1.0.X)**: Bug fixes, minor updates

Example: v1.2.3 means: Major(1) Minor(2) Patch(3)
