#!/usr/bin/env python3
"""
多模态知识检索API服务器
提供RESTful API接口用于知识检索
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Union, Any
from contextlib import asynccontextmanager
import uvicorn
import os
import tempfile
from pathlib import Path
import asyncio
import json

# 导入我们的检索模块
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from search_knowledge import MultimodalKnowledgeRetriever

# 全局检索器实例
retriever = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化检索器
    global retriever
    try:
        print("初始化多模态知识检索器...")
        retriever = MultimodalKnowledgeRetriever(
            database_dir="./vector_database",
            model_path="./models/clip-vit-base-patch32",
            device="auto"
        )
        print("检索器初始化完成")
    except Exception as e:
        print(f"检索器初始化失败: {e}")
        raise
    
    yield
    
    # 关闭时清理（如果需要）
    print("正在关闭...")

app = FastAPI(
    title="多模态知识检索API",
    description="基于CLIP模型的多模态向量数据库检索服务",
    version="1.0.0",
    lifespan=lifespan
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js默认端口
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextQueryRequest(BaseModel):
    query: str
    top_k: int = 5
    min_score: float = 0.3
    mode: str = "multimodal"  # text, image, multimodal, rag

class SearchResponse(BaseModel):
    success: bool
    data: Union[Dict, List, Any]  # 允许字典、列表或任何类型
    message: str = ""

class HealthResponse(BaseModel):
    status: str
    database_info: Dict



@app.get("/health", response_model=HealthResponse)
async def health_check():
    """健康检查接口"""
    if retriever is None:
        raise HTTPException(status_code=503, detail="检索器未初始化")
    
    return HealthResponse(
        status="healthy",
        database_info={
            "text_count": len(retriever.text_metadata),
            "image_count": len(retriever.image_metadata),
            "embedding_dim": retriever.config.get("embedding_dim", 0)
        }
    )

@app.post("/search/text", response_model=SearchResponse)
async def search_text_endpoint(request: TextQueryRequest):
    """文本搜索接口"""
    if retriever is None:
        raise HTTPException(status_code=503, detail="检索器未初始化")
    
    try:
        print(f"收到搜索请求 - 查询: {request.query}, 模式: {request.mode}, top_k: {request.top_k}")
        
        if request.mode == "text":
            raw_results = retriever.search_text(request.query, request.top_k, request.min_score)
            results = {
                "query": request.query,
                "mode": "text",
                "results": raw_results,
                "total_count": len(raw_results)
            }
        elif request.mode == "image":
            raw_results = retriever.search_images(request.query, request.top_k, request.min_score)
            results = {
                "query": request.query,
                "mode": "image", 
                "results": raw_results,
                "total_count": len(raw_results)
            }
        elif request.mode == "multimodal":
            raw_results = retriever.multimodal_search(request.query, request.top_k)
            results = raw_results  # multimodal_search已经返回字典格式
        elif request.mode == "rag":
            results = retriever.generate_rag_context(request.query)
        else:
            raise HTTPException(status_code=400, detail="不支持的搜索模式")
        
        print(f"搜索完成 - 结果类型: {type(results)}")
        
        # 确保results是可序列化的
        if results is None:
            results = {"message": "未找到结果", "results": [], "total_count": 0}
        
        return SearchResponse(
            success=True,
            data=results,
            message="搜索完成"
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"搜索错误详情: {error_trace}")
        raise HTTPException(status_code=500, detail=f"搜索失败: {str(e)}")

@app.post("/search/image", response_model=SearchResponse)
async def search_by_image_endpoint(
    file: UploadFile = File(...),
    top_k: int = Form(5),
    min_score: float = Form(0.3)
):
    """图片搜索接口"""
    if retriever is None:
        raise HTTPException(status_code=503, detail="检索器未初始化")
    
    # 检查文件类型
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="请上传图片文件")
    
    try:
        # 保存临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # 执行图片搜索
            image_results, text_results = retriever.search_by_image(
                temp_file_path, top_k, min_score
            )
            
            results = {
                "query_image": file.filename,
                "similar_images": image_results,
                "related_texts": text_results
            }
            
            return SearchResponse(
                success=True,
                data=results,
                message="图片搜索完成"
            )
        finally:
            # 清理临时文件
            os.unlink(temp_file_path)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"图片搜索失败: {str(e)}")

@app.get("/search/chapters")
async def get_chapters():
    """获取所有章节信息"""
    if retriever is None:
        raise HTTPException(status_code=503, detail="检索器未初始化")
    
    try:
        chapters = {}
        
        # 从文本元数据中提取章节信息
        for item in retriever.text_metadata:
            chapter_num = item['chapter_number']
            if chapter_num not in chapters:
                chapters[chapter_num] = {
                    'chapter_number': chapter_num,
                    'chapter_name': item['chapter_name'],
                    'text_chunks': 0,
                    'images': 0
                }
            chapters[chapter_num]['text_chunks'] += 1
        
        # 从图片元数据中提取章节信息
        for item in retriever.image_metadata:
            chapter_num = item['chapter_number']
            if chapter_num in chapters:
                chapters[chapter_num]['images'] += 1
        
        return SearchResponse(
            success=True,
            data={
                "chapters": list(chapters.values()),
                "total_chapters": len(chapters)
            },
            message="章节信息获取成功"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取章节信息失败: {str(e)}")

@app.get("/search/chapter/{chapter_number}")
async def get_chapter_content(chapter_number: int):
    """获取特定章节的内容"""
    if retriever is None:
        raise HTTPException(status_code=503, detail="检索器未初始化")
    
    try:
        # 获取该章节的文本内容
        chapter_texts = [
            item for item in retriever.text_metadata 
            if item['chapter_number'] == chapter_number
        ]
        
        # 获取该章节的图片
        chapter_images = [
            item for item in retriever.image_metadata 
            if item['chapter_number'] == chapter_number
        ]
        
        if not chapter_texts and not chapter_images:
            raise HTTPException(status_code=404, detail="章节不存在")
        
        chapter_name = chapter_texts[0]['chapter_name'] if chapter_texts else chapter_images[0]['chapter_name']
        
        return SearchResponse(
            success=True,
            data={
                "chapter_number": chapter_number,
                "chapter_name": chapter_name,
                "texts": chapter_texts,
                "images": chapter_images,
                "stats": {
                    "text_chunks": len(chapter_texts),
                    "image_count": len(chapter_images)
                }
            },
            message="章节内容获取成功"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取章节内容失败: {str(e)}")

@app.post("/rag/generate")
async def generate_rag_response(request: TextQueryRequest):
    """生成RAG响应（准备用于LLM）"""
    if retriever is None:
        raise HTTPException(status_code=503, detail="检索器未初始化")
    
    try:
        # 获取RAG上下文
        context = retriever.generate_rag_context(request.query, max_context_length=2000)
        
        # 构建RAG提示
        system_prompt = """你是一个专业的设计历史专家。请基于提供的知识库内容回答用户的问题。

