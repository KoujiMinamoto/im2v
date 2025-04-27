document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const videoForm = document.getElementById('videoForm');
    const generationTypeSelect = document.getElementById('generationType');
    const modeSelect = document.getElementById('mode');
    const imageInputs = document.getElementById('imageInputs');
    const textInputs = document.getElementById('textInputs');
    const imageUrlInput = document.getElementById('imageUrl');
    const endImageUrlInput = document.getElementById('endImageUrl');
    const textPromptInput = document.getElementById('textPrompt');
    const promptInput = document.getElementById('prompt');
    const guidanceScaleInput = document.getElementById('guidanceScale');
    const guidanceScaleValue = document.getElementById('guidanceScaleValue');
    const negativePromptInput = document.getElementById('negativePrompt');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultContainer = document.getElementById('resultContainer');
    const videoContainer = document.getElementById('videoContainer');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    const statusMessage = document.getElementById('statusMessage');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const downloadBtn = document.getElementById('downloadBtn');
    const tabs = document.querySelectorAll('.tab');

    // 添加赛博朋克风格的控制台日志
    console.log('%c[KLING-AI-SYS] %c初始化系统...', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;');
    
    // 标签切换功能
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签的active类
            tabs.forEach(t => t.classList.remove('active'));
            
            // 添加当前标签的active类
            this.classList.add('active');
            
            // 更新生成类型选择器
            const tabType = this.getAttribute('data-tab');
            generationTypeSelect.value = tabType;
            
            // 触发change事件以更新表单
            const event = new Event('change');
            generationTypeSelect.dispatchEvent(event);
            
            console.log(`%c[KLING-AI-SYS] %c切换到${tabType === 'image' ? '图片生成视频' : '文字生成视频'}模式`, 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;');
        });
    });

    // 生成类型变更事件
    generationTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        
        // 更新标签状态
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === selectedType) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // 显示/隐藏相应的输入字段
        if (selectedType === 'image') {
            imageInputs.classList.remove('hidden');
            textInputs.classList.add('hidden');
        } else {
            imageInputs.classList.add('hidden');
            textInputs.classList.remove('hidden');
        }
        
        console.log(`%c[KLING-AI-SYS] %c生成类型已更改为: ${selectedType}`, 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;');
    });

    // 模式变更事件
    modeSelect.addEventListener('change', function() {
        const selectedMode = this.value;
        
        // 启用/禁用结束图片输入框
        if (selectedMode === 'Professional' && generationTypeSelect.value === 'image') {
            endImageUrlInput.disabled = false;
            endImageUrlInput.placeholder = '输入结束图片URL (可选，专业模式)';
        } else {
            endImageUrlInput.disabled = true;
            endImageUrlInput.placeholder = '输入结束图片URL (可选，仅专业模式)';
        }
        
        console.log(`%c[KLING-AI-SYS] %c模式已更改为: ${selectedMode}`, 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;');
    });

    // 引导比例滑块事件
    guidanceScaleInput.addEventListener('input', function() {
        guidanceScaleValue.textContent = this.value;
    });

    // 表单提交事件
    videoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('%c[KLING-AI-SYS] %c开始处理视频生成请求...', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;');
        
        // 重置UI状态
        resetUI();
        
        // 显示加载指示器
        loadingIndicator.classList.remove('hidden');
        
        try {
            // 获取表单数据
            const generationType = generationTypeSelect.value;
            const isImageToVideo = generationType === 'image';
            const mode = modeSelect.value;
            const guidanceScale = parseFloat(guidanceScaleInput.value);
            const negativePrompt = negativePromptInput.value.trim();
            
            // 创建请求数据
            const requestData = {
                mode,
                guidance_scale: guidanceScale
            };
            
            // 添加负面提示词（如果有）
            if (negativePrompt) {
                requestData.negative_prompt = negativePrompt;
            }
            
            // 根据生成类型设置不同的请求数据
            if (isImageToVideo) {
                // 图片生成视频模式
                const imageUrl = imageUrlInput.value.trim();
                const endImageUrl = endImageUrlInput.value.trim();
                const prompt = promptInput.value.trim();
                
                // 验证必填字段
                if (!imageUrl || !prompt) {
                    throw new Error('请填写所有必填字段（起始图片URL和提示词）');
                }
                
                // 设置图生视频特有的参数
                requestData.image_url = imageUrl;
                requestData.prompt = prompt;
                
                // 添加可选字段
                if (mode === 'Professional' && endImageUrl) {
                    requestData.end_image_url = endImageUrl;
                }
                
                // 发送图生视频API请求
                statusMessage.textContent = '正在提交图片生成视频请求...';
                const taskId = await createImageToVideoTask(requestData);
                
                if (!taskId) {
                    throw new Error('未能获取任务ID');
                }
                
                statusMessage.textContent = '任务已提交，正在生成视频...';
                
                // 轮询获取结果
                await pollTaskResult(taskId);
            } else {
                // 文字生成视频模式
                const textPrompt = textPromptInput.value.trim();
                const additionalPrompt = promptInput.value.trim();
                
                // 验证必填字段
                if (!textPrompt) {
                    throw new Error('请填写文字提示词');
                }
                
                // 设置文生视频特有的参数
                requestData.prompt = textPrompt;
                
                // 如果有额外提示词，添加到主提示词中
                if (additionalPrompt) {
                    requestData.prompt += " " + additionalPrompt;
                }
                
                // 发送文生视频API请求
                statusMessage.textContent = '正在提交文字生成视频请求...';
                const taskId = await createTextToVideoTask(requestData);
                
                if (!taskId) {
                    throw new Error('未能获取任务ID');
                }
                
                statusMessage.textContent = '任务已提交，正在生成视频...';
                
                // 轮询获取结果
                await pollTaskResult(taskId);
            }
            
        } catch (error) {
            console.error('%c[KLING-AI-SYS] %c视频生成请求失败:', 'color: #ff3366; font-weight: bold;', 'color: #e0e0e0;', error.message);
            showError(error.message);
        }
        console.log('%c[KLING-AI-SYS] %c视频生成请求处理完成', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;');
    });

    // 创建图片生成视频任务
    async function createImageToVideoTask(data) {
        console.log('%c[KLING-AI-SYS] %c发送图片生成视频API请求数据:', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;', JSON.stringify(data));
        
        const response = await fetch('/api/create-video-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('%c[KLING-AI-SYS] %cAPI请求状态:', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;', response.status, response.statusText);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('%c[KLING-AI-SYS] %cAPI请求失败:', 'color: #ff3366; font-weight: bold;', 'color: #e0e0e0;', errorData);
            throw new Error(`API请求失败: ${errorData.message || response.statusText || '未知错误'}`);
        }
        
        const result = await response.json();
        console.log('%c[KLING-AI-SYS] %cAPI请求成功，返回结果:', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;', result);
        console.log('%c[KLING-AI-SYS] %c获取到的任务ID:', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;', result.task_id);
        return result.task_id;
    }
    
    // 创建文字生成视频任务
    async function createTextToVideoTask(data) {
        console.log('%c[KLING-AI-SYS] %c发送文字生成视频API请求数据:', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;', JSON.stringify(data));
        
        const response = await fetch('/api/create-text-to-video-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('%c[KLING-AI-SYS] %cAPI请求状态:', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;', response.status, response.statusText);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('%c[KLING-AI-SYS] %cAPI请求失败:', 'color: #ff3366; font-weight: bold;', 'color: #e0e0e0;', errorData);
            throw new Error(`API请求失败: ${errorData.message || response.statusText || '未知错误'}`);
        }
        
        const result = await response.json();
        console.log('%c[KLING-AI-SYS] %cAPI请求成功，返回结果:', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;', result);
        console.log('%c[KLING-AI-SYS] %c获取到的任务ID:', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;', result.task_id);
        return result.task_id;
    }

    // 轮询任务结果
    async function pollTaskResult(taskId) {
        let attempts = 0;
        const maxAttempts = 60; // 最多尝试60次，约10分钟
        const pollInterval = 10000; // 10秒轮询一次
        
        console.log(`%c[KLING-AI-SYS] %c开始轮询任务结果，任务ID: ${taskId}，最大尝试次数: ${maxAttempts}，轮询间隔: ${pollInterval}ms`, 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;');
        
        const checkResult = async () => {
            attempts++;
            console.log(`%c[KLING-AI-SYS] %c轮询尝试次数: ${attempts}/${maxAttempts}`, 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;');
            
            try {
                const result = await getTaskResult(taskId);
                
                // 更新进度
                if (result.task && result.task.progress_percent !== undefined) {
                    const progress = result.task.progress_percent;
                    console.log(`%c[KLING-AI-SYS] %c任务进度: ${progress}%`, 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;');
                    updateProgress(progress);
                }
                
                // 检查任务状态
                console.log('%c[KLING-AI-SYS] %c当前任务状态:', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;', result.task ? result.task.status : '未知');
                
                if (result.task && result.task.status === 'TASK_STATUS_SUCCEED') {
                    // 任务成功完成
                    console.log('%c[KLING-AI-SYS] %c任务成功完成!', 'color: #00ff66; font-weight: bold;', 'color: #e0e0e0;');
                    if (result.videos && result.videos.length > 0) {
                        console.log('%c[KLING-AI-SYS] %c找到生成的视频:', 'color: #00ff66; font-weight: bold;', 'color: #e0e0e0;', result.videos[0].video_url);
                        displayVideo(result.videos[0].video_url);
                        return;
                    } else {
                        console.error('%c[KLING-AI-SYS] %c未找到生成的视频', 'color: #ff3366; font-weight: bold;', 'color: #e0e0e0;');
                        throw new Error('未找到生成的视频');
                    }
                } else if (result.task && result.task.status === 'TASK_STATUS_FAILED') {
                    // 任务失败
                    console.error('%c[KLING-AI-SYS] %c任务失败:', 'color: #ff3366; font-weight: bold;', 'color: #e0e0e0;', result.task.reason || '未知原因');
                    throw new Error(`任务失败: ${result.task.reason || '未知原因'}`);
                } else if (attempts >= maxAttempts) {
                    // 超过最大尝试次数
                    console.error('%c[KLING-AI-SYS] %c生成超时，请稍后再试', 'color: #ff3366; font-weight: bold;', 'color: #e0e0e0;');
                    throw new Error('生成超时，请稍后再试');
                } else {
                    // 继续轮询
                    console.log(`%c[KLING-AI-SYS] %c任务仍在进行中，${pollInterval/1000}秒后再次检查...`, 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;');
                    setTimeout(checkResult, pollInterval);
                }
            } catch (error) {
                console.error('%c[KLING-AI-SYS] %c轮询过程中发生错误:', 'color: #ff3366; font-weight: bold;', 'color: #e0e0e0;', error.message);
                showError(error.message);
            }
        };
        
        // 开始轮询
        await checkResult();
    }

    // 获取任务结果
    async function getTaskResult(taskId) {
        console.log(`%c[KLING-AI-SYS] %c正在获取任务结果，任务ID: ${taskId}`, 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;');
        
        const response = await fetch(`/api/task-result?task_id=${taskId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('%c[KLING-AI-SYS] %c获取任务结果状态:', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;', response.status, response.statusText);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('%c[KLING-AI-SYS] %c获取任务结果失败:', 'color: #ff3366; font-weight: bold;', 'color: #e0e0e0;', errorData);
            throw new Error(`获取结果失败: ${errorData.message || response.statusText || '未知错误'}`);
        }
        
        const result = await response.json();
        console.log('%c[KLING-AI-SYS] %c获取任务结果成功:', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;', result);
        return result;
    }

    // 显示视频
    function displayVideo(videoUrl) {
        // 隐藏加载指示器
        loadingIndicator.classList.add('hidden');
        
        // 创建视频元素
        const video = document.createElement('video');
        video.controls = true;
        video.autoplay = false;
        video.src = videoUrl;
        video.className = 'result-video';
        
        // 清空并添加视频到容器
        videoContainer.innerHTML = '';
        videoContainer.appendChild(video);
        
        // 设置下载按钮
        downloadBtn.disabled = false;
        downloadBtn.onclick = () => downloadVideo(videoUrl);
        
        // 显示结果容器
        resultContainer.classList.remove('hidden');
        
        console.log('%c[KLING-AI-SYS] %c视频已成功加载并显示', 'color: #00ff66; font-weight: bold;', 'color: #e0e0e0;');
    }

    // 下载视频
    function downloadVideo(videoUrl) {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `kling-video-${Date.now()}.mp4`;
        a.target = '_blank';
        a.click();
        
        console.log('%c[KLING-AI-SYS] %c开始下载视频', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;');
    }

    // 显示错误信息
    function showError(message) {
        loadingIndicator.classList.add('hidden');
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
        
        console.error('%c[KLING-AI-SYS] %c显示错误信息:', 'color: #ff3366; font-weight: bold;', 'color: #e0e0e0;', message);
    }

    // 更新进度条
    function updateProgress(percent) {
        progressFill.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
    }

    // 重置UI状态
    function resetUI() {
        loadingIndicator.classList.add('hidden');
        resultContainer.classList.add('hidden');
        errorContainer.classList.add('hidden');
        videoContainer.innerHTML = '';
        downloadBtn.disabled = true;
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
        
        console.log('%c[KLING-AI-SYS] %cUI状态已重置', 'color: #00ffff; font-weight: bold;', 'color: #e0e0e0;');
    }
    
    // 初始化完成
    console.log('%c[KLING-AI-SYS] %c系统初始化完成，等待用户输入...', 'color: #00ff66; font-weight: bold;', 'color: #e0e0e0;');
});