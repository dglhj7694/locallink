'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Post, ApiResponse, PageResponse, BOARD_CATEGORY_LABELS, BoardCategory } from '@/types';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const category = (params.category as string)?.toUpperCase() as BoardCategory;
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  const categoryLabel = BOARD_CATEGORY_LABELS[category] || params.category;

  useEffect(() => {
    loadPosts();
  }, [category, page]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<PageResponse<Post>>>('/posts', {
        params: { category, page, size: 20, keyword: keyword || undefined },
      });
      setPosts(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadPosts();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }} className="animate-fade-in">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{categoryLabel}</h1>
        {isAuthenticated && (
          <Link href={`/board/${(params.category as string)}/write`} className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '0.9rem' }}>
            ✏️ 글쓰기
          </Link>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input className="glass-input" placeholder="검색어를 입력하세요" value={keyword}
            onChange={(e) => setKeyword(e.target.value)} style={{ flex: 1 }} />
          <button type="submit" className="btn-secondary" style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>🔍</button>
        </div>
      </form>

      {/* Post List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '16px' }} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-surface-300)' }}>
          아직 게시글이 없습니다. 첫 번째 글을 작성해보세요!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {posts.map((post, index) => (
            <Link
              key={post.id}
              href={`/board/${(params.category as string)}/${post.id}`}
              className="glass-card animate-fade-in"
              style={{
                padding: '20px 24px',
                textDecoration: 'none',
                display: 'block',
                animationDelay: `${index * 0.05}s`,
                opacity: 0,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '1rem', fontWeight: 600, color: 'var(--color-surface-100)',
                    marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{post.title}</h3>
                  <p style={{
                    fontSize: '0.85rem', color: 'var(--color-surface-300)', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{post.content}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', fontSize: '0.8rem', color: 'var(--color-surface-300)' }}>
                    <span style={{ fontWeight: 500 }}>{post.author.nickname}</span>
                    {post.author.neighborhood && <span>📍 {post.author.neighborhood}</span>}
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', flexShrink: 0 }}>
                  {category === 'MARKETPLACE' && post.price != null && (
                    <span style={{ fontWeight: 700, color: 'var(--color-primary-400)', fontSize: '1rem' }}>
                      {post.price.toLocaleString()}원
                    </span>
                  )}
                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: 'var(--color-surface-300)' }}>
                    <span>❤️ {post.likeCount}</span>
                    <span>💬 {post.commentCount}</span>
                    <span>👁️ {post.viewCount}</span>
                  </div>
                </div>
              </div>
              {post.imageUrls?.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  {post.imageUrls.slice(0, 3).map((url, i) => (
                    <div key={i} style={{
                      width: '60px', height: '60px', borderRadius: '8px',
                      background: 'var(--color-surface-800)', overflow: 'hidden',
                    }}>
                      <img src={`http://localhost:8080${url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                  {post.imageUrls.length > 3 && (
                    <div style={{
                      width: '60px', height: '60px', borderRadius: '8px',
                      background: 'var(--color-surface-800)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
                      color: 'var(--color-surface-300)',
                    }}>+{post.imageUrls.length - 3}</div>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)} style={{
              width: '36px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
              background: page === i ? 'var(--color-primary-600)' : 'rgba(30, 41, 59, 0.6)',
              color: page === i ? 'white' : 'var(--color-surface-300)',
            }}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
