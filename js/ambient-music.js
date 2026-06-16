/**
 * 背景音乐系统
 * 使用 Web Audio API 生成环境音乐
 */

class AmbientMusic {
    constructor() {
        this.isPlaying = false;
        this.volume = 0.3;
        this.audio = new Audio('assets/ambient-space.mp3');
        this.audio.loop = true;
        this.audio.volume = this.volume;
        
        this.init();
    }
    
    init() {
        // 创建控制按钮
        this.createControlButton();
        this.addStyles();
    }
    
    createControlButton() {
        const btn = document.createElement('button');
        btn.className = 'ambient-music-btn';
        btn.id = 'ambient-music-toggle';
        btn.setAttribute('aria-label', '播放背景音乐');
        btn.innerHTML = `
            <svg class="music-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <span class="music-waves">
                <span class="wave"></span>
                <span class="wave"></span>
                <span class="wave"></span>
            </span>
        `;
        
        document.body.appendChild(btn);
        
        btn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.stop();
            } else {
                this.play();
            }
        });
    }
    
    addStyles() {
        // ... (Styles are unchanged)
        const style = document.createElement('style');
        style.textContent = `
            .ambient-music-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: rgba(26, 36, 56, 0.8);
                border: 1px solid rgba(201, 214, 227, 0.2);
                color: #c9d6e3;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                transition: all 0.3s ease;
                backdrop-filter: blur(8px);
            }
            
            .ambient-music-btn:hover {
                background: rgba(26, 36, 56, 0.95);
                border-color: rgba(201, 214, 227, 0.4);
                transform: scale(1.1);
            }
            
            .ambient-music-btn.playing {
                border-color: rgba(212, 175, 55, 0.5);
                color: #d4af37;
            }
            
            .music-icon {
                transition: opacity 0.3s ease;
            }
            
            .ambient-music-btn.playing .music-icon {
                opacity: 0;
            }
            
            .music-waves {
                position: absolute;
                display: flex;
                align-items: center;
                gap: 3px;
                height: 16px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .ambient-music-btn.playing .music-waves {
                opacity: 1;
            }
            
            .music-waves .wave {
                width: 3px;
                height: 4px;
                background: currentColor;
                border-radius: 2px;
                animation: none;
            }
            
            .ambient-music-btn.playing .music-waves .wave {
                animation: waveAnim 0.8s ease-in-out infinite;
            }
            
            .music-waves .wave:nth-child(1) { animation-delay: 0s; }
            .music-waves .wave:nth-child(2) { animation-delay: 0.2s; }
            .music-waves .wave:nth-child(3) { animation-delay: 0.4s; }
            
            @keyframes waveAnim {
                0%, 100% { height: 4px; }
                50% { height: 14px; }
            }
            
            /* 音量控制 */
            .volume-control {
                position: fixed;
                bottom: 75px;
                right: 20px;
                width: 48px;
                padding: 10px;
                background: rgba(26, 36, 56, 0.9);
                border: 1px solid rgba(201, 214, 227, 0.2);
                border-radius: 8px;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 999;
            }
            
            .volume-control.visible {
                opacity: 1;
                visibility: visible;
            }
            
            .volume-slider {
                -webkit-appearance: none;
                appearance: none;
                width: 100%;
                height: 60px;
                background: transparent;
                writing-mode: vertical-lr;
                direction: rtl;
            }
            
            .volume-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 12px;
                height: 12px;
                background: #d4af37;
                border-radius: 50%;
                cursor: pointer;
            }
            
            .volume-slider::-webkit-slider-runnable-track {
                width: 4px;
                background: rgba(201, 214, 227, 0.2);
                border-radius: 2px;
            }
        `;
        document.head.appendChild(style);
    }
    
    async play() {
        if (this.isPlaying) return;
        
        try {
            await this.audio.play();
            this.isPlaying = true;
            
            // 更新按钮状态
            const btn = document.getElementById('ambient-music-toggle');
            if (btn) {
                btn.classList.add('playing');
                btn.setAttribute('aria-label', '暂停背景音乐');
            }
            
        } catch (e) {
            console.warn('无法播放背景音乐:', e);
        }
    }
    
    stop() {
        if (!this.isPlaying) return;
        
        this.audio.pause();
        this.isPlaying = false;
        
        // 更新按钮状态
        const btn = document.getElementById('ambient-music-toggle');
        if (btn) {
            btn.classList.remove('playing');
            btn.setAttribute('aria-label', '播放背景音乐');
        }
    }
    
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        this.audio.volume = this.volume;
    }
}

// 初始化
new AmbientMusic();
