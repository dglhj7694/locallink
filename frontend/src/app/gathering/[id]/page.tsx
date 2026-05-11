'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Gathering, ApiResponse, GATHERING_CATEGORY_LABELS, ParticipantInfo } from '@/types';

export default function GatheringDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => { loadGathering(); }, [params.id]);

  const loadGathering = async () => {
    try {
      const res = await api.get<ApiResponse<Gathering>>(`/gatherings/${params.id}`);
      setGathering(res.data.data);
    } catch { router.push('/gathering'); } finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setJoining(true);
    try {
      const res = await api.post<ApiResponse<Gathering>>(`/gatherings/${params.id}/apply`);
      setGathering(res.data.data);
      alert('참여 신청이 완료되었습니다. 모임장의 수락을 기다려주세요.');
    } catch (err: any) { alert(err.response?.data?.message || '참여 신청에 실패했습니다.'); }
    finally { setJoining(false); }
  };

  const handleApprove = async (participantId: number) => {
    try {
      const res = await api.post<ApiResponse<Gathering>>(`/gatherings/${params.id}/applications/${participantId}/approve`);
      setGathering(res.data.data);
    } catch (err: any) { alert(err.response?.data?.message || '수락에 실패했습니다.'); }
  };

  const handleReject = async (participantId: number) => {
    if (!confirm('신청을 거절하시겠습니까?')) return;
    try {
      await api.post(`/gatherings/${params.id}/applications/${participantId}/reject`);
      loadGathering();
    } catch (err: any) { alert(err.response?.data?.message || '거절에 실패했습니다.'); }
  };

  const handleLeave = async () => {
    if (!confirm('모임에서 탈퇴하시겠습니까?')) return;
    try {
      await api.delete(`/gatherings/${params.id}/leave`);
      loadGathering();
    } catch (err: any) { alert(err.response?.data?.message || '탈퇴에 실패했습니다.'); }
  };

  const handleDelete = async () => {
    if (!confirm('모임을 삭제하시겠습니까?')) return;
    await api.delete(`/gatherings/${params.id}`);
    router.push('/gathering');
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--color-surface-300)' }}>로딩 중...</div>;
  if (!gathering) return null;

  const isOrganizer = user?.id === gathering.organizer.id;
  const pct = (gathering.currentParticipants / gathering.maxParticipants) * 100;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <div className="glass-card animate-fade-in" style={{ padding: '36px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <span className={`badge ${gathering.status === 'RECRUITING' ? 'badge-success' : 'badge-warning'}`} style={{ marginBottom: '12px' }}>
              {gathering.status === 'RECRUITING' ? '모집중' : '모집마감'}
            </span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px' }}>{gathering.title}</h1>
            <span style={{ color: 'var(--color-surface-300)', fontSize: '0.9rem' }}>{GATHERING_CATEGORY_LABELS[gathering.category]}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ color: 'var(--color-surface-300)', fontSize: '0.8rem', marginBottom: '4px' }}>📍 장소</div>
            <div style={{ fontWeight: 600 }}>{gathering.location || '미정'}</div>
          </div>
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ color: 'var(--color-surface-300)', fontSize: '0.8rem', marginBottom: '4px' }}>📅 일시</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fmt(gathering.eventDate)}</div>
          </div>
        </div>

        {/* Demographics Constraints */}
        {(gathering.targetGender !== 'ANY' || gathering.minAge || gathering.maxAge) && (
          <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
            {gathering.targetGender !== 'ANY' && (
              <span className="badge badge-secondary">{gathering.targetGender === 'MALE_ONLY' ? '남성만 참여가능' : '여성만 참여가능'}</span>
            )}
            {(gathering.minAge || gathering.maxAge) && (
              <span className="badge badge-secondary">
                {gathering.minAge ? `${gathering.minAge}세 이상` : ''} 
                {gathering.minAge && gathering.maxAge ? ' ~ ' : ''} 
                {gathering.maxAge ? `${gathering.maxAge}세 이하` : ''} 
              </span>
            )}
          </div>
        )}

        {gathering.description && (
          <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(15,23,42,0.5)', marginBottom: '24px' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--color-surface-200)', whiteSpace: 'pre-wrap' }}>{gathering.description}</p>
          </div>
        )}

        {/* Progress */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>참여 현황</span>
            <span style={{ color: 'var(--color-primary-400)', fontWeight: 700 }}>{gathering.currentParticipants} / {gathering.maxParticipants}명</span>
          </div>
          <div className="progress-bar" style={{ height: '10px' }}>
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Interests */}
        {gathering.interests?.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px', color: 'var(--color-surface-200)' }}>관련 관심사</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {gathering.interests.map(i => <span key={i} className="interest-tag">{i}</span>)}
            </div>
          </div>
        )}

        {/* Organizer */}
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(15,23,42,0.5)', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-surface-300)', marginBottom: '8px' }}>모임장</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '0.85rem' }}>{gathering.organizer.nickname.charAt(0).toUpperCase()}</div>
            <span style={{ fontWeight: 600 }}>{gathering.organizer.nickname}</span>
          </div>
        </div>

        {/* Participants (Approved only) */}
        {gathering.participants && gathering.participants.filter(p => p.status === 'APPROVED').length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px' }}>참여자</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {gathering.participants.filter(p => p.status === 'APPROVED').map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '9999px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.1)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'white' }}>{p.nickname.charAt(0).toUpperCase()}</div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{p.nickname}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Applications (Organizer Only) */}
        {isOrganizer && gathering.participants && gathering.participants.filter(p => p.status === 'PENDING').length > 0 && (
          <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px', color: 'var(--color-primary-400)' }}>승인 대기 중인 신청자</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {gathering.participants.filter(p => p.status === 'PENDING').map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(15,23,42,0.8)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--color-surface-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>{p.nickname.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{p.nickname}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-surface-300)' }}>
                        {p.age ? `${p.age}세` : '나이 미상'} · {p.gender === 'MALE' ? '남성' : p.gender === 'FEMALE' ? '여성' : '성별 비공개'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleApprove(p.id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>수락</button>
                    <button onClick={() => handleReject(p.id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>거절</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {!isOrganizer && !gathering.joined && gathering.status === 'RECRUITING' && (
            <button onClick={handleJoin} className="btn-primary" disabled={joining} style={{ flex: 1 }}>{joining ? '신청 중...' : '🙋 모임 참여 신청하기'}</button>
          )}
          {!isOrganizer && gathering.joined && gathering.participants?.find(p => p.id === user?.id)?.status === 'PENDING' && (
            <button disabled className="btn-secondary" style={{ flex: 1, opacity: 0.7 }}>⏳ 승인 대기중</button>
          )}
          {!isOrganizer && gathering.joined && gathering.participants?.find(p => p.id === user?.id)?.status === 'APPROVED' && (
            <button onClick={handleLeave} className="btn-secondary" style={{ flex: 1 }}>모임 탈퇴</button>
          )}
          {(isOrganizer || gathering.participants?.find(p => p.id === user?.id)?.status === 'APPROVED') && gathering.chatRoomId && (
            <Link href={`/chat/${gathering.chatRoomId}`} className="btn-primary" style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>💬 채팅방 입장</Link>
          )}
          {isOrganizer && <button onClick={handleDelete} className="btn-danger">모임 삭제</button>}
        </div>
      </div>
    </div>
  );
}
