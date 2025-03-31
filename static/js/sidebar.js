document.addEventListener('DOMContentLoaded', () => {
    // 移动端菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            menuToggle.classList.toggle('active');
        });
    }

    // 点击侧边栏外部关闭菜单
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('show');
                menuToggle.classList.remove('active');
            }
        }
    });

    // 子菜单展开/收起
    const menuItems = document.querySelectorAll('.nav-item');
    menuItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const submenu = item.querySelector('.nav-submenu');
        
        if (link && submenu) {
            link.addEventListener('click', (e) => {
                e.preventDefault(); // 阻止链接默认行为
                
                // 关闭其他打开的子菜单
                menuItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.querySelector('.nav-submenu')?.classList.remove('show');
                    }
                });
                
                // 切换当前子菜单
                submenu.classList.toggle('show');
            });
        }
    });

    // 暗色模式切换
    const themeToggle = document.querySelector('#theme-toggle');
    if (themeToggle) {
        // 检查本地存储的主题设置
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }

        // 切换主题
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // 搜索功能
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase();
                // 这里可以实现搜索逻辑
                // 例如：发送请求到搜索API或过滤本地文章列表
            }, 300);
        });
    }

    // 回到顶部按钮
    const backToTop = document.querySelector('#back-to-top');
    if (backToTop) {
        // 监听滚动事件
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });

        // 点击回到顶部
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}); 