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

// 处理 Markdown 内容（仅处理标签和换行）
function processContent(content) {
    // 处理标签
    content = content.replace(/#([^\s#]+?)(?=\s|$)/g, '<a href="javascript:void(0)" class="memo-tag" onclick="filterByTag(\'$1\')">#$1</a>');
    
    // 处理换行
    content = content.replace(/\n/g, '<br>');
    
    return content;
}

// 创建 memo 卡片
function createMemoCard(memo) {
    let content = memo.content;

    // 处理网易云音乐链接
    const NETEASE_MUSIC_REG = /\[([^\]]+)\]\((https?:\/\/)?music\.163\.com\/(?:#\/)?song(?:\?id=|\/)(\d+)(?:[^)]*)\)/g;
    content = content.replace(NETEASE_MUSIC_REG, (match, title, protocol, songId) => {
 

        return `
            <div class="memo-music-wrapper">
                <div class="memo-music"><meting-js auto="https://music.163.com/song?id=${songId}"></meting-js></div>

            </div>
        `;
    });

    // 处理其他 Markdown 内容
    content = processContent(content);
    const date = formatDate(memo.createdTs);
    
    let imagesHtml = '';
    if (memo.resourceList && memo.resourceList.length > 0) {
        const images = memo.resourceList.filter(resource => resource.type.startsWith('image/'));
        if (images.length > 0) {
            const displayImages = images.slice(0, 9);
            const remainingCount = images.length - 9;
            
            imagesHtml = `
                <div class="memo-images" view-image data-count="${Math.min(images.length, 9)}">
                    ${displayImages.map((resource, index) => {
                        if (index === 8 && remainingCount > 0) {
                            return `
                                <div class="memo-image-wrapper">
                                    <img src="https://memos.erduoya.top/o/r/${resource.id}" alt="memo image" loading="lazy">
                                    <div class="memo-image-more">+${remainingCount}</div>
                                </div>
                            `;
                        }
                        return `<img src="https://memos.erduoya.top/o/r/${resource.id}" alt="memo image" loading="lazy">`;
                    }).join('')}
                </div>
            `;
        }
    }
    
    const card = document.createElement('div');
    card.className = 'memo-card';
    card.innerHTML = `
        <img class="memo-avatar" src="/images/avatar.png" alt="avatar">
        <div class="memo-bubble">
            <div class="memo-info">
                <a href="#" class="memo-author">${memo.creatorName}</a>
                <span class="memo-meta">${date}</span>
            </div>
            <div class="memo-content">${content}</div>
            ${imagesHtml}
        </div>
    `;
    
    return card;
}

// 清除过滤
function clearFilter() {
    currentTag = '';
    document.getElementById('memos-container').innerHTML = '';
    document.getElementById('filter-indicator').style.display = 'none';
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
    const filterIndicator = document.getElementById('filter-indicator');
    const filterTag = filterIndicator.querySelector('.filter-tag');
    filterTag.textContent = `当前筛选：#${tag}`;
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
    loadMemos();
    window.addEventListener('scroll', handleScroll);
    ViewImage.init();
});