// PDF to Word 前端逻辑
class PDFToWordConverter {
    constructor() {
        this.selectedFile = null;
        this.isMember = false;
        this.dailyUsage = this.getDailyUsage();
        this.convertApiKey = 'YOUR_CONVERT_API_KEY'; // 需要替换
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateQuotaDisplay();
        this.initPayPal();
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
        // 上传区域点击
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.btnUpload.addEventListener('click', (e) => {
            e.stopPropagation();
            this.fileInput.click();
        });

        // 文件选择
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // 拖拽上传
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // 移除文件
        this.btnRemove.addEventListener('click', () => this.removeFile());

        // 转换按钮
        this.btnConvert.addEventListener('click', () => this.convertFile());

        // 升级会员
        this.btnUpgrade.addEventListener('click', () => this.showPayPal());
        this.btnCancel.addEventListener('click', () => this.hidePayPal());
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

        // 检查文件大小
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
            // 使用ConvertAPI转换
            const result = await this.convertWithConvertAPI();
            
            // 增加使用次数
            if (!this.isMember) {
                this.dailyUsage++;
                this.saveDailyUsage();
                this.updateQuotaDisplay();
            }

            // 显示结果
            this.showResult(result);
        } catch (error) {
            console.error('转换失败:', error);
            alert('转换失败，请重试！');
        } finally {
            this.btnConvert.disabled = false;
            this.btnConvert.querySelector('.btn-text').style.display = 'inline';
            this.btnConvert.querySelector('.btn-loader').style.display = 'none';
        }
    }

    async convertWithConvertAPI() {
        // 这里需要配置ConvertAPI
        // 暂时用模拟，实际需要替换为真实API调用
        return new Promise((resolve) => {
            setTimeout(() => {
                // 模拟返回下载URL
                resolve({
                    downloadUrl: '#',
                    fileName: this.selectedFile.name.replace('.pdf', '.docx')
                });
            }, 2000);
        });
    }

    showResult(result) {
        this.actionArea.style.display = 'none';
        this.resultArea.style.display = 'block';
        
        this.btnDownload.onclick = () => {
            // 实际项目中这里会下载真实文件
            alert('下载功能需要配置真实的ConvertAPI！');
        };
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new PDFToWordConverter();
});
