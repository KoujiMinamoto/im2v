require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.NOVITA_API_KEY;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});