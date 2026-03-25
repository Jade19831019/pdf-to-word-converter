# PDF to Word Converter

一个简单、快速、经济的PDF转Word在线工具，部署在Cloudflare上。

## ✨ 功能

- 📄 PDF上传（拖拽/点击）
- 🔄 一键转换为Word (.docx)
- 📥 下载转换结果
- 🎁 免费用户：2次/天
- ⭐ 付费会员：$4.99/月，无限使用
- 💳 PayPal支付集成

## 🚀 快速部署

### 1. 部署到Cloudflare Pages

1. Fork这个仓库
2. 打开 [Cloudflare Pages](https://pages.cloudflare.com)
3. 创建新项目，连接你的GitHub仓库
4. 部署！

### 2. 配置Cloudflare Workers

1. 安装Wrangler：`npm install -g wrangler`
2. 登录：`wrangler login`
3. 创建KV命名空间：`wrangler kv:namespace create USERS_KV`
4. 更新 `wrangler.toml` 中的KV ID
5. 部署：`wrangler deploy`

### 3. 配置API密钥

在Cloudflare Pages环境变量中设置：
- `CONVERT_API_KEY`：你的ConvertAPI密钥
- `PAYPAL_CLIENT_ID`：你的PayPal Client ID

## 💰 定价

| 用户类型 | 价格 | 配额 |
|----------|------|------|
| 免费用户 | $0 | 2次/天，5MB/文件 |
| 付费会员 | $4.99/月 | 无限，50MB/文件 |

## 🛠️ 技术栈

- **前端：** HTML + CSS + JavaScript
- **托管：** Cloudflare Pages
- **后端：** Cloudflare Workers
- **数据库：** Cloudflare KV
- **PDF转换：** ConvertAPI
- **支付：** PayPal

## 📝 开发

```bash
# 本地预览
# 使用任何HTTP服务器，比如：
python -m http.server 8000
# 然后打开 http://localhost:8000
```

## 🎉 上线检查清单

- [ ] Cloudflare Pages 部署成功
- [ ] Cloudflare Workers 部署成功
- [ ] KV命名空间配置完成
- [ ] ConvertAPI 密钥配置
- [ ] PayPal 应用创建并配置
- [ ] 测试免费用户转换
- [ ] 测试支付流程
- [ ] 测试会员功能
- [ ] 域名绑定（可选）

## 📄 License

MIT

---

**Made with ❤️ on Cloudflare**
