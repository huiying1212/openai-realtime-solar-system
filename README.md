# 智能助教系统 - AI Intelligent Tutor

基于OpenAI Realtime API的智能助教系统，通过语音交互和智能白板为学生提供个性化的学习体验。

## 功能特点

- **实时语音交互**: 支持自然语言语音对话，学生可以直接提问
- **智能白板**: 实时展示教学内容，包括文本、图表、列表等多种形式
- **多媒体展示**: 支持条形图、饼图、折线图等数据可视化
- **同步教学**: 语音讲解与视觉展示同步进行，提升学习效果
- **自适应内容**: 根据学生问题动态生成教学内容

## 技术栈

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS
- **图表**: Chart.js + react-chartjs-2
- **AI**: OpenAI Realtime API
- **实时通信**: WebRTC

## 开始使用

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

创建 `.env` 文件并添加 OpenAI API 密钥：

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 运行开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用方法

1. **连接会话**: 点击"连接"按钮启动AI助教会话
2. **语音交互**: 点击麦克风按钮开始说话，向AI助教提问
3. **查看白板**: AI助教会在白板上实时展示相关教学内容
4. **持续学习**: 可以继续提问，AI会根据问题更新白板内容

## 白板功能

- **文本展示**: 显示概念解释、定义等文本内容
- **列表展示**: 展示要点、步骤等结构化信息
- **图表展示**: 
  - 条形图：用于数据对比
  - 饼图：用于比例分布
  - 折线图：用于趋势展示
- **内容高亮**: 突出显示重要概念
- **清空白板**: 切换话题时自动清理内容

## AI助教能力

- 回答各学科问题
- 提供概念解释和定义
- 生成图表和数据可视化
- 分步骤讲解复杂概念
- 提供学习建议和指导

## 项目结构

```
├── app/
│   ├── api/session/     # OpenAI会话管理API
│   ├── layout.tsx       # 应用布局
│   └── page.tsx         # 主页面
├── components/
│   ├── app.tsx          # 主应用组件
│   ├── whiteboard.tsx   # 智能白板组件
│   ├── controls.tsx     # 控制面板
│   └── logs.tsx         # 日志显示
├── lib/
│   ├── config.ts        # AI配置和工具定义
│   └── constants.ts     # 常量配置
└── public/              # 静态资源
```

## 开发指南

### 添加新的白板内容类型

1. 在 `components/whiteboard.tsx` 中添加新的内容渲染逻辑
2. 在 `lib/config.ts` 中更新工具定义
3. 在AI指令中添加相应的使用说明

### 自定义AI行为

修改 `lib/config.ts` 中的 `INSTRUCTIONS` 常量来调整AI助教的行为和教学风格。

## 部署

```bash
npm run build
npm start
```

## 许可证

MIT License
