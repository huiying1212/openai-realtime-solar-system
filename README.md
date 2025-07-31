# Realtime AI Teaching Whiteboard

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![NextJS](https://img.shields.io/badge/Built_with-NextJS-blue)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)

这是一个基于 [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime) 的智能教学白板工具，能够通过语音实时生成结构化的教学内容展示。

该工具使用 [Realtime + WebRTC integration](https://platform.openai.com/docs/guides/realtime-webrtc) 实现语音交互，并通过 [Function Calling](https://platform.openai.com/docs/guides/realtime-model-capabilities#function-calling) 触发白板内容的动态生成和组织。

![screenshot](./public/screenshot.jpg)

## 功能特点

### 🎤 语音驱动的内容生成
- 通过自然语音输入自动生成结构化内容
- 实时语音识别和内容组织
- 支持多种内容格式（标题、副标题、要点、段落、重点标注）

### 📊 智能数据可视化
- 自动识别数值数据并生成图表
- 支持柱状图和饼图展示
- 实时图表生成和展示

### 📝 动态白板功能
- 清晰的内容层次结构
- 实时内容添加和排版
- 分节管理和内容组织
- 响应式布局设计

## 使用方法

### 运行应用

1. **设置 OpenAI API：**

   - 如果您是 OpenAI API 新用户，请[注册账户](https://platform.openai.com/signup)
   - 按照[快速开始指南](https://platform.openai.com/docs/quickstart)获取您的 API 密钥

2. **克隆项目：**

   ```bash
   git clone https://github.com/openai/openai-realtime-whiteboard-teaching.git
   ```

3. **设置 API 密钥：**

   有两种方式：

   - 在系统中[全局设置](https://platform.openai.com/docs/quickstart#create-and-export-an-api-key) `OPENAI_API_KEY` 环境变量
   - 在项目中设置环境变量：
     在项目根目录创建 `.env` 文件并添加：
     ```bash
     OPENAI_API_KEY=<your_api_key>
     ```

4. **安装依赖：**

   进入项目目录并运行：

   ```bash
   npm install
   ```

5. **运行应用：**

   ```bash
   npm run dev
   ```

   应用将在 [http://localhost:3000](http://localhost:3000) 启动。

### 开始教学会话

1. 等待页面加载完成（首次加载可能需要几秒钟）
2. 点击右上角的WiFi图标开始新的会话
3. 图标变绿后，即可开始语音教学
4. 使用麦克风图标控制录音开关
5. 点击WiFi图标可停止会话并重置对话

## 使用示例

### 配置的交互功能

白板工具会根据您的语音内容自动：

📝 **内容组织** - 将您的讲解自动格式化为结构化内容：
- 主要话题 → 标题格式
- 子话题 → 副标题格式  
- 关键点 → 要点列表格式
- 详细解释 → 段落格式
- 重要信息 → 高亮显示

📊 **数据可视化** - 当您提到数据时自动生成图表：
- 比较数据 → 柱状图
- 比例分布 → 饼图

🗂️ **内容管理** - 智能管理教学内容：
- 自动创建新章节
- 清理白板内容
- 维护内容层次结构

### 教学示例流程

以下是一个典型的教学场景：

1. 说："今天我们来学习人工智能基础" → 自动创建标题
2. 说："人工智能有三个主要分支" → 自动创建副标题
3. 说："机器学习、深度学习、强化学习" → 自动创建要点列表
4. 提供具体数据："机器学习占AI应用的60%，深度学习30%，强化学习10%" → 自动生成饼图
5. 说："现在我们开始新的章节" → 自动创建新分节
6. 说："清空白板" → 清理所有内容

## 自定义配置

您可以通过修改以下文件来自定义工具行为：

- `lib/config.ts` - 修改AI指令和工具定义
- `lib/constants.ts` - 修改[语音设置](https://platform.openai.com/docs/api-reference/realtime-sessions/create#realtime-sessions-create-voice)
- `components/whiteboard.tsx` - 自定义白板样式和布局

### 工具配置

当前支持的工具包括：

1. **add_content** - 添加结构化内容到白板
2. **display_data** - 显示数据图表
3. **clear_whiteboard** - 清空白板
4. **create_section** - 创建新章节

您可以在 `lib/config.ts` 中添加新的工具或修改现有工具的行为。

## 技术架构

- **前端框架**: Next.js 15 + React 19 + TypeScript
- **样式**: Tailwind CSS
- **图表**: Chart.js + Recharts
- **语音交互**: OpenAI Realtime API + WebRTC
- **图标**: Lucide React

## 许可证

本项目采用 MIT 许可证。详情请参阅 LICENSE 文件。
