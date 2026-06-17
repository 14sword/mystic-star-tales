/**
 * 故事搜索功能
 * 实时搜索故事标题和内容
 */

const PINYIN_MAP = {
    'tiger': ['yhcs', 'yinhuchuanshuo', 'hu', 'tiger', '老虎', 'laohu', '寅虎', '大老虎', '十二生肖', '生肖'],
    'sagittarius': ['sszsh', 'sheshouzuoshenhua', 'ssz', 'sagittarius', '射手', '半人马', '人马座', '弓箭', '喀戎', '星座'],
    'aurora': ['jgjl', 'jiguangjingling', 'jg', 'aurora', '北极光', '极光', '狐狸', '北欧', '神狐', '斯堪的纳维亚'],
    'kalpavriksha': ['ryss', 'ruyishenshu', 'ry', 'kalpavriksha', '如意', '神树', '许愿树', '印度神话', '因陀罗'],
    'anubis': ['anbsdsp', 'anubisideshenpan', 'anbs', 'anubis', '阿努比斯', '死神', '审判', '埃及', '胡狼', '心脏', '羽毛'],
    'amaterasu': ['tzdsdyt', 'tianzhaodashendeyintui', 'tzds', 'amaterasu', '天照', '大神', '太阳神', '日本神话', '高天原', '天岩户'],
    'sidhe': ['jlzqddy', 'jinglingzhiqiudediyu', 'jl', 'sidhe', '精灵', '爱尔兰', '凯尔特', '达南神族', '异世界'],
    'quetzalcoatl': ['ysdsec', 'yusheshendeenci', 'yss', 'quetzalcoatl', '羽蛇神', '玛雅', '阿兹特克', '玉米', '美洲'],
    'firebird': ['hndym', 'huoniaodeyumao', 'hn', 'firebird', '火鸟', '羽毛', '俄罗斯', '斯拉夫', '伊凡', '沙皇', '金苹果'],
    'genie': ['dsyft', 'dengshenyufeitan', 'ds', 'genie', '灯神', '飞毯', '神灯', '阿拉丁', '阿拉伯', '中东', '许愿'],
    'time-devotion': ['sjyznzs', 'shijianyuzhinianzhishi', 'sj', 'time', '时间', '执念', '时光', '钟表', '岁月', '魔法'],
    'altair-vega': ['nlznxq', 'nlzn', 'niulangzhinvxingqiao', 'niulang', 'zhinv', '牛郎', '织女', '鹊桥', '七夕', '银河', '爱情'],
    'orpheus-lyre': ['aefsdag', 'aoerfusideaige', 'aefs', 'orpheus', '奥菲斯', '欧律狄刻', '竖琴', '冥界', '希腊', '冥王', '回头'],
    'cupid-psyche': ['asylhzs', 'aishenyulinghunzhishi', 'as', 'cupid', '爱神', '丘比特', '普赛克', '灵魂', '维纳斯', '蜡烛', '信任'],
    'tristan-iseult': ['xyllzs', 'xingyelianlizhishi', 'xyll', 'tristan', '特里斯坦', '伊索尔德', '骑士', '亚瑟王', '魔药', '悲剧']
};

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
    
    createSearchBar() {
        const controlsContainer = this.getOrCreateControlsContainer();
        if (!controlsContainer) return;
        
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
                           id="story-search-input"
                           name="q"
                           class="search-input" 
                           placeholder="搜索神话故事..." 
                           aria-label="搜索神话故事"
                           autocomplete="off">
                    <button class="search-clear" aria-label="清除搜索">&times;</button>
                </div>
            </div>
        `;
        
        controlsContainer.appendChild(searchBar);
        
        this.searchBar = searchBar;
        this.searchInput = searchBar.querySelector('.search-input');
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 在位过滤卡片 */
            .mystic-card.search-hidden {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    bindEvents() {
        if (!this.searchBar) return;
        
        const toggle = this.searchBar.querySelector('.search-toggle');
        const inputWrapper = this.searchBar.querySelector('.search-input-wrapper');
        const clearBtn = this.searchBar.querySelector('.search-clear');
        
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
            
            // 如果输入框有内容，分发事件重置故事分类过滤
            if (query.length > 0) {
                if (window.MysticApp && window.MysticApp.events) {
                    window.MysticApp.events.emit('search-active');
                } else {
                    document.dispatchEvent(new CustomEvent('mystic:search-active'));
                }
            }
        });
        
        // 支持回车收起键盘
        this.searchInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.searchInput.blur();
                this.search(this.searchInput.value.trim());
            }
        });
        
        // 清除搜索
        clearBtn?.addEventListener('click', () => {
            this.searchInput.value = '';
            clearBtn.classList.remove('visible');
            this.search('');
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
        const container = document.querySelector('.search-container');
        
        toggle?.classList.add('active');
        inputWrapper?.classList.add('active');
        container?.classList.add('active');
        this.searchInput?.focus();
    }
    
    closeSearch() {
        if (!this.searchBar) return;
        const toggle = this.searchBar.querySelector('.search-toggle');
        const inputWrapper = this.searchBar.querySelector('.search-input-wrapper');
        const container = this.searchBar.querySelector('.search-container');
        const clearBtn = this.searchBar.querySelector('.search-clear');
        
        toggle?.classList.remove('active');
        inputWrapper?.classList.remove('active');
        container?.classList.remove('active');
        
        if (this.searchInput) {
            this.searchInput.value = '';
            clearBtn?.classList.remove('visible');
        }
        
        this.search('');
    }
    
    search(query) {
        const cards = document.querySelectorAll('.mystic-card');
        
        if (!query || typeof window.cardsData === 'undefined') {
            cards.forEach(card => card.classList.remove('search-hidden'));
            return;
        }

        const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        if (terms.length === 0) {
            cards.forEach(card => card.classList.remove('search-hidden'));
            return;
        }

        const scoredResults = window.cardsData.map(story => {
            let score = 0;
            const title = story.title.toLowerCase();
            const origin = story.origin.toLowerCase();
            const preview = story.preview.toLowerCase();
            const storyText = story.story.toLowerCase();

            let matchedAll = true;
            terms.forEach(term => {
                let termScore = 0;
                // 1. 标题匹配（最高权重）
                if (title.includes(term)) {
                    termScore += 100;
                    if (title === term) termScore += 100; // 完全匹配 bonus
                    if (title.startsWith(term)) termScore += 50; // 前缀匹配 bonus
                }
                // 2. 出处匹配（中等权重）
                if (origin.includes(term)) {
                    termScore += 40;
                }
                // 3. 预览简介匹配（较低权重）
                if (preview.includes(term)) {
                    termScore += 15;
                }
                // 4. 故事全文匹配（最低权重）
                if (storyText.includes(term)) {
                    termScore += 5;
                }

                // 5. 拼音及外文别名匹配 (如 "nlzn" -> 牛郎织女)
                if (termScore === 0) {
                    const aliases = PINYIN_MAP[story.id] || [];
                    const aliasMatch = aliases.some(alias => alias.includes(term) || this.isSubsequence(term, alias));
                    if (aliasMatch) {
                        termScore += 40;
                    }
                }

                // 6. 模糊字符子序列匹配（如输入 "nzn" 或 "牛织" 模糊匹配 "牛郎织女"）
                if (termScore === 0) {
                    if (this.isSubsequence(term, title)) {
                        termScore += 30;
                    } else if (this.isSubsequence(term, preview)) {
                        termScore += 5;
                    } else {
                        matchedAll = false;
                    }
                }

                score += termScore;
            });

            return { story, score, matchedAll };
        });

        // 过滤得分大于0的故事 ID
        const matchedIds = new Set(scoredResults
            .filter(item => item.score > 0)
            .map(item => item.story.id)
        );

        // 应用过滤到 DOM
        cards.forEach(card => {
            if (matchedIds.has(card.dataset.id)) {
                card.classList.remove('search-hidden');
            } else {
                card.classList.add('search-hidden');
            }
        });
    }

    isSubsequence(term, str) {
        let tIdx = 0;
        let sIdx = 0;
        while (tIdx < term.length && sIdx < str.length) {
            if (term[tIdx] === str[sIdx]) {
                tIdx++;
            }
            sIdx++;
        }
        return tIdx === term.length;
    }
}

// 初始化
new StorySearch();
