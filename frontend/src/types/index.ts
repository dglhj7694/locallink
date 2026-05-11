export interface User {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  bio: string | null;
  neighborhood: string | null;
  age: number | null;
  gender: 'MALE' | 'FEMALE' | 'SECRET';
  role: 'USER' | 'ADMIN';
  interests: string[];
  createdAt: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  nickname: string;
  role: string;
}

export interface AuthorInfo {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  neighborhood: string | null;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  category: BoardCategory;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  price: number | null;
  tradeStatus: string | null;
  author: AuthorInfo;
  imageUrls: string[];
  liked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  content: string;
  author: AuthorInfo;
  parentId: number | null;
  children: Comment[];
  createdAt: string;
}

export interface Gathering {
  id: number;
  title: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  minAge: number | null;
  maxAge: number | null;
  targetGender: 'ANY' | 'MALE_ONLY' | 'FEMALE_ONLY';
  eventDate: string;
  maxParticipants: number;
  currentParticipants: number;
  status: GatheringStatus;
  category: GatheringCategory;
  organizer: {
    id: number;
    nickname: string;
    profileImageUrl: string | null;
  };
  interests: string[];
  participants: ParticipantInfo[] | null;
  chatRoomId: number | null;
  joined: boolean;
  createdAt: string;
}

export interface ParticipantInfo {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  joinedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  age: number | null;
  gender: 'MALE' | 'FEMALE' | 'SECRET';
}

export interface ChatRoom {
  id: number;
  name: string;
  gatheringId: number | null;
  gatheringCategory: string | null;
  participantCount: number;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE';
  sender: {
    id: number;
    nickname: string;
    profileImageUrl: string | null;
  };
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export type BoardCategory = 'FREE' | 'NEIGHBORHOOD' | 'QUESTION' | 'MARKETPLACE';
export type GatheringCategory = 'FOOD' | 'BOARD_GAME' | 'RUNNING' | 'STUDY' | 'MOVIE' | 'ETC';
export type GatheringStatus = 'RECRUITING' | 'CLOSED' | 'COMPLETED';

export const BOARD_CATEGORY_LABELS: Record<BoardCategory, string> = {
  FREE: '자유게시판',
  NEIGHBORHOOD: '동네정보',
  QUESTION: '질문게시판',
  MARKETPLACE: '중고거래',
};

export const GATHERING_CATEGORY_LABELS: Record<GatheringCategory, string> = {
  FOOD: '🍽️ 맛집 탐방',
  BOARD_GAME: '🎲 보드게임',
  RUNNING: '🏃 러닝',
  STUDY: '📚 스터디',
  MOVIE: '🎬 영화',
  ETC: '✨ 기타',
};

export const GATHERING_STATUS_LABELS: Record<GatheringStatus, string> = {
  RECRUITING: '모집중',
  CLOSED: '모집마감',
  COMPLETED: '완료',
};

export const INTEREST_OPTIONS = [
  '맛집', '카페', '보드게임', '러닝', '산책', '자전거',
  '스터디', '독서', '영화', '음악', '요리', '사진',
  '여행', '등산', '헬스', '요가', '반려동물', '게임',
  '프로그래밍', '디자인', '투자', '부동산',
];
