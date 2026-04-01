
// PDF to Word 前端逻辑 - 最终修复版
let converter = null;

// 先定义全局回调函数，确保 Google SDK 能找到
window.handleGoogleLogin = function(response) {
    console.log('Google 登录全局回调触发:', response);
    if (converter) {
        converter.handleGoogleResponse(response);
    } else {
        console.error('Converter 未初始化');
    }
};

class PDFToWordConverter {
    constructor() {
        this.selectedFile = null;
        this.isMember = false;
        this.dailyUsage = this.getDailyUsage();
        this.user = this.getUser();
        
        this.services = [
            {
                id: 'convertapi',
                name: 'ConvertAPI',
                key: 'secret_TlCaots3K4kAaqve',
                enabled: true,
                converter: this.convertWithConvertAPI.bind(this)
            }
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
        this.initGoogleLogin();
        this.updateUserUI();
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
        this.userArea = document.getElementById('userArea');
        this.loginArea = document.getElementById('loginArea');
        this.userAvatar = document.getElementById('userAvatar');
        this.userName = document.getElementById('userName');
        this.btnLogout = document.getElementById('btnLogout');
    }

    bindEvents() {
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.btnUpload.addEventListener('click', (e) => {
            e.stopPropagation();
            this.fileInput.click();
        });
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.btnRemove.addEventListener('click', () => this.removeFile());
        this.btnConvert.addEventListener('click', () => this.convertFile());
        this.btnUpgrade.addEventListener('click', () => this.showPayPal());
        this.btnCancel.addEventListener('click', () => this.hidePayPal());
        this.btnLogout.addEventListener('click', () => this.logout());
    }

    initGoogleLogin() {
        console.log('Google 登录初始化完成');
    }

    handleGoogleResponse(response) {
        console.log('Google 登录成功:', response);
        
        try {
            const payload = this.decodeJwt(response.credential);
            console.log('用户信息:', payload);
            
            this.user = {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                loginTime: Date.now()
            };
            
            this.saveUser();
            this.updateUserUI();
            this.migrateUsageToUser();
            
        } catch (error) {
            console.error('解析 Google 登录信息失败:', error);
            alert('登录失败，请重试！');
        }
    }

    decodeJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    updateUserUI() {
        if (this.user) {
            this.loginArea.style.display = 'none';
            this.userArea.style.display = 'flex';
            this.userAvatar.src = this.user.picture;
            this.userName.textContent = this.user.name;
        } else {
            this.loginArea.style.display = 'block';
            this.userArea.style.display = 'none';
        }
    }

    logout() {
        this.user = null;
        localStorage.removeItem('pdf2word_user');
        this.updateUserUI();
        console.log('已退出登录');
    }

    saveUser() {
        localStorage.setItem('pdf2word_user', JSON.stringify(this.user));
    }

    getUser() {
        const stored = localStorage.getItem('pdf2word_user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    migrateUsageToUser() {
        const anonymousUsage = this.getDailyUsage();
        if (anonymousUsage > 0 && this.user) {
            console.log('迁移匿名用户使用记录到登录用户');
        }
    }

    initServiceStatus() {
        this.services.forEach(service => {
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
        if (file && file.type === 'application/pdf') {
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
        if (file.size > maxSize) {
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

        if (this.dailyUsage >= 2) {
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
            const result = await this.convertWithFallback();
            
            if (!this.isMember) {
                this.dailyUsage++;
                this.saveDailyUsage();
                this.updateQuotaDisplay();
            }

            this.showResult(result);
        } catch (error) {
            console.error('所有转换服务都失败:', error);
            alert('转换失败！\n\n详细错误信息:\n' + JSON.stringify(error, null, 2));
        } finally {
            this.btnConvert.disabled = false;
            this.btnConvert.querySelector('.btn-text').style.display = 'inline';
            this.btnConvert.querySelector('.btn-loader').style.display = 'none';
        }
    }

    async convertWithFallback() {
        const enabledServices = this.services.filter(s => s.enabled);
        
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
        const service = this.services.find(s => s.id === 'convertapi');
        const formData = new FormData();
        formData.append('File', file);
        
        console.log('ConvertAPI: 开始上传文件...');
        
        const response = await fetch(`https://v2.convertapi.com/convert/pdf/to/docx?Secret=${service.key}`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        console.log('ConvertAPI 完整响应:', JSON.stringify(result, null, 2));
        
        let downloadUrl = null;
        let fileName = null;
        
        if (result.Files && result.Files.length > 0) {
            const fileInfo = result.Files[0];
            
            console.log('FileInfo 对象:', JSON.stringify(fileInfo, null, 2));
            
            downloadUrl = fileInfo.Url || fileInfo.url || fileInfo.DownloadUrl || fileInfo.downloadUrl;
            fileName = fileInfo.FileName || fileInfo.fileName || fileInfo.Filename || fileInfo.filename;
            
            if (!downloadUrl && fileInfo.Id) {
                downloadUrl = `https://v2.convertapi.com/d/${fileInfo.Id}`;
            }
            
            if (!downloadUrl && fileInfo.id) {
                downloadUrl = `https://v2.convertapi.com/d/${fileInfo.id}`;
            }
        }
        
        if (!downloadUrl) {
            console.error('无法找到下载链接，完整响应:', result);
            throw new Error('转换成功但无法获取下载链接，请查看控制台日志');
        }
        
        if (!fileName) {
            fileName = file.name.replace('.pdf', '.docx');
        }
        
        console.log('提取到的下载链接:', downloadUrl);
        console.log('提取到的文件名:', fileName);
        
        return {
            downloadUrl: downloadUrl,
            fileName: fileName,
            service: 'ConvertAPI'
        };
    }

    showResult(result) {
        console.log('开始显示结果:', result);
        
        this.actionArea.style.display = 'none';
        this.resultArea.style.display = 'block';
        
        const resultArea = document.getElementById('resultArea');
        const successDiv = resultArea.querySelector('.result-success');
        
        const extraLinks = successDiv.querySelectorAll('.extra-download-info');
        extraLinks.forEach(el => el.remove());
        
        let serviceInfo = '';
        if (result.service) {
            serviceInfo = `<p style="color: #666; font-size: 14px; margin-bottom: 15px;">由 ${result.service} 提供技术支持</p>`;
        }
        
        const linkHtml = document.createElement('div');
        linkHtml.className = 'extra-download-info';
        linkHtml.style.marginTop = '20px';
        linkHtml.innerHTML = `
            ${serviceInfo}
            <p style="margin-bottom: 10px;">如果下载按钮无法下载，请复制下面的链接到浏览器地址栏打开：</p>
            <p style="background: #f3f4f6; padding: 10px; border-radius: 8px; word-break: break-all; font-size: 12px;">
                <a href="${result.downloadUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;">
                    ${result.downloadUrl}
                </a>
            </p>
        `;
        successDiv.appendChild(linkHtml);
        
        this.btnDownload.onclick = async () => {
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
                createOrder: (data, actions) => {
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
                onApprove: async (data, actions) => {
                    const details = await actions.order.capture();
                    this.activateMembership();
                    this.hidePayPal();
                    alert('支付成功！会员已激活！');
                },
                onError: (err) => {
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
        
        if (this.user) {
            localStorage.setItem(`pdf2word_member_${this.user.id}`, 'true');
        }
        
        this.checkQuota();
    }

    getDailyUsage() {
        const today = new Date().toDateString();
        let key = 'pdf2word_usage';
        
        if (this.user) {
            key = `pdf2word_usage_${this.user.id}`;
        }
        
        const stored = localStorage.getItem(key);
        
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
        let key = 'pdf2word_usage';
        
        if (this.user) {
            key = `pdf2word_usage_${this.user.id}`;
        }
        
        localStorage.setItem(key, JSON.stringify({
            date: today,
            count: this.dailyUsage
        }));
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i).toFixed(2)) + ' ' + sizes[i];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    converter = new PDFToWordConverter();
});
