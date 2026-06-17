/**
 * 鼠标特效系统
 * 粒子拖尾效果和点击涟漪效果
 */

class MouseEffects {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.ripples = [];
        this.mouse = { x: 0, y: 0, lastX: 0, lastY: 0 };
        this.isMoving = false;
        this.moveTimeout = null;
        this.animationId = null;
        this.enabled = true;
        this.isAnimating = false;

        this.init();
    }

    init() {
        this.createCanvas();
        this.bindEvents();
    }

    startAnimation() {
        if (!this.isAnimating && this.enabled) {
            this.isAnimating = true;
            this.animate();
        }
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'mouse-effects-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        // 鼠标移动 - 不再生成粒子以优化性能
        document.addEventListener('mousemove', (e) => {
            if (!this.enabled) return;

            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.isMoving = true;

            // 清除移动停止检测
            clearTimeout(this.moveTimeout);
            this.moveTimeout = setTimeout(() => {
                this.isMoving = false;
            }, 100);
        });

        // 鼠标点击 - 涟漪效果
        document.addEventListener('click', (e) => {
            if (!this.enabled) return;
            this.spawnRipple(e.clientX, e.clientY);
        });

        // 触摸设备支持 - 移动不再生成粒子以优化性能
        document.addEventListener('touchmove', (e) => {
            if (!this.enabled) return;
            const touch = e.touches[0];
            this.mouse.x = touch.clientX;
            this.mouse.y = touch.clientY;
        }, { passive: true });

        document.addEventListener('touchstart', (e) => {
            if (!this.enabled) return;
            const touch = e.touches[0];
            this.spawnRipple(touch.clientX, touch.clientY);
        }, { passive: true });
    }

    /**
     * 生成粒子
     */
    spawnParticles(x, y, count = 1) {
        const colors = [
            'rgba(201, 214, 227, 0.8)',  // 银色
            'rgba(180, 200, 220, 0.6)',
            'rgba(160, 180, 200, 0.5)',
            'rgba(255, 215, 140, 0.4)',  // 金色微光
        ];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.4 + 0.1;
            const size = Math.random() * 1.5 + 0.5;

            this.particles.push({
                x: x + (Math.random() - 0.5) * 5,
                y: y + (Math.random() - 0.5) * 5,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1,
                decay: Math.random() * 0.04 + 0.03, // Decays much faster
                glow: Math.random() * 5 + 2
            });
        }

        // 限制粒子上限
        if (this.particles.length > 30) {
            this.particles.splice(0, this.particles.length - 30);
        }

        this.startAnimation();
    }

    /**
     * 生成涟漪
     */
    spawnRipple(x, y) {
        this.ripples.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 100,
            alpha: 0.6,
            lineWidth: 2,
            speed: 3
        });

        // 添加第二层涟漪
        setTimeout(() => {
            if (!this.enabled) return;
            this.ripples.push({
                x: x,
                y: y,
                radius: 0,
                maxRadius: 80,
                alpha: 0.4,
                lineWidth: 1.5,
                speed: 2.5
            });
            this.startAnimation();
        }, 100);

        this.startAnimation();
    }

    /**
     * 更新粒子
     */
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.size *= 0.98;

            if (p.life <= 0 || p.size < 0.1) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * 更新涟漪
     */
    updateRipples() {
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];

            r.radius += r.speed;
            r.alpha -= 0.015;
            r.lineWidth *= 0.98;

            if (r.alpha <= 0 || r.radius >= r.maxRadius) {
                this.ripples.splice(i, 1);
            }
        }
    }

    /**
     * 绘制粒子 (禁用 shadowBlur, 提升性能)
     */
    drawParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // 绘制外圈光晕
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life * 0.25;
            this.ctx.fill();

            // 绘制核心亮区
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.globalAlpha = p.life;
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * 绘制涟漪 (移除 save/restore)
     */
    drawRipples() {
        this.ripples.forEach(r => {
            this.ctx.globalAlpha = r.alpha;

            // 外圈
            this.ctx.strokeStyle = 'rgba(201, 214, 227, 0.8)';
            this.ctx.lineWidth = r.lineWidth;
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            this.ctx.stroke();

            // 内圈（更亮）
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.lineWidth = r.lineWidth * 0.5;
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, r.radius * 0.7, 0, Math.PI * 2);
            this.ctx.stroke();
        });
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * 动画循环 (空闲自动休眠)
     */
    animate() {
        if (!this.enabled) {
            this.isAnimating = false;
            this.animationId = null;
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.updateParticles();
        this.updateRipples();
        this.drawParticles();
        this.drawRipples();

        if (this.particles.length === 0 && this.ripples.length === 0) {
            this.isAnimating = false;
            this.animationId = null;
            return; // 队列清空，自动休眠
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * 启用/禁用效果
     */
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.particles = [];
            this.ripples = [];
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            this.isAnimating = false;
            if (this.canvas) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        } else {
            this.startAnimation();
        }
        return this.enabled;
    }

    /**
     * 销毁
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isAnimating = false;
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// 页面加载完成后初始化；支持动态延迟加载。
function initMouseEffects() {
    if (!window.mouseEffects) {
        window.mouseEffects = new MouseEffects();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMouseEffects, { once: true });
} else {
    initMouseEffects();
}
