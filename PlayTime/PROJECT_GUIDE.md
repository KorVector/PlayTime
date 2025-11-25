# TimePlay 프로젝트 가이드

## 📋 프로젝트 개요

TimePlay는 영화 커뮤니티 플랫폼으로, 사용자가 영화를 탐색하고 다른 사용자와 채팅할 수 있는 웹 애플리케이션입니다.

**기술 스택:**
- React 18 + TypeScript
- Vite (번들러)
- CSS (순수 CSS, 특별한 라이브러리 없음)
- Font: DM Sans, Roboto, Work Sans

---

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트들
├── styles/             # CSS 스타일 시트들
├── assets/             # 이미지 및 리소스
├── App.tsx             # 메인 애플리케이션 컴포넌트
├── main.tsx            # 애플리케이션 진입점
├── index.css           # 전역 스타일
└── App.css             # App 컴포넌트 스타일
```

---

## 🎨 컴포넌트 설명

### 1. **Header** (`Header.tsx` / `Header.css`)

**목적:** 페이지 상단 네비게이션 바

**기능:**
- 로고 표시
- 네비게이션 링크 제공
- 반응형 디자인 지원

**주요 요소:**
- 검은 배경 (`background-color: #000`)
- DM Sans 폰트 사용
- 수평 플렉스 레이아웃

---

### 2. **HeroSection** (`HeroSection.tsx` / `HeroSection.css`)

**목적:** 랜딩 페이지의 주요 배너 영역

**기능:**
- 대형 배너 이미지 표시
- 영화 캐러셀 포함
- 타이틀과 서브타이틀 표시
- 콜-투-액션(CTA) 버튼 제공

**주요 스타일:**
- 전체 높이 커버 레이아웃 (`min-height: 100vh`)
- 배경 그래디언트 적용
- 중앙 정렬된 콘텐츠

---

### 3. **MovieCarousel** (`MovieCarousel.tsx` / `MovieCarousel.css`)

**목적:** 가로 스크롤 가능한 영화 카드 목록

**기능:**
- 여러 MovieCard 컴포넌트 렌더링
- 수평 스크롤바 지원
- 반응형 그리드 레이아웃

**주요 특징:**
```css
.carousel {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding: 20px;
}
```

---

### 4. **MovieCard** (`MovieCard.tsx` / `MovieCard.css`)

**목적:** 개별 영화 정보 카드

**기능:**
- 영화 포스터 이미지 표시
- 영화 제목, 개봉일, 평점 표시
- 언어 태그 표시
- 찜하기 기능 (하트 아이콘)
- 채팅방 진입 버튼

**Props:**
```typescript
interface MovieCardProps {
  image?: string;              // 영화 포스터 URL
  title: string;              // 영화 제목
  date: string;               // 개봉일
  rating: string;             // 평점 (예: "8.5/10")
  languages: string[];        // 언어 배열 (예: ["EN", "KO"])
  onChatClick?: () => void;   // 채팅 버튼 클릭 콜백
  onLikeClick?: (liked: boolean) => void;  // 찜 버튼 클릭 콜백
  isLiked?: boolean;          // 초기 찜 상태
}
```

**상태 관리:**
- `isLiked` 상태: useState 훅으로 찜 상태 관리
- 클릭 시 상태 토글 및 부모 컴포넌트에 콜백 전달

**레이아웃:**
```
┌─────────────────────────┐
│   영화 포스터 이미지    │
├─────────────────────────┤
│ 제목                     │
│ 개봉일                   │
│ 평점                     │
│ [언어태그]              │
├─────────────────────────┤
│ [채팅방] [찜하기]       │ ← 하단 액션 버튼
└─────────────────────────┘
```

**주요 스타일:**
```css
.movie-card {
  width: 309px;
  height: 450px;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.movie-overlay {
  position: absolute;
  background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8) 100%);
}

.movie-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

---

### 5. **HeartIcon** (`HeartIcon.tsx`)

**목적:** 찜하기 기능용 SVG 하트 아이콘

**기능:**
- 상태에 따른 하트 아이콘 렌더링
- 클릭 가능한 버튼으로 기능

**Props:**
```typescript
interface HeartIconProps {
  liked: boolean;           // 찜 상태
  onClick?: () => void;     // 클릭 콜백
  className?: string;       // 추가 CSS 클래스
}
```

**렌더링:**
```
상태: liked = false       |  상태: liked = true
색: #b94a4a (연한 빨강)  |  색: #eb5757 (진한 빨강)
fill: none (빈 하트)     |  fill: #eb5757 (채운 하트)
```

**SVG 속성:**
- 크기: 32x32px
- Stroke Width: 2px
- Line Cap/Join: Round

---

### 6. **FeaturesSection** (`FeaturesSection.tsx` / `FeaturesSection.css`)

**목적:** 플랫폼의 주요 기능 소개

**기능:**
- 3개 열 그리드 레이아웃
- 각 기능별 아이콘 및 설명 표시
- 반응형 디자인

**레이아웃:**
```css
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

---

### 7. **FeatureCard** (`FeatureCard.tsx` / `FeatureCard.css`)

