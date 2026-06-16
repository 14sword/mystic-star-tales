/**
 * 故事分类筛选功能
 * 按文化区域筛选神话故事
 */

class StoryFilter {
    constructor() {
        this.categories = {
            'all': { name: '全部故事', icon: '✦' },
            'favorites': { name: '我的收藏', icon: '❤️' },
            'east-asia': { name: '东亚神话', icon: '✵', stories: ['tiger', 'amaterasu'] },
            'europe': { name: '欧洲神话', icon: '❈', stories: ['sagittarius', 'aurora', 'sidhe', 'firebird'] },
            'south-asia': { name: '南亚神话', icon: '❂', stories: ['kalpavriksha'] },
            'middle-east': { name: '中东神话', icon: '☾', stories: ['anubis', 'genie'] },
            'americas': { name: '美洲神话', icon: '◈', stories: ['quetzalcoatl'] }
        };
        
        this.currentFilter = 'all';
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
        this.createFilterBar();
        this.addStyles();
        this.bindEvents();
    }
    
    createFilterBar() {
        const header = document.querySelector('.site-header');
        if (!header) return;
        
        const filterBar = document.createElement('div');
        filterBar.className = 'story-filter-bar';
        filterBar.innerHTML = `
            <div class="filter-container">
                ${Object.entries(this.categories).map(([key, cat]) => `
                    <button class="filter-btn ${key === 'all' ? 'active' : ''}" data-filter="${key}">
                        <span class="filter-icon">${cat.icon}</span>
                        <span class="filter-name">${cat.name}</span>
                    </button>
                `).join('')}
            </div>
        `;
        
        header.appendChild(filterBar);
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .story-filter-bar {
                margin-top: 2rem;
                display: flex;
                justify-content: center;
            }
            
            .filter-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 0.5rem;
                max-width: 600px;
            }
            
            .filter-btn {
                display: flex;
                align-items: center;
                gap: 0.4rem;
                padding: 0.5rem 1rem;
                background: rgba(26, 36, 56, 0.6);
                border: 1px solid rgba(201, 214, 227, 0.15);
                border-radius: 20px;
                color: #a8b8cc;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .filter-btn:hover {
                background: rgba(26, 36, 56, 0.8);
                border-color: rgba(201, 214, 227, 0.3);
                color: #c9d6e3;
            }
            
            .filter-btn.active {
                background: rgba(212, 175, 55, 0.15);
                border-color: rgba(212, 175, 55, 0.4);
                color: #d4af37;
            }
            
            .filter-btn .filter-icon {
                font-size: 1rem;
            }
            
            .filter-btn .filter-name {
                letter-spacing: 0.05em;
            }
            
            /* 卡片筛选动画 */
            .mystic-card.filtered-out {
                opacity: 0;
                transform: scale(0.8);
                pointer-events: none;
            }
            
            .mystic-card.filtered-in {
                animation: filterIn 0.4s ease forwards;
            }
            
            @keyframes filterIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            
            /* 响应式 */
            @media (max-width: 768px) {
                .story-filter-bar {
                    margin-top: 1.5rem;
                }
                
                .filter-container {
                    gap: 0.4rem;
                }
                
                .filter-btn {
                    padding: 0.4rem 0.8rem;
                    font-size: 0.75rem;
                }
                
                .filter-btn .filter-name {
                    display: none;
                }
                
                .filter-btn .filter-icon {
                    font-size: 1.2rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    bindEvents() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.applyFilter(filter);
                
                // 更新按钮状态
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // 监听收藏状态改变，当处于“我的收藏”筛选视图下时，实时更新卡片列表
        document.addEventListener('mystic:favorite-changed', () => {
            if (this.currentFilter === 'favorites') {
                this.applyFilter('favorites');
            }
        });
    }
    
    applyFilter(filter) {
        this.currentFilter = filter;
        const cards = document.querySelectorAll('.mystic-card');
        const category = this.categories[filter];
        
        cards.forEach((card, index) => {
            const cardId = card.dataset.id;
            const shouldBeVisible = filter === 'all' || 
                (filter === 'favorites' && window.storyFavorites && window.storyFavorites.favorites.includes(cardId)) ||
                (category.stories && category.stories.includes(cardId));
            
            // 移除之前的动画类
            card.classList.remove('filtered-out', 'filtered-in');
            
            if (shouldBeVisible) {
                card.style.display = '';
                // 添加入场动画（带延迟）
                setTimeout(() => {
                    card.classList.add('filtered-in');
                }, index * 50);
            } else {
                card.classList.add('filtered-out');
                setTimeout(() => {
                    card.style.display = 'none';
                }, 400);
            }
        });
        
        // 播放音效
        if (window.audioSystem) {
            window.audioSystem.playClick();
        }
    }
}

// 初始化
new StoryFilter();
