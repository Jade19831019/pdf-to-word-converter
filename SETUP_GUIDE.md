
# PDF to Word - 完整配置指南

## 📋 部署检查清单

- [ ] 1. Cloudflare Pages 部署
- [ ] 2. Cloudflare Workers（可选，用于后端）
- [ ] 3. ConvertAPI 密钥配置
- [ ] 4. PayPal 应用创建和配置
- [ ] 5. 域名绑定（pdf-to-word.xyz）
- [ ] 6. Google OAuth（可选，二期功能）
- [ ] 7. 测试完整流程

---

## 💰 PayPal 配置步骤

### 1. 创建 PayPal 开发者账号

1. 访问 https://developer.paypal.com/
2. 登录或注册账号
3. 进入 "Dashboard" → "My Apps &amp; Credentials"

### 2. 创建 REST API 应用

1. 点击 "Create App"
2. 填写应用名称：`PDF to Word Converter`
3. 选择商户账号
4. 点击 "Create App"

### 3. 获取 Client ID

在应用详情页，你会看到：
- **Sandbox**（测试环境）Client ID
- **Live**（生产环境）Client ID

### 4. 配置到项目

编辑 `index.html`，找到：
```html
&lt;script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&amp;currency=USD"&gt;&lt;/script&gt;
```

将 `YOUR_PAYPAL_CLIENT_ID` 替换为你的真实 Client ID。

### 5. 配置 Webhook（可选但推荐）

用于接收支付成功通知：
1. 在 PayPal 开发者后台 → "Webhooks"
2. 添加 Webhook URL：`https://pdf-to-word.xyz/api/paypal-webhook`
3. 选择事件：`CHECKOUT.ORDER.APPROVED`

---

## 🔑 ConvertAPI 配置

### 当前状态：
✅ 已配置密钥：`Xy4IX8NQtXKUAyjezmZ7G1o4rvTH0R8A`

### 管理后台：
访问 https://www.convertapi.com/dashboard 查看使用量和续费。

---

## 🌐 域名配置（pdf-to-word.xyz）

### Cloudflare Nameservers：
已配置完成！

### 绑定到 Cloudflare Pages：
1. 进入 Cloudflare Pages 项目设置
2. "Custom domains" → "Set up a custom domain"
3. 输入 `pdf-to-word.xyz`
4. 按照提示配置 DNS 记录

---

## 🔐 Google OAuth 配置（二期功能）

### 步骤：
1. 访问 https://console.cloud.google.com/
2. 创建新项目
3. 启用 "Google Identity API"
4. 创建 OAuth 2.0 客户端 ID
5. 配置授权重定向 URI
6. 获取 Client ID 和 Client Secret

---

## 🧪 测试流程

### 免费用户测试：
1. 打开网站
2. 上传 PDF 文件（&lt;5MB）
3. 点击"开始转换"
4. 验证是否成功转换并下载
5. 测试 2 次免费额度限制

### 付费会员测试（Sandbox）：
1. 点击"升级会员"
2. 使用 PayPal 沙箱账号测试支付
3. 验证支付成功后会员状态更新
4. 测试无限转换功能

---

## 📊 监控和维护

### 使用量监控：
- ConvertAPI：https://www.convertapi.com/dashboard
- Cloudflare：https://dash.cloudflare.com/
- PayPal：https://www.paypal.com/businessmanage/activity

### 成本监控：
- ConvertAPI 免费额度：250次/月
- Cloudflare 免费额度：充足
- PayPal 手续费：2.9% + $0.30/笔

---

## 🚀 上线前最后检查

- [ ] 所有链接可访问
- [ ] 转换功能正常工作
- [ ] PayPal 支付流程测试通过
- [ ] 移动端适配正常
- [ ] 页面加载速度 &lt;3秒
- [ ] 错误提示友好清晰
- [ ] 隐私政策和服务条款页面（可选）

---

**配置完成！可以上线啦！🎉**
