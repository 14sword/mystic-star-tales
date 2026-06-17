/**
 * Idle-time module loader for non-critical enhancements.
 * Keeps the first screen responsive while preserving the existing feature modules.
 */

(function () {
    const app = window.MysticApp = window.MysticApp || {};
    const LOADER_VERSION = '20260617-beautify-2';
    const loadedScripts = new Set(
        Array.from(document.scripts)
            .map((script) => script.getAttribute('src'))
            .filter(Boolean)
    );

    const groups = [
        {
            name: 'clean-reading-tools',
            scripts: [
                'js/story-favorites.js',
                'js/story-rating.js',
                'js/story-notes.js',
                'js/story-search.js'
            ]
        },
        {
            name: 'interactive-enhancements',
            scripts: [
                'js/audio.js',
                'js/ambient-music.js',
                'js/story-filter.js',
                'js/reading-progress.js',
                'js/keyboard-hints.js'
            ]
        }
    ];

    function emit(type, detail) {
        if (app.events) {
            app.events.emit(type, detail);
        } else {
            document.dispatchEvent(new CustomEvent(`mystic:${type}`, { detail }));
        }
    }

    function waitForIdle(timeout = 900) {
        return new Promise((resolve) => {
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(resolve, { timeout });
                return;
            }
            window.setTimeout(resolve, 40);
        });
    }

    function waitForCriticalUi() {
        if (document.querySelector('.mystic-card')) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const finish = () => {
                document.removeEventListener('mystic:cards-ready', finish);
                resolve();
            };

            document.addEventListener('mystic:cards-ready', finish, { once: true });
            window.setTimeout(finish, 1200);
        });
    }

    function loadScript(src) {
        if (loadedScripts.has(src)) {
            return Promise.resolve({ src, skipped: true });
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `${src}?v=${LOADER_VERSION}`;
            script.async = false;
            script.dataset.deferredModule = 'true';
            script.dataset.deferredModuleSrc = src;
            script.onload = () => {
                loadedScripts.add(src);
                resolve({ src, skipped: false });
            };
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.body.appendChild(script);
        });
    }

    async function loadGroup(group) {
        emit('deferred-group-start', { name: group.name });

        for (const src of group.scripts) {
            await waitForIdle();
            await loadScript(src);
        }

        emit('deferred-group-ready', { name: group.name });
    }

    async function start() {
        await waitForCriticalUi();
        await waitForIdle(1200);

        for (const group of groups) {
            await loadGroup(group);
        }

        document.documentElement.classList.add('deferred-modules-ready');
        emit('deferred-modules-ready', {
            groups: groups.map((group) => group.name),
            count: groups.reduce((total, group) => total + group.scripts.length, 0)
        });
    }

    app.deferredLoader = {
        groups,
        loadScript,
        start
    };

    start().catch((error) => {
        emit('deferred-modules-error', { error: String(error.message || error) });
    });
})();
