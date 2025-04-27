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
  document.getElementById('profile-username').textContent = user.username;
  document.getElementById('profile-nickname').textContent = user.nickname || user.username;
  document.getElementById('profile-balance').textContent = `¥${user.balance.toFixed(2)}`;
  
  // 登出按钮
  document.getElementById('logout-btn').addEventListener('click', logout);
  
  // 打开修改昵称模态框
  document.getElementById('edit-nickname-btn').addEventListener('click', function() {
    document.getElementById('nickname-modal').classList.remove('hidden');
    document.getElementById('nickname-modal').style.visibility = 'visible';
  });
  
  // 关闭修改昵称模态框
  document.querySelectorAll('.close-modal').forEach(function(element) {
    element.addEventListener('click', function() {
      document.getElementById('nickname-modal').classList.add('hidden');
      document.getElementById('nickname-modal').style.visibility = 'hidden';
    });
  });
  
  // 修改昵称表单提交
  const nicknameForm = document.getElementById('nickname-form');
  nicknameForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const newNickname = document.getElementById('new-nickname').value;
    
    try {
      const response = await fetch('/api/user/nickname', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nickname: newNickname })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 更新昵称成功
        document.getElementById('profile-nickname').textContent = newNickname;
        document.getElementById('nickname-modal').classList.add('hidden');
        document.getElementById('nickname-modal').style.visibility = 'hidden';
        alert('昵称更新成功');
      } else {
        alert(data.error || '昵称更新失败');
      }
    } catch (error) {
      console.error('更新昵称错误:', error);
      alert('昵称更新失败，请稍后再试');
    }
  });
  
  // 修改密码表单提交
  const passwordForm = document.getElementById('password-form');
  passwordForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
      alert('两次输入的新密码不一致');
      return;
    }
    
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 更新密码成功
        alert('密码更新成功');
        passwordForm.reset();
      } else {
        alert(data.error || '密码更新失败');
      }
    } catch (error) {
      console.error('更新密码错误:', error);
      alert('密码更新失败，请稍后再试');
    }
  });
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