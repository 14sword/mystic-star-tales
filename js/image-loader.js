/**
 * 图片加载优化
 * 渐进式加载、占位骨架、错误处理
 */

class ImageLoader {
    constructor() {
        this.previewItems = [];
        this.previewTimer = null;
        this.previewFrameDelay = 1400;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.observeImages();
        this.addStyles();
    }
    
    observeImages() {
        // 使用 IntersectionObserver 实现懒加载
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.1
        });
        
        // 观察所有需要懒加载的图片
        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
        
        // 为卡片图片添加加载状态
        this.setupCardImages();
    }
    
    setupCardImages() {
        const checkCards = setInterval(() => {
            const cards = document.querySelectorAll('.mystic-card');
            if (cards.length > 0) {
                clearInterval(checkCards);
                
                cards.forEach((card, index) => {
                    const storyId = card.dataset.id;
                    const imageContainer = card.querySelector('.card-image');
                    const story = typeof cardsData !== 'undefined' && Array.isArray(cardsData)
                        ? cardsData.find((item) => item.id === storyId)
                        : null;
                    const imageSrc = `assets/images/${storyId}.jpg`;
                    const previewFrames = []; // Disable homepage card preview rotation per user request
                    const hasIntroFrames = story?.aiIntro?.frames?.length > 0 || (story?.aiIntro?.frames && story.aiIntro.frames.length > 0);
                    
                    if (imageContainer && !imageContainer.querySelector('.skeleton-loader')) {
                        // 添加骨架加载器
                        const skeleton = document.createElement('div');
                        skeleton.className = 'skeleton-loader';
                        imageContainer.appendChild(skeleton);
                        
                        // 创建图片元素
                        const img = document.createElement('img');
                        img.className = 'card-story-image';
                        img.dataset.src = imageSrc;
                        img.alt = card.querySelector('.card-title')?.textContent || '';
                        img.loading = 'lazy';
                        
                        let hasLoaded = false;
                        img.onload = () => {
                            skeleton.classList.add('loaded');
                            img.classList.add('loaded');
                            setTimeout(() => skeleton.remove(), 500);
                            if (!hasLoaded) {
                                hasLoaded = true;
                                this.registerCardPreview(img, previewFrames);
                            }
                        };
                        img.onerror = () => {
                            const fallback = `assets/images/${storyId}.jpg`;
                            const fallbackUrl = new URL(fallback, window.location.href).href;
                            if (img.src !== fallbackUrl) {
                                img.src = fallback;
                            } else {
                                skeleton.classList.add('error');
                            }
                        };
                        
                        imageContainer.appendChild(img);
                        this.addPreviewBadge(imageContainer, hasIntroFrames);
                        
                        // 延迟加载图片
                        setTimeout(() => {
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                            }
                        }, index * 100);
                    }
                });
            }
        }, 200);
    }

    addPreviewBadge(container, enabled) {
        if (!enabled || container.querySelector('.card-film-badge')) return;

        const badge = document.createElement('span');
        badge.className = 'card-film-badge';
        badge.textContent = 'AI短片';
        container.appendChild(badge);
    }

    registerCardPreview(img, frames) {
        if (!frames || frames.length <= 1) return;

        this.previewItems.push({ img, frames, index: 0 });

        if (!this.previewTimer) {
            this.previewTimer = window.setInterval(() => this.advanceCardPreviews(), this.previewFrameDelay);
        }
    }

    advanceCardPreviews() {
        if (document.hidden || this.prefersReducedMotion) return;

        this.previewItems = this.previewItems.filter((item) => item.img.isConnected);

        if (!this.previewItems.length) {
            clearInterval(this.previewTimer);
            this.previewTimer = null;
            return;
        }

        this.previewItems.forEach((item) => {
            const rect = item.img.getBoundingClientRect();
            const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
            if (!isVisible) return;

            item.index = (item.index + 1) % item.frames.length;
            item.img.src = item.frames[item.index];
        });
    }
    
    loadImage(img) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 骨架加载器 */
            .skeleton-loader {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    110deg,
                    rgba(26, 36, 56, 0.8) 0%,
                    rgba(40, 50, 70, 0.8) 50%,
                    rgba(26, 36, 56, 0.8) 100%
                );
                background-size: 200% 100%;
                animation: skeletonShimmer 1.5s ease-in-out infinite;
                z-index: 1;
                transition: opacity 0.5s ease;
            }
            
            .skeleton-loader.loaded,
            .skeleton-loader.error {
                opacity: 0;
            }
            
            @keyframes skeletonShimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            /* 卡片故事图片 */
            .card-story-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: 0;
                transition: opacity 0.5s ease, transform 0.5s ease;
                z-index: 2;
            }
            
            .card-story-image.loaded {
                opacity: 1;
            }
            
            .mystic-card:hover .card-story-image.loaded {
                transform: scale(1.05);
            }
            
            /* 图片加载失败时显示图标 */
            .skeleton-loader.error::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 60px;
                height: 60px;
                background: radial-gradient(circle, rgba(201, 214, 227, 0.3) 0%, transparent 70%);
                border-radius: 50%;
                animation: pulseGlow 2s ease-in-out infinite;
            }
            
            @keyframes pulseGlow {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
    }
}

// 初始化
new ImageLoader();
