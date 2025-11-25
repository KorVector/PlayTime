# 반응형 UI/UX 구현 가이드

## 📱 반응형 디자인 개요

TimePlay 프로젝트는 **react-responsive** 라이브러리를 활용하여 모든 화면 크기에 최적화된 반응형 UI/UX를 제공합니다.

---

## 📊 화면 크기 breakpoint

| 디바이스 | 범위 | 특징 |
|---------|------|------|
| **초소형 모바일** | `≤ 360px` | 스마트폰 (5" 이하) |
| **모바일** | `361px - 640px` | 스마트폰 (일반) |
| **태블릿** | `641px - 1024px` | 태블릿 기기 |
| **데스크톱** | `≥ 1025px` | 데스크톱 / 노트북 |
| **대형 데스크톱** | `≥ 1441px` | 초대형 모니터 |

---

## 🛠️ useResponsive 훅 사용법

### 기본 사용

```tsx
import { useResponsive } from '../hooks/useResponsive';

const MyComponent: React.FC = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div>
      {isMobile && <p>모바일 버전</p>}
      {isTablet && <p>태블릿 버전</p>}
      {isDesktop && <p>데스크톱 버전</p>}
    </div>
  );
};
```

### 반환값

```typescript
{
  isMobile: boolean;          // 최대 640px
  isTablet: boolean;          // 641px - 1024px
  isDesktop: boolean;         // 1025px 이상
  isLargeDesktop: boolean;    // 1441px 이상
  isSmall: boolean;           // isMobile과 동일
  isMedium: boolean;          // isTablet과 동일
  isLarge: boolean;           // isDesktop || isLargeDesktop
}
```

---

## 📄 개선된 컴포넌트 목록

### 1. **Header** (헤더)
- ✅ 고정 위치 네비게이션
- ✅ 모바일 시 햄버거 메뉴 제공
- ✅ 반응형 폰트 크기 (40px → 28px → 24px)
- ✅ 반응형 높이 (143px → 120px → 100px → 90px)

```tsx
// 모바일에서 자동으로 슬라이드 메뉴 활성화
<Header />
```

### 2. **HeroSection** (히어로 배너)
- ✅ 반응형 높이 (855px → 600px → 400px → 350px)
- ✅ 이미지 선택 (모바일용 별도 이미지 제공 가능)
- ✅ 텍스트 축약 (모바일에서 짧은 텍스트)
- ✅ 버튼 크기 조정

```css
/* 데스크톱: 855px 높이 */
/* 태블릿: 600px 높이 */
/* 모바일: 400px 높이 */
/* 초소형: 350px 높이 */
```

### 3. **MovieCarousel** (영화 캐러셀)
- ✅ 화면 크기별 컬럼 수 조정
  - 데스크톱: 4개 영화 표시
  - 태블릿: 3개 영화 표시
  - 모바일: 2개 영화 표시
  - 초소형: 1개 영화 표시
- ✅ Grid 기반 레이아웃 (flexbox 대신)
- ✅ 간격 및 여백 자동 조정

```tsx
const { isMobile, isTablet } = useResponsive();
const displayCount = isMobile ? 2 : isTablet ? 3 : 4;
```

### 4. **MovieCard** (영화 카드)
- ✅ 반응형 크기 (309x450 → 250x360 → 180x260)
- ✅ 폰트 크기 조정 (22px → 16px → 14px)
- ✅ 버튼 크기 최적화
- ✅ 터치 친화적 최소 크기 유지

```css
/* 데스크톱: 309x450px */
/* 태블릿: 280x400px */
/* 모바일: 250x360px */
/* 초소형: 180x260px */
```

### 5. **FeaturesSection** (기능 소개)
- ✅ 카드 그리드 자동 정렬
- ✅ 모바일에서 수직 레이아웃
- ✅ 반응형 박스 크기
- ✅ 텍스트 폰트 조정

### 6. **StatsSection** (통계)
- ✅ 이미지 크기 조정 (298x420 → 200x280)
- ✅ 모바일에서 수직 정렬
- ✅ 라벨 박스 크기 자동 조정

### 7. **Footer** (푸터)
- ✅ 반응형 패딩
- ✅ 텍스트 크기 조정
- ✅ 모든 기기에서 일관된 스타일

---

## 🎨 반응형 CSS 패턴

### 모바일 우선 설계 (Mobile-First)

```css
/* 기본: 모바일 스타일 */
.component {
  font-size: 14px;
  padding: 16px;
}

/* 태블릿 이상 */
@media (min-width: 641px) {
  .component {
    font-size: 16px;
    padding: 24px;
  }
}

/* 데스크톱 이상 */
@media (min-width: 1025px) {
  .component {
    font-size: 20px;
    padding: 32px;
  }
}
```

### 권장 미디어 쿼리

```css
/* 태블릿 (641px - 1024px) */
@media (max-width: 1024px) and (min-width: 641px) {
  /* 스타일 */
}

/* 모바일 (max-width: 640px) */
@media (max-width: 640px) {
  /* 스타일 */
}

/* 초소형 모바일 (max-width: 360px) */
@media (max-width: 360px) {
  /* 스타일 */
}
```

---

## 📏 크기 조정 가이드

### 폰트 크기 스케일링

| 요소 | 데스크톱 | 태블릿 | 모바일 | 초소형 |
|------|--------|--------|---------|--------|
| 제목 (h2) | 35px | 28px | 22px | 18px |
| 부제목 (h3) | 25px | 20px | 18px | 14px |
| 본문 | 20px | 18px | 16px | 14px |
| 캡션 | 16px | 14px | 12px | 11px |
| 버튼 | 20px | 18px | 14px | 12px |

### 간격 (패딩/마진) 스케일링

| 요소 | 데스크톱 | 태블릿 | 모바일 |
|------|--------|--------|---------|
| 섹션 패딩 | 100px | 60px | 40px |
| 내부 패딩 | 80px | 50px | 30px |
| 요소 간격 | 30px | 25px | 15px |
| 여백 | 40px | 20px | 12px |

---

## 🚀 성능 최적화

### 이미지 반응형 처리

```tsx
const { isMobile } = useResponsive();

return (
  <img
    src={isMobile ? '/image-mobile.jpg' : '/image-desktop.jpg'}
    alt="description"
  />
);
```

### 조건부 렌더링 최적화

```tsx
const { isMobile } = useResponsive();

// 좋은 방법: 한 번만 호출
return (
  <>
    {isMobile && <MobileNav />}
    {!isMobile && <DesktopNav />}
  </>
);

// 피해야 할 방법: 매번 재계산
if (window.innerWidth < 640) { /* ... */ }
```

---

## 🔧 새로운 컴포넌트 작성 시

### Step 1: useResponsive 훅 import

```tsx
import { useResponsive } from '../hooks/useResponsive';
```

### Step 2: 훅 사용

```tsx
const { isMobile, isTablet, isDesktop } = useResponsive();
```

### Step 3: 조건부 렌더링 또는 동적 스타일

```tsx
return (
  <div className={`my-component ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
    {/* 컨텐츠 */}
  </div>
);
```

### Step 4: CSS에서 미디어 쿼리 작성

```css
.my-component {
  /* 데스크톱 기본 스타일 */
}

