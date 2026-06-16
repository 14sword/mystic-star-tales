/**
 * 页面加载动画
 * 优雅的加载过渡效果
 */

class PageLoader {
    constructor() {
        this.loader = null;
        this.minDisplayTime = 250; // 最小显示时间
        this.startTime = Date.now();
        this.hidden = false;
        
        this.init();
    }
    
    init() {
        // 创建加载器
        this.createLoader();
        
        // 首屏核心内容出现即可隐藏，不等待所有增强模块和图片资源。
        document.addEventListener('mystic:cards-ready', () => this.hide(), { once: true });
        document.addEventListener('DOMContentLoaded', () => this.hideWhenCardsExist());
        window.addEventListener('load', () => this.hideWhenCardsExist());
        
        // 备用：3秒后强制隐藏
        setTimeout(() => {
            this.hide();
        }, 3000);
    }

    hideWhenCardsExist() {
        if (document.querySelector('.mystic-card')) {
            this.hide();
            return;
        }

        const container = document.getElementById('cards-container');
        if (!container || !('MutationObserver' in window)) return;

        const observer = new MutationObserver(() => {
            if (document.querySelector('.mystic-card')) {
                observer.disconnect();
                this.hide();
            }
        });

        observer.observe(container, { childList: true, subtree: true });
        setTimeout(() => observer.disconnect(), 2500);
    }
    
    createLoader() {
        // 创建加载器容器
        this.loader = document.createElement('div');
        this.loader.id = 'page-loader';
        this.loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-stars">
                    <span class="star star-1">✦</span>
                    <span class="star star-2">✧</span>
                    <span class="star star-3">✦</span>
                </div>
                <div class="loader-text">
                    <span class="text-cn">神秘星语</span>
                    <span class="text-en">Mystic Star Tales</span>
                </div>
                <div class="loader-progress">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `;
        
        // 插入到页面开头
        document.body.insertBefore(this.loader, document.body.firstChild);
        
        // 添加样式
        this.addStyles();
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #page-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(180deg, #0a0f1a 0%, #121a2b 50%, #1a2438 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                transition: opacity 0.6s ease, visibility 0.6s ease;
            }
            
            #page-loader.hidden {
                opacity: 0;
                visibility: hidden;
            }
            
            .loader-content {
                text-align: center;
            }
            
            .loader-stars {
                margin-bottom: 2rem;
                font-size: 2rem;
            }
            
            .loader-stars .star {
                display: inline-block;
                color: #c9d6e3;
                animation: starPulse 1.5s ease-in-out infinite;
            }
            
            .loader-stars .star-1 { animation-delay: 0s; }
            .loader-stars .star-2 { animation-delay: 0.3s; margin: 0 0.5rem; }
            .loader-stars .star-3 { animation-delay: 0.6s; }
            
            @keyframes starPulse {
                0%, 100% { 
                    opacity: 0.3; 
                    transform: scale(0.8);
                }
                50% { 
                    opacity: 1; 
                    transform: scale(1.2);
                    text-shadow: 0 0 20px rgba(201, 214, 227, 0.8);
                }
            }
            
            .loader-text {
                margin-bottom: 2rem;
            }
            
            .loader-text .text-cn {
                display: block;
                font-size: 1.8rem;
                color: #f0f4f8;
                letter-spacing: 0.3em;
                font-weight: 300;
                margin-bottom: 0.5rem;
                animation: fadeIn 1s ease-out 0.3s both;
            }
            
            .loader-text .text-en {
                display: block;
                font-size: 0.9rem;
                color: #8a9ab0;
                letter-spacing: 0.4em;
                text-transform: uppercase;
                animation: fadeIn 1s ease-out 0.5s both;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .loader-progress {
                width: 200px;
                height: 2px;
                background: rgba(201, 214, 227, 0.2);
                border-radius: 1px;
                overflow: hidden;
                margin: 0 auto;
            }
            
            .loader-progress .progress-bar {
                width: 0%;
                height: 100%;
                background: linear-gradient(90deg, #d4af37, #c9d6e3);
                border-radius: 1px;
                animation: progressAnim 2s ease-out forwards;
            }
            
            @keyframes progressAnim {
                0% { width: 0%; }
                30% { width: 30%; }
                60% { width: 60%; }
                80% { width: 80%; }
                100% { width: 100%; }
            }
            
            /* 减少动画偏好 */
            @media (prefers-reduced-motion: reduce) {
                #page-loader,
                .loader-stars .star,
                .loader-text .text-cn,
                .loader-text .text-en,
                .loader-progress .progress-bar {
                    animation: none !important;
                }
                
                .loader-stars .star {
                    opacity: 1;
                }
                
                .loader-text .text-cn,
                .loader-text .text-en {
                    opacity: 1;
                }
                
                .loader-progress .progress-bar {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    hide() {
        if (this.hidden) return;
        this.hidden = true;

        const elapsed = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minDisplayTime - elapsed);
        
        setTimeout(() => {
            if (this.loader) {
                this.loader.classList.add('hidden');
                
                // 动画完成后移除加载器
                setTimeout(() => {
                    this.loader.remove();
                }, 600);
            }
        }, remainingTime);
    }
}

// 立即初始化（不需要等待DOMContentLoaded）
new PageLoader();
