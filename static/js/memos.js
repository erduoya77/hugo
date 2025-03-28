let page = 1;
const limit = 10;
let loading = false;
let hasMore = true;
let currentTag = '';

// 格式化日期
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 处理 Markdown 内容
function processContent(content) {
    // 创建一个数组来存储占位符和对应的HTML
    let placeholders = [];
    let placeholderIndex = 0;

    // 先处理标签，保留音乐标签
    content = content.replace(/#([\u4e00-\u9fa5a-zA-Z0-9_]+)(?=\s|$)/g, (match, tag) => {
        const placeholder = `PLACEHOLDER_${placeholderIndex++}`;
        placeholders.push({
            placeholder: placeholder,
            html: `<a href="/tags/${tag}" class="memo-tag">#${tag}</a>`
        });
        return placeholder;
    });

    // 处理网易云音乐链接
    content = content.replace(/\[(.*?)\]\((https?:\/\/music\.163\.com\/song\?id=(\d+))\)/g, (match, title, url, id) => {
        const placeholder = `PLACEHOLDER_${placeholderIndex++}`;
        placeholders.push({
            placeholder: placeholder,
            html: `<div class="memo-music-wrapper"><meting-js server="netease" type="song" id="${id}" theme="var(--theme-color)"></meting-js></div>`
        });
        return placeholder;
    });

    // 处理直接的网易云音乐链接
    content = content.replace(/(https?:\/\/music\.163\.com\/song\?id=(\d+))/g, (match, url, id) => {
        const placeholder = `PLACEHOLDER_${placeholderIndex++}`;
        placeholders.push({
            placeholder: placeholder,
            html: `<div class="memo-music-wrapper"><meting-js server="netease" type="song" id="${id}" theme="var(--theme-color)"></meting-js></div>`
        });
        return placeholder;
    });

    // 使用 marked 处理其余的 Markdown 内容
    content = marked.parse(content);

    // 恢复占位符为实际的 HTML
    placeholders.forEach(({placeholder, html}) => {
        content = content.replace(placeholder, html);
    });

    return content;
}

// 创建 memo 卡片
function createMemoCard(memo) {
    let content = memo.content;
    content = processContent(content);
    const date = formatDate(memo.createdTs);
    
    let imagesHtml = '';
    let filesHtml = '';
    if (memo.resourceList && memo.resourceList.length > 0) {
        const images = memo.resourceList.filter(resource => resource.type.startsWith('image/'));
        const textFiles = memo.resourceList.filter(resource => resource.type.startsWith('text/'));
        
        if (images.length > 0) {
            const maxDisplayImages = images.length <= 4 ? 4 : 9;
            const displayImages = images.slice(0, maxDisplayImages);
            const remainingCount = images.length - maxDisplayImages;
            
            imagesHtml = `
                <div class="memo-images" view-image data-count="${Math.min(images.length, maxDisplayImages)}">
                    ${displayImages.map((resource, index) => {
                        if ((maxDisplayImages === 4 && index === 3 && remainingCount > 0) ||
                            (maxDisplayImages === 9 && index === 8 && remainingCount > 0)) {
                            return `
                                <div class="memo-image-wrapper">
                                    <img src="https://memos.erduoya.top/o/r/${resource.id}" alt="memo image" loading="lazy">
                                    <div class="memo-image-more">+${remainingCount}</div>
                                </div>
                            `;
                        }
                        return `
                            <div class="memo-image-wrapper">
                                <img src="https://memos.erduoya.top/o/r/${resource.id}" alt="memo image" loading="lazy">
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        if (textFiles.length > 0) {
            filesHtml = `
                <div class="memo-files">
                    ${textFiles.map(resource => `
                        <a href="https://memos.erduoya.top/o/r/${resource.id}" class="memo-file" target="_blank">
                            <i class="fas fa-file-code"></i>
                            <span class="memo-file-name">${resource.filename}</span>
                        </a>
                    `).join('')}
                </div>
            `;
        }
    }
    
    const card = document.createElement('div');
    card.className = 'memo-card';
    card.innerHTML = `
        <div class="memo-header">
            <img class="memo-avatar" src="/images/avatar.png" alt="avatar">
            <a class="memo-author">${memo.creatorName}</a>
        </div>
        <div class="memo-bubble">
            <div class="memo-content">${content}</div>
            ${imagesHtml}
            ${filesHtml}
            <span class="memo-meta">${date}</span>
        </div>
    `;
    
    return card;
}

// 清除过滤
function clearFilter() {
    currentTag = '';
    document.getElementById('memos-container').innerHTML = '';
    document.getElementById('current-filter').style.display = 'none';
    page = 1;
    hasMore = true;
    loadMemos();
}

// 添加标签筛选功能
async function filterByTag(tag) {
    if (currentTag === tag) {
        clearFilter();
        return;
    }

    currentTag = tag;
    page = 1;
    hasMore = true;
    const container = document.getElementById('memos-container');
    container.innerHTML = '';
    
    // 显示过滤指示器
    const filterIndicator = document.getElementById('current-filter');
    const filterTag = filterIndicator.querySelector('.current-tag');
    filterTag.textContent = `#${tag}`;
    filterIndicator.style.display = 'flex';
    
    await loadMemos();
}

// 修改加载 memos 函数，统一处理普通加载和标签筛选
async function loadMemos() {
    if (loading || !hasMore) return;
    
    loading = true;
    const loadingMore = document.getElementById('loading-more');
    loadingMore.style.display = 'block';
    
    try {
        const baseUrl = 'https://memos.erduoya.top/api/v1/memo?creatorId=1&rowStatus=NORMAL';
        let url = `${baseUrl}&limit=${limit}&offset=${(page - 1) * limit}`;
        
        if (currentTag) {
            url += `&tag=${currentTag}`;
        }
            
        const response = await fetch(url);
        const memos = await response.json();
        
        if (memos.length === 0 && page === 1) {
            const container = document.getElementById('memos-container');
            container.innerHTML = '<div class="no-memos">没有找到相关内容</div>';
            hasMore = false;
            loadingMore.style.display = 'none';
            return;
        }
        
        if (memos.length < limit) {
            hasMore = false;
            loadingMore.style.display = 'none';
        }
        
        const container = document.getElementById('memos-container');
        for (const memo of memos) {
            const card = createMemoCard(memo);
            container.appendChild(card);
        }
        
        page++;
    } catch (error) {
        console.error('Error loading memos:', error);
        if (page === 1) {
            const container = document.getElementById('memos-container');
            container.innerHTML = '<div class="error-message">加载失败，请稍后重试</div>';
        }
    } finally {
        loading = false;
        loadingMore.style.display = hasMore ? 'block' : 'none';
    }
}

// 监听滚动事件
function handleScroll() {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const clientHeight = window.innerHeight || document.documentElement.clientHeight;
    
    if (scrollHeight - scrollTop - clientHeight < 200) {
        loadMemos();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 添加筛选指示器到页面
    const filterHtml = `
        <div id="current-filter" class="current-filter" style="display: none;">
            <span class="current-filter-text">当前筛选：</span>
            <span class="current-tag"></span>
            <button class="clear-filter-btn" onclick="clearFilter()">清除筛选</button>
        </div>
    `;
    const container = document.getElementById('memos-container');
    container.insertAdjacentHTML('beforebegin', filterHtml);

    loadMemos();
    window.addEventListener('scroll', handleScroll);
    ViewImage.init();
});