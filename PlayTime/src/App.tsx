import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MovieCarousel from './components/MovieCarousel';
import MovieList from './components/MovieList';
import FeaturesSection from './components/FeaturesSection';
import StatsSection from './components/StatsSection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import LikedModal from './components/LikedModal';
import './App.css';

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [likedOpen, setLikedOpen] = useState(false);
  // (기존 샘플 데이터는 더 이상 사용되지 않음)

  // expose a small global helper so Header can open the liked modal without prop-drilling
  (window as any).openLiked = () => setLikedOpen(true);

  return (
    <AuthProvider>
      <div className="app">
        <Header onLoginClick={() => setAuthOpen(true)} onShowLiked={() => setLikedOpen(true)} />
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        <LikedModal open={likedOpen} onClose={() => setLikedOpen(false)} />
        <LikedModal open={likedOpen} onClose={() => setLikedOpen(false)} />
        <HeroSection />
        <MovieCarousel title="취향을 알아가는 순간, 영화는 더 재미있어진다.">
          <MovieList />
        </MovieCarousel>
        <FeaturesSection />
        <StatsSection />
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
