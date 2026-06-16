/**
 * 阅读进度指示器
 * 显示故事阅读进度和预计阅读时间
 */

class ReadingProgress {
    constructor() {
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
        this.createProgressBar();
        this.createReadingTime();
        this.addStyles();
        this.observeModal();
    }
    
    createProgressBar() {
        const bar = document.createElement('div');
        bar.className = 'reading-progress-bar';
        bar.innerHTML = '<div class="reading-progress-fill"></div>';
        document.body.appendChild(bar);
    }
    
    createReadingTime() {
        // 在模态框中添加阅读时间提示
        const checkModal = setInterval(() => {
            const modalText = document.querySelector('.modal-text');
            if (modalText && !modalText.querySelector('.reading-time')) {
                clearInterval(checkModal);
                
                const readingTime = document.createElement('div');
                readingTime.className = 'reading-time';
                readingTime.innerHTML = `
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    <span class="time-text">约 2 分钟</span>
                `;
                
                modalText.insertBefore(readingTime, modalText.firstChild);
            }
        }, 500);
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 阅读进度条 */
            .reading-progress-bar {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: rgba(201, 214, 227, 0.1);
                z-index: 10001;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .reading-progress-bar.visible {
                opacity: 1;
            }
            
            .reading-progress-fill {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #d4af37, #c9d6e3);
                transition: width 0.1s ease;
            }
            
            /* 阅读时间提示 */
            .reading-time {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 1rem;
                color: #8a9ab0;
                font-size: 0.8rem;
            }
            
            .reading-time svg {
                opacity: 0.7;
            }
        `;
        document.head.appendChild(style);
    }
    
    observeModal() {
        const modalOverlay = document.getElementById('modal-overlay');
        const progressBar = document.querySelector('.reading-progress-bar');
        const progressFill = progressBar?.querySelector('.reading-progress-fill');
        
        if (!modalOverlay || !progressBar || !progressFill) return;
        
        // 监听模态框滚动
        const updateProgress = () => {
            const modalText = document.querySelector('.modal-text');
            if (!modalText) return;
            
            const scrollTop = modalText.scrollTop;
            const scrollHeight = modalText.scrollHeight - modalText.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            
            progressFill.style.width = `${Math.min(100, progress)}%`;
        };
        
        // 监听模态框状态
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isActive = modalOverlay.classList.contains('active');
                    
                    if (isActive) {
                        progressBar.classList.add('visible');
                        
                        // 计算阅读时间
                        const modalText = document.querySelector('.modal-text');
                        if (modalText) {
                            const textLength = modalText.textContent.length;
                            const readingTime = Math.ceil(textLength / 500); // 约500字/分钟
                            const timeText = document.querySelector('.time-text');
                            if (timeText) {
                                timeText.textContent = `约 ${readingTime} 分钟`;
                            }
                            
                            // 监听滚动
                            modalText.addEventListener('scroll', updateProgress);
                        }
                    } else {
                        progressBar.classList.remove('visible');
                        progressFill.style.width = '0%';
                    }
                }
            });
        });
        
        observer.observe(modalOverlay, { attributes: true });
    }
}

// 初始化
new ReadingProgress();
