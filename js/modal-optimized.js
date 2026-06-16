/**
 * Optimized Modal Manager
 * Adds focus management, safe content rendering, reduced-motion handling, and touch support.
 */

class ModalManager {
    constructor() {
        this.overlay = document.getElementById('modal-overlay');
        this.closeBtn = document.getElementById('modal-close');
        this.titleEl = document.getElementById('modal-title');
        this.originEl = document.getElementById('modal-origin');
        this.storyEl = document.getElementById('modal-story');
        this.placeholder = document.getElementById('video-placeholder');

        this.currentData = null;
        this.isOpen = false;
        this.isClosing = false;
        this.previousFocus = null;
        this.previousOverflow = '';
        this.previousTouchAction = '';
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.introTimer = null;
        this.introFrameDelay = 2800; // Slower transition speed per user request (was 1200ms)
        this.introFrameIndex = 0;
        this.introFrames = [];
        this.introFrameEls = [];
        this.introProgressEl = null;
        this.introToggleBtn = null;
        this.introIsPlaying = false;
        this.closeResetTimer = null;
        this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.focusableSelector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'textarea:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(',');

        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.init();
    }

    init() {
        if (!this.overlay || !this.closeBtn) return;

        this.closeBtn.addEventListener('click', () => this.close());

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        this.closeBtn.tabIndex = 0;

        const modalContainer = this.overlay.querySelector('.modal-container');
        if (modalContainer) {
            if (!modalContainer.hasAttribute('tabindex')) {
                modalContainer.setAttribute('tabindex', '-1');
            }
            modalContainer.addEventListener('click', (e) => e.stopPropagation());
        }

        document.addEventListener('keydown', this.handleKeydown);

        if (this.isTouchDevice) {
            this.initTouchEvents();
        }

        this.bindMotionPreference();
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    bindMotionPreference() {
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updatePreference = (e) => {
            this.prefersReducedMotion = e.matches;
        };

        if (motionQuery.addEventListener) {
            motionQuery.addEventListener('change', updatePreference);
        } else if (motionQuery.addListener) {
            motionQuery.addListener(updatePreference);
        }
    }

    initTouchEvents() {
        const modalContent = this.overlay.querySelector('.modal-content');
        const modalText = this.overlay.querySelector('.modal-text');
        if (!modalContent || !modalText) return;

        modalText.addEventListener('touchstart', (e) => {
            this.touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        modalText.addEventListener('touchend', (e) => {
            this.touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        }, { passive: true });

        modalContent.addEventListener('touchmove', (e) => {
            const scrollTop = modalText.scrollTop;
            const scrollHeight = modalText.scrollHeight;
            const clientHeight = modalText.clientHeight;

            if (scrollTop <= 0 && e.touches[0].clientY > this.touchStartY) {
                e.preventDefault();
            } else if (scrollTop + clientHeight >= scrollHeight && e.touches[0].clientY < this.touchStartY) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    handleSwipe() {
        const swipeThreshold = 100;
        const diff = this.touchStartY - this.touchEndY;

        if (diff < -swipeThreshold && this.touchStartY < 120) {
            this.close();
        }
    }

    open(data) {
        if (!data || this.isOpen) return;

        if (this.closeResetTimer) {
            clearTimeout(this.closeResetTimer);
            this.closeResetTimer = null;
        }

        this.dismissBlockingOverlays();
        this.currentData = data;
        this.isOpen = true;
        this.isClosing = false;
        this.previousFocus = document.activeElement;
        this.previousOverflow = document.body.style.overflow;
        this.previousTouchAction = document.body.style.touchAction;

        this.titleEl.textContent = data.title || '';
        this.originEl.textContent = data.origin || '';
        this.loadStoryContent(data.story || '');

        const modalText = this.overlay.querySelector('.modal-text');
        if (modalText) modalText.scrollTop = 0;

        this.cancelOverlayAnimations();
        this.overlay.style.transition = 'none';
        this.overlay.setAttribute('aria-hidden', 'false');
        this.overlay.classList.add('active');
        this.overlay.style.visibility = 'visible';
        this.overlay.style.opacity = '1';
        this.overlay.style.pointerEvents = 'auto';
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        document.body.classList.add('modal-open');
        this.setBackgroundCardControlsHidden(true);

        this.queueFocusIntoModal();

        this.renderMedia(data);

        this.dispatchEvent('modalOpened', data);
    }

    focusCloseButton() {
        if (this.closeBtn) {
            this.safeFocus(this.closeBtn);
        }
    }

    queueFocusIntoModal() {
        const delays = this.prefersReducedMotion ? [0, 40] : [0, 120, 350];

        delays.forEach((delay) => {
            setTimeout(() => {
                if (!this.isOpen) return;

                this.focusCloseButton();

                if (!this.overlay.contains(document.activeElement)) {
                    const modalContainer = this.overlay.querySelector('.modal-container');
                    if (modalContainer) this.safeFocus(modalContainer);
                }
            }, delay);
        });
    }

    safeFocus(element) {
        if (!element) return;

        try {
            element.focus({ preventScroll: true });
        } catch (e) {
            element.focus();
        }

        if (document.activeElement !== element) {
            element.focus();
        }
    }

    dismissBlockingOverlays() {
        document.querySelectorAll('.welcome-overlay').forEach((overlay) => overlay.remove());

        try {
            localStorage.setItem('mysticStar_welcomeShown', 'true');
            localStorage.setItem('mystic-welcome-shown', 'true');
        } catch (e) {
            // Ignore storage failures in private or locked-down browsing contexts.
        }
    }

    setBackgroundCardControlsHidden(hidden) {
        document.querySelectorAll('.card-favorite-btn').forEach((button) => {
            if (hidden) {
                button.dataset.modalHidden = 'true';
                button.style.setProperty('opacity', '0', 'important');
                button.style.setProperty('visibility', 'hidden', 'important');
                button.style.setProperty('pointer-events', 'none', 'important');
                button.style.setProperty('transition', 'none', 'important');
            } else if (button.dataset.modalHidden === 'true') {
                delete button.dataset.modalHidden;
                button.style.removeProperty('opacity');
                button.style.removeProperty('visibility');
                button.style.removeProperty('pointer-events');
                button.style.removeProperty('transition');
            }
        });
    }

    cancelOverlayAnimations() {
        if (!this.overlay || !this.overlay.getAnimations) return;

        this.overlay.getAnimations().forEach((animation) => animation.cancel());
    }

    loadStoryContent(storyHTML) {
        const template = document.createElement('template');
        template.innerHTML = this.sanitizeStoryHTML(storyHTML);
        const nodes = Array.from(template.content.childNodes);
        this.storyEl.replaceChildren();

        if (this.prefersReducedMotion || nodes.length === 0) {
            const fragment = document.createDocumentFragment();
            nodes.forEach((node) => fragment.appendChild(node));
            this.storyEl.appendChild(fragment);
            return;
        }

        nodes.forEach((node, index) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                node.style.opacity = '0';
                node.style.transform = 'translateY(10px)';
                node.style.transition = `opacity 0.3s ease ${index * 0.04}s, transform 0.3s ease ${index * 0.04}s`;
            }
            this.storyEl.appendChild(node);
        });

        requestAnimationFrame(() => {
            Array.from(this.storyEl.children).forEach((node) => {
                node.style.opacity = '1';
                node.style.transform = 'translateY(0)';
            });
        });
    }

    sanitizeStoryHTML(html) {
        const template = document.createElement('template');
        template.innerHTML = html;

        template.content.querySelectorAll('script, style, iframe, object, embed').forEach((node) => node.remove());

        template.content.querySelectorAll('*').forEach((node) => {
            Array.from(node.attributes).forEach((attribute) => {
                const name = attribute.name.toLowerCase();
                const value = attribute.value.trim().toLowerCase();

                if (name.startsWith('on') || value.startsWith('javascript:')) {
                    node.removeAttribute(attribute.name);
                }
            });
        });

        return template.innerHTML;
    }

    close() {
        if (!this.isOpen || this.isClosing) return;

        this.isClosing = true;
        this.isOpen = false;

        // 立即归还焦点，防止正在聚焦的元素被隐藏在带有 aria-hidden="true" 的祖先节点下触发浏览器警告
        if (this.previousFocus && document.contains(this.previousFocus)) {
            this.safeFocus(this.previousFocus);
        }

        if (window.audioSystem) {
            window.audioSystem.playCloseSound();
        }

        this.overlay.classList.remove('active');
        this.overlay.setAttribute('aria-hidden', 'true');
        this.cancelOverlayAnimations();
        this.overlay.style.transition = 'none';
        this.overlay.style.opacity = '0';
        this.overlay.style.visibility = 'hidden';
        this.overlay.style.pointerEvents = 'none';
        document.body.style.overflow = this.previousOverflow;
        document.body.style.touchAction = this.previousTouchAction;
        document.body.classList.remove('modal-open');
        this.setBackgroundCardControlsHidden(false);

        const transitionDuration = this.prefersReducedMotion ? 0 : 320;
        this.closeResetTimer = setTimeout(() => {
            this.closeResetTimer = null;
            if (this.isOpen) return;

            this.titleEl.textContent = '';
            this.originEl.textContent = '';
            this.storyEl.replaceChildren();
            this.resetMedia();
            this.currentData = null;
            this.isClosing = false;

            this.dispatchEvent('modalClosed');
        }, transitionDuration);
    }

    handleKeydown(e) {
        if (!this.isOpen) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            this.close();
            return;
        }

        if (e.key === 'Tab') {
            this.trapFocus(e);
        }
    }

    trapFocus(e) {
        const focusable = Array.from(this.overlay.querySelectorAll(this.focusableSelector))
            .filter((element) => element.offsetParent !== null || element === this.closeBtn);

        if (focusable.length === 0) {
            e.preventDefault();
            return;
        }

        e.preventDefault();

        const currentIndex = focusable.indexOf(document.activeElement);
        const nextIndex = e.shiftKey
            ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
            : (currentIndex === -1 || currentIndex >= focusable.length - 1 ? 0 : currentIndex + 1);

        this.safeFocus(focusable[nextIndex]);
    }

    handleVisibilityChange() {
        if (!this.isOpen || this.prefersReducedMotion) return;

        if (document.hidden) {
            this.stopIntroFilm(false);
        } else if (this.introIsPlaying && this.introFrames.length > 1) {
            this.startIntroFilm();
        }
    }

    renderMedia(data) {
        this.resetMedia();

        const intro = this.normalizeAiIntro(data);
        const videoUrl = intro.videoUrl || data.videoUrl;

        if (videoUrl && this.updateVideo(videoUrl, data, intro)) {
            return;
        }

        this.renderIntroFilm(data, intro);
    }

    normalizeAiIntro(data) {
        const storyId = data.id && /^[a-z0-9-]+$/i.test(data.id) ? data.id : 'story';
        const aiIntro = data.aiIntro || {};
        const intro = data.intro || {};
        const base = `assets/generated/story-intros/${storyId}`;
        const frames = Array.isArray(aiIntro.frames)
            ? aiIntro.frames
            : [1, 2, 3, 4].map((frame) => `${base}/frame-${String(frame).padStart(2, '0')}-v2.webp`);

        return {
            poster: aiIntro.poster || `${base}/poster.webp`,
            thumb: aiIntro.thumb || `${base}/thumb.webp`,
            frames,
            videoUrl: aiIntro.videoUrl || null,
            caption: intro.caption || data.preview || '',
            tone: intro.tone || 'mystic',
            motion: intro.motion || 'drift',
            frameCaptions: aiIntro.frameCaptions || intro.frameCaptions || []
        };
    }

    safeUrl(value) {
        if (!value) return null;

        try {
            const url = new URL(value, window.location.href);
            if (url.protocol === 'javascript:' || url.protocol === 'data:') return null;
            return url.href;
        } catch (e) {
            return null;
        }
    }

    updateVideo(videoUrl, data, intro) {
        if (!this.placeholder || !videoUrl) return false;

        const safeVideoUrl = this.safeUrl(videoUrl);
        if (!safeVideoUrl) return false;

        const videoWrap = document.createElement('div');
        videoWrap.className = 'story-video-wrap';
        videoWrap.setAttribute('aria-label', `${data.title || '故事'} AI 视频短片`);

        const video = document.createElement('video');
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.className = 'story-video';

        const source = document.createElement('source');
        source.src = safeVideoUrl;
        source.type = 'video/mp4';
        video.appendChild(source);

        video.addEventListener('error', () => this.renderIntroFilm(data, intro), { once: true });
        videoWrap.appendChild(video);
        this.placeholder.replaceChildren(videoWrap);
        return true;
    }

    renderIntroFilm(data, intro) {
        if (!this.placeholder) return;

        // Use frames if they exist. Otherwise, fallback to the poster, and if no poster, use the default cover.
        let frameSources = [];
        if (intro.frames && intro.frames.length > 0) {
            frameSources = intro.frames;
        } else if (intro.poster) {
            frameSources = [intro.poster];
        }

        frameSources = frameSources.map((src) => this.safeUrl(src)).filter(Boolean);
        const fallbackCover = this.safeUrl(`assets/images/${data.id}.jpg`);
        const frames = frameSources.length > 0 ? frameSources : [fallbackCover].filter(Boolean);
        const film = document.createElement('div');

        film.className = 'story-intro-film';
        film.dataset.tone = intro.tone;
        film.dataset.motion = intro.motion;
        film.setAttribute('role', 'img');
        film.setAttribute('aria-label', `${data.title || '故事'} AI 可视化短片介绍`);

        const stage = document.createElement('div');
        stage.className = 'story-intro-stage';

        this.introFrameEls = frames.map((src, index) => {
            const img = document.createElement('img');
            img.className = `story-intro-frame${index === 0 ? ' active' : ''}`;
            img.src = src;
            img.alt = '';
            img.decoding = 'async';
            img.loading = index === 0 ? 'eager' : 'lazy';
            img.onerror = () => {
                if (fallbackCover && img.src !== fallbackCover) {
                    img.src = fallbackCover;
                }
            };
            stage.appendChild(img);
            return img;
        });

        const atmosphere = document.createElement('div');
        atmosphere.className = 'story-intro-atmosphere';
        stage.appendChild(atmosphere);

        const overlay = document.createElement('div');
        overlay.className = 'story-intro-copy';

        const badge = document.createElement('span');
        badge.className = 'story-intro-badge';
        badge.textContent = 'AI 短片';

        const title = document.createElement('strong');
        title.className = 'story-intro-title';
        title.textContent = data.title || '';

        const caption = document.createElement('span');
        caption.className = 'story-intro-caption';
        caption.textContent = intro.caption || data.preview || '';

        overlay.append(badge, title, caption);

        const controls = document.createElement('div');
        controls.className = 'story-intro-controls';

        const progress = document.createElement('div');
        progress.className = 'story-intro-progress';
        progress.setAttribute('aria-hidden', 'true');

        const progressBar = document.createElement('span');
        progressBar.style.width = '0%';
        progress.appendChild(progressBar);

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'story-intro-toggle';
        toggle.setAttribute('aria-pressed', 'true');
        toggle.textContent = '暂停';
        toggle.addEventListener('click', () => this.toggleIntroFilm());

        controls.append(progress, toggle);
        film.append(stage, overlay, controls);

        this.placeholder.replaceChildren(film);
        this.introFrames = frames;
        this.introProgressEl = progressBar;
        this.introToggleBtn = toggle;
        this.introFrameIndex = 0;
        this.introIsPlaying = !this.prefersReducedMotion && frames.length > 1;
        this.setIntroFrame(0);

        if (this.prefersReducedMotion || frames.length <= 1) {
            toggle.textContent = '静止';
            toggle.setAttribute('aria-pressed', 'false');
            toggle.disabled = true;
            if (this.introProgressEl) this.introProgressEl.style.width = '100%';
            return;
        }

        this.startIntroFilm();
    }

    startIntroFilm() {
        this.clearIntroTimer();
        if (!this.isOpen || this.prefersReducedMotion || this.introFrames.length <= 1) return;

        this.introIsPlaying = true;
        this.placeholder?.querySelector('.story-intro-film')?.classList.add('is-playing');
        if (this.introToggleBtn) {
            this.introToggleBtn.textContent = '暂停';
            this.introToggleBtn.setAttribute('aria-pressed', 'true');
        }

        this.introTimer = window.setInterval(() => {
            this.setIntroFrame((this.introFrameIndex + 1) % this.introFrames.length);
        }, this.introFrameDelay);
    }

    stopIntroFilm(markPaused = true) {
        this.clearIntroTimer();
        if (!markPaused) return;

        this.introIsPlaying = false;
        this.placeholder?.querySelector('.story-intro-film')?.classList.remove('is-playing');
        if (this.introToggleBtn) {
            this.introToggleBtn.textContent = '播放';
            this.introToggleBtn.setAttribute('aria-pressed', 'false');
        }
    }

    toggleIntroFilm() {
        if (this.prefersReducedMotion || this.introFrames.length <= 1) return;

        if (this.introIsPlaying && this.introTimer) {
            this.stopIntroFilm(true);
        } else {
            this.startIntroFilm();
        }
    }

    setIntroFrame(index) {
        if (!this.introFrameEls.length) return;

        this.introFrameIndex = index;
        this.introFrameEls.forEach((frame, frameIndex) => {
            frame.classList.toggle('active', frameIndex === index);
        });

        if (this.introProgressEl) {
            const progress = ((index + 1) / this.introFrameEls.length) * 100;
            this.introProgressEl.style.width = `${progress}%`;
        }

        const captionEl = this.placeholder?.querySelector('.story-intro-caption');
        if (captionEl && this.currentData) {
            const aiIntro = this.currentData.aiIntro || {};
            const intro = this.currentData.intro || {};
            const captions = aiIntro.frameCaptions || intro.frameCaptions || [];

            let activeCaption = intro.caption || this.currentData.preview || '';
            if (index > 0 && captions.length > 0) {
                activeCaption = captions[Math.min(index - 1, captions.length - 1)] || activeCaption;
            } else if (index === 0 && captions.length > 0) {
                activeCaption = intro.caption || captions[0] || this.currentData.preview || '';
            }

            captionEl.classList.add('switching');
            setTimeout(() => {
                captionEl.textContent = activeCaption;
                captionEl.classList.remove('switching');
            }, 180);
        }
    }

    clearIntroTimer() {
        if (this.introTimer) {
            window.clearInterval(this.introTimer);
            this.introTimer = null;
        }
    }

    resetMedia() {
        this.clearIntroTimer();
        this.introFrameIndex = 0;
        this.introFrames = [];
        this.introFrameEls = [];
        this.introProgressEl = null;
        this.introToggleBtn = null;
        this.introIsPlaying = false;

        if (!this.placeholder) return;

        const icon = document.createElement('div');
        icon.className = 'placeholder-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '✦';

        const label = document.createElement('p');
        label.textContent = 'AI视觉短片加载中';

        const hint = document.createElement('span');
        hint.className = 'placeholder-hint';
        hint.textContent = '离线图片短片 / 联网视频增强';

        this.placeholder.replaceChildren(icon, label, hint);
    }

    dispatchEvent(eventName, detail = null) {
        this.overlay.dispatchEvent(new CustomEvent(eventName, {
            bubbles: true,
            detail
        }));
    }

    preload() {
        // Reserved for future video/story preloading.
    }
}

function initModalManager() {
    window.modalManager = window.modalManager || new ModalManager();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalManager, { once: true });
} else {
    initModalManager();
}
