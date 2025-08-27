# 多模态知识检索系统

基于本地CLIP模型的多模态向量数据库，支持文本和图片的语义搜索，为智能导师系统提供强大的RAG检索能力。

## 系统特性

- 🔍 **多模态搜索**: 支持文本到文本、文本到图片、图片到图片的跨模态检索
- 🏠 **本地化部署**: 完全基于本地CLIP模型，保护数据隐私
- ⚡ **高效向量检索**: 使用FAISS进行快速相似度搜索
- 🤖 **RAG支持**: 为大语言模型提供相关的上下文信息
- 🎨 **现代化界面**: 基于Next.js和React的美观用户界面

## 项目结构

```
├── models/
│   └── clip-vit-base-patch32/     # 本地CLIP模型文件
├── public/
│   └── example-structuredDATA/    # 知识库数据
│       ├── content.json           # 文本内容
│       ├── image.json             # 图片元数据
│       └── images/                # 图片文件
├── scripts/
│   ├── build_vector_database.py  # 构建向量数据库
│   ├── search_knowledge.py       # 知识检索模块
│   ├── knowledge_api.py           # FastAPI服务器
│   └── setup.py                  # 环境检查脚本
├── components/
│   └── KnowledgeSearch.tsx       # React搜索组件
├── app/
│   └── knowledge/
│       └── page.tsx              # 知识检索页面
├── vector_database/              # 向量数据库存储目录
└── requirements.txt              # Python依赖
```

## 安装和设置

### 1. 安装Python依赖

```bash
pip install -r requirements.txt
```

### 2. 环境检查

运行设置脚本检查环境：

```bash
python scripts/setup.py
```

### 3. 构建向量数据库

```bash
python scripts/build_vector_database.py
```

这将：
- 加载本地CLIP模型
- 处理文本数据，分割为语义片段
- 为所有图片生成向量嵌入
- 创建FAISS索引用于快速检索
- 保存向量数据库到 `vector_database/` 目录

### 4. 启动API服务器

```bash
cd scripts
python knowledge_api.py
```

API服务器将在 `http://localhost:8000` 启动。

### 5. 启动Next.js开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000/knowledge` 使用知识检索界面。

## 使用方法

### Web界面

1. **文本搜索**: 输入关键词搜索相关的文本内容和图片
2. **图片搜索**: 上传图片找到相似的图片和相关文本
3. **多模态搜索**: 综合文本和图片结果
4. **RAG上下文**: 生成用于大语言模型的上下文信息

### API接口

#### 文本搜索
```bash
curl -X POST "http://localhost:8000/search/text" \
     -H "Content-Type: application/json" \
     -d '{"query": "设计历史", "mode": "multimodal", "top_k": 5}'
```

#### 图片搜索
```bash
curl -X POST "http://localhost:8000/search/image" \
     -F "file=@image.jpg" \
     -F "top_k=5"
```

#### RAG上下文生成
```bash
curl -X POST "http://localhost:8000/rag/generate" \
     -H "Content-Type: application/json" \
     -d '{"query": "后现代主义设计", "mode": "rag"}'
```

#### 健康检查
```bash
curl "http://localhost:8000/health"
```

### 命令行工具

#### 直接搜索
```bash
python scripts/search_knowledge.py --query "现代主义设计" --mode multimodal
```

#### 搜索并保存结果
```bash
python scripts/search_knowledge.py --query "包豪斯" --mode rag --output results.json
```

## 技术架构

### 核心组件

1. **CLIP模型**: 多模态编码器，将文本和图片映射到同一向量空间
2. **FAISS**: 高效的向量相似度搜索库
3. **FastAPI**: 提供RESTful API接口
4. **React**: 现代化的用户界面

### 数据流程

```
输入查询 → CLIP编码 → FAISS检索 → 结果排序 → 返回相关内容
```

### 向量数据库

- **文本索引**: 存储文本片段的向量嵌入
- **图片索引**: 存储图片的向量嵌入
- **元数据**: 包含章节信息、描述等结构化数据

## 配置选项

### 数据库构建参数

- `--data_dir`: 知识库数据目录（默认：`./public/example-structuredDATA`）
- `--output_dir`: 向量数据库输出目录（默认：`./vector_database`）
- `--model_path`: CLIP模型路径（默认：`./models/clip-vit-base-patch32`）
- `--device`: 计算设备（`auto`, `cuda`, `cpu`）

### 搜索参数

- `top_k`: 返回结果数量（默认：5）
- `min_score`: 最小相似度阈值（默认：0.3）
- `text_weight`: 文本结果权重（默认：0.6）
- `image_weight`: 图片结果权重（默认：0.4）

## 性能优化

### 硬件建议

- **GPU**: 建议使用支持CUDA的GPU加速模型推理
- **内存**: 至少8GB RAM用于加载模型和数据
- **存储**: SSD硬盘提高数据读取速度

### 优化技巧

1. **批处理**: 调整batch_size参数平衡内存使用和速度
2. **缓存**: API服务器会缓存模型，避免重复加载
3. **并行处理**: 多进程处理大量数据时提高效率

## 故障排除

### 常见问题

1. **模型加载失败**
   - 检查CLIP模型文件是否完整
   - 确认模型路径正确

2. **FAISS索引错误**
   - 确保有足够的磁盘空间
   - 检查向量维度是否匹配

3. **API连接失败**
   - 确认API服务器正在运行
   - 检查端口是否被占用

4. **搜索结果为空**
   - 降低相似度阈值
   - 检查知识库数据是否正确加载

### 日志和调试

启用详细日志：
```bash
PYTHONPATH=. python scripts/knowledge_api.py --log-level debug
```

## 扩展和定制

### 添加新的知识库

1. 准备数据文件（content.json, image.json）
2. 将图片文件放在images目录
3. 重新构建向量数据库

### 集成其他模型

可以替换CLIP模型为其他多模态模型：
- ALIGN
- BLIP
- Chinese-CLIP

### 自定义评分算法

修改`search_knowledge.py`中的相似度计算逻辑。

## 贡献和支持

本项目基于开源技术栈构建，欢迎贡献代码和反馈问题。

### 相关项目

- [OpenAI CLIP](https://github.com/openai/CLIP)
- [Hugging Face Transformers](https://github.com/huggingface/transformers)
- [FAISS](https://github.com/facebookresearch/faiss)
- [FastAPI](https://fastapi.tiangolo.com/)

---

**注意**: 此系统设计用于教育和研究目的，请确保遵循相关的数据使用政策和版权法规。 