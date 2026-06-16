/**
 * 音效系统
 * 使用 Web Audio API 生成音效，无需外部文件
 */

class AudioSystem {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.3;
        this.init();
    }

    init() {
        // 延迟初始化 AudioContext，等待用户交互
        this.setupUserInteraction();
    }

    setupUserInteraction() {
        const events = ['click', 'touchstart', 'keydown'];
        const initAudio = () => {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            events.forEach(e => document.removeEventListener(e, initAudio));
        };
        events.forEach(e => document.addEventListener(e, initAudio, { once: true }));
    }

    ensureContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * 播放卡片悬停音效 - 微妙的空灵音
     */
    playHoverSound() {
        if (!this.enabled) return;
        this.ensureContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // 使用正弦波创造柔和的声音
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + 0.1);

        // 低通滤波器让声音更柔和
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, this.ctx.currentTime);
        filter.Q.value = 1;

        // 音量包络 - 快速淡入淡出
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.15, this.ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.15);
    }

    /**
     * 播放打开模态框音效 - 魔法开启感
     */
    playOpenSound() {
        if (!this.enabled) return;
        this.ensureContext();

        const now = this.ctx.currentTime;

        // 创建和弦效果
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (C大调和弦)

        frequencies.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = index === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.4);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3000, now);
            filter.frequency.linearRampToValueAtTime(1000, now + 0.4);

            const delay = index * 0.03;
            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + delay + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 0.5);
        });

        // 添加一点"闪烁"效果
        const sparkle = this.ctx.createOscillator();
        const sparkleGain = this.ctx.createGain();
        sparkle.type = 'sine';
        sparkle.frequency.setValueAtTime(2000, now);
        sparkle.frequency.exponentialRampToValueAtTime(4000, now + 0.3);
        sparkleGain.gain.setValueAtTime(0, now);
        sparkleGain.gain.linearRampToValueAtTime(this.volume * 0.1, now + 0.1);
        sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        sparkle.connect(sparkleGain);
        sparkleGain.connect(this.ctx.destination);
        sparkle.start(now);
        sparkle.stop(now + 0.4);
    }

    /**
     * 播放关闭模态框音效 - 轻柔的消退感
     */
    playCloseSound() {
        if (!this.enabled) return;
        this.ensureContext();

        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.25); // 下降到 A4

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.linearRampToValueAtTime(500, now + 0.25);

        gain.gain.setValueAtTime(this.volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    /**
     * 播放导航音效 - 键盘切换卡片时
     */
    playNavigateSound() {
        if (!this.enabled) return;
        this.ensureContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, this.ctx.currentTime); // E5
        osc.frequency.linearRampToValueAtTime(880, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.12, this.ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.1);
    }

    /**
     * 播放确认音效 - 按下 Enter 时
     */
    playConfirmSound() {
        if (!this.enabled) return;
        this.ensureContext();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    /**
     * 设置音量
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
    }

    /**
     * 启用/禁用音效
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * 播放普通点击音效
     */
    playClick() {
        if (!this.enabled) return;
        this.ensureContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.1, this.ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.08);
    }
}

// 创建全局音效实例
window.audioSystem = new AudioSystem();
