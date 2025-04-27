document.addEventListener('DOMContentLoaded', function() {
    // 标签切换功能
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // 更新活动标签
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 显示对应的内容
            tabContents.forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(tabId).style.display = 'block';
        });
    });
    
    // 表单提交处理
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        // 这里添加登录逻辑
        console.log('登录请求:', { username, password });
        // 修改重定向到 main.html（原 index.html）
        window.location.href = 'main.html';
    });
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }
        
        // 这里添加注册逻辑
        console.log('注册请求:', { username, email, password });
        alert('注册功能尚未实现，请稍后再试');
    });
    
    // 加载瀑布流图片
    loadWaterfallImages();
});

// 瀑布流图片数据
const imageData = [
    { src: 'images/waterfall-1.jpg', alt: '瀑布流图片1' },
    { src: 'images/waterfall-2.jpg', alt: '瀑布流图片2' },
    { src: 'images/waterfall-3.jpg', alt: '瀑布流图片3' },
    { src: 'images/waterfall-4.jpg', alt: '瀑布流图片4' },
    { src: 'images/waterfall-5.jpg', alt: '瀑布流图片5' },
    { src: 'images/waterfall-6.jpg', alt: '瀑布流图片6' },
    { src: 'images/waterfall-7.jpg', alt: '瀑布流图片7' },
    { src: 'images/waterfall-8.jpg', alt: '瀑布流图片8' },
    { src: 'images/waterfall-9.jpg', alt: '瀑布流图片9' },
    { src: 'images/waterfall-10.jpg', alt: '瀑布流图片10' },
    // 可以根据需要添加更多图片
];

function loadWaterfallImages() {
    const waterfallContainer = document.getElementById('waterfall');
    
    // 清空容器
    waterfallContainer.innerHTML = '';
    
    // 创建并添加图片元素
    imageData.forEach(image => {
        const item = document.createElement('div');
        item.className = 'waterfall-item';
        
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        img.loading = 'lazy'; // 懒加载
        
        item.appendChild(img);
        waterfallContainer.appendChild(item);
    });
    
    // 随机排列图片
    const items = document.querySelectorAll('.waterfall-item');
    items.forEach(item => {
        item.style.order = Math.floor(Math.random() * items.length);
    });
}