
// PDF to Word 前端逻辑 - 多服务降级版
class PDFToWordConverter {
    constructor() {
        this.selectedFile = null;
        this.isMember = false;
        this.dailyUsage = this.getDailyUsage();
        
        // 转换服务配置 - 支持多服务自动降级
        this.services = [
            {
                id: 'convertapi',
                name: 'ConvertAPI',
                key: 'Xy4IX8NQtXKUAyjezmZ7G1o4rvTH0R8A',
                enabled: true,
                converter: this.convertWithConvertAPI.bind(this)
            }
            // 可以添加更多服务：
            // {
            //     id: 'ilovepdf',
            //     name: 'iLovePDF',
            //     key: 'YOUR_ILOVEPDF_KEY',
            //     enabled: false,
            //     converter: this.convertWithILovePDF.bind(this)
            // },
            // {
            //     id: 'cloudconvert',
            //     name: 'CloudConvert',
            //     key: 'YOUR_CLOUDCONVERT_KEY',
            //     enabled: false,
            //     converter: this.convertWithCloudConvert.bind(this)
            // }
        ];
        
        this.serviceStatus = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateQuotaDisplay();
        this.initPayPal();
        this.initServiceStatus();
    }

    cacheElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.btnUpload = document.getElementById('btnUpload');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.btnRemove = document.getElementById('btnRemove');
        this.quotaInfo = document.getElementById('quotaInfo');
        this.quotaRemaining = document.getElementById('quotaRemaining');
        this.btnUpgrade = document.getElementById('btnUpgrade');
        this.actionArea = document.getElementById('actionArea');
        this.btnConvert = document.getElementById('btnConvert');
        this.resultArea = document.getElementById('resultArea');
        this.btnDownload = document.getElementById('btnDownload');
        this.paypalArea = document.getElementById('paypalArea');
        this.btnCancel = document.getElementById('btnCancel');
    }

    bindEvents() {
        this.uploadArea.addEventListener('click', () =&gt; this.fileInput.click());
        this.btnUpload.addEventListener('click', (e) =&gt; {
            e.stopPropagation();
            this.fileInput.click();
        });
        this.fileInput.addEventListener('change', (e) =&gt; this.handleFileSelect(e));
        this.uploadArea.addEventListener('dragover', (e) =&gt; this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) =&gt; this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) =&gt; this.handleDrop(e));
        this.btnRemove.addEventListener('click', () =&gt; this.removeFile());
        this.btnConvert.addEventListener('click', () =&gt; this.convertFile());
        this.btnUpgrade.addEventListener('click', () =&gt; this.showPayPal());
        this.btnCancel.addEventListener('click', () =&gt; this.hidePayPal());
    }

    initServiceStatus() {
        this.services.forEach(service =&gt; {
            this.serviceStatus[service.id] = {
                lastUsed: null,
                successCount: 0,
                failureCount: 0
            };
        });
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.selectFile(file);
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file &amp;&amp; file.type === 'application/pdf') {
            this.selectFile(file);
        } else {
            alert('请选择PDF文件！');
        }
    }

    selectFile(file) {
        if (file.type !== 'application/pdf') {
            alert('请选择PDF文件！');
            return;
        }

        const maxSize = this.isMember ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size &gt; maxSize) {
            alert(`文件太大！最大支持 ${this.isMember ? '50MB' : '5MB'}。`);
            return;
        }

        this.selectedFile = file;
        this.showFileInfo();
    }

    showFileInfo() {
        this.uploadArea.style.display = 'none';
        this.fileInfo.style.display = 'block';
        this.actionArea.style.display = 'block';
        
        this.fileName.textContent = this.selectedFile.name;
        this.fileSize.textContent = this.formatFileSize(this.selectedFile.size);
        
        this.checkQuota();
    }

    removeFile() {
        this.selectedFile = null;
        this.fileInput.value = '';
        
        this.uploadArea.style.display = 'block';
        this.fileInfo.style.display = 'none';
        this.actionArea.style.display = 'none';
        this.resultArea.style.display = 'none';
    }

    checkQuota() {
        if (this.isMember) {
            this.btnConvert.disabled = false;
            this.quotaRemaining.textContent = '无限使用';
            return;
        }

        if (this.dailyUsage &gt;= 2) {
            this.btnConvert.disabled = true;
            this.quotaRemaining.textContent = '今日次数已用完';
            alert('今日免费转换次数已用完，请升级会员！');
        } else {
            this.btnConvert.disabled = false;
            this.updateQuotaDisplay();
        }
    }

    updateQuotaDisplay() {
        if (this.isMember) {
            this.quotaRemaining.textContent = '无限使用';
        } else {
            const remaining = Math.max(0, 2 - this.dailyUsage);
            this.quotaRemaining.textContent = `${remaining} 次/天剩余`;
        }
    }

    async convertFile() {
        if (!this.selectedFile) return;

        this.btnConvert.disabled = true;
        this.btnConvert.querySelector('.btn-text').style.display = 'none';
        this.btnConvert.querySelector('.btn-loader').style.display = 'inline';

        try {
            // 使用多服务降级策略转换
            const result = await this.convertWithFallback();
            
            if (!this.isMember) {
                this.dailyUsage++;
                this.saveDailyUsage();
                this.updateQuotaDisplay();
            }

            this.showResult(result);
        } catch (error) {
            console.error('所有转换服务都失败:', error);
            alert('转换失败，请稍后重试！\n\n错误信息: ' + error.message);
        } finally {
            this.btnConvert.disabled = false;
            this.btnConvert.querySelector('.btn-text').style.display = 'inline';
            this.btnConvert.querySelector('.btn-loader').style.display = 'none';
        }
    }

    async convertWithFallback() {
        const enabledServices = this.services.filter(s =&gt; s.enabled);
        
        if (enabledServices.length === 0) {
            throw new Error('没有可用的转换服务');
        }

        let lastError = null;
        
        for (const service of enabledServices) {
            try {
                console.log(`尝试使用 ${service.name} 转换...`);
                this.updateButtonText(`正在使用 ${service.name} 转换...`);
                
                const result = await service.converter(this.selectedFile);
                
                this.serviceStatus[service.id].successCount++;
                this.serviceStatus[service.id].lastUsed = Date.now();
                
                console.log(`${service.name} 转换成功！`);
                return result;
                
            } catch (error) {
                console.warn(`${service.name} 转换失败:`, error);
                this.serviceStatus[service.id].failureCount++;
                lastError = error;
                continue;
            }
        }
        
        throw lastError || new Error('所有转换服务都失败了');
    }

    updateButtonText(text) {
        const loader = this.btnConvert.querySelector('.btn-loader');
        if (loader) {
            loader.textContent = text;
        }
    }

    async convertWithConvertAPI(file) {
        const service = this.services.find(s =&gt; s.id === 'convertapi');
        const formData = new FormData();
        formData.append('File', file);
        
        console.log('ConvertAPI: 开始上传文件...');
        
        const response = await fetch(`https://v2.convertapi.com/convert/pdf/to/docx?Secret=${service.key}`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        console.log('ConvertAPI 响应:', result);
        
        if (result.Files &amp;&amp; result.Files.length &gt; 0) {
            return {
                downloadUrl: result.Files[0].Url,
                fileName: result.Files[0].FileName,
                service: 'ConvertAPI'
            };
        } else {
            console.error('ConvertAPI错误:', result);
            throw new Error(result.Message || '转换失败');
        }
    }

    async convertWithILovePDF(file) {
        const service = this.services.find(s =&gt; s.id === 'ilovepdf');
        
        console.log('iLovePDF: 开始转换...');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch('https://api.ilovepdf.com/v1/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${service.key}`
            },
            body: formData
        });
        
        const uploadData = await uploadResponse.json();
        
        const taskResponse = await fetch('https://api.ilovepdf.com/v1/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${service.key}`
            },
            body: JSON.stringify({
                tool: 'pdf_to_word',
                files: [{
                    server_filename: uploadData.server_filename,
                    filename: file.name
                }]
            })
        });
        
        const taskData = await taskResponse.json();
        
        return {
            downloadUrl: `https://api.ilovepdf.com/v1/download/${taskData.task}`,
            fileName: file.name.replace('.pdf', '.docx'),
            service: 'iLovePDF'
        };
    }

    async convertWithCloudConvert(file) {
        const service = this.services.find(s =&gt; s.id === 'cloudconvert');
        
        console.log('CloudConvert: 开始转换...');
        
        const jobResponse = await fetch('https://api.cloudconvert.com/v2/jobs', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${service.key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tasks: {
                    'import': { operation: 'import/upload' },
                    'convert': {
                        operation: 'convert',
                        input: 'import',
                        input_format: 'pdf',
                        output_format: 'docx'
                    },
                    'export': {
                        operation: 'export/url',
                        input: 'convert'
                    }
                }
            })
        });
        
        const jobData = await jobResponse.json();
        const importTask = jobData.data.tasks.find(t =&gt; t.name === 'import');
        
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        
        await fetch(importTask.result.form.url, {
            method: 'POST',
            body: uploadFormData
        });
        
        const waitResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobData.data.id}/wait`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${service.key}`
            }
        });
        
        const finalData = await waitResponse.json();
        const exportTask = finalData.data.tasks.find(t =&gt; t.name === 'export');
        
        return {
            downloadUrl: exportTask.result.files[0].url,
            fileName: file.name.replace('.pdf', '.docx'),
            service: 'CloudConvert'
        };
    }

    showResult(result) {
        console.log('开始显示结果:', result);
        
        this.actionArea.style.display = 'none';
        this.resultArea.style.display = 'block';
        
        const resultArea = document.getElementById('resultArea');
        const successDiv = resultArea.querySelector('.result-success');
        
        const extraLinks = successDiv.querySelectorAll('.extra-download-info');
        extraLinks.forEach(el =&gt; el.remove());
        
        let serviceInfo = '';
        if (result.service) {
            serviceInfo = `&lt;p style="color: #666; font-size: 14px; margin-bottom: 15px;"&gt;由 ${result.service} 提供技术支持&lt;/p&gt;`;
        }
        
        const linkHtml = document.createElement('div');
        linkHtml.className = 'extra-download-info';
        linkHtml.style.marginTop = '20px';
        linkHtml.innerHTML = `
            ${serviceInfo}
            &lt;p style="margin-bottom: 10px;"&gt;如果下载按钮无法下载，请复制下面的链接到浏览器地址栏打开：&lt;/p&gt;
            &lt;p style="background: #f3f4f6; padding: 10px; border-radius: 8px; word-break: break-all; font-size: 12px;"&gt;
                &lt;a href="${result.downloadUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;"&gt;
                    ${result.downloadUrl}
                &lt;/a&gt;
            &lt;/p&gt;
        `;
        successDiv.appendChild(linkHtml);
        
        this.btnDownload.onclick = async () =&gt; {
            try {
                console.log('开始下载文件:', result.downloadUrl);
                window.open(result.downloadUrl, '_blank');
            } catch (error) {
                console.error('下载失败:', error);
                alert('下载失败！请复制页面上的链接到浏览器地址栏直接打开！');
            }
        };
        
        console.log('结果显示完成');
    }

    showPayPal() {
        this.paypalArea.style.display = 'flex';
    }

    hidePayPal() {
        this.paypalArea.style.display = 'none';
    }

    initPayPal() {
        if (typeof paypal !== 'undefined') {
            paypal.Buttons({
                createOrder: (data, actions) =&gt; {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: '4.99',
                                currency_code: 'USD'
                            },
                            description: 'PDF to Word 会员 - 1个月'
                        }]
                    });
                },
                onApprove: async (data, actions) =&gt; {
                    const details = await actions.order.capture();
                    this.activateMembership();
                    this.hidePayPal();
                    alert('支付成功！会员已激活！');
                },
                onError: (err) =&gt; {
                    console.error('PayPal错误:', err);
                    alert('支付失败，请重试！');
                }
            }).render('#paypal-button-container');
        }
    }

    activateMembership() {
        this.isMember = true;
        localStorage.setItem('pdf2word_member', 'true');
        localStorage.setItem('pdf2word_member_since', Date.now());
        this.checkQuota();
    }

    getDailyUsage() {
        const today = new Date().toDateString();
        const stored = localStorage.getItem('pdf2word_usage');
        
        if (stored) {
            const data = JSON.parse(stored);
            if (data.date === today) {
                return data.count || 0;
            }
        }
        return 0;
    }

    saveDailyUsage() {
        const today = new Date().toDateString();
        localStorage.setItem('pdf2word_usage', JSON.stringify({
            date: today,
            count: this.dailyUsage
        }));
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

document.addEventListener('DOMContentLoaded', () =&gt; {
    new PDFToWordConverter();
});
