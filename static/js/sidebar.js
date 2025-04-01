document.addEventListener('DOMContentLoaded', () => {
    // 获取必要的元素
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const menuToggle = document.querySelector('.menu-toggle');
    
    // 确保所有必需的元素都存在
    if (!sidebar || !mainContent || !sidebarToggle || !menuToggle) {
        console.warn('侧边栏所需的某些元素未找到', {
            sidebar: !!sidebar,
            mainContent: !!mainContent,
            sidebarToggle: !!sidebarToggle,
            menuToggle: !!menuToggle
        });
        return;
    }

    // 检查窗口宽度和本地存储中的侧边栏状态
    const isMobile = window.innerWidth <= 768;
    const storedCollapsed = localStorage.getItem('sidebarCollapsed');
    const shouldBeCollapsed = storedCollapsed === 'true';

    // 初始化侧边栏状态
    if (!isMobile) {
        // 桌面端：根据存储的状态初始化
        if (shouldBeCollapsed) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('sidebar-collapsed');
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('sidebar-collapsed');
        }
        sidebar.style.transform = 'none'; // 确保桌面端不会被移动端的样式影响
    } else {
        // 移动端：默认隐藏侧边栏
        sidebar.classList.remove('collapsed');
        mainContent.classList.remove('sidebar-collapsed');
    }

    // 折叠按钮点击事件
    sidebarToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
    });

    // 移动端菜单切换
    menuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
    });

    // 点击侧边栏外部关闭菜单（仅限移动端）
    document.addEventListener('click', (e) => {
        if (isMobile && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target) && 
            sidebar.classList.contains('show')) {
            toggleMobileMenu();
        }
    });

    // 监听窗口大小变化
    let lastIsMobile = isMobile;
    window.addEventListener('resize', () => {
        const newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== lastIsMobile) {
            if (!newIsMobile) {
                // 切换到桌面端
                sidebar.classList.remove('show');
                menuToggle.classList.remove('active');
                document.body.classList.remove('sidebar-open');
                sidebar.style.transform = 'none';
                
                // 恢复存储的折叠状态
                if (shouldBeCollapsed) {
                    sidebar.classList.add('collapsed');
                    mainContent.classList.add('sidebar-collapsed');
                } else {
                    sidebar.classList.remove('collapsed');
                    mainContent.classList.remove('sidebar-collapsed');
                }
            } else {
                // 切换到移动端
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('sidebar-collapsed');
                sidebar.style.transform = '';
            }
            lastIsMobile = newIsMobile;
        }
    });

    // 子菜单展开/收起
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const submenu = link.nextElementSibling;
        if (submenu && submenu.classList.contains('nav-submenu')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const arrow = link.querySelector('.nav-link-arrow');
                if (arrow) {
                    submenu.classList.toggle('show');
                    arrow.style.transform = submenu.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0)';
                }
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
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
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

    // 切换侧边栏函数（桌面端）
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }

    // 切换移动端菜单函数
    function toggleMobileMenu() {
        sidebar.classList.toggle('show');
        menuToggle.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
    }
}); 