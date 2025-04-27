// 登录和注册功能
document.addEventListener('DOMContentLoaded', function() {
  // 切换标签
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // 移除所有标签的active类
      tabs.forEach(t => t.classList.remove('active'));
      // 添加当前标签的active类
      this.classList.add('active');
      
      // 隐藏所有内容
      tabContents.forEach(content => {
        content.style.display = 'none';
      });
      
      // 显示当前内容
      document.getElementById(tabId).style.display = 'block';
    });
  });
  
  // 登录表单提交
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // 登录成功，跳转到主页
          window.location.href = 'main.html';
        } else {
          // 登录失败，显示错误信息
          alert(data.error || '登录失败');
        }
      } catch (error) {
        console.error('登录错误:', error);
        alert('登录失败，请稍后再试');
      }
    });
  }
  
  // 注册表单提交
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('register-username').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      
      // 验证密码
      if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
      }
      
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // 注册成功，跳转到主页
          window.location.href = 'main.html';
        } else {
          // 注册失败，显示错误信息
          alert(data.error || '注册失败');
        }
      } catch (error) {
        console.error('注册错误:', error);
        alert('注册失败，请稍后再试');
      }
    });
  }
});

// 检查用户登录状态
async function checkLoginStatus() {
  try {
    const response = await fetch('/api/user');
    
    if (response.ok) {
      const data = await response.json();
      return data.user;
    } else {
      return null;
    }
  } catch (error) {
    console.error('检查登录状态错误:', error);
    return null;
  }
}

// 登出功能
async function logout() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST'
    });
    
    if (response.ok) {
      // 登出成功，跳转到登录页
      window.location.href = 'index.html';
    } else {
      alert('登出失败，请稍后再试');
    }
  } catch (error) {
    console.error('登出错误:', error);
    alert('登出失败，请稍后再试');
  }
}