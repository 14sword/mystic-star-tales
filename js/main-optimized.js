/**
 * Optimized Main Entry
 * 优化后的主入口文件 - 性能优化和兼容性处理
 */

const MYSTIC_DEBUG = (() => {
    try {
        return localStorage.getItem('mysticStar_debug') === 'true';
    } catch (e) {
        return false;
    }
})();

// 平滑滚动
class SmoothScroll {
    static init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                    target.scrollIntoView({
                        behavior: prefersReducedMotion ? 'auto' : 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// 性能优化：防抖函数
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// 性能优化：节流函数
function throttle(func, limit) {
    let inThrottle;
    let lastFunc;
    let lastRan;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            lastRan = Date.now();
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
                if (lastFunc) {
                    lastFunc.apply(context, args);
                    lastFunc = null;
                }
            }, limit);
        } else {
            lastFunc = func;
        }
    };
}

// 视差效果（优化版）
class ParallaxEffect {
    constructor() {
        this.elements = document.querySelectorAll('.parallax');
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        this.ticking = false;
        
        this.init();
    }
    
    init() {
        if (this.elements.length === 0 || this.prefersReducedMotion || this.isTouchDevice) return;
        
        const handleScroll = () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.updatePositions();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    updatePositions() {
        const scrolled = window.pageYOffset;
        
        this.elements.forEach(el => {
            const speed = parseFloat(el.dataset.speed) || 0.5;
            const yPos = -(scrolled * speed);
            // 使用 transform3d 启用 GPU 加速
            el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }
}

// 页面可见性管理（性能优化）
class VisibilityManager {
    constructor() {
        this.callbacks = new Map();
        this.init();
    }
    
    init() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 页面不可见时暂停动画
                document.body.classList.add('page-hidden');
                this.trigger('hidden');
            } else {
                // 页面可见时恢复动画
                document.body.classList.remove('page-hidden');
                this.trigger('visible');
            }
        });
    }
    
    on(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.callbacks.has(event)) {
            const callbacks = this.callbacks.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    trigger(event) {
        if (this.callbacks.has(event)) {
            this.callbacks.get(event).forEach(callback => callback());
        }
    }
}

// 触摸设备检测和优化（避免与独立 touch-optimizer.js 顶层类重名）
class MainTouchOptimizer {
    constructor() {
        this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        this.init();
    }
    
    init() {
        if (this.isTouchDevice) {
            document.body.classList.add('touch-device');
            this.optimizeForTouch();
        } else {
            document.body.classList.add('mouse-device');
        }
    }
    
    optimizeForTouch() {
        // 禁用悬停效果相关的样式
        const style = document.createElement('style');
        style.textContent = `
            .touch-device .mystic-card:hover {
                transform: none !important;
            }
            .touch-device .card-hint {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// 错误处理
class ErrorHandler {
    static init() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            // 可以在这里添加错误上报逻辑
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            // 可以在这里添加错误上报逻辑
        });
    }
}

// 性能监控
class PerformanceMonitor {
    static init() {
        if (!MYSTIC_DEBUG) return;

        // 检测长任务
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            console.warn('Long task detected:', entry.duration, 'ms');
                        }
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // 浏览器不支持 longtask
            }
        }
        
        // 测量关键性能指标
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const domReadyTime = perfData.domComplete - perfData.domLoading;
                
                console.log('Page load time:', pageLoadTime, 'ms');
                console.log('DOM ready time:', domReadyTime, 'ms');
            }, 0);
        });
    }
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    // 初始化平滑滚动
    SmoothScroll.init();
    
    // 初始化视差效果
    new ParallaxEffect();
    
    // 初始化页面可见性管理
    window.visibilityManager = new VisibilityManager();
    
    // 初始化触摸优化
    new MainTouchOptimizer();
    
    // 初始化错误处理
    ErrorHandler.init();
    
    // 初始化性能监控（仅调试模式）
    PerformanceMonitor.init();
    
    // 添加页面加载完成标记
    document.body.classList.add('page-loaded');
    
    if (MYSTIC_DEBUG) {
        console.log('✦ Mystic Star Tales 优化版初始化完成');
    }
});

// 导出全局工具函数
window.MysticUtils = {
    debounce,
    throttle,
    SmoothScroll,
    ParallaxEffect,
    VisibilityManager,
    MainTouchOptimizer,
    ErrorHandler,
    PerformanceMonitor
};
