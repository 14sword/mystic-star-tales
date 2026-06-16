/**
 * 故事收藏功能
 * 使用 localStorage 存储用户收藏的故事
 */

class StoryFavorites {
    constructor() {
        this.storageKey = 'mysticStar_favorites';
        this.favorites = this.loadFavorites();
        
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
        this.addFavoriteButtons();
        this.addStyles();
    }

    isCleanUi() {
        return window.MYSTIC_APP_CONFIG?.cleanUi !== false;
    }
    
    loadFavorites() {
        try {
            const stored = localStorage.getItem(this.storageKey)
                || localStorage.getItem('mystic-star-tales-favorites')
                || localStorage.getItem('mystic-favorites');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }
    
    saveFavorites() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
        } catch (e) {
            console.warn('无法保存收藏');
        }
    }
    
    addFavoriteButtons() {
        // 等待卡片渲染完成
        const checkCards = setInterval(() => {
            const cards = document.querySelectorAll('.mystic-card');
            if (cards.length > 0) {
                clearInterval(checkCards);
                
                cards.forEach(card => {
                    const storyId = card.dataset.id;
                    const isFavorite = this.favorites.includes(storyId);
                    
                    // 创建收藏按钮
                    const favBtn = document.createElement('button');
                    favBtn.className = `card-favorite-btn ${isFavorite ? 'favorited' : ''}`;
                    favBtn.dataset.storyId = storyId;
                    favBtn.setAttribute('aria-label', isFavorite ? '取消收藏' : '添加收藏');
                    favBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    `;
                    
                    favBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.toggleFavorite(storyId, favBtn);
                    });
                    
                    card.appendChild(favBtn);
                });
            }
        }, 100);
    }
    
    toggleFavorite(storyId, btn) {
        const index = this.favorites.indexOf(storyId);
        let action = '';
        
        if (index === -1) {
            // 添加收藏
            this.favorites.push(storyId);
            btn.classList.add('favorited');
            btn.setAttribute('aria-label', '取消收藏');
            this.showToast('已添加到收藏');
            action = 'add';
        } else {
            // 取消收藏
            this.favorites.splice(index, 1);
            btn.classList.remove('favorited');
            btn.setAttribute('aria-label', '添加收藏');
            this.showToast('已取消收藏');
            action = 'remove';
        }
        
        this.saveFavorites();
        
        // 触发自定义事件，通知筛选等其他组件
        document.dispatchEvent(new CustomEvent('mystic:favorite-changed', {
            detail: { storyId, action, favorites: this.favorites }
        }));
        
        // 播放音效
        if (window.audioSystem) {
            window.audioSystem.playConfirmSound();
        }
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .card-favorite-btn {
                position: absolute;
                top: 12px;
                left: 12px;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(10, 15, 26, 0.6);
                border: 1px solid rgba(201, 214, 227, 0.2);
                color: #8a9ab0;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: all 0.3s ease;
                z-index: 5;
            }
            
            .mystic-card:hover .card-favorite-btn {
                opacity: 1;
            }
            
            .card-favorite-btn:hover {
                background: rgba(10, 15, 26, 0.8);
                transform: scale(1.1);
            }
            
            .card-favorite-btn.favorited {
                color: #d4af37;
                border-color: rgba(212, 175, 55, 0.4);
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'favorite-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 20px;
            background: rgba(26, 36, 56, 0.95);
            color: #f0f4f8;
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid rgba(201, 214, 227, 0.2);
            font-size: 0.85rem;
            z-index: 1001;
            animation: toastIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 1500);
    }
}

// 初始化
window.storyFavorites = window.storyFavorites || new StoryFavorites();

// Toast动画
const favToastStyle = document.createElement('style');
favToastStyle.textContent = `
    @keyframes toastIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes toastOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`;
if (!document.getElementById('favorite-toast-styles')) {
    favToastStyle.id = 'favorite-toast-styles';
    document.head.appendChild(favToastStyle);
}
