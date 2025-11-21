import { useMediaQuery } from 'react-responsive';

/**
 * 화면 크기별 반응형 값을 반환하는 커스텀 훅
 * 
 * 반응점:
 * - Mobile: max-width 640px
 * - Tablet: 641px - 1024px
 * - Desktop: 1025px+
 */

export const useResponsive = () => {
  const isMobile = useMediaQuery({
    maxWidth: 640,
  });

  const isTablet = useMediaQuery({
    minWidth: 641,
    maxWidth: 1024,
  });

  const isDesktop = useMediaQuery({
    minWidth: 1025,
  });

  const isLargeDesktop = useMediaQuery({
    minWidth: 1441,
  });

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    // 편의 메서드
    isSmall: isMobile,
    isMedium: isTablet,
    isLarge: isDesktop || isLargeDesktop,
  };
};


