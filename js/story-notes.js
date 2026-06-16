/**
 * 故事笔记功能
 * 用户可以为故事添加个人笔记
 */

class StoryNotes {
    constructor() {
        this.storageKey = 'mysticStar_notes';
        this.notes = this.loadNotes();
        
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    loadNotes() {
        try {
            const stored = localStorage.getItem(this.storageKey)
                || localStorage.getItem('mystic-star-tales-notes')
                || localStorage.getItem('mystic-notes');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }
    
    saveNotes() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
        } catch (e) {}
    }
    
    setup() {
        this.addNoteButton();
        this.addStyles();
    }
    
    addNoteButton() {
        const checkModal = setInterval(() => {
            const modalText = document.querySelector('.modal-text');
            if (modalText && !modalText.querySelector('.note-btn')) {
                clearInterval(checkModal);
                
                const btn = document.createElement('button');
                btn.className = 'note-btn';
                btn.setAttribute('aria-label', '添加笔记');
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                `;
                
                modalText.appendChild(btn);
                
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showNoteEditor();
                });
                
                this.observeModal(btn);
            }
        }, 500);
    }
    
    observeModal(btn) {
        const modalOverlay = document.getElementById('modal-overlay');
        if (!modalOverlay) return;
        
        const observer = new MutationObserver(() => {
            const storyId = window.modalManager?.currentData?.id;
            if (storyId && this.notes[storyId]) {
                btn.classList.add('has-note');
            } else {
                btn.classList.remove('has-note');
            }
        });
        
        observer.observe(modalOverlay, { attributes: true, attributeFilter: ['class'] });
    }
    
    showNoteEditor() {
        const storyId = window.modalManager?.currentData?.id;
        const storyTitle = window.modalManager?.currentData?.title;
        if (!storyId) return;
        
        const currentNote = this.notes[storyId] || '';
        const safeTitle = this.escapeHtml(storyTitle || '');
        const safeNote = this.escapeHtml(currentNote);
        
        const editor = document.createElement('div');
        editor.className = 'note-editor';
        editor.innerHTML = `
            <div class="note-content">
                <div class="note-header">
                    <span>我的笔记 - ${safeTitle}</span>
                    <button class="note-close">&times;</button>
                </div>
                <textarea class="note-textarea" placeholder="在这里记录你的想法...">${safeNote}</textarea>
                <div class="note-actions">
                    <button class="note-save">保存</button>
                    <button class="note-clear">清除</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(editor);
        
        const textarea = editor.querySelector('.note-textarea');
        const saveBtn = editor.querySelector('.note-save');
        const clearBtn = editor.querySelector('.note-clear');
        const closeBtn = editor.querySelector('.note-close');
        
        saveBtn.addEventListener('click', () => {
            const text = textarea.value.trim();
            if (text) {
                this.notes[storyId] = text;
            } else {
                delete this.notes[storyId];
            }
            this.saveNotes();
            this.showToast('笔记已保存');
            editor.remove();
        });
        
        clearBtn.addEventListener('click', () => {
            textarea.value = '';
            delete this.notes[storyId];
            this.saveNotes();
        });
        
        closeBtn.addEventListener('click', () => editor.remove());
        editor.addEventListener('click', (e) => {
            if (e.target === editor) editor.remove();
        });
        
        setTimeout(() => editor.classList.add('visible'), 10);
        textarea.focus();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(26, 36, 56, 0.95);
            color: #f0f4f8;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 10002;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .note-btn {
                position: absolute;
                bottom: 24px;
                right: 24px;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: linear-gradient(135deg, rgba(201, 214, 227, 0.15), rgba(201, 214, 227, 0.05));
                backdrop-filter: blur(8px);
                border: 1px solid rgba(201, 214, 227, 0.2);
                color: #c9d6e3;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 10;
            }
            
            .note-btn:hover {
                transform: translateY(-4px) scale(1.05);
                box-shadow: 0 10px 25px rgba(201, 214, 227, 0.2);
                background: linear-gradient(135deg, rgba(201, 214, 227, 0.25), rgba(201, 214, 227, 0.1));
            }
            
            .note-btn.has-note {
                color: #d4af37;
                border-color: rgba(212, 175, 55, 0.4);
            }
            
            .note-editor {
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
            
            .note-editor.visible { opacity: 1; }
            
            .note-content {
                background: rgba(26, 36, 56, 0.95);
                border: 1px solid rgba(201, 214, 227, 0.2);
                border-radius: 16px;
                padding: 20px;
                width: 90%;
                max-width: 500px;
            }
            
            .note-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                color: #f0f4f8;
                font-size: 0.95rem;
            }
            
            .note-close {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: transparent;
                border: none;
                color: #8a9ab0;
                cursor: pointer;
                font-size: 1.2rem;
            }
            
            .note-textarea {
                width: 100%;
                height: 200px;
                padding: 12px;
                background: rgba(10, 15, 26, 0.6);
                border: 1px solid rgba(201, 214, 227, 0.2);
                border-radius: 8px;
                color: #f0f4f8;
                font-size: 0.9rem;
                line-height: 1.6;
                resize: vertical;
                outline: none;
            }
            
            .note-textarea::placeholder {
                color: #6b7a8f;
            }
            
            .note-textarea:focus {
                border-color: rgba(212, 175, 55, 0.4);
            }
            
            .note-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 16px;
            }
            
            .note-save, .note-clear {
                padding: 8px 20px;
                border-radius: 6px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .note-save {
                background: rgba(212, 175, 55, 0.2);
                border: 1px solid rgba(212, 175, 55, 0.4);
                color: #d4af37;
            }
            
            .note-clear {
                background: transparent;
                border: 1px solid rgba(201, 214, 227, 0.2);
                color: #8a9ab0;
            }
        `;
        document.head.appendChild(style);
    }
}

// 初始化
window.storyNotes = window.storyNotes || new StoryNotes();
