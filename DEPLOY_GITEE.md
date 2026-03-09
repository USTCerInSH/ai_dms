# 双平台部署指南 (Gitee + GitHub)

## Git 远程仓库配置

### 初始化仓库
```bash
cd turingquant
git init
git add .
git commit -m "Initial commit - TuringQuant 量化分析平台"
```

### 添加双远程仓库

**注意**：先在 GitHub 和 Gitee 上创建空仓库，然后再执行以下命令。

```bash
# 添加 GitHub 远程（先创建仓库）
git remote add github https://github.com/你的用户名/turingquant.git

# 添加 Gitee 远程
git remote add gitee https://gitee.com/你的用户名/turingquant.git
```

**当前配置**：
- `origin` → Gitee: https://gitee.com/turingquant/ai-dms.git
- `github` → GitHub: https://github.com/fengge82394/turingquant.git (需手动创建)

### 推送到双平台
```bash
# 推送到 GitHub
git push -u github main

# 推送到 Gitee
git push -u gitee main
```

### 一键同步双平台 (可选)
创建 `.git/config` 配置或使用别名：

```bash
# 在 .git/config 中添加
[remote "all"]
    url = https://github.com/你的用户名/turingquant.git
    url = https://gitee.com/你的用户名/turingquant.git

# 然后使用
git push all main
```

### 常用命令
```bash
# 查看远程仓库
git remote -v

# 从 GitHub 拉取
git pull github main

# 从 Gitee 拉取
git pull gitee main

# 推送到双平台
git push github main && git push gitee main
```

## 平台选择建议

- **Gitee**: 国内访问速度快，适合国内用户
- **GitHub**: 国际社区活跃，适合开源协作
- **双平台**: 最佳实践，兼顾速度和国际化

## 自动化同步 (可选)

创建 `sync.sh` 脚本：
```bash
#!/bin/bash
git push github main
git push gitee main
echo "✓ 已同步到 GitHub 和 Gitee"
```