知识库内容包含以下信息：
"""
        
        # 添加文本上下文
        if context['text_context']:
            system_prompt += "\n相关文本内容：\n"
            for i, text_item in enumerate(context['text_context'], 1):
                system_prompt += f"{i}. 来源：{text_item['source']}\n内容：{text_item['content']}\n\n"
        
        # 添加图片上下文
        if context['image_context']:
            system_prompt += "\n相关图片：\n"
            for i, img_item in enumerate(context['image_context'], 1):
                system_prompt += f"{i}. 图片：{img_item['image_url']}\n描述：{img_item['description']}\n来源：{img_item['source']}\n\n"
        
        system_prompt += """
请基于以上知识库内容回答用户的问题。如果知识库中没有相关信息，请说明无法找到相关内容。
请确保回答准确、详细且有帮助。
"""
        
        rag_data = {
            "system_prompt": system_prompt,
            "user_query": request.query,
            "context": context,
            "sources": []
        }
        
        # 收集来源信息
        sources = set()
        for text_item in context['text_context']:
            sources.add(text_item['source'])
        for img_item in context['image_context']:
            sources.add(img_item['source'])
        rag_data['sources'] = list(sources)
        
        return SearchResponse(
            success=True,
            data=rag_data,
            message="RAG上下文生成完成"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG生成失败: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "knowledge_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 