// 格式化日期
function formatDate(timestamp) {
    // 将 Unix 时间戳转换为毫秒
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '-');
}

// 获取月份名称
function getMonthName(month) {
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return months[month];
}

// 创建文章卡片
function createArchiveCard(post) {
    const formattedDate = formatDate(post.timestamp);
    
    const card = document.createElement('div');
    card.className = 'archive-card';
    card.innerHTML = `
        <div href="${post.url}" class="archive-bubble">
            <div class="archive-info">
                <a href="${post.url}" class="archive-title">${post.title}</a>
                <span class="archive-meta">${formattedDate}</span>
            </div>
        </div>
    `;
    
    return card;
}

// 按年月组织文章
function organizePostsByDate(posts) {
    const organized = {};
    
    posts.forEach(post => {
        try {
            // 使用 timestamp 创建日期对象
            const date = new Date(post.timestamp * 1000);
            const year = date.getFullYear();
            const month = date.getMonth();
            
            if (!organized[year]) {
                organized[year] = {};
            }
            if (!organized[year][month]) {
                organized[year][month] = [];
            }
            
            organized[year][month].push(post);
        } catch (error) {
            console.error('处理日期时出错:', error, post);
        }
    });
    
    return organized;
}

// 渲染时间轴
function renderArchives(posts) {
    const container = document.getElementById('archives-container');
    const organizedPosts = organizePostsByDate(posts);
    
    // 按年份降序排序
    const years = Object.keys(organizedPosts).sort((a, b) => b - a);
    
    years.forEach(year => {
        // 添加年份标题
        const yearHeader = document.createElement('h2');
        yearHeader.className = 'archive-year';
        yearHeader.textContent = `${year}年`;
        container.appendChild(yearHeader);
        
        // 获取该年份的所有月份并降序排序
        const months = Object.keys(organizedPosts[year]).sort((a, b) => b - a);
        
        months.forEach(month => {
            // 添加月份标题
            const monthHeader = document.createElement('h3');
            monthHeader.className = 'archive-month';
            monthHeader.textContent = getMonthName(month);
            container.appendChild(monthHeader);
            
            // 添加该月的所有文章
            organizedPosts[year][month].forEach(post => {
                const card = createArchiveCard(post);
                container.appendChild(card);
            });
        });
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 添加调试信息
    console.log('初始化时间轴...');
    const archivesData = window.archivesData || [];
    console.log('文章数据:', archivesData);
    
    if (archivesData.length > 0) {
        renderArchives(archivesData);
    } else {
        const container = document.getElementById('archives-container');
        container.innerHTML = '<div class="no-archives">暂无文章</div>';
    }
}); 