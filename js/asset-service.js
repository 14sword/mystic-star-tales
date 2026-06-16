/**
 * Story asset registry. Uses packaged offline assets first, then generated assets when available.
 */

(function () {
    window.MysticApp = window.MysticApp || {};

    class AssetService {
        constructor() {
            this.manifest = null;
            this.ready = this.loadManifest();
        }

        async loadManifest() {
            try {
                if (window.MysticAppManifest) {
                    this.manifest = window.MysticAppManifest;
                    this.emit('asset-manifest-ready', this.manifest);
                    return this.manifest;
                }

                if (location.protocol === 'file:') {
                    this.manifest = this.createLocalManifest();
                    this.emit('asset-manifest-ready', this.manifest);
                    return this.manifest;
                }

                const response = await fetch('assets/generated/asset-manifest.json', { cache: 'no-store' });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                this.manifest = await response.json();
                this.emit('asset-manifest-ready', this.manifest);
                return this.manifest;
            } catch (error) {
                this.manifest = { version: 1, assets: [] };
                this.emit('asset-manifest-error', { error: String(error) });
                return this.manifest;
            }
        }

        createLocalManifest() {
            const stories = typeof cardsData !== 'undefined' && Array.isArray(cardsData)
                ? cardsData
                : (Array.isArray(window.cardsData) ? window.cardsData : []);

            return {
                version: 2,
                generatedAt: new Date().toISOString(),
                intros: stories.map((story) => ({
                    storyId: story.id,
                    poster: story.aiIntro?.poster || `assets/generated/story-intros/${story.id}/poster.webp`,
                    thumb: story.aiIntro?.thumb || `assets/generated/story-intros/${story.id}/thumb.webp`,
                    frames: story.aiIntro?.frames || [1, 2, 3, 4].map((frame) => `assets/generated/story-intros/${story.id}/frame-${String(frame).padStart(2, '0')}-v2.webp`),
                    videoUrl: story.aiIntro?.videoUrl || null,
                    caption: story.intro?.caption || story.preview || '',
                    tone: story.intro?.tone || 'mystic',
                    motion: story.intro?.motion || 'drift',
                    offline: true
                })),
                assets: stories.flatMap((story) => {
                    const aiIntro = story.aiIntro || {};
                    const frames = aiIntro.frames || [1, 2, 3, 4].map((frame) => `assets/generated/story-intros/${story.id}/frame-${String(frame).padStart(2, '0')}-v2.webp`);
                    return [
                        { storyId: story.id, type: 'cover', src: `assets/images/${story.id}.jpg`, offline: true },
                        { storyId: story.id, type: 'intro-poster', src: aiIntro.poster || `assets/generated/story-intros/${story.id}/poster.webp`, offline: true },
                        { storyId: story.id, type: 'intro-thumb', src: aiIntro.thumb || `assets/generated/story-intros/${story.id}/thumb.webp`, offline: true },
                        ...frames.map((src, index) => ({ storyId: story.id, type: 'intro-frame', frameIndex: index + 1, src, offline: true }))
                    ];
                })
            };
        }

        async getStoryAsset(storyId, type = 'cover') {
            await this.ready;
            return (this.manifest.assets || []).find((asset) => asset.storyId === storyId && asset.type === type) || null;
        }

        async getStoryIntro(storyId) {
            await this.ready;
            const intro = (this.manifest.intros || []).find((item) => item.storyId === storyId);
            if (intro) return intro;

            const story = typeof cardsData !== 'undefined' && Array.isArray(cardsData)
                ? cardsData.find((item) => item.id === storyId)
                : null;

            if (!story) return null;

            return {
                storyId,
                poster: story.aiIntro?.poster || `assets/generated/story-intros/${storyId}/poster.webp`,
                thumb: story.aiIntro?.thumb || `assets/generated/story-intros/${storyId}/thumb.webp`,
                frames: story.aiIntro?.frames || [1, 2, 3, 4].map((frame) => `assets/generated/story-intros/${storyId}/frame-${String(frame).padStart(2, '0')}-v2.webp`),
                videoUrl: story.aiIntro?.videoUrl || null,
                caption: story.intro?.caption || story.preview || '',
                tone: story.intro?.tone || 'mystic',
                motion: story.intro?.motion || 'drift',
                offline: true
            };
        }

        async getOfflineAssets() {
            await this.ready;
            return (this.manifest.assets || []).filter((asset) => asset.offline);
        }

        emit(type, detail) {
            if (window.MysticApp.events) {
                window.MysticApp.events.emit(type, detail);
            }
        }
    }

    window.MysticApp.assetService = window.MysticApp.assetService || new AssetService();
    window.assetService = window.MysticApp.assetService;
})();
