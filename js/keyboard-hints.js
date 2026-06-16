/**
 * 键盘快捷键提示
 * 显示可用的键盘快捷键
 */

class KeyboardHints {
    constructor() {
        this.hints = [
            { key: '← →', desc: '切换故事' },
            { key: 'Enter', desc: '打开故事' },
            { key: 'Esc', desc: '关闭' },
            { key: '?', desc: '显示帮助' }
        ];
        
        this.init();
    }
    
    init() {
        this.createHintButton();
        this.createHintPanel();
        this.addStyles();
        this.bindEvents();
    }
    
    createHintButton() {
        const btn = document.createElement('button');
        btn.className = 'keyboard-hint-btn';
        btn.setAttribute('aria-label', '键盘快捷键');
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 5H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 4h-2v-2h2v2zm0-3h-2V8h2v2z"/>
            </svg>
        `;
        document.body.appendChild(btn);
        
        btn.addEventListener('click', () => this.togglePanel());
    }
    
    createHintPanel() {
        const panel = document.createElement('div');
        panel.className = 'keyboard-hint-panel';
        panel.innerHTML = `
            <div class="hint-header">
                <span>键盘快捷键</span>
                <button class="hint-close">&times;</button>
            </div>
            <div class="hint-content">
                ${this.hints.map(h => `
                    <div class="hint-item">
                        <kbd class="hint-key">${h.key}</kbd>
                        <span class="hint-desc">${h.desc}</span>
                    </div>
                `).join('')}
            </div>
        `;
        document.body.appendChild(panel);
        
        panel.querySelector('.hint-close').addEventListener('click', () => this.hidePanel());
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-hint-btn {
                position: fixed;
                bottom: 75px;
                right: 20px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(26, 36, 56, 0.8);
                border: 1px solid rgba(201, 214, 227, 0.2);
                color: #c9d6e3;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999;
                transition: all 0.3s ease;
                opacity: 0.7;
            }
            
            .keyboard-hint-btn:hover {
                opacity: 1;
                background: rgba(26, 36, 56, 0.95);
                border-color: rgba(201, 214, 227, 0.4);
            }
            
            .keyboard-hint-panel {
                position: fixed;
                bottom: 120px;
                right: 20px;
                width: 200px;
                background: rgba(26, 36, 56, 0.95);
                border: 1px solid rgba(201, 214, 227, 0.2);
                border-radius: 12px;
                backdrop-filter: blur(12px);
                z-index: 1001;
                opacity: 0;
                visibility: hidden;
                transform: translateY(10px);
                transition: all 0.3s ease;
            }
            
            .keyboard-hint-panel.visible {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .hint-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 14px;
                border-bottom: 1px solid rgba(201, 214, 227, 0.1);
                color: #f0f4f8;
                font-size: 0.85rem;
            }
            
            .hint-close {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: transparent;
                border: none;
                color: #8a9ab0;
                cursor: pointer;
                font-size: 1rem;
            }
            
            .hint-content {
                padding: 10px;
            }
            
            .hint-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 6px 4px;
            }
            
            .hint-key {
                display: inline-block;
                min-width: 40px;
                padding: 3px 8px;
                background: rgba(201, 214, 227, 0.1);
                border: 1px solid rgba(201, 214, 227, 0.2);
                border-radius: 4px;
                color: #d4af37;
                font-size: 0.75rem;
                text-align: center;
                font-family: monospace;
            }
            
            .hint-desc {
                color: #a8b8cc;
                font-size: 0.8rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    bindEvents() {
        // 按 ? 键显示帮助
        document.addEventListener('keydown', (e) => {
            if (e.key === '?' && !this.isInputFocused()) {
                this.togglePanel();
            }
        });
        
        // 点击外部关闭
        document.addEventListener('click', (e) => {
            const panel = document.querySelector('.keyboard-hint-panel');
            const btn = document.querySelector('.keyboard-hint-btn');
            
            if (panel?.classList.contains('visible') && 
                !panel.contains(e.target) && 
                !btn?.contains(e.target)) {
                this.hidePanel();
            }
        });
    }
    
    isInputFocused() {
        const active = document.activeElement;
        return active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable;
    }
    
    togglePanel() {
        const panel = document.querySelector('.keyboard-hint-panel');
        panel?.classList.toggle('visible');
    }
    
    hidePanel() {
        const panel = document.querySelector('.keyboard-hint-panel');
        panel?.classList.remove('visible');
    }
}

// 初始化
new KeyboardHints();
