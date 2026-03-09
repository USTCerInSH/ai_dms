# TuringQuant - 智能股票分析系统

🚀 AI 驱动的股票行情智能分析平台

## 功能特性

- 📊 实时股票行情展示
- 📈 30 日价格走势图（含 MA5 均线）
- 🎯 智能买卖信号分析
- 📉 **MACD 多周期分析**（15 分钟/60 分钟/日线/周线）
- 🔀 **金叉/死叉信号检测**
- 🌅 **早盘涨跌比例监控**（开盘时 vs 开盘 15 分钟后）
- 💡 技术面解读（支撑/阻力/趋势）
- ⚡ 波动率分析
- 🎨 现代化 UI 设计

## 快速部署

### 双平台部署 (Gitee + GitHub)

详细部署指南请查看 [DEPLOY_GITEE.md](./DEPLOY_GITEE.md)

```bash
# 初始化仓库
cd turingquant
git init
git add .
git commit -m "Initial commit - TuringQuant 量化分析平台"
git branch -M main

# 添加双远程仓库
git remote add github https://github.com/你的用户名/turingquant.git
git remote add gitee https://gitee.com/你的用户名/turingquant.git

# 推送到双平台
git push -u github main
git push -u gitee main
```

### 部署到 Vercel

#### 方法一：GitHub + Vercel（推荐）

1. **创建 GitHub 仓库**（见上方双平台部署）

2. **部署到 Vercel**
   - 访问 https://vercel.com
   - 登录/注册账号
   - 点击 "New Project"
   - 导入你的 GitHub 仓库
   - 项目名称输入：`turingquant`
   - 点击 "Deploy"

3. **完成！**
   - 部署成功后，你的网站地址是：`https://turingquant.vercel.app`
   - 如果名字被占用，Vercel 会自动分配类似 `turingquant-xxx.vercel.app` 的名字

### 方法二：Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 进入项目目录
cd turingquant

# 登录 Vercel
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 技术栈

- Next.js 14 (App Router)
- React 18
- TailwindCSS
- Recharts (图表库)
- Lucide React (图标)

## 数据说明

当前版本使用模拟数据演示。如需接入真实数据，可以：

1. **免费 API 选项**：
   - Alpha Vantage (免费但有限制)
   - Yahoo Finance API (非官方)
   - 雪球 API (需要爬虫)

2. **修改 `app/page.js` 中的 `loadStockData` 函数**，替换为真实 API 调用

## 自定义

- 修改股票代码：在搜索框输入任意 A 股/美股代码
- 调整分析逻辑：编辑 `analyzeStock` 函数
- 更改 UI 主题：编辑 `app/globals.css` 和颜色配置

## 注意事项

⚠️ 本系统仅供学习参考，不构成投资建议。股市有风险，投资需谨慎。

---

Built with ❤️ by 蹦财兔 for 烽哥
