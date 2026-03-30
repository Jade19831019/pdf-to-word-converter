# PDF to Word - Cloudflare 完整配置指南

## 📋 已完成配置

✅ Cloudflare API Token: 已配置
✅ Cloudflare Account ID: 96e986a523a0b7b83584132878d5aae3
✅ GitHub仓库: https://github.com/Jade19831019/pdf-to-word-converter
✅ Cloudflare Pages: https://pdf-to-word-converter-8m7.pages.dev

---

## 🔧 下一步配置

### 1. Cloudflare Pages GitHub 集成（需要在Cloudflare Dashboard操作）

#### 步骤：
1. 访问 https://dash.cloudflare.com/
2. 进入 **Workers & Pages** → **Pages**
3. 选择你的项目 `pdf-to-word-converter-8m7`
4. 点击 **Settings** → **Builds & deployments**
5. 找到 **Git** 部分
6. 点击 **Connect to Git**
7. 选择 GitHub 仓库：`Jade19831019/pdf-to-word-converter`
8. 配置构建设置：
   - **Build command:** (留空)
   - **Build output directory:** (留空)
9. 点击 **Save and Deploy**

---

### 2. 创建 Cloudflare KV 命名空间（需要在Cloudflare Dashboard操作）

#### 步骤：
1. 访问 https://dash.cloudflare.com/
2. 进入 **Workers & Pages** → **KV**
3. 点击 **Create namespace**
4. 命名空间名称：`USERS_KV`
5. 点击 **Add**
6. 创建完成后，复制命名空间的 **ID**

#### 更新 wrangler.toml：
将创建的KV命名空间ID替换到 `wrangler.toml` 中：
```toml
[[kv_namespaces]]
binding = "USERS_KV"
id = "你的KV命名空间ID"
```

---

### 3. 部署 Cloudflare Workers

#### 步骤（在本地执行）：
```bash
cd pdf-to-word
wrangler deploy
```

---

### 4. 配置环境变量（在Cloudflare Dashboard）

进入 Cloudflare Pages 项目设置：
- **Settings** → **Environment variables**

添加以下变量：
```
CONVERT_API_KEY = 你的ConvertAPI密钥
PAYPAL_CLIENT_ID = 你的PayPal客户端ID
PAYPAL_CLIENT_SECRET = 你的PayPal客户端密钥
```

---

## 📝 ConvertAPI 注册

1. 访问 https://www.convertapi.com/
2. 注册免费账户
3. 获取 API Secret Key
4. 替换到环境变量和代码中

---

## 💳 PayPal 配置

1. 访问 https://developer.paypal.com/
2. 创建应用获取 Client ID 和 Secret
3. 配置 Webhook（可选）

---

## 🚀 完整部署流程

1. ✅ 完成 GitHub 集成（Cloudflare Dashboard）
2. ✅ 创建 KV 命名空间（Cloudflare Dashboard）
3. ✅ 更新 wrangler.toml（本地）
4. ✅ 部署 Workers（本地）
5. ✅ 配置环境变量（Cloudflare Dashboard）
6. ✅ 注册 ConvertAPI
7. ✅ 配置 PayPal
8. ✅ 测试完整功能

---

## 📞 需要帮助？

按照以上步骤操作，遇到问题随时问我！
