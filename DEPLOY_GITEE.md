# Gitee Pages 部署指南

## 第一步：推送到 Gitee 仓库

```powershell
# 进入项目目录
cd C:\Users\82394\.openclaw\workspace\turingquant

# 初始化 Git（如果还没初始化）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Gitee Pages 部署版本"

# 关联 Gitee 仓库（替换为你的仓库地址）
git remote add origin https://gitee.com/<你的用户名>/<你的仓库名>.git

# 推送
git push -u origin main
```

## 第二步：开启 Gitee Pages 服务

1. **访问你的 Gitee 仓库**
   - 打开 https://gitee.com/<你的用户名>/<你的仓库名>

2. **进入 Pages 服务**
   - 点击顶部菜单的 **服务**
   - 点击左侧的 **Gitee Pages**

3. **配置 Pages**
   - **源分支**：选择 `main`（或 `master`）
   - **源路径**：留空（或填 `/`）
   - **构建目录**：留空（Next.js 会构建到根目录）

4. **点击「启动」**
   - 等待约 1-2 分钟构建完成

5. **获得访问地址**
   - 格式：`https://你的用户名.gitee.io/仓库名/`
   - 例如：`https://zhangsan.gitee.io/turingquant/`

## 第三步：后续更新

每次修改代码后：

```powershell
git add .
git commit -m "描述你的更改"
git push
```

然后去 Gitee Pages 页面点击 **更新** 按钮重新构建。

## 注意事项

1. **仓库必须是公开的** — Gitee Pages 要求仓库是 Public
2. **构建需要时间** — 每次推送后约 1-2 分钟完成构建
3. **缓存问题** — 如果更新后没变化，强制刷新浏览器（Ctrl+F5）
4. **API 限制** — 静态页面无法调用需要后端的 API

## 如果遇到问题

### 构建失败
- 检查仓库是否是公开仓库
- 确认推送的是 `main` 或 `master` 分支

### 页面空白
- 打开浏览器控制台查看错误
- 可能需要配置 `basePath`（如果用项目路径访问）

### 访问慢
- Gitee Pages 国内访问应该很快
- 如仍慢，尝试清除 DNS 缓存

---

**构建命令**（本地测试）：
```powershell
npm run build
```

构建产物在 `out/` 目录，Gitee Pages 会自动构建。
