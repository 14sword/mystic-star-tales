/**
 * Optimized Cards Renderer
 * Keeps the original keyboard/a11y behavior while using delegated events and lazy entry animation.
 */

class CardsRenderer {
    constructor(containerId, data) {
        this.container = document.getElementById(containerId);
        this.data = Array.isArray(data) ? data : [];
        this.renderedCards = [];
        this.cards = this.renderedCards;
        this.observer = null;
        this.focusedIndex = -1;
        this.isKeyboardNavigating = false;
        this.lastOpenedCard = null;
        this.tiltFrame = null;
        this.activeTiltCard = null;
        this.hasEmittedReady = false;
        this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.init();
    }

    init() {
        if (!this.container || this.data.length === 0) return;

        this.initObserver();
        this.render();
        this.attachEvents();
        this.setupKeyboardNavigation();
        this.setupModalFocusRestore();
    }

    initObserver() {
        if ('IntersectionObserver' in window && !this.prefersReducedMotion) {
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    rootMargin: '80px 0px',
                    threshold: 0.1
                }
            );
        }
    }

    handleIntersection(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                this.animateCardEntry(entry.target);
                if (this.observer) this.observer.unobserve(entry.target);
            }
        });
    }

    animateCardEntry(card) {
        if (!card || card.dataset.entryAnimated === 'true') return;
        card.dataset.entryAnimated = 'true';

        if (this.prefersReducedMotion) {
            card.style.opacity = '1';
            card.style.transform = 'none';
            return;
        }

        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }

    scheduleEntryFallback(card, index) {
        window.setTimeout(() => {
            if (!card.isConnected || card.dataset.entryAnimated === 'true') return;
            this.animateCardEntry(card);
        }, 450 + index * 80);
    }

    createCardHTML(card, index) {
        const title = this.escapeHtml(card.title);
        const origin = this.escapeHtml(card.origin);
        const preview = this.escapeHtml(card.preview);
        const icon = this.escapeHtml(card.icon);

        const themeColors = [
            '212, 175, 55',   // Gold
            '125, 211, 232',  // Ice Blue
            '232, 125, 164',  // Rose
            '125, 232, 164',  // Emerald
            '180, 125, 232',  // Amethyst
            '232, 180, 125',  // Amber
            '255, 255, 255',  // Silver
            '240, 100, 100',  // Crimson
            '100, 240, 200'   // Mint
        ];
        const themeColor = themeColors[index % themeColors.length];

        return `
            <article class="mystic-card" data-id="${this.escapeHtml(card.id)}" data-index="${index}" tabindex="0" role="button" aria-label="${title} - ${origin}" style="opacity: 1; transform: none; --card-theme: ${themeColor};">
                <div class="card-border-glow" aria-hidden="true"></div>
                <div class="card-glow" aria-hidden="true"></div>
                <div class="card-corner" aria-hidden="true">${String(index + 1).padStart(2, '0')}</div>
                <div class="card-image">
                    <div class="card-image-placeholder" aria-hidden="true">
                        <span class="card-icon">${icon}</span>
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${title}</h3>
                    <p class="card-origin">${origin}</p>
                    <p class="card-preview">${preview}</p>
                </div>
                <span class="card-hint">点击阅读完整故事</span>
            </article>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    render() {
        this.container.innerHTML = '';
        this.renderedCards = [];
        this.cards = this.renderedCards;

        const batchSize = this.data.length;
        const totalCards = this.data.length;

        const renderBatch = (startIndex) => {
            const fragment = document.createDocumentFragment();
            const endIndex = Math.min(startIndex + batchSize, totalCards);

            for (let i = startIndex; i < endIndex; i++) {
                const cardData = this.data[i];
                const wrapper = document.createElement('div');
                wrapper.innerHTML = this.createCardHTML(cardData, i).trim();
                const card = wrapper.firstElementChild;
                card._data = cardData;

                fragment.appendChild(card);
                this.renderedCards.push(card);

                if (this.observer) {
                    this.observer.observe(card);
                    this.scheduleEntryFallback(card, i);
                } else {
                    card.style.opacity = '1';
                    card.style.transform = 'none';
                }
            }

            this.container.appendChild(fragment);
            this.emitReadyIfComplete(endIndex, totalCards);

            if (endIndex < totalCards) {
                const schedule = window.requestIdleCallback || ((callback) => setTimeout(callback, 0));
                schedule(() => renderBatch(endIndex));
            }
        };

        renderBatch(0);
    }

    emitReadyIfComplete(renderedCount, totalCards) {
        if (this.hasEmittedReady || renderedCount < totalCards) return;
        this.hasEmittedReady = true;

        document.dispatchEvent(new CustomEvent('mystic:cards-ready', {
            detail: { count: this.renderedCards.length }
        }));
    }

    attachEvents() {
        this.container.addEventListener('click', (e) => {
            const card = e.target.closest('.mystic-card');
            if (!card || this.isInteractiveTarget(e.target)) return;
            this.openCard(card);
        });

        this.container.addEventListener('keydown', (e) => {
            const card = e.target.closest('.mystic-card');
            if (!card) return;

            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openCard(card);
            }
        });

        this.container.addEventListener('focusin', (e) => {
            const card = e.target.closest('.mystic-card');
            if (!card) return;

            this.focusedIndex = Number(card.dataset.index);
            card.classList.add('keyboard-focused');

            if (window.audioSystem && this.isKeyboardNavigating) {
                window.audioSystem.playNavigateSound();
            }
        });

        this.container.addEventListener('focusout', (e) => {
            const card = e.target.closest('.mystic-card');
            if (card) card.classList.remove('keyboard-focused');
        });

        if (!this.isTouchDevice && !this.prefersReducedMotion) {
            this.initPointerTilt();
        } else if (this.isTouchDevice) {
            this.initTouchEvents();
        }
    }

    initPointerTilt() {
        this.container.addEventListener('pointermove', (e) => {
            const card = e.target.closest('.mystic-card');
            if (!card || this.isInteractiveTarget(e.target)) return;

            this.activeTiltCard = card;
            if (this.tiltFrame) return;

            this.tiltFrame = requestAnimationFrame(() => {
                this.updateTilt(card, e);
                this.tiltFrame = null;
            });
        });

        // 移除卡片悬停音效，避免过于吵闹

        this.container.addEventListener('pointerleave', () => this.resetTilt(), true);
        this.container.addEventListener('pointerout', (e) => {
            const card = e.target.closest('.mystic-card');
            if (card && !card.contains(e.relatedTarget)) {
                this.resetTilt(card);
            }
        });
    }

    updateTilt(card, event) {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;

        const glow = card.querySelector('.card-glow');
        if (glow) {
            glow.style.setProperty('--x', `${x}px`);
            glow.style.setProperty('--y', `${y}px`);
        }
    }

    resetTilt(card = this.activeTiltCard) {
        if (!card) return;
        card.style.transform = '';

        const glow = card.querySelector('.card-glow');
        if (glow) {
            glow.style.removeProperty('--x');
            glow.style.removeProperty('--y');
        }
    }

    initTouchEvents() {
        let activeCard = null;
        let touchTimeout = null;

        this.container.addEventListener('touchstart', (e) => {
            const card = e.target.closest('.mystic-card');
            if (!card || this.isInteractiveTarget(e.target)) return;

            activeCard = card;
            card.style.transform = 'scale(0.98)';
            card.style.transition = 'transform 0.1s ease';

            if (touchTimeout) clearTimeout(touchTimeout);
        }, { passive: true });

        this.container.addEventListener('touchend', () => {
            if (!activeCard) return;

            touchTimeout = setTimeout(() => {
                activeCard.style.transform = '';
                activeCard.style.transition = '';
                activeCard = null;
            }, 150);
        }, { passive: true });

        this.container.addEventListener('touchcancel', () => {
            if (!activeCard) return;
            activeCard.style.transform = '';
            activeCard.style.transition = '';
            activeCard = null;
        }, { passive: true });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (this.isEditableTarget(e.target)) return;

            if (window.modalManager && window.modalManager.isOpen) return;

            const totalCards = this.renderedCards.length;
            if (totalCards === 0) return;

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    this.isKeyboardNavigating = true;
                    this.focusCard((this.focusedIndex + 1 + totalCards) % totalCards);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.isKeyboardNavigating = true;
                    this.focusCard(this.focusedIndex <= 0 ? totalCards - 1 : this.focusedIndex - 1);
                    break;
                case 'Home':
                    e.preventDefault();
                    this.isKeyboardNavigating = true;
                    this.focusCard(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.isKeyboardNavigating = true;
                    this.focusCard(totalCards - 1);
                    break;
            }
        });

        document.addEventListener('pointerdown', () => {
            this.isKeyboardNavigating = false;
        }, { passive: true });
    }

    setupModalFocusRestore() {
        document.addEventListener('modalClosed', () => {
            if (this.lastOpenedCard && document.contains(this.lastOpenedCard)) {
                this.lastOpenedCard.focus({ preventScroll: true });
            }
        });
    }

    focusCard(index) {
        const card = this.renderedCards[index];
        if (!card) return;

        this.focusedIndex = index;
        card.focus({ preventScroll: true });
        card.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: this.prefersReducedMotion ? 'auto' : 'smooth' });
    }

    openCard(card) {
        const cardData = card._data || this.data.find((item) => item.id === card.dataset.id);
        if (!cardData || !window.modalManager) return;

        this.lastOpenedCard = card;

        if (window.audioSystem) {
            window.audioSystem.playOpenSound();
        }

        window.modalManager.open(cardData);
    }

    updateCard(cardId, newData) {
        const card = this.renderedCards.find((item) => item._data.id === cardId);
        if (!card) return;

        Object.assign(card._data, newData);
        const index = Number(card.dataset.index);
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.createCardHTML(card._data, index).trim();
        const newCard = wrapper.firstElementChild;
        newCard._data = card._data;

        card.replaceWith(newCard);
        this.renderedCards[index] = newCard;
        this.cards = this.renderedCards;

        if (this.observer) {
            this.observer.observe(newCard);
            this.scheduleEntryFallback(newCard, index);
        } else {
            newCard.style.opacity = '1';
            newCard.style.transform = 'none';
        }
    }

    isInteractiveTarget(target) {
        return Boolean(target.closest('button, a, input, textarea, select, label, [role="button"]:not(.mystic-card)'));
    }

    isEditableTarget(target) {
        const tagName = target.tagName;
        return target.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
    }

    destroy() {
        if (this.observer) this.observer.disconnect();
        if (this.tiltFrame) cancelAnimationFrame(this.tiltFrame);
        this.container.innerHTML = '';
        this.renderedCards = [];
        this.cards = this.renderedCards;
    }
}

function initCardsRenderer() {
    if (typeof cardsData !== 'undefined') {
        window.cardsRenderer = window.cardsRenderer || new CardsRenderer('cards-container', cardsData);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCardsRenderer, { once: true });
} else {
    initCardsRenderer();
}
