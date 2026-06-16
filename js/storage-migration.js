/**
 * Local storage compatibility layer.
 * Moves older Mystic Star Tales keys into the shared mysticStar_* namespace.
 */
(function () {
    const migrations = [
        {
            target: 'mysticStar_favorites',
            sources: ['mystic-star-tales-favorites', 'mystic-favorites']
        },
        {
            target: 'mysticStar_notes',
            sources: ['mystic-star-tales-notes', 'mystic-notes']
        },
        {
            target: 'mysticStar_ratings',
            sources: ['mystic-star-tales-ratings', 'mystic-ratings']
        },
        {
            target: 'mysticStar_bookmarks',
            sources: ['mystic-star-tales-bookmarks']
        },
        {
            target: 'mysticStar_preferences',
            sources: ['mystic-preferences']
        },
        {
            target: 'mysticStar_theme',
            sources: ['mystic-star-tales-theme']
        },
        {
            target: 'mysticStar_stats',
            sources: ['mystic-star-tales-stats']
        },
        {
            target: 'mysticStar_readStories',
            sources: ['mystic-read-stories']
        },
        {
            target: 'mysticStar_readHistory',
            sources: ['mystic-reading-history']
        },
        {
            target: 'mysticStar_badges',
            sources: ['mystic-achievements']
        },
        {
            target: 'mysticStar_language',
            sources: ['mystic-language']
        }
    ];

    function parseValue(value) {
        if (value == null) return undefined;
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }

    function serializeValue(value) {
        return typeof value === 'string' ? value : JSON.stringify(value);
    }

    function mergeValues(current, incoming) {
        if (incoming === undefined) return current;
        if (current === undefined) return incoming;

        if (Array.isArray(current) && Array.isArray(incoming)) {
            return Array.from(new Set(current.concat(incoming)));
        }

        if (
            current &&
            incoming &&
            typeof current === 'object' &&
            typeof incoming === 'object' &&
            !Array.isArray(current) &&
            !Array.isArray(incoming)
        ) {
            return { ...incoming, ...current };
        }

        return current;
    }

    function migrateKey(target, sources) {
        let merged = parseValue(localStorage.getItem(target));

        sources.forEach((source) => {
            merged = mergeValues(merged, parseValue(localStorage.getItem(source)));
        });

        if (merged !== undefined) {
            localStorage.setItem(target, serializeValue(merged));
        }
    }

    function migrate() {
        try {
            migrations.forEach(({ target, sources }) => migrateKey(target, sources));
            localStorage.setItem('mysticStar_storageMigratedAt', new Date().toISOString());
        } catch (e) {
            // Storage can be blocked in private contexts; the app should still load.
        }
    }

    window.MysticStorage = {
        keys: migrations.reduce((acc, item) => {
            acc[item.target.replace('mysticStar_', '')] = item.target;
            return acc;
        }, {}),
        migrate
    };

    migrate();
})();
