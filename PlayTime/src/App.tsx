// src/App.tsx

import React, { useState } from 'react';
import AuthModal from './components/AuthModal';
import './App.css';  //src폴더 내부에 vite-env.d.ts파일안에 /// <reference types="vite/client" />가 꼭 존재해야함
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MovieCarousel from './components/MovieCarousel'; // ⬅️ 이 부품
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';

// 1. ⬇️ (임시) 영화 데이터 만들기
// (나중에는 이 데이터를 TMDB API에서 가져올 것입니다)
// (public 폴더에 있는 이미지 경로를 사용합니다)
// src/App.tsx

// 1. ⬇️ '임시' 속성(date, rating, languages)을 추가합니다.
// (값은 아무거나 넣으셔도 됩니다. 형식만 맞추면 됩니다.)
const dummyMovies = [
  { 
    id: 1, 
    title: '범죄도시', 
    posterUrl: '/rank1.jpg', 
    date: '2024-01-01', // ⬅️ 추가
    rating: 8.5,           // ⬅️ 추가
    languages: ['Korean']  // ⬅️ 추가
  },
  { 
    id: 2, 
    title: '설계자', 
    posterUrl: '/rank2.jpg', 
    date: '2024-02-01', // ⬅️ 추가
    rating: 7.0,           // ⬅️ 추가
    languages: ['Korean']  // ⬅️ 추가
  },
  { 
    id: 3, 
    title: '그녀가 죽었다', 
    posterUrl: '/rank3.jpg',
    date: '2024-03-01', // ⬅️ 추가
    rating: 7.8,           // ⬅️ 추가
    languages: ['Korean']  // ⬅️ 추가
  },
];

const backgroundImagePath = '/common.jpg'; // <-- 이 부분을 실제 이미지 경로로 수정하세요!

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
    console.log("로그인 창 열기 신호 보냄!");
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="app-container">
      
      {/* 2. Header에게 openModal 함수를 'onLoginClick'이라는 이름으로 전달 */}
      <Header onLoginClick={openModal} />
      
      <main> 
        <HeroSection />
        <MovieCarousel title="🔥 지금 인기있는 영화" movies={dummyMovies} />
        <FeaturesSection />
      </main>
      
      <Footer />
      
      <AuthModal open={isModalOpen} onClose={closeModal} />
    </div>
  )
}

export default App;