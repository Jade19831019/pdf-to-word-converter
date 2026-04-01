
# Google OAuth 登录集成方案

## 📋 功能设计

### 用户流程
1. 用户点击"使用 Google 登录"按钮
2. 弹出 Google 登录窗口
3. 用户选择账号并授权
4. 登录成功，获取用户信息（姓名、邮箱）
5. 保存登录状态到 localStorage
6. 识别用户身份（免费用户 / 付费会员）

### 页面变化
- 右上角显示用户头像和姓名
- 登录状态持久化（刷新页面不丢失）
- 支持退出登录

---

## 🔧 Google Cloud 控制台配置步骤

### 1. 创建 Google Cloud 项目
1. 访问 https://console.cloud.google.com/
2. 点击右上角"选择项目" → "新建项目"
3. 项目名称：`PDF to Word Converter`
4. 点击"创建"

### 2. 启用 Google Identity API
1. 在左侧菜单 → "API 和服务" → "库"
2. 搜索 "Google Identity API" 或 "Google+ API"（已废弃，用新的）
3. 搜索 "Cloud Identity-Aware Proxy API" 或直接用 "Google Sign-In for Web"
4. 其实最简单的是直接用 **Google Identity Services (GIS)** - 推荐！

### 3. 创建 OAuth 同意屏幕
1. 左侧菜单 → "API 和服务" → "OAuth 同意屏幕"
2. User Type：选择 "External"（外部用户）
3. 点击"创建"
4. 填写应用信息：
   - 应用名称：`PDF to Word Converter`
   - 用户支持电子邮件：你的邮箱
   - 应用首页链接：`https://pdf-to-word.xyz`
   - 应用隐私政策链接：`https://pdf-to-word.xyz/privacy`
   - 授权域名：`pdf-to-word.xyz`
   - 开发者联系信息：你的邮箱
5. 点击"保存并继续"
6. （测试用户阶段）可以添加你的测试邮箱
7. 点击"保存并继续"

### 4. 创建 OAuth 2.0 客户端 ID
1. 左侧菜单 → "API 和服务" → "凭据"
2. 点击"创建凭据" → "OAuth 客户端 ID"
3. 应用类型：选择 "Web 应用"
4. 名称：`PDF to Word Web Client`
5. 已获授权的 JavaScript 来源：
   - `https://pdf-to-word.xyz`
   - `http://localhost:8000`（本地开发用）
6. 已获授权的重定向 URI：
   - `https://pdf-to-word.xyz`
   - `http://localhost:8000`
7. 点击"创建"
8. **重要**：复制你的 "客户端 ID"（Client ID），格式类似：
   `1234567890-abc123def456.apps.googleusercontent.com`

---

## ✅ 代码已完成集成！

### 已实现的功能：
- ✅ Google 登录按钮（使用 Google Identity Services）
- ✅ 用户信息显示（头像、姓名）
- ✅ 登录状态持久化（localStorage）
- ✅ 退出登录功能
- ✅ 会员状态和登录状态结合
- ✅ 用户使用记录关联（登录用户和匿名用户分开计数）

### 需要手动配置：

**1. 修改 index.html 中的 Google Client ID**

找到这一行：
```html
&lt;div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     ...&gt;
&lt;/div&gt;
```

把 `YOUR_GOOGLE_CLIENT_ID` 替换成你从 Google Cloud 控制台拿到的真实 Client ID。

**2. 配置已获授权的 JavaScript 来源**

在 Google Cloud 控制台 → 凭据 → OAuth 2.0 客户端 ID 中，添加：
- `https://pdf-to-word.xyz`
- `http://localhost:8000`（本地测试用）

---

## 🎯 功能特点

- **纯前端实现**：无需后端服务器
- **用户体验好**：Google 官方一键登录
- **状态持久化**：刷新页面不丢失登录状态
- **数据隔离**：登录用户和匿名用户的使用次数分开计数
- **美观界面**：用户头像 + 姓名显示在右上角

---

## 📝 完整功能列表

- [x] Google 登录按钮
- [x] 用户信息显示（头像、姓名、邮箱）
- [x] 登录状态持久化
- [x] 退出登录功能
- [x] 会员状态和登录状态结合
- [x] 用户使用记录关联