**목적:** 개별 기능 카드

**Props:**
```typescript
interface FeatureCardProps {
  icon: string;        // 아이콘 또는 이모지
  title: string;       // 기능 제목
  description: string; // 기능 설명
}
```

---

### 8. **StatsSection** (`StatsSection.tsx` / `StatsSection.css`)

**목적:** 플랫폼 통계 정보 표시

**기능:**
- 사용자 수, 영화 수, 채팅 수 등 주요 통계 표시
- 이미지와 함께 시각적으로 표현
- 2열 레이아웃

---

### 9. **Footer** (`Footer.tsx` / `Footer.css`)

**목적:** 페이지 하단 영역

**기능:**
- 저작권 정보 표시
- 링크 정보 제공
- 상단 경계선 강조

---

## 🎯 주요 기능

### 1. 찜하기 기능

**구현 방식:**
```typescript
// MovieCard.tsx
const [isLiked, setIsLiked] = useState(initialLiked);

const handleLikeClick = () => {
  const newLikedState = !isLiked;
  setIsLiked(newLikedState);
  onLikeClick?.(newLikedState);
};
```

**특징:**
- 클릭 시 상태 즉시 토글
- 부모 컴포넌트에 콜백으로 알림
- HeartIcon 컴포넌트로 SVG 렌더링

### 2. 채팅방 연결

**구현 방식:**
```typescript
<button className="chat-button" onClick={onChatClick}>
  채팅방 바로가기
</button>
```

**특징:**
- 클릭 시 onChatClick 콜백 실행
- 부모 컴포넌트에서 네비게이션 처리

---

## 🎨 디자인 시스템

### 색상 팔레트

| 용도 | 색상 코드 | RGB |
|------|----------|-----|
| 배경 | `#000000` | 검정 |
| 강조 | `#00ff2f` | 밝은 녹색 |
| 찜하기 (비활성) | `#b94a4a` | 연한 빨강 |
| 찜하기 (활성) | `#eb5757` | 진한 빨강 |
| 카드 배경 | `#1a1a1a` | 어두운 회색 |

### 타이포그래피

- **제목**: DM Sans
- **본문**: Roboto
- **보조**: Work Sans

### 간격 (Spacing)

- 기본 간격: 16px / 24px / 32px
- 패딩: 20px (카드 내부)
- 갭: 16px (그리드/플렉스)

---

## 🔧 개발 가이드

### 새로운 MovieCard 추가하기

```typescript
import MovieCard from './components/MovieCard';

<MovieCard
  title="영화 제목"
  date="2025-01-01"
  rating="8.5/10"
  languages={["EN", "KO"]}
  image="https://example.com/poster.jpg"
  onChatClick={() => console.log('채팅방 진입')}
  onLikeClick={(liked) => console.log('찜:', liked)}
  isLiked={false}
/>
```

### HeartIcon 커스터마이징

HeartIcon 컴포넌트의 SVG를 수정하려면 `HeartIcon.tsx`의 `<path>` 요소를 변경하세요:

```typescript
<svg
  width="32"
  height="32"
  viewBox="0 0 24 24"
  fill={liked ? '#eb5757' : 'none'}
  stroke={liked ? '#eb5757' : '#b94a4a'}
  strokeWidth="2"
>
  {/* path 요소 */}
</svg>
```

---

## 📱 반응형 디자인

모든 컴포넌트는 다음 미디어 쿼리를 지원합니다:

```css
/* 태블릿 */
@media (max-width: 768px) {
  /* 1열 또는 2열 레이아웃 */
}

/* 모바일 */
@media (max-width: 480px) {
  /* 1열 레이아웃 */
}
```

---

## 📦 빌드 및 배포

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```

### 빌드 미리보기
```bash
npm run preview
```

---

## 🐛 알려진 문제 및 개선 사항

### 완료된 개선 사항
- ✅ 하트 아이콘 크기 일관성 (SVG 적용)
- ✅ 버튼 배치 및 스타일링
- ✅ 반응형 레이아웃

### 향후 개선 사항
- 🔄 실시간 채팅 기능 연동
- 🔄 사용자 인증 시스템
- 🔄 백엔드 API 연동
- 🔄 영화 검색/필터링 기능
- 🔄 사용자 프로필 페이지

---

## 📝 파일별 주요 코드 스니펫

### MovieCard.tsx - 상태 관리
```typescript
const [isLiked, setIsLiked] = useState(initialLiked);

const handleLikeClick = () => {
  const newLikedState = !isLiked;
  setIsLiked(newLikedState);
  onLikeClick?.(newLikedState);
};
```

### MovieCard.css - 오버레이 효과
```css
.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
}
```

### HeartIcon.tsx - SVG 조건부 렌더링
```typescript
<svg
  fill={liked ? '#eb5757' : 'none'}
  stroke={liked ? '#eb5757' : '#b94a4a'}
>
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
</svg>
```

---

## 📞 문의 및 지원

이 프로젝트에 대한 질문이나 버그 리포트는 GitHub 이슈에서 등록해주세요.

---

**마지막 업데이트:** 2025-11-13
**버전:** 1.0.0
