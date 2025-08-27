#!/usr/bin/env python3
"""
简单的API服务器启动脚本
"""

import uvicorn
import sys
import os

# 添加scripts目录到Python路径
scripts_dir = os.path.join(os.path.dirname(__file__), 'scripts')
sys.path.insert(0, scripts_dir)

if __name__ == "__main__":
    # 确保在正确的目录中运行
    os.chdir(os.path.dirname(__file__))
    
    # 启动API服务器
    uvicorn.run(
        "scripts.knowledge_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 