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
    
    getOrCreateControlsContainer() {
        let container = document.querySelector('.story-controls-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'story-controls-container';
            const cardsContainer = document.getElementById('cards-container');
            if (cardsContainer) {
                cardsContainer.parentNode.insertBefore(container, cardsContainer);
            }
        }
        return container;
    }

    createFilterBar() {
        const controlsContainer = this.getOrCreateControlsContainer();
        if (!controlsContainer) return;
        
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
        
        controlsContainer.appendChild(filterBar);
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
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
                this.applyFilter('favorites', true);
            }
        });

        // 监听搜索事件，如果有输入，自动重置分类到 "all"
        document.addEventListener('mystic:search-active', () => {
            if (this.currentFilter !== 'all') {
                this.currentFilter = 'all';
                // 更新按钮状态
                filterBtns.forEach(b => {
                    if (b.dataset.filter === 'all') {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
                this.applyFilter('all', true);
            }
        });
    }
    
    applyFilter(filter, isSilent = false) {
        this.currentFilter = filter;
        const cards = document.querySelectorAll('.mystic-card');
        const category = this.categories[filter];
        
        cards.forEach((card, index) => {
            const cardId = card.dataset.id;
            const shouldBeVisible = filter === 'all' || 
                (filter === 'favorites' && window.storyFavorites && window.storyFavorites.favorites.includes(cardId)) ||
                (category.stories && category.stories.includes(cardId));
            
            // 清除之前的定时器以防竞态条件
            if (card._filterInTimeout) {
                clearTimeout(card._filterInTimeout);
                card._filterInTimeout = null;
            }
            if (card._filterOutTimeout) {
                clearTimeout(card._filterOutTimeout);
                card._filterOutTimeout = null;
            }

            // 移除之前的动画类
            card.classList.remove('filtered-out', 'filtered-in');
            
            if (shouldBeVisible) {
                card.style.display = '';
                // 添加入场动画（带延迟）
                card._filterInTimeout = setTimeout(() => {
                    card.classList.add('filtered-in');
                    card._filterInTimeout = null;
                }, index * 50);
            } else {
                card.classList.add('filtered-out');
                card._filterOutTimeout = setTimeout(() => {
                    card.style.display = 'none';
                    card._filterOutTimeout = null;
                }, 400);
            }
        });
        
        // 播放音效
        if (!isSilent && window.audioSystem) {
            window.audioSystem.playClick();
        }
    }
}

// 初始化
new StoryFilter();
