'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Post, Comment as CommentType, ApiResponse } from '@/types';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPost(); loadComments(); }, [params.id]);

  const loadPost = async () => {
    try {
      const res = await api.get<ApiResponse<Post>>(`/posts/${params.id}`);
      setPost(res.data.data);
    } catch { router.push('/'); } finally { setLoading(false); }
  };

  const loadComments = async () => {
    try {
      const res = await api.get<ApiResponse<CommentType[]>>(`/posts/${params.id}/comments`);
      setComments(res.data.data);
    } catch {}
  };

  const handleLike = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    const res = await api.post<ApiResponse<{ liked: boolean }>>(`/posts/${params.id}/like`);
    setPost(prev => prev ? { ...prev, liked: res.data.data.liked, likeCount: res.data.data.liked ? prev.likeCount + 1 : prev.likeCount - 1 } : null);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await api.post(`/posts/${params.id}/comments`, { content: commentText, parentId: replyTo });
    setCommentText(''); setReplyTo(null); loadComments();
    setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
  };

  const handleDelete = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    await api.delete(`/posts/${params.id}`);
    router.push(`/board/${params.category}`);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--color-surface-300)' }}>로딩 중...</div>;
  if (!post) return null;

  const renderComment = (c: CommentType, depth = 0) => (
    <div key={c.id} style={{ marginLeft: depth > 0 ? '24px' : 0, marginBottom: '12px' }}>
      <div style={{ padding: '16px', borderRadius: '12px', background: depth > 0 ? 'rgba(15,23,42,0.4)' : 'rgba(30,41,59,0.4)', border: '1px solid rgba(148,163,184,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>{c.author.nickname.charAt(0).toUpperCase()}</div>
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.author.nickname}</span>
            <span style={{ color: 'var(--color-surface-300)', fontSize: '0.75rem' }}>{fmt(c.createdAt)}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isAuthenticated && <button onClick={() => setReplyTo(c.id)} style={{ background: 'none', border: 'none', color: 'var(--color-primary-400)', cursor: 'pointer', fontSize: '0.8rem' }}>답글</button>}
            {user?.id === c.author.id && <button onClick={async () => { await api.delete(`/posts/comments/${c.id}`); loadComments(); }} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '0.8rem' }}>삭제</button>}
          </div>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-surface-200)', lineHeight: 1.6 }}>{c.content}</p>
      </div>
      {c.children?.map(child => renderComment(child, depth + 1))}
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <article className="glass-card animate-fade-in" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: 'white' }}>{post.author.nickname.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 600 }}>{post.author.nickname}</div>
            <div style={{ color: 'var(--color-surface-300)', fontSize: '0.8rem' }}>{post.author.neighborhood && `📍 ${post.author.neighborhood} · `}{fmt(post.createdAt)}</div>
          </div>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>{post.title}</h1>
        {post.category === 'MARKETPLACE' && post.price != null && (
          <div style={{ padding: '12px 20px', borderRadius: '12px', marginBottom: '20px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-primary-400)' }}>{post.price.toLocaleString()}원</span>
            <span className={`badge ${post.tradeStatus === 'SELLING' ? 'badge-success' : 'badge-warning'}`}>{post.tradeStatus === 'SELLING' ? '판매중' : post.tradeStatus === 'RESERVED' ? '예약중' : '판매완료'}</span>
          </div>
        )}
        {post.imageUrls?.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
            {post.imageUrls.map((url, i) => <img key={i} src={`http://localhost:8080${url}`} alt="" style={{ height: '200px', borderRadius: '12px', objectFit: 'cover' }} />)}
          </div>
        )}
        <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--color-surface-200)', whiteSpace: 'pre-wrap', marginBottom: '24px' }}>{post.content}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(148,163,184,0.1)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: post.liked ? 'rgba(239,68,68,0.15)' : 'rgba(30,41,59,0.6)', color: post.liked ? '#f87171' : 'var(--color-surface-300)' }}>{post.liked ? '❤️' : '🤍'} {post.likeCount}</button>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', color: 'var(--color-surface-300)', fontSize: '0.9rem' }}>💬 {post.commentCount}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', color: 'var(--color-surface-300)', fontSize: '0.9rem' }}>👁️ {post.viewCount}</span>
          </div>
          {user?.id === post.author.id && <button onClick={handleDelete} className="btn-danger">삭제</button>}
        </div>
      </article>

      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>댓글 {post.commentCount}</h2>
        {isAuthenticated && (
          <form onSubmit={handleComment} style={{ marginBottom: '24px' }}>
            {replyTo && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', marginBottom: '8px', background: 'rgba(99,102,241,0.1)', fontSize: '0.85rem', color: 'var(--color-primary-400)' }}><span>답글 작성 중</span><button type="button" onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: 'var(--color-surface-300)', cursor: 'pointer' }}>✕</button></div>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="glass-input" placeholder="댓글을 입력하세요" value={commentText} onChange={e => setCommentText(e.target.value)} style={{ flex: 1 }} />
              <button type="submit" className="btn-primary" style={{ padding: '12px 20px' }}>등록</button>
            </div>
          </form>
        )}
        <div>{comments.map(c => renderComment(c))}</div>
      </section>
    </div>
  );
}
