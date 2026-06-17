/**
 * 故事评分系统
 * Story Rating System
 * 支持五星评分和评论功能
 */

class StoryRating {
    constructor() {
        this.ratings = {};
        this.comments = {};
        this.userRating = {};
        this.init();
    }

    init() {
        this.loadData();
        this.addStyles();
        this.bindModalEvents();
    }

    loadData() {
        const savedRatings = localStorage.getItem('mysticStar_ratings');
        const savedComments = localStorage.getItem('mysticStar_comments');
        const savedUserRating = localStorage.getItem('mysticStar_userRating');

        if (savedRatings) this.ratings = JSON.parse(savedRatings);
        if (savedComments) this.comments = JSON.parse(savedComments);
        if (savedUserRating) this.userRating = JSON.parse(savedUserRating);
    }

    saveData() {
        localStorage.setItem('mysticStar_ratings', JSON.stringify(this.ratings));
        localStorage.setItem('mysticStar_comments', JSON.stringify(this.comments));
        localStorage.setItem('mysticStar_userRating', JSON.stringify(this.userRating));
    }

    addStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .rating-section {
                padding: 20px;
                background: rgba(255,255,255,0.05);
                border-radius: 15px;
                margin: 20px 0;
            }

            .rating-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .rating-title {
                font-size: 1.2em;
                color: #ffd700;
            }

            .rating-stats {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .rating-average {
                font-size: 2em;
                font-weight: bold;
                color: #ffd700;
            }

            .rating-count {
                font-size: 0.9em;
                color: rgba(255,255,255,0.6);
            }

            .star-rating {
                display: flex;
                gap: 5px;
                font-size: 1.5em;
            }

            .star {
                cursor: pointer;
                color: rgba(255,255,255,0.3);
                transition: all 0.2s ease;
            }

            .star:hover,
            .star.active {
                color: #ffd700;
                text-shadow: 0 0 10px rgba(255,215,0,0.5);
            }

            .star-rating-input {
                display: flex;
                gap: 8px;
                font-size: 2em;
                margin: 15px 0;
            }

            .star-rating-input .star {
                cursor: pointer;
                transition: transform 0.2s ease;
            }

            .star-rating-input .star:hover {
                transform: scale(1.2);
            }

            .rating-labels {
                display: flex;
                justify-content: space-between;
                font-size: 0.85em;
                color: rgba(255,255,255,0.6);
                margin-top: 5px;
            }

            .comment-section {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid rgba(255,255,255,0.1);
            }

            .comment-input-area {
                margin-bottom: 20px;
            }

            .comment-textarea {
                width: 100%;
                min-height: 100px;
                padding: 15px;
                background: rgba(0,0,0,0.2);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 10px;
                color: #fff;
                font-size: 1em;
                resize: vertical;
                transition: all 0.3s ease;
            }

            .comment-textarea:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
            }

