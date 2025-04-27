document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const videoForm = document.getElementById('videoForm');
    const generationTypeSelect = document.getElementById('generationType');
    const modeSelect = document.getElementById('mode');
    const imageInputsContainer = document.getElementById('imageInputs');
    const textInputsContainer = document.getElementById('textInputs');
    const imageUrlInput = document.getElementById('imageUrl');
    const endImageUrlInput = document.getElementById('endImageUrl');
    const textPromptInput = document.getElementById('textPrompt');
    const promptInput = document.getElementById('prompt');
    const promptHelp = document.getElementById('promptHelp');
    const negativePromptInput = document.getElementById('negativePrompt');
    const guidanceScaleInput = document.getElementById('guidanceScale');
    const guidanceScaleValue = document.getElementById('guidanceScaleValue');
    const generateBtn = document.getElementById('generateBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultContainer = document.getElementById('resultContainer');
    const videoContainer = document.getElementById('videoContainer');
    const downloadBtn = document.getElementById('downloadBtn');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    const statusMessage = document.getElementById('statusMessage');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    // 根据生成类型切换输入表单
    function updateFormFields() {
        const isImageToVideo = generationTypeSelect.value === 'image';
        
        // 切换输入容器的显示状态
        imageInputsContainer.classList.toggle('hidden', !isImageToVideo);
        textInputsContainer.classList.toggle('hidden', isImageToVideo);
        
        // 更新提示词帮助文本
        if (isImageToVideo) {
            promptHelp.textContent = '必填，引导生成过程的文本提示';
            imageUrlInput.setAttribute('required', '');
            textPromptInput.removeAttribute('required');
            promptInput.setAttribute('required', '');
        } else {
            promptHelp.textContent = '可选，额外的生成提示';
            imageUrlInput.removeAttribute('required');
            textPromptInput.setAttribute('required', '');
            promptInput.removeAttribute('required');
        }
    }
    
    // 初始化表单字段
    updateFormFields();
    
    // 监听生成类型变化
    generationTypeSelect.addEventListener('change', updateFormFields);

    // 更新引导比例值显示
    guidanceScaleInput.addEventListener('input', () => {
        guidanceScaleValue.textContent = guidanceScaleInput.value;
    });

    // 监听模式变化，控制结束图片输入框的可用性
    modeSelect.addEventListener('change', () => {
        const isProfessional = modeSelect.value === 'Professional';
        endImageUrlInput.disabled = !isProfessional;
        if (!isProfessional) {
            endImageUrlInput.value = '';
        }
    });

    // 表单提交处理
    videoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('开始处理视频生成请求...');
        
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
            console.error('视频生成请求失败:', error.message);
            showError(error.message);
        }
        console.log('视频生成请求处理完成');
    });

    // 创建图片生成视频任务
    async function createImageToVideoTask(data) {
        console.log('发送图片生成视频API请求数据:', JSON.stringify(data));
        
        const response = await fetch('/api/create-video-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('API请求状态:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API请求失败:', errorData);
            throw new Error(`API请求失败: ${errorData.message || response.statusText || '未知错误'}`);
        }
        
        const result = await response.json();
        console.log('API请求成功，返回结果:', result);
        console.log('获取到的任务ID:', result.task_id);
        return result.task_id;
    }
    
    // 创建文字生成视频任务
    async function createTextToVideoTask(data) {
        console.log('发送文字生成视频API请求数据:', JSON.stringify(data));
        
        const response = await fetch('/api/create-text-to-video-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('API请求状态:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API请求失败:', errorData);
            throw new Error(`API请求失败: ${errorData.message || response.statusText || '未知错误'}`);
        }
        
        const result = await response.json();
        console.log('API请求成功，返回结果:', result);
        console.log('获取到的任务ID:', result.task_id);
        return result.task_id;
    }

    // 轮询任务结果
    async function pollTaskResult(taskId) {
        let attempts = 0;
        const maxAttempts = 60; // 最多尝试60次，约10分钟
        const pollInterval = 10000; // 10秒轮询一次
        
        console.log(`开始轮询任务结果，任务ID: ${taskId}，最大尝试次数: ${maxAttempts}，轮询间隔: ${pollInterval}ms`);
        
        const checkResult = async () => {
            attempts++;
            console.log(`轮询尝试次数: ${attempts}/${maxAttempts}`);
            
            try {
                const result = await getTaskResult(taskId);
                
                // 更新进度
                if (result.task && result.task.progress_percent !== undefined) {
                    const progress = result.task.progress_percent;
                    console.log(`任务进度: ${progress}%`);
                    updateProgress(progress);
                }
                
                // 检查任务状态
                console.log('当前任务状态:', result.task ? result.task.status : '未知');
                
                if (result.task && result.task.status === 'TASK_STATUS_SUCCEED') {
                    // 任务成功完成
                    console.log('任务成功完成!');
                    if (result.videos && result.videos.length > 0) {
                        console.log('找到生成的视频:', result.videos[0].video_url);
                        displayVideo(result.videos[0].video_url);
                        return;
                    } else {
                        console.error('未找到生成的视频');
                        throw new Error('未找到生成的视频');
                    }
                } else if (result.task && result.task.status === 'TASK_STATUS_FAILED') {
                    // 任务失败
                    console.error('任务失败:', result.task.reason || '未知原因');
                    throw new Error(`任务失败: ${result.task.reason || '未知原因'}`);
                } else if (attempts >= maxAttempts) {
                    // 超过最大尝试次数
                    console.error('生成超时，请稍后再试');
                    throw new Error('生成超时，请稍后再试');
                } else {
                    // 继续轮询
                    console.log(`任务仍在进行中，${pollInterval/1000}秒后再次检查...`);
                    setTimeout(checkResult, pollInterval);
                }
            } catch (error) {
                console.error('轮询过程中发生错误:', error.message);
                showError(error.message);
            }
        };
        
        // 开始轮询
        await checkResult();
    }

    // 获取任务结果
    async function getTaskResult(taskId) {
        console.log(`正在获取任务结果，任务ID: ${taskId}`);
        
        const response = await fetch(`/api/task-result?task_id=${taskId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('获取任务结果状态:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('获取任务结果失败:', errorData);
            throw new Error(`获取结果失败: ${errorData.message || response.statusText || '未知错误'}`);
        }
        
        const result = await response.json();
        console.log('获取任务结果成功:', result);
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
    }

    // 下载视频
    function downloadVideo(videoUrl) {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `kling-video-${Date.now()}.mp4`;
        a.target = '_blank';
        a.click();
    }

    // 显示错误信息
    function showError(message) {
        loadingIndicator.classList.add('hidden');
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
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
    }
});