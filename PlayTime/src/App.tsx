import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import LiveChatRoom from './pages/LiveChatRoom';
import ChatMainPage from './pages/ChatMainPage';
import MovieChatListPage from './pages/MovieChatListPage';
import MovieBoardPage from './pages/MovieBoardPage';
import GenreListPage from './pages/GenreListPage';
import GenreBoardPage from './pages/GenreBoardPage';
import PostDetailPage from './pages/PostDetailPage';
import './App.css';

function HomePage() {
  return (
    <>
      <HeroSection />
      <MovieCarousel title="취향을 알아가는 순간, 영화는 더 재미있어진다.">
        <MovieList />
      </MovieCarousel>
      <FeaturesSection />
      <StatsSection />
    </>
  );
}

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [likedOpen, setLikedOpen] = useState(false);

  // expose a small global helper so Header can open the liked modal without prop-drilling
  (window as any).openLiked = () => setLikedOpen(true);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Header onLoginClick={() => setAuthOpen(true)} onShowLiked={() => setLikedOpen(true)} />
          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
          <LikedModal open={likedOpen} onClose={() => setLikedOpen(false)} />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/live-chat" element={<LiveChatRoom />} />
            <Route path="/chat-main" element={<ChatMainPage />} />
            <Route path="/movie-chat-list" element={<MovieChatListPage />} />
            <Route path="/movie/:movieId/board" element={<MovieBoardPage />} />
            <Route path="/genres" element={<GenreListPage />} />
            <Route path="/genre/:genreId/board" element={<GenreBoardPage />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
          </Routes>
          
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
