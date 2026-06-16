/**
 * 成就系统
 * 解锁各种成就
 */

class AchievementSystem {
    constructor() {
        this.storageKey = 'mysticStar_badges';
        this.achievements = this.loadAchievements();
        
        this.definitions = {
            'first-story': { name: '初次探索', desc: '阅读第一个故事', icon: '📖' },
            'five-stories': { name: '故事爱好者', desc: '阅读5个故事', icon: '📚' },
            'all-stories': { name: '神话大师', desc: '阅读所有故事', icon: '🏆' },
            'first-favorite': { name: '心动时刻', desc: '收藏第一个故事', icon: '❤️' },
            'five-favorites': { name: '收藏家', desc: '收藏5个故事', icon: '💎' },
            'first-rating': { name: '品鉴师', desc: '为第一个故事评分', icon: '⭐' },
            'all-ratings': { name: '评论家', desc: '为所有故事评分', icon: '🌟' },
            'first-note': { name: '记录者', desc: '写下第一条笔记', icon: '📝' },
            'music-lover': { name: '音乐爱好者', desc: '播放背景音乐', icon: '🎵' },
            'explorer': { name: '探索者', desc: '使用搜索功能', icon: '🔍' }
        };
        
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    loadAchievements() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }
    
    saveAchievements() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.achievements));
        } catch (e) {}
    }
    
    setup() {
        this.createAchievementPanel();
        this.observeEvents();
        this.addStyles();
        
        // 检查成就
        this.checkAchievements();
    }
    
    unlock(achievementId) {
        if (this.achievements.includes(achievementId)) return;
        
        const def = this.definitions[achievementId];
        if (!def) return;
        
        this.achievements.push(achievementId);
        this.saveAchievements();
        
        // 显示解锁通知
        this.showUnlockNotification(def);
    }
    
    showUnlockNotification(def) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${def.icon}</div>
            <div class="achievement-info">
                <span class="achievement-name">${def.name}</span>
                <span class="achievement-desc">${def.desc}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('visible'), 10);
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    checkAchievements() {
        // 检查阅读成就
        const stats = JSON.parse(localStorage.getItem('mysticStar_stats') || localStorage.getItem('mystic-star-tales-stats') || '{}');
        const readCount = (stats.storiesRead || []).length;
        
        if (readCount >= 1) this.unlock('first-story');
        if (readCount >= 5) this.unlock('five-stories');
        if (readCount >= 10) this.unlock('all-stories');
        
        // 检查收藏成就
        const favorites = JSON.parse(localStorage.getItem('mysticStar_favorites') || localStorage.getItem('mystic-star-tales-favorites') || '[]');
        if (favorites.length >= 1) this.unlock('first-favorite');
        if (favorites.length >= 5) this.unlock('five-favorites');
        
        // 检查评分成就
        const ratings = JSON.parse(localStorage.getItem('mystic-star-tales-ratings') || '{}');
        const ratingCount = Object.keys(ratings).length;
        if (ratingCount >= 1) this.unlock('first-rating');
        if (ratingCount >= 10) this.unlock('all-ratings');
        
        // 检查笔记成就
        const notes = JSON.parse(localStorage.getItem('mysticStar_notes') || localStorage.getItem('mystic-star-tales-notes') || '{}');
        if (Object.keys(notes).length >= 1) this.unlock('first-note');
    }
    
    observeEvents() {
        // 定期检查成就
        setInterval(() => this.checkAchievements(), 10000);
    }
    
    createAchievementPanel() {
        const btn = document.createElement('button');
        btn.className = 'achievement-btn';
        btn.setAttribute('aria-label', '查看成就');
        btn.innerHTML = `
            <span class="achievement-count">${this.achievements.length}/${Object.keys(this.definitions).length}</span>
            <span class="achievement-badge">🏆</span>
        `;
        
        document.body.appendChild(btn);
        
        btn.addEventListener('click', () => this.showAchievementsList());
    }
    
    showAchievementsList() {
        const panel = document.createElement('div');
        panel.className = 'achievements-panel';
        
        const achievementsList = Object.entries(this.definitions).map(([id, def]) => {
            const unlocked = this.achievements.includes(id);
            return `
                <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
                    <span class="item-icon">${unlocked ? def.icon : '🔒'}</span>
                    <div class="item-info">
                        <span class="item-name">${def.name}</span>
                        <span class="item-desc">${def.desc}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        panel.innerHTML = `
            <div class="achievements-content">
                <div class="achievements-header">
                    <h3>成就系统</h3>
                    <button class="achievements-close">&times;</button>
                </div>
                <div class="achievements-list">${achievementsList}</div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        panel.querySelector('.achievements-close').addEventListener('click', () => panel.remove());
        panel.addEventListener('click', (e) => {
            if (e.target === panel) panel.remove();
        });
        
        setTimeout(() => panel.classList.add('visible'), 10);
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .achievement-btn {
                position: fixed;
                top: 60px;
                left: 20px;
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: rgba(26, 36, 56, 0.8);
                border: 1px solid rgba(201, 214, 227, 0.2);
                border-radius: 20px;
                cursor: pointer;
                z-index: 999;
                transition: all 0.3s ease;
            }
            
            .achievement-btn:hover {
                background: rgba(26, 36, 56, 0.95);
            }
            
            .achievement-count {
                color: #a8b8cc;
                font-size: 0.75rem;
            }
            
            .achievement-badge {
                font-size: 1rem;
            }
            
            .achievement-notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(-100px);
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 20px;
                background: rgba(26, 36, 56, 0.95);
                border: 1px solid rgba(212, 175, 55, 0.4);
                border-radius: 12px;
                z-index: 10002;
                transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .achievement-notification.visible {
                transform: translateX(-50%) translateY(0);
            }
            
            .achievement-notification .achievement-icon {
                font-size: 1.5rem;
            }
            
            .achievement-notification .achievement-name {
                display: block;
                color: #d4af37;
                font-size: 0.9rem;
            }
            
            .achievement-notification .achievement-desc {
                display: block;
                color: #a8b8cc;
                font-size: 0.75rem;
            }
            
            .achievements-panel {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(10, 15, 26, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .achievements-panel.visible { opacity: 1; }
            
            .achievements-content {
                background: rgba(26, 36, 56, 0.95);
                border: 1px solid rgba(201, 214, 227, 0.2);
                border-radius: 16px;
                padding: 20px;
                width: 90%;
                max-width: 400px;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .achievements-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .achievements-header h3 {
                color: #f0f4f8;
                font-size: 1.1rem;
            }
            
            .achievements-close {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: transparent;
                border: none;
                color: #8a9ab0;
                cursor: pointer;
                font-size: 1.2rem;
            }
            
            .achievement-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 8px;
                background: rgba(201, 214, 227, 0.05);
            }
            
            .achievement-item.locked {
                opacity: 0.5;
            }
            
            .achievement-item.unlocked {
                background: rgba(212, 175, 55, 0.1);
            }
            
            .item-icon {
                font-size: 1.5rem;
            }
            
            .item-name {
                display: block;
                color: #f0f4f8;
                font-size: 0.9rem;
            }
            
            .item-desc {
                display: block;
                color: #8a9ab0;
                font-size: 0.75rem;
            }
        `;
        document.head.appendChild(style);
    }
}

// 初始化
new AchievementSystem();
