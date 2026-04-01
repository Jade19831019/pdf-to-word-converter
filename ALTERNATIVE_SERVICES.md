
# PDF 转换服务备选方案

## 📊 服务对比

| 服务 | 免费额度 | 价格 | 特点 | 官网 |
|------|---------|------|------|------|
| **ConvertAPI** | 250次/月 | $19/月起 | 简单易用，文档清晰 | https://www.convertapi.com |
| **iLovePDF API** | 250次/月 | $10/月起 | 知名品牌，稳定可靠 | https://developer.ilovepdf.com |
| **CloudConvert** | 25分钟/天 | $9/月起 | 支持格式多，功能强大 | https://cloudconvert.com |
| **Adobe PDF Services API** | 500次/月 | $0.15/次起 | 官方质量最高 | https://developer.adobe.com |

---

## 🔧 iLovePDF API 集成方案

### 优点：
- ✅ 知名品牌，用户信任度高
- ✅ API 简单易用
- ✅ 支持多种 PDF 操作（合并、拆分、压缩等）
- ✅ 免费额度充足（250次/月）

### 缺点：
- ❌ 付费起点比 ConvertAPI 低但功能相对少一些

### 集成代码示例：

```javascript
// iLovePDF API 转换 PDF 到 Word
async function convertWithILovePDF(file) {
    const publicKey = 'YOUR_PUBLIC_KEY';
    
    // 1. 上传文件
    const uploadResponse = await fetch('https://api.ilovepdf.com/v1/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${publicKey}`
        },
        body: file
    });
    
    const uploadData = await uploadResponse.json();
    const serverFilename = uploadData.server_filename;
    
    // 2. 开始转换任务
    const taskResponse = await fetch('https://api.ilovepdf.com/v1/process', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicKey}`
        },
        body: JSON.stringify({
            tool: 'pdf_to_word',
            files: [{
                server_filename: serverFilename,
                filename: file.name
            }]
        })
    });
    
    const taskData = await taskResponse.json();
    const downloadUrl = `https://api.ilovepdf.com/v1/download/${taskData.task}`;
    
    return {
        downloadUrl: downloadUrl,
        fileName: file.name.replace('.pdf', '.docx')
    };
}
```

---

## 🔧 CloudConvert API 集成方案

### 优点：
- ✅ 支持 200+ 格式转换
- ✅ 功能非常强大
- ✅ API 文档完善
- ✅ 按使用量付费灵活

### 缺点：
- ❌ 免费额度是按时间计算（25分钟/天）
- ❌ 配置相对复杂

### 集成代码示例：

```javascript
// CloudConvert API 转换 PDF 到 Word
async function convertWithCloudConvert(file) {
    const apiKey = 'YOUR_API_KEY';
    
    const response = await fetch('https://api.cloudconvert.com/v2/jobs', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tasks: {
                'import-my-file': {
                    operation: 'import/upload'
                },
                'convert-my-file': {
                    operation: 'convert',
                    input: 'import-my-file',
                    input_format: 'pdf',
                    output_format: 'docx',
                    engine: 'office'
                },
                'export-my-file': {
                    operation: 'export/url',
                    input: 'convert-my-file'
                }
            }
        })
    });
    
    const jobData = await response.json();
    
    // 上传文件
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    
    await fetch(jobData.data.tasks.find(t => t.name === 'import-my-file').result.form.url, {
        method: 'POST',
        body: uploadFormData
    });
    
    // 等待任务完成并获取下载链接
    const waitResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobData.data.id}/wait`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });
    
    const finalData = await waitResponse.json();
    const downloadUrl = finalData.data.tasks.find(t => t.name === 'export-my-file').result.files[0].url;
    
    return {
        downloadUrl: downloadUrl,
        fileName: file.name.replace('.pdf', '.docx')
    };
}
```

---

## 🎯 推荐方案

### 当前建议：
1. **先用 ConvertAPI**（已集成，先测试）
2. **iLovePDF 作为主要备选**（稳定性好，用户熟悉）
3. **CloudConvert 作为高级备选**（功能最强大）

### 多服务降级策略：
```javascript
async function convertPDF(file) {
    const services = [
        { name: 'ConvertAPI', fn: convertWithConvertAPI },
        { name: 'iLovePDF', fn: convertWithILovePDF },
        { name: 'CloudConvert', fn: convertWithCloudConvert }
    ];
    
    for (const service of services) {
        try {
            console.log(`尝试使用 ${service.name} 转换...`);
            return await service.fn(file);
        } catch (error) {
            console.warn(`${service.name} 转换失败:`, error);
            // 继续尝试下一个服务
        }
    }
    
    throw new Error('所有转换服务都失败了');
}
```

---

## 📝 下一步行动

1. 测试当前 ConvertAPI 是否正常工作
2. 如果需要，注册 iLovePDF 开发者账号
3. 实现多服务降级策略
4. 添加服务健康检查和状态显示