            .comment-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 10px;
            }

            .btn-submit-comment {
                padding: 10px 25px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 25px;
                color: #fff;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .btn-submit-comment:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
            }

            .comments-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .comment-item {
                padding: 15px;
                background: rgba(0,0,0,0.2);
                border-radius: 10px;
                border-left: 3px solid #667eea;
            }

            .comment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .comment-author {
                font-weight: bold;
                color: #ffd700;
            }

            .comment-date {
                font-size: 0.8em;
                color: rgba(255,255,255,0.5);
            }

            .comment-rating {
                color: #ffd700;
                margin-bottom: 8px;
            }

            .comment-text {
                color: rgba(255,255,255,0.9);
                line-height: 1.6;
            }

            .rating-distribution {
                margin: 20px 0;
            }

            .rating-bar {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 8px 0;
            }

            .rating-bar-label {
                min-width: 60px;
                color: rgba(255,255,255,0.7);
            }

            .rating-bar-track {
                flex: 1;
                height: 8px;
                background: rgba(255,255,255,0.1);
                border-radius: 4px;
                overflow: hidden;
            }

            .rating-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #ffd700 0%, #ff8c00 100%);
                border-radius: 4px;
                transition: width 0.5s ease;
            }

            .rating-bar-count {
                min-width: 40px;
                text-align: right;
                color: rgba(255,255,255,0.6);
                font-size: 0.9em;
            }

            .user-rating-display {
                padding: 15px;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
                border-radius: 10px;
                margin-bottom: 20px;
            }

            .user-rating-display h4 {
                margin-bottom: 10px;
                color: #fff;
            }

            .rating-hint {
                font-size: 0.9em;
                color: rgba(255,255,255,0.6);
                margin-top: 10px;
                text-align: center;
            }
        `;
        document.head.appendChild(styles);
    }

    createRatingUI(storyId) {
        const container = document.createElement('div');
        container.className = 'rating-section';
        container.id = `rating-section-${storyId}`;

        const avgRating = this.getAverageRating(storyId);
        const totalRatings = this.getTotalRatings(storyId);
        const userRating = this.userRating[storyId] || 0;
        const distribution = this.getRatingDistribution(storyId);

        container.innerHTML = `
            <div class="rating-header">
                <h3 class="rating-title">⭐ 评分与评论</h3>
                <div class="rating-stats">
                    <span class="rating-average">${avgRating.toFixed(1)}</span>
                    <div>
                        <div class="star-rating">${this.renderStars(Math.round(avgRating))}</div>
                        <span class="rating-count">${totalRatings} 人评分</span>
                    </div>
                </div>
            </div>

            <div class="rating-distribution">
                ${[5, 4, 3, 2, 1].map(star => `
                    <div class="rating-bar">
                        <span class="rating-bar-label">${star} 星</span>
                        <div class="rating-bar-track">
                            <div class="rating-bar-fill" style="width: ${distribution[star]}%"></div>
                        </div>
                        <span class="rating-bar-count">${distribution.counts[star]}</span>
                    </div>
                `).join('')}
            </div>

            ${userRating > 0 ? `
                <div class="user-rating-display">
                    <h4>你的评分</h4>
                    <div class="star-rating">${this.renderStars(userRating)}</div>
                    <button class="btn-secondary" onclick="storyRating.editRating('${storyId}')">修改评分</button>
                </div>
            ` : `
                <div class="rating-input-area">
                    <p class="rating-hint">点击星星为这个故事评分</p>
                    <div class="star-rating-input" id="rating-input-${storyId}">
                        ${[1, 2, 3, 4, 5].map(star => `
                            <span class="star" data-rating="${star}" onclick="storyRating.submitRating('${storyId}', ${star})">★</span>
                        `).join('')}
                    </div>
                    <div class="rating-labels">
                        <span>很差</span>
                        <span>一般</span>
                        <span>很好</span>
                        <span>非常好</span>
                        <span>完美</span>
                    </div>
                </div>
            `}

            <div class="comment-section">
                <h4>💬 发表评论</h4>
                <div class="comment-input-area">
                    <textarea class="comment-textarea" id="comment-input-${storyId}" 
                        placeholder="分享你对这个故事的想法..."></textarea>
                    <div class="comment-actions">
                        <button class="btn-submit-comment" onclick="storyRating.submitComment('${storyId}')">
                            发表评论
                        </button>
                    </div>
                </div>

                <div class="comments-list" id="comments-list-${storyId}">
                    ${this.renderComments(storyId)}
                </div>
            </div>
        `;

        // 添加悬停效果
        setTimeout(() => {
            const starContainer = container.querySelector('.star-rating-input');
            if (starContainer) {
                const stars = starContainer.querySelectorAll('.star');
                stars.forEach((star, index) => {
                    star.addEventListener('mouseenter', () => {
                        stars.forEach((s, i) => {
                            s.classList.toggle('active', i <= index);
                        });
                    });
                });
                starContainer.addEventListener('mouseleave', () => {
                    stars.forEach(s => s.classList.remove('active'));
                });
            }
        }, 0);

        return container;
    }

    renderStars(rating) {
        return Array(5).fill(0).map((_, i) => 
            `<span class="star ${i < rating ? 'active' : ''}">★</span>`
        ).join('');
    }

    renderComments(storyId) {
        const comments = this.comments[storyId] || [];
        if (comments.length === 0) {
            return '<p style="text-align: center; color: rgba(255,255,255,0.5);">暂无评论，来发表第一条评论吧！</p>';
        }

        return comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${this.formatDate(comment.date)}</span>
                </div>
                <div class="comment-rating">${this.renderStars(comment.rating)}</div>
                <p class="comment-text">${this.escapeHtml(comment.text)}</p>
            </div>
        `).reverse().join('');
    }

    submitRating(storyId, rating) {
        // 保存用户评分
        this.userRating[storyId] = rating;

        // 更新总体评分
        if (!this.ratings[storyId]) {
            this.ratings[storyId] = { total: 0, count: 0, sum: 0, counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
        }
        if (!this.ratings[storyId].counts) {
            this.ratings[storyId].counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        }

        // 如果用户之前评过分，先减去旧评分
        const oldRating = this.userRating[storyId + '_old'];
        if (oldRating) {
            this.ratings[storyId].sum -= oldRating;
            if (this.ratings[storyId].counts[oldRating] > 0) {
                 this.ratings[storyId].counts[oldRating]--;
            }
        } else {
            this.ratings[storyId].count++;
        }

        this.ratings[storyId].sum += rating;
        this.ratings[storyId].counts[rating] = (this.ratings[storyId].counts[rating] || 0) + 1;
        this.ratings[storyId].total = this.ratings[storyId].sum / this.ratings[storyId].count;
        this.userRating[storyId + '_old'] = rating;

        this.saveData();

        // 更新UI
        this.updateRatingUI(storyId);

        // 显示提示
        this.showToast(`评分成功！你给了 ${rating} 星`, 'success');

        // 触发事件
        window.dispatchEvent(new CustomEvent('storyRated', { 
            detail: { storyId, rating } 
        }));
    }

    submitComment(storyId) {
        const textarea = document.getElementById(`comment-input-${storyId}`);
        const text = textarea.value.trim();

        if (!text) {
            this.showToast('请输入评论内容', 'warning');
            return;
        }

        const userRating = this.userRating[storyId] || 0;
        if (userRating === 0) {
            this.showToast('请先评分再发表评论', 'warning');
            return;
        }

        if (!this.comments[storyId]) {
            this.comments[storyId] = [];
        }

        const comment = {
            author: '我',
            text: text,
            rating: userRating,
            date: new Date().toISOString()
        };

        this.comments[storyId].push(comment);
        this.saveData();

        // 清空输入框
        textarea.value = '';

        // 更新评论列表
        const commentsList = document.getElementById(`comments-list-${storyId}`);
        if (commentsList) {
            commentsList.innerHTML = this.renderComments(storyId);
        }

        this.showToast('评论发表成功！', 'success');
    }

    editRating(storyId) {
        // 移除用户评分显示，显示评分输入
        const userRatingDisplay = document.querySelector(`#rating-section-${storyId} .user-rating-display`);
        if (userRatingDisplay) {
            userRatingDisplay.outerHTML = `
                <div class="rating-input-area">
                    <p class="rating-hint">点击星星修改你的评分</p>
                    <div class="star-rating-input" id="rating-input-${storyId}">
                        ${[1, 2, 3, 4, 5].map(star => `
                            <span class="star ${star <= this.userRating[storyId] ? 'active' : ''}" 
                                  data-rating="${star}" 
                                  onclick="storyRating.submitRating('${storyId}', ${star})">★</span>
                        `).join('')}
                    </div>
                    <div class="rating-labels">
                        <span>很差</span>
                        <span>一般</span>
                        <span>很好</span>
                        <span>非常好</span>
                        <span>完美</span>
                    </div>
                </div>
            `;
        }
    }

    updateRatingUI(storyId) {
        const container = document.getElementById(`rating-section-${storyId}`);
        if (!container) return;

        const avgRating = this.getAverageRating(storyId);
        const totalRatings = this.getTotalRatings(storyId);
        const userRating = this.userRating[storyId] || 0;
        const distribution = this.getRatingDistribution(storyId);

        // 更新平均分
        const avgElement = container.querySelector('.rating-average');
        if (avgElement) avgElement.textContent = avgRating.toFixed(1);

        // 更新星级
        const starElement = container.querySelector('.rating-stats .star-rating');
        if (starElement) starElement.innerHTML = this.renderStars(Math.round(avgRating));

        // 更新评分人数
        const countElement = container.querySelector('.rating-count');
        if (countElement) countElement.textContent = `${totalRatings} 人评分`;

        // 更新分布条
        container.querySelectorAll('.rating-bar-fill').forEach((fill, index) => {
            const star = 5 - index;
            fill.style.width = `${distribution[star]}%`;
        });
        container.querySelectorAll('.rating-bar-count').forEach((count, index) => {
            const star = 5 - index;
            count.textContent = distribution.counts[star];
        });
    }

    getAverageRating(storyId) {
        if (!this.ratings[storyId] || this.ratings[storyId].count === 0) {
            return 0;
        }
        return this.ratings[storyId].total;
    }

    getTotalRatings(storyId) {
        return this.ratings[storyId]?.count || 0;
    }

    getRatingDistribution(storyId) {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
        
        const total = this.getTotalRatings(storyId);
        if (total === 0) return distribution;

        const ratingData = this.ratings[storyId];
        
        if (ratingData && ratingData.counts) {
            // Use actual tracked counts
            distribution.counts = { ...ratingData.counts };
        } else {
            // Fallback for old data: place all votes on the rounded average
            const avg = Math.round(this.getAverageRating(storyId)) || 5;
            distribution.counts[avg] = total;
        }

        // 计算百分比
        [1, 2, 3, 4, 5].forEach(star => {
            distribution[star] = (distribution.counts[star] / total) * 100;
        });

        return distribution;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes} 分钟前`;
        if (hours < 24) return `${hours} 小时前`;
        if (days < 7) return `${days} 天前`;

        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        if (window.storyApp) {
            window.storyApp.showToast(message, type);
        }
    }

    bindModalEvents() {
        const overlay = document.getElementById('modal-overlay');
        if (!overlay) return;

        overlay.addEventListener('modalOpened', (event) => {
            const storyId = event.detail?.id || window.modalManager?.currentData?.id;
            if (storyId) {
                this.addRatingToStoryModal(storyId);
            }
        });

        overlay.addEventListener('modalClosed', () => {
            document.querySelectorAll('#modal-overlay .rating-section').forEach((node) => node.remove());
        });
    }

    // 为故事模态框添加评分区域 (已屏蔽UI以还用户清爽沉浸的睡前阅读体验)
    addRatingToStoryModal(storyId) {
        const modalBody = document.querySelector('#modal-overlay .modal-text')
            || document.querySelector('.story-modal .modal-body');
        if (modalBody) {
            modalBody.querySelectorAll('.rating-section').forEach((node) => node.remove());
        }
    }
}

// 初始化
window.storyRating = window.storyRating || new StoryRating();
var storyRating = window.storyRating;
