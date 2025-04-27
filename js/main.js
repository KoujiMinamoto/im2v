document.addEventListener('DOMContentLoaded', async function() {
  // 检查用户登录状态
  const user = await checkLoginStatus();
  
  if (!user) {
    // 未登录，跳转到登录页
    window.location.href = 'index.html';
    return;
  }
  
  // 更新用户信息显示
  document.querySelector('.username').textContent = user.username;
  
  // 登出按钮
  document.getElementById('logout-btn').addEventListener('click', logout);
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