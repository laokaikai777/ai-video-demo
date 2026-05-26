# AI视频导演台 — 项目说明

## 项目概述
将专业影视前期制作流程（编剧→导演→服化道→音乐→分镜）变成 AI 协作界面。
目标：融资级别正式产品，面向创作人和艺术家。

## 文件位置
- 主文件：`index.html`（单文件 HTML+Tailwind+Vanilla JS）
- 配置文件：`4/` 目录（v7.0.10.1，5 步工作流定义）
- 后端 API：`api/generate.js` + `lib/prompts.js`

## 后端
- URL：`https://ai-video-demo-psi.vercel.app/api/generate`
- 5 个 action：`write` `direct` `design` `music` `storyboard`
- 模型：`claude-sonnet-4-6`（通过 cloud.hongqiye.com 代理）
- Vercel 免费版 60s 超时，每个 action 单独调用（20-40s）

## 前端
- `https://laokaikai777.github.io/ai-video-demo/`
- 深色主题，金色点缀（ink #070a10，gold #b8945f）
- 三栏 wizard 布局：进度条 | 阶段卡片 | 资产面板
- 5 步状态机，用户每步确认后才进下一步
- 路径 B：上传剧本可跳过编剧步骤

## 部署
- GitHub 仓库：`laokaikai777/ai-video-demo`
- git push 常被 GFW 阻断，备选方案是用户通过 GitHub 网页手动上传文件
- 用户是代码小白，所有部署指引需逐步骤、不假设先验知识

## 中国大陆注意事项
- 优先用国内 CDN 镜像（cdn.jsdelivr.net, unpkg.com, cdn.bootcdn.net）
- 避免引用被墙的资源
