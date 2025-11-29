import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MovieCarousel from './components/MovieCarousel';
import MovieList from './components/MovieList';
import FeaturesSection from './components/FeaturesSection';
import StatsSection from './components/StatsSection';
import HotTopicsSection from './components/HotTopicsSection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import LikedModal from './components/LikedModal';
import MovieRecommendModal from './components/MovieRecommendModal';
import MovieDetailModal from './components/MovieDetailModal';
import ProtectedRoute from './components/ProtectedRoute';
import LiveChatRoom from './pages/LiveChatRoom';
import ChatMainPage from './pages/ChatMainPage';
import MovieChatListPage from './pages/MovieChatListPage';
import MovieBoardPage from './pages/MovieBoardPage';
import GenreListPage from './pages/GenreListPage';
import GenreBoardPage from './pages/GenreBoardPage';
import PostDetailPage from './pages/PostDetailPage';
import './App.css';

interface HomePageProps {
  onAuthRequired: () => void;
  onRecommendClick: () => void;
  onMovieClick: (movieId: number) => void;
}

function HomePage({ onAuthRequired, onRecommendClick, onMovieClick }: HomePageProps) {
  return (
    <>
      <HeroSection onRecommendClick={onRecommendClick} />
      <StatsSection />
      <FeaturesSection />
      <MovieCarousel title="취향을 알아가는 순간, 영화는 더 재미있어진다.">
        <MovieList onAuthRequired={onAuthRequired} onMovieClick={onMovieClick} />
      </MovieCarousel>
      <HotTopicsSection />
    </>
  );
}

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [likedOpen, setLikedOpen] = useState(false);
  const [recommendOpen, setRecommendOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  // expose a small global helper so Header can open the liked modal without prop-drilling
  (window as typeof window & { openLiked?: () => void; openAuth?: () => void }).openLiked = () => setLikedOpen(true);
  // expose auth modal opener for components that need it
  (window as typeof window & { openAuth?: () => void }).openAuth = () => setAuthOpen(true);

  const handleAuthRequired = () => setAuthOpen(true);
  const handleRecommendClick = () => setRecommendOpen(true);
  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setDetailOpen(true);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Header onLoginClick={() => setAuthOpen(true)} onShowLiked={() => setLikedOpen(true)} />
          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
          <LikedModal open={likedOpen} onClose={() => setLikedOpen(false)} />
          <MovieRecommendModal open={recommendOpen} onClose={() => setRecommendOpen(false)} />
          <MovieDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} movieId={selectedMovieId} />
          
          <Routes>
            <Route path="/" element={<HomePage onAuthRequired={handleAuthRequired} onRecommendClick={handleRecommendClick} onMovieClick={handleMovieClick} />} />
            <Route path="/live-chat" element={<ProtectedRoute><LiveChatRoom /></ProtectedRoute>} />
            <Route path="/chat-main" element={<ProtectedRoute><ChatMainPage /></ProtectedRoute>} />
            <Route path="/movie-chat-list" element={<ProtectedRoute><MovieChatListPage /></ProtectedRoute>} />
            <Route path="/movie/:movieId/board" element={<ProtectedRoute><MovieBoardPage /></ProtectedRoute>} />
            <Route path="/genres" element={<ProtectedRoute><GenreListPage /></ProtectedRoute>} />
            <Route path="/genre/:genreId/board" element={<ProtectedRoute><GenreBoardPage /></ProtectedRoute>} />
            <Route path="/post/:postId" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
          </Routes>
          
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