@media (max-width: 1024px) and (min-width: 641px) {
  .my-component {
    /* 태블릿 스타일 */
  }
}

@media (max-width: 640px) {
  .my-component {
    /* 모바일 스타일 */
  }
}
```

---

## 📱 테스트 팁

### Chrome DevTools 사용

1. F12 또는 우클릭 → 검사
2. Ctrl+Shift+M (또는 ⌘+Shift+M on Mac) - 반응형 모드 활성화
3. 드롭다운에서 기기 선택:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPhone 14 Pro Max (430px)
   - iPad (768px)
   - iPad Pro (1024px)

### 일반적인 테스트 화면 크기

```
- 320px (초소형 모바일)
- 360px (모바일)
- 480px (모바일)
- 640px (모바일 최대)
- 768px (태블릿)
- 1024px (태블릿 최대)
- 1440px (데스크톱)
- 1920px (큰 데스크톱)
```

---

## 🐛 일반적인 문제 해결

### 문제: 컴포넌트가 반응형이 아님

**확인사항:**
1. `useResponsive` 훅을 import했는가?
2. 훅에서 반환된 값을 사용했는가?
3. CSS 미디어 쿼리가 올바른가?
4. `box-sizing: border-box` 설정이 있는가?

### 문제: 모바일에서 텍스트가 너무 작음

**해결:**
```css
@media (max-width: 640px) {
  .text {
    font-size: clamp(12px, 4vw, 16px); /* 유동적 크기 */
  }
}
```

### 문제: 이미지가 깨짐

**해결:**
```css
img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

---

## 🎯 체크리스트

새로운 컴포넌트 작성 시:

- [ ] `useResponsive` 훅 사용
- [ ] 모바일, 태블릿, 데스크톱 모두 테스트
- [ ] 초소형 모바일(360px) 테스트
- [ ] 큰 데스크톱(1920px) 테스트
- [ ] 터치 기기 최소 크기 44x44px 유지
- [ ] 텍스트 가독성 확인
- [ ] 이미지 로딩 및 표시 확인
- [ ] 버튼 클릭 영역 확인
- [ ] 가로 스크롤 없음 확인

---

## 📚 추가 리소스

- [MDN: 반응형 디자인](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [react-responsive 공식 문서](https://yoconservative.github.io/react-responsive/)
- [Google: 반응형 웹 디자인](https://developers.google.com/web/fundamentals/design-and-ux/responsive)

---

**마지막 업데이트:** 2025-11-18
**버전:** 2.0.0 (반응형 UI/UX 적용)
