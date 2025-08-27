'use client';

import React, { useState, useCallback } from 'react';
import { Search, Upload, Image, FileText, Loader2, AlertCircle } from 'lucide-react';

interface TextResult {
  chapter_number: number;
  chapter_name: string;
  chunk_id: number;
  text: string;
  type: 'text';
  similarity_score: number;
  weighted_score?: number;
}

interface ImageResult {
  chapter_number: number;
  chapter_name: string;
  image_id: number;
  image_url: string;
  image_description: string;
  image_path: string;
  type: 'image';
  similarity_score: number;
  weighted_score?: number;
}

interface SearchResults {
  query: string;
  text_results?: TextResult[];
  image_results?: ImageResult[];
  combined_results?: (TextResult | ImageResult)[];
  total_results?: number;
}

interface RAGContext {
  query: string;
  text_context: Array<{
    content: string;
    source: string;
    similarity: number;
  }>;
  image_context: Array<{
    image_url: string;
    description: string;
    source: string;
    similarity: number;
  }>;
  context_stats: {
    text_chunks: number;
    total_text_length: number;
    related_images: number;
  };
}

const KnowledgeSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'text' | 'image' | 'multimodal' | 'rag'>('multimodal');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [ragContext, setRagContext] = useState<RAGContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const API_BASE = 'http://localhost:8000';

  const handleTextSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/search/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          top_k: 10,
          min_score: 0.2,
          mode: searchMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`搜索失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (searchMode === 'rag') {
          setRagContext(data.data);
          setResults(null);
        } else {
          // 处理新的响应格式
          const responseData = data.data;
          if (responseData.mode === 'text') {
            setResults({
              query: responseData.query,
              text_results: responseData.results,
              total_results: responseData.total_count
            });
          } else if (responseData.mode === 'image') {
            setResults({
              query: responseData.query,
              image_results: responseData.results,
              total_results: responseData.total_count
            });
          } else {
            // multimodal格式保持不变
            setResults(responseData);
          }
          setRagContext(null);
        }
      } else {
        throw new Error(data.message || '搜索失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索过程中发生错误');
    } finally {
      setLoading(false);
    }
  }, [query, searchMode]);

  const handleImageSearch = useCallback(async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('top_k', '10');
      formData.append('min_score', '0.2');

      const response = await fetch(`${API_BASE}/search/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`图片搜索失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResults({
          query: `图片搜索: ${selectedFile.name}`,
          image_results: data.data.similar_images,
          text_results: data.data.related_texts,
        });
        setRagContext(null);
      } else {
        throw new Error(data.message || '图片搜索失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片搜索过程中发生错误');
    } finally {
      setLoading(false);
    }
  }, [selectedFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    }
  };

  const renderTextResult = (result: TextResult, index: number) => (
    <div key={`text-${index}`} className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center text-blue-600">
          <FileText className="w-4 h-4 mr-2" />
          <span className="font-semibold">Chapter {result.chapter_number}: {result.chapter_name}</span>
        </div>
        <span className="text-sm text-gray-500">
          相似度: {(result.similarity_score * 100).toFixed(1)}%
        </span>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">
        {result.text.length > 300 ? `${result.text.substring(0, 300)}...` : result.text}
      </p>
    </div>
  );

  const renderImageResult = (result: ImageResult, index: number) => (
    <div key={`image-${index}`} className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center text-green-600">
          <Image className="w-4 h-4 mr-2" />
          <span className="font-semibold">Chapter {result.chapter_number}: {result.chapter_name}</span>
        </div>
        <span className="text-sm text-gray-500">
          相似度: {(result.similarity_score * 100).toFixed(1)}%
        </span>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <img 
          src={`/example-structuredDATA/images/${result.image_url}`}
          alt={result.image_description}
          className="w-full md:w-48 h-32 object-cover rounded-lg"
          onError={(e) => {
            console.log(`图片加载失败: ${result.image_url}`);
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEzMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+aXoOazleWKoOi9vTwvdGV4dD48L3N2Zz4=';
          }}
        />
        <p className="text-gray-700 text-sm flex-1">
          {result.image_description}
        </p>
      </div>
    </div>
  );

  const renderRAGContext = (context: RAGContext) => (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-purple-800 mb-4">RAG 上下文分析</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{context.context_stats.text_chunks}</div>
          <div className="text-sm text-gray-600">相关文本片段</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{context.context_stats.related_images}</div>
          <div className="text-sm text-gray-600">相关图片</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{context.context_stats.total_text_length}</div>
          <div className="text-sm text-gray-600">上下文字符数</div>
        </div>
      </div>

      {context.text_context.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">相关文本内容</h4>
          <div className="space-y-3">
            {context.text_context.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-600">{item.source}</span>
                  <span className="text-xs text-gray-500">匹配度: {(item.similarity * 100).toFixed(1)}%</span>
                </div>
                <p className="text-sm text-gray-700">
                  {item.content.length > 200 ? `${item.content.substring(0, 200)}...` : item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {context.image_context.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">相关图片</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {context.image_context.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-green-600">{item.source}</span>
                  <span className="text-xs text-gray-500">匹配度: {(item.similarity * 100).toFixed(1)}%</span>
                </div>
                <img 
                  src={`/example-structuredDATA/images/${item.image_url}`}
                  alt={item.description}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                  onError={(e) => {
                    console.log(`RAG图片加载失败: ${item.image_url}`);
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEzMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+aXoOazleWKoOi9vTwvdGV4dD48L3N2Zz4=';
                  }}
                />
                <p className="text-sm text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">多模态知识检索</h2>
        
        {/* 搜索模式选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">搜索模式</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'text', label: '文本搜索', icon: FileText },
              { value: 'image', label: '图片搜索', icon: Image },
              { value: 'multimodal', label: '多模态搜索', icon: Search },
              { value: 'rag', label: 'RAG上下文', icon: AlertCircle },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSearchMode(value as any)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchMode === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 文本搜索输入 */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入搜索关键词..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
            />
            <button
              onClick={handleTextSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 图片上传 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">或上传图片进行搜索</label>
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleImageSearch}
              disabled={loading || !selectedFile}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            </button>
          </div>
          {selectedFile && (
            <p className="text-sm text-gray-600 mt-2">已选择: {selectedFile.name}</p>
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="font-medium">错误:</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}
      </div>

      {/* 搜索结果 */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600 mt-2">正在搜索...</p>
        </div>
      )}

      {/* RAG上下文结果 */}
      {ragContext && !loading && (
        <div className="mb-8">
          {renderRAGContext(ragContext)}
        </div>
      )}

      {/* 搜索结果 */}
      {results && !loading && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            搜索结果 ({results.total_results || (results.text_results?.length || 0) + (results.image_results?.length || 0)} 个)
          </h3>
          
          {/* 综合结果 */}
          {results.combined_results && (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-700 mb-3">综合结果</h4>
              {results.combined_results.map((result, index) => 
                result.type === 'text' 
                  ? renderTextResult(result as TextResult, index)
                  : renderImageResult(result as ImageResult, index)
              )}
            </div>
          )}

          {/* 分类结果 */}
          {!results.combined_results && (
            <>
              {results.text_results && results.text_results.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-700 mb-3">文本结果</h4>
                  {results.text_results.map(renderTextResult)}
                </div>
              )}

              {results.image_results && results.image_results.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-700 mb-3">图片结果</h4>
                  {results.image_results.map(renderImageResult)}
                </div>
              )}
            </>
          )}

          {(!results.text_results?.length && !results.image_results?.length && !results.combined_results?.length) && (
            <div className="text-center py-12">
              <p className="text-gray-500">未找到相关结果</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeSearch; 