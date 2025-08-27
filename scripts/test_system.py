#!/usr/bin/env python3
"""
系统测试脚本 - 验证多模态向量数据库系统
"""

import os
import json
import time
import requests
from pathlib import Path

def test_environment():
    """测试环境是否正确配置"""
    print("1. 测试环境配置...")
    
    # 检查必要目录
    required_dirs = [
        "./models/clip-vit-base-patch32",
        "./public/example-structuredDATA",
        "./vector_database"
    ]
    
    for dir_path in required_dirs:
        if os.path.exists(dir_path):
            print(f"✓ 目录存在: {dir_path}")
        else:
            print(f"✗ 目录缺失: {dir_path}")
            return False
    
    return True

def test_vector_database():
    """测试向量数据库"""
    print("\n2. 测试向量数据库...")
    
    db_files = [
        "./vector_database/text_index.faiss",
        "./vector_database/image_index.faiss",
        "./vector_database/text_metadata.pkl",
        "./vector_database/image_metadata.pkl",
        "./vector_database/database_config.json"
    ]
    
    all_exist = True
    for file_path in db_files:
        if os.path.exists(file_path):
            print(f"✓ 数据库文件: {file_path}")
        else:
            print(f"✗ 文件缺失: {file_path}")
            all_exist = False
    
    if all_exist:
        # 读取配置信息
        try:
            with open("./vector_database/database_config.json", 'r') as f:
                config = json.load(f)
            print(f"✓ 文本片段数量: {config.get('text_count', 0)}")
            print(f"✓ 图片数量: {config.get('image_count', 0)}")
            print(f"✓ 嵌入维度: {config.get('embedding_dim', 0)}")
        except Exception as e:
            print(f"✗ 配置文件读取错误: {e}")
            return False
    
    return all_exist

def test_model_loading():
    """测试模型加载"""
    print("\n3. 测试模型加载...")
    
    try:
        from search_knowledge import MultimodalKnowledgeRetriever
        
        print("正在加载检索器...")
        retriever = MultimodalKnowledgeRetriever()
        
        print(f"✓ 文本数据: {len(retriever.text_metadata)} 条")
        print(f"✓ 图片数据: {len(retriever.image_metadata)} 条")
        
        return True
    except ImportError as e:
        print(f"✗ 导入错误: {e}")
        return False
    except Exception as e:
        print(f"✗ 模型加载错误: {e}")
        return False

def test_search_functionality():
    """测试搜索功能"""
    print("\n4. 测试搜索功能...")
    
    try:
        from search_knowledge import MultimodalKnowledgeRetriever
        
        retriever = MultimodalKnowledgeRetriever()
        
        # 测试文本搜索
        print("测试文本搜索...")
        text_results = retriever.search_text("design", top_k=3)
        print(f"✓ 文本搜索结果: {len(text_results)} 条")
        
        # 测试图片搜索
        print("测试图片搜索...")
        image_results = retriever.search_images("design", top_k=3)
        print(f"✓ 图片搜索结果: {len(image_results)} 条")
        
        # 测试多模态搜索
        print("测试多模态搜索...")
        multimodal_results = retriever.multimodal_search("modern design", top_k=5)
        print(f"✓ 综合搜索结果: {multimodal_results.get('total_results', 0)} 条")
        
        # 测试RAG上下文生成
        print("测试RAG上下文生成...")
        rag_context = retriever.generate_rag_context("postmodern architecture")
        print(f"✓ RAG文本片段: {rag_context['context_stats']['text_chunks']} 条")
        print(f"✓ RAG相关图片: {rag_context['context_stats']['related_images']} 张")
        
        return True
    except Exception as e:
        print(f"✗ 搜索功能测试失败: {e}")
        return False

def test_api_server():
    """测试API服务器"""
    print("\n5. 测试API服务器...")
    
    api_base = "http://localhost:8000"
    
    # 测试健康检查
    try:
        response = requests.get(f"{api_base}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ API服务器健康状态: {data.get('status')}")
            db_info = data.get('database_info', {})
            print(f"✓ API文本数据: {db_info.get('text_count', 0)} 条")
            print(f"✓ API图片数据: {db_info.get('image_count', 0)} 条")
        else:
            print(f"✗ API健康检查失败: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ API服务器连接失败: {e}")
        print("提示: 请确保API服务器正在运行 (python scripts/knowledge_api.py)")
        return False
    
    # 测试文本搜索API
    try:
        search_data = {
            "query": "design history",
            "mode": "multimodal",
            "top_k": 3
        }
        response = requests.post(f"{api_base}/search/text", json=search_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✓ 文本搜索API正常")
            else:
                print(f"✗ 文本搜索API返回错误: {data.get('message')}")
                return False
        else:
            print(f"✗ 文本搜索API失败: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ 文本搜索API测试失败: {e}")
        return False
    
    return True

def main():
    print("开始系统测试...")
    print("=" * 50)
    
    tests = [
        ("环境配置", test_environment),
        ("向量数据库", test_vector_database),
        ("模型加载", test_model_loading),
        ("搜索功能", test_search_functionality),
        ("API服务器", test_api_server)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            if test_func():
                print(f"✓ {test_name} 测试通过")
                passed += 1
            else:
                print(f"✗ {test_name} 测试失败")
        except Exception as e:
            print(f"✗ {test_name} 测试异常: {e}")
    
    print("\n" + "=" * 50)
    print(f"测试完成: {passed}/{total} 通过")
    
    if passed == total:
        print("🎉 所有测试通过！系统运行正常。")
        print("\n快速开始:")
        print("1. 访问 http://localhost:3000/knowledge 使用Web界面")
        print("2. 或使用API: curl http://localhost:8000/health")
    else:
        print("⚠️  部分测试失败，请检查相关组件。")
        print("\n故障排除:")
        if passed < 3:
            print("- 运行 'python scripts/setup.py' 检查环境")
            print("- 运行 'python scripts/build_vector_database.py' 构建数据库")
        if passed >= 3 and passed < 5:
            print("- 运行 'python scripts/knowledge_api.py' 启动API服务器")

if __name__ == "__main__":
    main() 