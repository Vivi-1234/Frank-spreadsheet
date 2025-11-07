# 🚀 Vercel 部署指南

## ⚠️ 重要：环境变量配置

在 Vercel 部署后，必须配置以下环境变量才能使 Admin 登录正常工作：

### 步骤 1: 登录 Vercel Dashboard
```
https://vercel.com/dashboard
```

### 步骤 2: 进入项目设置
```
1. 选择 Frank-spreadsheet 项目
2. 点击 Settings
3. 选择 Environment Variables
```

### 步骤 3: 添加环境变量

#### 必需的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `ADMIN_PASSWORD` | Admin 登录密码 | `your-secure-password` |
| `SUPABASE_JWT_SECRET` | Supabase JWT 密钥 | 从 Supabase Dashboard 获取 |

#### 如何获取 Supabase JWT Secret

1. 登录 Supabase Dashboard: https://app.supabase.com
2. 选择你的项目
3. 进入 Settings → API
4. 找到 **JWT Secret** 部分
5. 复制 `JWT Secret` 值

### 步骤 4: 设置环境变量

在 Vercel Environment Variables 页面：

```
Name: ADMIN_PASSWORD
Value: <你的管理员密码>
Environment: Production, Preview, Development
✅ Save
```

```
Name: SUPABASE_JWT_SECRET  
Value: <从 Supabase 复制的 JWT Secret>
Environment: Production, Preview, Development
✅ Save
```

### 步骤 5: 重新部署

设置完环境变量后，必须重新部署：

```
Deployments → 最新的 Deployment → ... → Redeploy
```

或者推送一个新的 commit 触发自动部署。

## ✅ 验证部署

部署完成后：

1. 访问 `https://your-domain.vercel.app/admin`
2. 输入你设置的 `ADMIN_PASSWORD`
3. 应该能成功登录 ✨

## 🐛 常见问题

### 1. 登录返回 500 错误
```
原因: 环境变量未设置或设置错误
解决: 检查 Vercel 环境变量是否正确配置
```

### 2. 登录返回 401 错误
```
原因: 密码不正确
解决: 确认输入的密码与 ADMIN_PASSWORD 一致
```

### 3. JWT Secret 错误
```
原因: SUPABASE_JWT_SECRET 不正确
解决: 重新从 Supabase Dashboard 复制正确的 JWT Secret
```

## 📝 本地开发

本地开发时，在项目根目录创建 `.env` 文件：

```bash
ADMIN_PASSWORD=your-password
SUPABASE_JWT_SECRET=your-jwt-secret
```

**注意**: `.env` 文件不会被提交到 Git（已在 .gitignore 中）

## 🔒 安全建议

1. **使用强密码**：Admin 密码至少 12 位，包含大小写字母、数字和特殊字符
2. **定期更换**：定期更换 Admin 密码
3. **不要分享**：不要在公开场合分享 JWT Secret
4. **HTTPS only**：确保生产环境使用 HTTPS

## 📚 相关文档

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

**部署日期**: 2025-11-07  
**项目**: Frank-spreadsheet  
**框架**: Vue 3 + Vite

