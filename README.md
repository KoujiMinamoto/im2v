# 图片转视频工具 (IM2V)

这是一个使用Novita AI API将图片转换为视频的Web应用程序。该应用程序允许用户上传图片，并通过AI生成流畅的视频内容。

## 功能特点

- 支持标准和专业两种生成模式
- 可以设置提示词和负面提示词引导生成过程
- 可调整引导比例控制生成内容与提示的匹配程度
- 实时显示生成进度
- 支持视频下载

## 技术架构

- 前端：HTML, CSS, JavaScript
- 后端：Node.js, Express
- API：Novita AI KLING V1.6 API

## 安装与部署

### 前提条件

- Node.js (v14或更高版本)
- Novita AI API密钥

### 安装步骤

1. 克隆或下载本项目代码

2. 安装依赖
   ```
   npm install
   ```

3. 配置环境变量
   - 复制`.env.example`文件为`.env`
   - 在`.env`文件中设置你的Novita AI API密钥
   ```
   NOVITA_API_KEY=your_api_key_here
   PORT=3000
   ```

4. 启动应用
   ```
   npm start
   ```

5. 在浏览器中访问 `http://localhost:3000`

### 部署到生产环境

在生产环境中部署时，确保设置以下环境变量：

- `NOVITA_API_KEY`: 你的Novita AI API密钥
- `PORT`: 应用运行的端口（可选，默认为3000）

#### 使用Docker部署

如果使用Docker部署，可以在运行容器时设置环境变量：

```
docker run -p 3000:3000 -e NOVITA_API_KEY=your_api_key_here im2v
```

#### 使用云平台部署

在Heroku、Vercel、Netlify等云平台部署时，请在平台的环境变量或配置部分设置`NOVITA_API_KEY`。

## 使用说明

1. 选择生成模式（标准或专业）
2. 输入图片URL
3. 如果选择专业模式，可以选择性地输入结束图片URL
4. 输入提示词以引导生成过程
5. 可选择性地输入负面提示词
6. 调整引导比例
7. 点击"生成视频"按钮
8. 等待视频生成完成
9. 生成完成后可以预览和下载视频

## 安全说明

本应用将API密钥存储在服务器端的环境变量中，而不是在前端暴露，以提高安全性。

## 许可证

[MIT](LICENSE)