# 🚀 Vercel 部署指南

## ⚠️ 重要：创建 Admin 账号

### 使用 Supabase Auth 认证

Frank-spreadsheet 使用 Supabase Auth 进行管理员认证，不需要配置环境变量或 API 路由。

### 步骤 1: 在 Supabase 创建管理员账号

1. 登录 Supabase Dashboard: https://app.supabase.com
2. 选择你的项目：`xqlzhvfqibkgdgcycnel`
3. 进入 **Authentication** → **Users**
4. 点击 **Add User** → **Create new user**
5. 填写信息：
   ```
   Email: admin@yourproject.com
   Password: <设置一个强密码>
   ✅ Auto Confirm User (自动确认用户)
   ```
6. 点击 **Create User**

### 步骤 2: 验证部署

1. 访问 `https://frank-spreadsheet.vercel.app/admin`
2. 输入创建的 Email 和 Password
3. 应该能成功登录 ✨

## 🐛 常见问题

### 1. 登录失败 "Invalid login credentials"
```
原因: Email 或密码不正确
解决: 
1. 检查 Supabase → Authentication → Users 确认账号已创建
2. 确认 Email 和密码拼写正确
3. 尝试在 Supabase 重置密码
```

### 2. 无法创建用户
```
原因: Email 验证设置问题
解决: 
1. Supabase → Authentication → Settings
2. 关闭 "Enable email confirmations"
3. 或创建用户时勾选 "Auto Confirm User"
```

### 3. 登录后立即退出
```
原因: Session 问题
解决: 清除浏览器缓存和 Local Storage 后重试
```

## 🔒 安全建议

1. **使用强密码**：至少 12 位，包含大小写字母、数字和特殊字符
2. **限制管理员账号**：只创建必要的管理员账号
3. **定期审查**：定期检查 Supabase → Authentication → Users 中的账号
4. **HTTPS only**：确保生产环境使用 HTTPS

## 📚 相关文档

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

**部署日期**: 2025-11-07  
**项目**: Frank-spreadsheet  
**框架**: Vue 3 + Vite

