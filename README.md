# ✦ 神秘星语 | Mystic Star Tales

<div align="center">

A Cozy Mythic Story PWA Web Application. Built with Vanilla JS & Canvas Physics.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version: 1.2.0](https://img.shields.io/badge/version-1.2.0-green.svg)](CHANGELOG.md)
[![PWA Ready](https://img.shields.io/badge/PWA-ready-orange.svg)](#)
[![IndexedDB Support](https://img.shields.io/badge/IndexedDB-active-blue.svg)](#)

[Demo](https://14sword.github.io/mystic-star-tales/) · [Changelog](CHANGELOG.md) · [Contributing](CONTRIBUTING.md)

</div>

<p align="center">
  <img src="screenshots/desktop_home.png" width="49%" alt="Desktop Home" />
  <img src="screenshots/desktop_modal.png" width="49%" alt="Desktop Modal" />
</p>
<p align="center">
  <img src="screenshots/mobile_home.png" width="32%" alt="Mobile Home" />
  <img src="screenshots/mobile_modal.png" width="32%" alt="Mobile Modal" />
  <img src="screenshots/desktop_filtered.png" width="32%" alt="Desktop Filtered" />
</p>

---

## ✨ Features

### 📖 Content & Organization
- **10 World Mythology Tales**: Explore distinct mythic stories covering Chinese zodiac, Greek constellations, Norse aurora, Egyptian Anubis, and more.
- **Story Category Filters**: Easily filter stories by region (East Asia, Europe, South Asia, Middle East, Americas) using a modern glassmorphic filter bar.
- **Reading Progress Viz**: View estimated reading time and see a progress bar dynamically fill as you scroll.
- **Mythic Timeline**: A drawer timeline that anchors all 10 stories to their corresponding historical eras.

### 🎨 Visual & Audio Experience
- **Premium Glassmorphic UI**: Refactored cards interface leveraging CSS glassmorphism, nested border radii, and hover-zoom transitions.
- **Cursor Flashlight Glow**: Re-enabled interactive cursor-tracking flashlight glow within card regions.
- **3D Card Rotation**: Move your mouse across card boundaries to tilt them dynamically in 3D.
- **Physics Canvas Backgrounds**: Multi-layered starfields, falling sands, and trailing mouse particles active in the background.
- **Web Audio Sound Effects**: Ambient space drone generator and subtle click/hover audio effects synthesized directly in code.

### ⌨️ Navigation & Access
- **Keyboard Cheatsheet Drawer**: Press `?` to toggle a panel detailing keyboard shortcut commands.
- **Interactive keyboard support**: `←` / `→` arrow keys navigation, `Enter` to open, and `Esc` to close modal overlays.
- **Mobile Touch Enhancements**: Pre-configured swipe gestures and touch feedbacks optimized for iOS & Android.

### 🛰️ Offline & Cloud Architecture
- **PWA offline-first**: Installable shell with pre-cached assets (`sw.js`) and background stale-while-revalidate fetching.
- **Local DB Layer**: Mirrors preferences, bookmarks, ratings, and stats locally using IndexedDB (no network required).
- **Optional Supabase Cloud Sync**: Pre-wired Magic Link authentication and cloud storage sync schema.
- **Optional AI Image generation**: Front-end client to dispatch generation prompts to OpenAI-integrated Edge Functions.

---

## 📂 Project Structure

```text
mystic-star-tales/
├── index.html              # Main HTML Shell
├── offline.html            # Offline Fallback page
├── sw.js                   # Service Worker Cache Registry
├── manifest.json           # PWA Manifest
├── LICENSE                  # MIT License
├── README.md               # Project documentation
├── .gitignore               # Git ignored assets
├── CHANGELOG.md             # Version releases log
├── CONTRIBUTING.md          # Contributions guide
├── css/
│   ├── reset.css           # CSS Reset
│   ├── variables.css       # Style variables
│   ├── styles.min.css      # Consolidated production CSS
│   └── clean-ui.css        # Premium Glassmorphic cards overrides
├── js/
│   ├── page-loader.js      # Boot loading screen animation
│   ├── deferred-loader.js  # Idle-time non-critical scripts loader
│   ├── main-optimized.js   # Production entrypoint & optimizations
│   ├── cards-render-optimized.js # Card grid drawing & 3D tilt
│   ├── modal-optimized.js  # Story details dialog & swipe close
│   ├── local-db.js         # IndexedDB synchronization bridge
│   ├── auth-service.js     # Supabase client authentication
│   ├── sync-service.js     # Supabase database synchronization
│   ├── image-generation-service.js # AI DALL-E proxy client
│   └── ...                 # Other active lazy-loaded enhancement modules
└── assets/
    ├── images/             # Mythology cover JPGs
    └── generated/          # Pre-packaged AI images and manifest JSONs
```

---

## 🛠 Tech Stack

- **Core**: Vanilla HTML5 / CSS3 / ES6+ JavaScript
- **Animations**: HTML5 Canvas / requestAnimationFrame API
- **Audio**: Web Audio API
- **Database**: IndexedDB / LocalStorage
- **PWA**: Service Worker / Web App Manifest
- **Backend (Optional)**: Supabase / Edge Functions

---

## 🚀 Installation & Usage

### Clone Repository
```bash
git clone https://github.com/your-username/mystic-star-tales.git
cd mystic-star-tales
```

### Run Locally
Since this is a static offline-first app, you can run it with any simple local web server to test PWA capabilities (like Service Workers):

#### Python
```bash
python3 -m http.server 8000
```

#### Node.js
```bash
npx http-server -p 8000
```
Open your browser and navigate to `http://localhost:8000`.

---

## 🚢 Optional Cloud Configuration

To enable online Magic Link login and AI Image generation:

1. Copy `js/app-config.example.js` to `js/app-config.js` and fill in your Supabase configuration:
   ```javascript
   window.MYSTIC_APP_CONFIG = {
       supabaseUrl: 'https://your-project.supabase.co',
       supabaseAnonKey: 'your-anon-key',
       aiGenerationEnabled: true
   };
   ```
2. Initialize database schema using `supabase/schema.sql`.
3. Deploy the Edge Functions found in `supabase/functions/` to your project and configure `OPENAI_API_KEY` in Supabase.
4. Detailed setup steps can be found in `docs/DEPLOYMENT.md`.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
