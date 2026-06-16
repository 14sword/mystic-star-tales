/**
 * Optimized Starfield Background
 * 优化后的星轨背景效果 - 使用 requestAnimationFrame 和性能优化
 */

class Starfield {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.trails = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // 性能优化参数
        this.isActive = true;
        this.frameCount = 0;
        this.skipFrames = 0; // 跳帧计数
        this.targetFPS = 60;
        this.lastTime = 0;
        this.animationId = null;
        
        // 检测用户偏好
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        
        // 根据设备调整质量
        this.quality = this.isTouchDevice ? 'low' : 'high';
        
        this.init();
    }
    
    init() {
        this.resize();
        
        // 使用 ResizeObserver 替代 resize 事件
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    this.resize();
                }
            });
            this.resizeObserver.observe(this.canvas);
        } else {
            // 降级处理：使用节流后的 resize 事件
            this.throttledResize = this.throttle(() => this.resize(), 200);
            window.addEventListener('resize', this.throttledResize, { passive: true });
        }
        
        // 页面可见性管理
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // 监听动画偏好变化
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleMotionChange = (e) => {
            this.prefersReducedMotion = e.matches;
            if (this.prefersReducedMotion) {
                this.pause();
                this.drawStaticFrame();
            } else {
                this.resume();
            }
        };
        if (motionQuery.addEventListener) {
            motionQuery.addEventListener('change', handleMotionChange);
        } else if (motionQuery.addListener) {
            motionQuery.addListener(handleMotionChange);
        }
        
        if (!this.prefersReducedMotion) {
            this.animate();
        } else {
            this.drawStaticFrame();
        }
    }
    
    resize() {
        // 使用 devicePixelRatio 优化高清屏幕显示
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        // 重新创建星星和星轨
        this.stars = [];
        this.trails = [];
        this.createStars();
        this.createTrails();

        if (this.prefersReducedMotion) {
            this.drawStaticFrame();
        }
    }
    
    createStars() {
        // 根据质量设置星星数量
        const density = this.quality === 'high' ? 6000 : 12000;
        const starCount = Math.floor((this.width * this.height) / density);
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    createTrails() {
        // 根据质量设置星轨数量
        const trailDensity = this.quality === 'high' ? 150 : 300;
        const trailCount = Math.floor(this.width / trailDensity);
        
        for (let i = 0; i < trailCount; i++) {
            this.trails.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                length: Math.random() * 100 + 50,
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.3 + 0.1,
                width: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.15 + 0.05
            });
        }
    }
    
    drawStars() {
        const bins = [[], [], [], [], []];
        const glowBin = [];
        
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            
            star.twinklePhase += star.twinkleSpeed;
            const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
            const currentOpacity = star.opacity * twinkle;
            
            let binIdx = Math.floor(currentOpacity * 5);
            if (binIdx < 0) binIdx = 0;
            if (binIdx > 4) binIdx = 4;
            
            bins[binIdx].push({
                x: star.x,
                y: star.y,
                size: star.size
            });
            
            if (star.size > 1 && this.quality === 'high') {
                glowBin.push({
                    x: star.x,
                    y: star.y,
                    size: star.size * 2,
                    opacity: currentOpacity * 0.2
                });
            }
        }
        
        const opacities = [0.15, 0.35, 0.55, 0.75, 0.95];
        for (let j = 0; j < 5; j++) {
            const list = bins[j];
            if (list.length === 0) continue;
            
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacities[j]})`;
            
            for (let i = 0; i < list.length; i++) {
                const star = list[i];
                this.ctx.moveTo(star.x + star.size, star.y);
                this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            }
            this.ctx.fill();
        }
        
        if (glowBin.length > 0) {
            const glowBins = [[], [], []];
            for (let i = 0; i < glowBin.length; i++) {
                const glow = glowBin[i];
                let gBinIdx = Math.floor(glow.opacity * 15);
                if (gBinIdx < 0) gBinIdx = 0;
                if (gBinIdx > 2) gBinIdx = 2;
                glowBins[gBinIdx].push(glow);
            }
            
            const glowOpacities = [0.04, 0.1, 0.16];
            for (let j = 0; j < 3; j++) {
                const list = glowBins[j];
                if (list.length === 0) continue;
                
                this.ctx.beginPath();
                this.ctx.fillStyle = `rgba(200, 220, 255, ${glowOpacities[j]})`;
                
                for (let i = 0; i < list.length; i++) {
                    const glow = list[i];
                    this.ctx.moveTo(glow.x + glow.size, glow.y);
                    this.ctx.arc(glow.x, glow.y, glow.size, 0, Math.PI * 2);
                }
                this.ctx.fill();
            }
        }
    }
    
    drawTrails() {
        for (let i = 0; i < this.trails.length; i++) {
            const trail = this.trails[i];
            
            // 更新位置
            trail.x += Math.cos(trail.angle) * trail.speed;
            trail.y += Math.sin(trail.angle) * trail.speed;
            
            // 边界处理
            if (trail.x < -trail.length) trail.x = this.width + trail.length;
            if (trail.x > this.width + trail.length) trail.x = -trail.length;
            if (trail.y < -trail.length) trail.y = this.height + trail.length;
            if (trail.y > this.height + trail.length) trail.y = -trail.length;
            
            // 绘制星轨
            const endX = trail.x - Math.cos(trail.angle) * trail.length;
            const endY = trail.y - Math.sin(trail.angle) * trail.length;
            
            const gradient = this.ctx.createLinearGradient(trail.x, trail.y, endX, endY);
            gradient.addColorStop(0, `rgba(200, 220, 255, ${trail.opacity.toFixed(3)})`);
            gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
            
            this.ctx.beginPath();
            this.ctx.moveTo(trail.x, trail.y);
            this.ctx.lineTo(endX, endY);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = trail.width;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }
    }
    
    animate(currentTime = 0) {
        if (!this.isActive) return;
        
        // 计算帧率并动态调整
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 如果帧率过低，增加跳帧
        if (deltaTime > 20) { // 低于 50fps
            this.skipFrames = Math.min(this.skipFrames + 1, 2);
        } else if (deltaTime < 17 && this.skipFrames > 0) {
            this.skipFrames--;
        }
        
        this.frameCount++;
        
        // 跳帧逻辑
        if (this.skipFrames > 0 && this.frameCount % (this.skipFrames + 1) !== 0) {
            this.animationId = requestAnimationFrame((time) => this.animate(time));
            return;
        }
        
        // 使用 willReadFrequently 优化（如果支持）
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawTrails();
        this.drawStars();
        
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
    
    drawStaticFrame() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制静态星星（无闪烁）
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity.toFixed(3)})`;
            this.ctx.fill();
        }
    }
    
    pause() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    resume() {
        if (!this.isActive && !this.prefersReducedMotion) {
            this.isActive = true;
            this.lastTime = performance.now();
            this.animate();
        }
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    destroy() {
        this.pause();
        
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        if (this.throttledResize) {
            window.removeEventListener('resize', this.throttledResize);
        }
    }
}

// 页面加载完成后初始化；支持动态延迟加载。
function initStarfield() {
    if (!window.starfield) {
        window.starfield = new Starfield('starfield');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStarfield, { once: true });
} else {
    initStarfield();
}
