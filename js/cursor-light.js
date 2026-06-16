/**
 * 鼠标跟随光效
 * 鼠标移动时产生微妙的光点跟随效果
 */

class CursorLight {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mouse = { x: -100, y: -100 };
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.isActive = false;
        this.inactivityTimeout = null;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.bindEvents();
    }
    
    startAnimation() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.animate();
        }
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'cursor-light-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: screen;
        `;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    
    bindEvents() {
        // 鼠标移动
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.isActive = true;
            
            // 添加新粒子
            this.addParticles(2);
            
            // 重置不活跃计时器
            clearTimeout(this.inactivityTimeout);
            this.inactivityTimeout = setTimeout(() => {
                this.isActive = false;
            }, 100);
        });
        
        // 触摸设备支持
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
                this.isActive = true;
                this.addParticles(1);
            }
        }, { passive: true });
        
        // 窗口调整
        window.addEventListener('resize', () => this.resize());
        
        // 鼠标离开窗口
        document.addEventListener('mouseleave', () => {
            this.isActive = false;
        });
    }
    
    addParticles(count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 20;
            
            this.particles.push({
                x: this.mouse.x + Math.cos(angle) * distance,
                y: this.mouse.y + Math.sin(angle) * distance,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.6 + 0.4,
                decay: Math.random() * 0.015 + 0.008,
                color: this.getRandomColor()
            });
        }
        
        // 限制粒子数量上限
        if (this.particles.length > 40) {
            this.particles.splice(0, this.particles.length - 40);
        }
        
        this.startAnimation();
    }
    
    getRandomColor() {
        const colors = [
            { r: 255, g: 255, b: 255 },   // 白色
            { r: 200, g: 220, b: 255 },   // 淡蓝
            { r: 255, g: 230, b: 180 },   // 淡金
            { r: 180, g: 220, b: 255 },   // 天蓝
            { r: 255, g: 250, b: 230 }    // 暖白
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    drawParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // 更新位置
            p.x += p.vx;
            p.y += p.vy;
            p.opacity -= p.decay;
            p.size *= 0.985;
            
            // 移除消失的粒子
            if (p.opacity <= 0 || p.size < 0.3) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // 绘制粒子
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
            this.ctx.fill();
            
            // 光晕效果
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity * 0.3})`;
            this.ctx.fill();
        }
    }
    
    drawCursorGlow() {
        if (!this.isActive) return;
        
        // 主光标光晕
        const gradient = this.ctx.createRadialGradient(
            this.mouse.x, this.mouse.y, 0,
            this.mouse.x, this.mouse.y, 60
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        gradient.addColorStop(0.3, 'rgba(200, 220, 255, 0.08)');
        gradient.addColorStop(0.7, 'rgba(200, 220, 255, 0.03)');
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
            this.mouse.x - 60,
            this.mouse.y - 60,
            120,
            120
        );
        
        // 内部亮点
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.x, this.mouse.y, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.x, this.mouse.y, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fill();
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawCursorGlow();
        this.drawParticles();
        
        if (!this.isActive && this.particles.length === 0) {
            this.isAnimating = false;
            return; // 自动休眠
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// 页面加载完成后初始化；支持动态延迟加载。
function initCursorLight() {
    if (!window.cursorLight) {
        window.cursorLight = new CursorLight();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursorLight, { once: true });
} else {
    initCursorLight();
}
