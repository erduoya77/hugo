// 日期格式化
function formatDate(timestamp, format = 'zh-CN') {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString(format, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 暗色模式切换
function toggleDarkMode() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-theme');
    localStorage.setItem('dark-theme', isDark);
}

// 检查暗色模式
function checkDarkMode() {
    const isDark = localStorage.getItem('dark-theme') === 'true';
    if (isDark) {
        document.body.classList.add('dark-theme');
    }
}

// 滚动到顶部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 检查元素是否在视口中
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// 懒加载图片
function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('loading');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// 复制文本到剪贴板
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
}

// 导出工具函数
window.utils = {
    formatDate,
    debounce,
    throttle,
    toggleDarkMode,
    checkDarkMode,
    scrollToTop,
    isInViewport,
    lazyLoadImages,
    copyToClipboard
}; 