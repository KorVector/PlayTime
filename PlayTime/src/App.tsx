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
import ProfileEditModal from './components/ProfileEditModal';
import UserSearchModal from './components/UserSearchModal';
import ProtectedRoute from './components/ProtectedRoute';
import LiveChatRoom from './pages/LiveChatRoom';
import ChatMainPage from './pages/ChatMainPage';
import MovieChatListPage from './pages/MovieChatListPage';
import MovieBoardPage from './pages/MovieBoardPage';
import GenreListPage from './pages/GenreListPage';
import GenreBoardPage from './pages/GenreBoardPage';
import PostDetailPage from './pages/PostDetailPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

interface HomePageProps {
  onAuthRequired: () => void;
}

function HomePage({ onAuthRequired }: HomePageProps) {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <MovieCarousel title="취향을 알아가는 순간, 영화는 더 재미있어진다.">
        <MovieList onAuthRequired={onAuthRequired} />
      </MovieCarousel>
      <HotTopicsSection />
    </>
  );
}

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [likedOpen, setLikedOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [userSearchOpen, setUserSearchOpen] = useState(false);

  // expose a small global helper so Header can open the liked modal without prop-drilling
  (window as typeof window & { openLiked?: () => void; openAuth?: () => void }).openLiked = () => setLikedOpen(true);
  // expose auth modal opener for components that need it
  (window as typeof window & { openAuth?: () => void }).openAuth = () => setAuthOpen(true);
  // expose profile edit modal opener
  (window as typeof window & { openProfileEdit?: () => void }).openProfileEdit = () => setProfileEditOpen(true);
  // expose user search modal opener
  (window as typeof window & { openUserSearch?: () => void }).openUserSearch = () => setUserSearchOpen(true);

  const handleAuthRequired = () => setAuthOpen(true);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Header onLoginClick={() => setAuthOpen(true)} onShowLiked={() => setLikedOpen(true)} />
          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
          <LikedModal open={likedOpen} onClose={() => setLikedOpen(false)} />
          <ProfileEditModal open={profileEditOpen} onClose={() => setProfileEditOpen(false)} />
          <UserSearchModal open={userSearchOpen} onClose={() => setUserSearchOpen(false)} />
          
          <Routes>
            <Route path="/" element={<HomePage onAuthRequired={handleAuthRequired} />} />
            <Route path="/live-chat" element={<ProtectedRoute><LiveChatRoom /></ProtectedRoute>} />
            <Route path="/chat-main" element={<ProtectedRoute><ChatMainPage /></ProtectedRoute>} />
            <Route path="/movie-chat-list" element={<ProtectedRoute><MovieChatListPage /></ProtectedRoute>} />
            <Route path="/movie/:movieId/board" element={<ProtectedRoute><MovieBoardPage /></ProtectedRoute>} />
            <Route path="/genres" element={<ProtectedRoute><GenreListPage /></ProtectedRoute>} />
            <Route path="/genre/:genreId/board" element={<ProtectedRoute><GenreBoardPage /></ProtectedRoute>} />
            <Route path="/post/:postId" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
          </Routes>
          
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
