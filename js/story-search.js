/**
 * 故事搜索功能
 * 实时搜索故事标题和内容
 */

class StorySearch {
    constructor() {
        this.searchInput = null;
        this.searchResults = null;
        this.isSearching = false;
        
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
        this.createSearchBar();
        this.addStyles();
        this.bindEvents();
    }
    
    createSearchBar() {
        const header = document.querySelector('.site-header');
        if (!header) return;
        
        const searchBar = document.createElement('div');
        searchBar.className = 'story-search-bar';
        searchBar.innerHTML = `
            <div class="search-container">
                <button class="search-toggle" aria-label="搜索故事">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                </button>
                <div class="search-input-wrapper">
                    <input type="text" 
                           class="search-input" 
                           placeholder="搜索神话故事..." 
                           aria-label="搜索神话故事"
                           autocomplete="off">
                    <button class="search-clear" aria-label="清除搜索">&times;</button>
                </div>
                <div class="search-results"></div>
            </div>
        `;
        
        header.appendChild(searchBar);
        
        this.searchInput = searchBar.querySelector('.search-input');
        this.searchResults = searchBar.querySelector('.search-results');
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .story-search-bar {
                margin-top: 1.5rem;
                display: flex;
                justify-content: center;
            }
            
            .search-container {
                position: relative;
            }
            
            .search-toggle {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: rgba(26, 36, 56, 0.6);
                border: 1px solid rgba(201, 214, 227, 0.2);
                color: #c9d6e3;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            
            .search-toggle:hover {
                background: rgba(26, 36, 56, 0.8);
                border-color: rgba(201, 214, 227, 0.4);
            }
            
            .search-toggle.active {
                border-radius: 22px 0 0 22px;
                border-right: none;
            }
            
            .search-input-wrapper {
                position: absolute;
                top: 0;
                right: 0;
                width: 0;
                height: 44px;
                overflow: hidden;
                transition: width 0.3s ease;
            }
            
            .search-input-wrapper.active {
                width: 250px;
            }
            
            .search-input {
                width: 100%;
                height: 100%;
                padding: 0 35px 0 15px;
                background: rgba(26, 36, 56, 0.8);
                border: 1px solid rgba(201, 214, 227, 0.2);
                border-left: none;
                border-radius: 0 22px 22px 0;
                color: #f0f4f8;
                font-size: 0.9rem;
                outline: none;
            }
            
            .search-input::placeholder {
                color: #8a9ab0;
            }
            
            .search-clear {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: transparent;
                border: none;
                color: #8a9ab0;
                cursor: pointer;
                font-size: 1rem;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            
            .search-clear.visible {
                opacity: 1;
            }
            
            .search-results {
                position: absolute;
                top: 50px;
                left: 50%;
                transform: translateX(-50%);
                width: 300px;
                max-height: 300px;
                background: rgba(26, 36, 56, 0.95);
                border: 1px solid rgba(201, 214, 227, 0.2);
                border-radius: 12px;
                overflow-y: auto;
                opacity: 0;
                visibility: hidden;
                transform: translateX(-50%) translateY(10px);
                transition: all 0.3s ease;
                backdrop-filter: blur(12px);
                z-index: 100;
            }
            
            .search-results.visible {
                opacity: 1;
                visibility: visible;
                transform: translateX(-50%) translateY(0);
            }
            
            .search-result-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 14px;
                cursor: pointer;
                transition: background 0.2s ease;
            }
            
            .search-result-item:hover {
                background: rgba(201, 214, 227, 0.1);
            }
            
            .search-result-icon {
                font-size: 1.5rem;
            }
            
            .search-result-info {
                flex: 1;
            }
            
            .search-result-title {
                display: block;
                color: #f0f4f8;
                font-size: 0.9rem;
            }
            
            .search-result-origin {
                display: block;
                color: #8a9ab0;
                font-size: 0.75rem;
            }
            
            .search-no-results {
                padding: 20px;
                text-align: center;
                color: #8a9ab0;
                font-size: 0.85rem;
            }
            
            .search-highlight {
                color: #d4af37;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }
    
    bindEvents() {
        const toggle = document.querySelector('.search-toggle');
        const inputWrapper = document.querySelector('.search-input-wrapper');
        const clearBtn = document.querySelector('.search-clear');
        
        // 切换搜索框
        toggle?.addEventListener('click', () => {
            const isActive = inputWrapper?.classList.contains('active');
            
            if (isActive) {
                this.closeSearch();
            } else {
                this.openSearch();
            }
        });
        
        // 输入搜索
        this.searchInput?.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            this.search(query);
            
            // 显示/隐藏清除按钮
            clearBtn?.classList.toggle('visible', query.length > 0);
        });
        
        // 清除搜索
        clearBtn?.addEventListener('click', () => {
            this.searchInput.value = '';
            clearBtn.classList.remove('visible');
            this.searchResults.classList.remove('visible');
        });
        
        // ESC关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && inputWrapper?.classList.contains('active')) {
                this.closeSearch();
            }
        });
        
        // 点击外部关闭
        document.addEventListener('click', (e) => {
            const container = document.querySelector('.search-container');
            if (!container?.contains(e.target) && inputWrapper?.classList.contains('active')) {
                this.closeSearch();
            }
        });
    }
    
    openSearch() {
        const toggle = document.querySelector('.search-toggle');
        const inputWrapper = document.querySelector('.search-input-wrapper');
        
        toggle?.classList.add('active');
        inputWrapper?.classList.add('active');
        this.searchInput?.focus();
    }
    
    closeSearch() {
        const toggle = document.querySelector('.search-toggle');
        const inputWrapper = document.querySelector('.search-input-wrapper');
        
        toggle?.classList.remove('active');
        inputWrapper?.classList.remove('active');
        this.searchResults?.classList.remove('visible');
        
        if (this.searchInput) {
            this.searchInput.value = '';
        }
    }
    
    search(query) {
        if (!query || typeof cardsData === 'undefined') {
            this.searchResults?.classList.remove('visible');
            return;
        }
        
        const results = cardsData.filter(story => {
            const searchText = `${story.title} ${story.origin} ${story.preview} ${story.story}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
        
        this.renderResults(results, query);
    }
    
    renderResults(results, query) {
        if (!this.searchResults) return;
        
        if (results.length === 0) {
            this.searchResults.innerHTML = '<div class="search-no-results">没有找到相关故事</div>';
        } else {
            this.searchResults.innerHTML = results.map(story => `
                <div class="search-result-item" data-story-id="${story.id}">
                    <span class="search-result-icon">${story.icon}</span>
                    <div class="search-result-info">
                        <span class="search-result-title">${this.highlight(story.title, query)}</span>
                        <span class="search-result-origin">${story.origin}</span>
                    </div>
                </div>
            `).join('');
            
            // 绑定点击事件
            this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const storyId = item.dataset.storyId;
                    const card = document.querySelector(`.mystic-card[data-id="${storyId}"]`);
                    
                    if (card) {
                        card.click();
                        this.closeSearch();
                    }
                });
            });
        }
        
        this.searchResults.classList.add('visible');
    }
    
    highlight(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }
}

// 初始化
new StorySearch();
