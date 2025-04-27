require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const { initDatabase, addUser, findUserByUsername, findUserByEmail, updateNickname, updatePassword, updateBalance } = require('./db/database');

// 初始化数据库
initDatabase();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.NOVITA_API_KEY;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

// 配置会话
app.use(session({
  secret: 'im2v-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1天过期
}));

// 身份验证中间件
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: '请先登录' });
  }
};

// 验证API密钥是否存在
if (!API_KEY) {
  console.error('错误: 未设置NOVITA_API_KEY环境变量');
  process.exit(1);
}

// 创建图片转视频任务的API端点
app.post('/api/create-video-task', async (req, res) => {
  try {
    console.log('收到创建图片转视频任务请求:', req.body);
    
    const response = await fetch('https://api.novita.ai/v3/async/kling-v1.6-i2v', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API请求失败:', errorData);
      return res.status(response.status).json({
        error: true,
        message: errorData.message || response.statusText || '未知错误'
      });
    }
    
    const result = await response.json();
    console.log('API请求成功，返回结果:', result);
    res.json(result);
  } catch (error) {
    console.error('处理请求时出错:', error);
    res.status(500).json({
      error: true,
      message: error.message || '服务器内部错误'
    });
  }
});

// 创建文字转视频任务的API端点
app.post('/api/create-text-to-video-task', async (req, res) => {
  try {
    console.log('收到创建文字转视频任务请求:', req.body);
    
    const response = await fetch('https://api.novita.ai/v3/async/kling-v1.6-t2v', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API请求失败:', errorData);
      return res.status(response.status).json({
        error: true,
        message: errorData.message || response.statusText || '未知错误'
      });
    }
    
    const result = await response.json();
    console.log('API请求成功，返回结果:', result);
    res.json(result);
  } catch (error) {
    console.error('处理请求时出错:', error);
    res.status(500).json({
      error: true,
      message: error.message || '服务器内部错误'
    });
  }
});

// 获取任务结果的API端点
app.get('/api/task-result', async (req, res) => {
  try {
    const taskId = req.query.task_id;
    
    if (!taskId) {
      return res.status(400).json({
        error: true,
        message: '缺少任务ID参数'
      });
    }
    
    console.log(`正在获取任务结果，任务ID: ${taskId}`);
    
    const response = await fetch(`https://api.novita.ai/v3/async/task-result?task_id=${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('获取任务结果失败:', errorData);
      return res.status(response.status).json({
        error: true,
        message: errorData.message || response.statusText || '未知错误'
      });
    }
    
    const result = await response.json();
    console.log('获取任务结果成功');
    res.json(result);
  } catch (error) {
    console.error('处理请求时出错:', error);
    res.status(500).json({
      error: true,
      message: error.message || '服务器内部错误'
    });
  }
});

// 注册API
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email, nickname } = req.body;
    
    // 验证输入
    if (!username || !password || !email) {
      return res.status(400).json({ error: '用户名、密码和邮箱为必填项' });
    }
    
    // 检查用户名是否已存在
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    // 检查邮箱是否已存在
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const result = await addUser(username, hashedPassword, email, nickname);
    
    // 设置会话
    const user = await findUserByUsername(username);
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      balance: user.balance
    };
    
    res.status(201).json({ message: '注册成功', user: req.session.user });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 登录API
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码为必填项' });
    }
    
    // 查找用户
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码不正确' });
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码不正确' });
    }
    
    // 设置会话
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      balance: user.balance
    };
    
    res.json({ message: '登录成功', user: req.session.user });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 登出API
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: '登出失败' });
    }
    res.json({ message: '登出成功' });
  });
});

// 获取当前用户信息
app.get('/api/user', requireAuth, (req, res) => {
  res.json({ user: req.session.user });
});

// 更新昵称
app.put('/api/user/nickname', requireAuth, async (req, res) => {
  try {
    const { nickname } = req.body;
    
    if (!nickname) {
      return res.status(400).json({ error: '昵称不能为空' });
    }
    
    await updateNickname(req.session.user.id, nickname);
    
    // 更新会话中的用户信息
    req.session.user.nickname = nickname;
    
    res.json({ message: '昵称更新成功', user: req.session.user });
  } catch (error) {
    console.error('更新昵称错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新密码
app.put('/api/user/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '当前密码和新密码为必填项' });
    }
    
    // 查找用户
    const user = await findUserByUsername(req.session.user.username);
    
    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '当前密码不正确' });
    }
    
    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await updatePassword(req.session.user.id, hashedPassword);
    
    res.json({ message: '密码更新成功' });
  } catch (error) {
    console.error('更新密码错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});