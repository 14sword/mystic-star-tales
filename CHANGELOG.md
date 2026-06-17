# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-06-17

### Added
- **Unified Controls Panel**: Combined story filter buttons and the search input bar into a single horizontal glassmorphic panel (`.story-controls-container`), aligned perfectly with the card grid at `1180px` max-width.
- **Slide-to-Left Search**: Re-engineered search bar layout so the magnifying glass toggle resides on the right side of the control panel and expands smoothly leftwards.
- **Mobile Flow Edge Gradients**: Integrated transparent fade-out gradient overlays at the left and right edges of the horizontally scrollable filter list on mobile to indicate scrollability.

### Changed
- **PWA Service Worker Cache**: Upgraded Service Worker cache namespace to `v9` to force clean reload and wipe legacy client assets cache.
- **Responsive Layout Flow**: Set controls bar on mobile screen to a vertical stacked list (search input full-width on top, filter horizontal scroll below) to optimize viewport real estate.

### Removed
- **Redundant Achievement System**: Completely removed `js/achievement-system.js` script, cleaned up `.achievement-btn` and `.achievements-panel` styles from `css/clean-ui.css`, and removed it from Service Worker cache targets to clean up unused UI features and reduce bundle size.

---

## [1.2.0] - 2026-06-16

### Added
- **CSS Bundler Tool**: Created `tools/build-css.mjs` and configured `"build:css"` command in `package.json` to automatically concatenate and minify CSS files.
- **PWA Cache Update**: Upgraded service worker cache version to `v6` to deliver instant updates.

### Changed
- **Unified Stylesheets**: Combined `clean-ui.css` and all modular styles into a single production stylesheet `css/styles.min.css`, reducing critical rendering path CSS load by 1 network request.
- **Homepage Card Covers**: Realigned cards to show the fixed theme-matching cover image (`assets/images/${storyId}.jpg`) on the homepage, keeping AI-generated story frames exclusive to the reading details modal.
- **Ambient Music Compatibility**: Replaced the OGG background track with a high-compatibility MP3 track (`assets/ambient-space.mp3`), resolving playback failures on Safari and iOS.

### Removed
- **Redundant Assets**: Deleted ~13.2MB of unused legacy PNG story frame files (including qinglong, suzaku, xuanwu) and redundant icon files.
- **Unused OGG Audio**: Removed the old OGG background music file.

---

## [1.1.0] - 2026-06-14

### Added
- **UI Redesign**: Fully refactored the selection cards layout into a modern glassmorphic look with nested image containers and smooth scaling animations.
- **Flashlight Glow**: Re-enabled cursor-tracking dynamic glow overlay inside card boundaries.
- **Card 3D Tilt**: Restored 3D rotational pointer tilt animations for story cards.
- **Audio Synthesizer**: Added custom synthetic UI hover and confirmation sounds.
- **Ambient Background Music**: Integrated space drone sound generator with Web Audio API.
- **Category Filter**: Added region filters under the header for organizing mythic tales.
- **Reading Progress & Metrics**: Estimated reading time and added a progress bar inside the reading modal.
- **Keyboard Cheatsheet**: Added keyboard shortcuts drawer button.
- **Achievements System**: Milestones badge tracker and popup notifications.
- **User Stats Panel**: Interactive read completion metrics tracker.
- **Enhanced Timeline**: Historical era timeline drawer containing all 10 stories.
- **Standard Project Files**: Created `.gitignore`, `LICENSE`, `CHANGELOG.md`, and `CONTRIBUTING.md`.

### Fixed
- **Dependency Issues**: Loaded `image-generation-service.js` before `app-shell.js` in `index.html` to fix the offline App Shell crash.
- **Audio Method Crash**: Added missing `playClick()` to `audio.js` class definition to resolve categorizer select errors.
- **Cleaned Up Bloat**: Cleaned up 68 unused scripts and deprecated unoptimized HTML templates.

### Removed
- **Welcome Guide**: Bypassed the first-visit gesture welcome overlay for direct card selection.

---

## [1.0.0] - 2026-06-09

### Added
- Initial release containing 10 world mythology stories.
- PWA baseline installation support and static pre-caching.
- IndexedDB offline local storage adapter layer.
