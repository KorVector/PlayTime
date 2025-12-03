import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import '../styles/ProfilePage.css';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  createdAt?: Date;
}

interface FavoriteMovie {
  movieId: number;
  title: string;
  image: string;
  date: string;
  rating: string;
  addedAt?: Date;
}

interface ParticipatedPost {
  postId: string;
  postTitle: string;
  type: 'author' | 'commenter';
  createdAt?: Date;
}

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [participatedPosts, setParticipatedPosts] = useState<ParticipatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine which user's profile to show
  const targetUserId = userId || user?.uid;
  const isOwnProfile = !userId || userId === user?.uid;

  useEffect(() => {
    if (!targetUserId) {
      setError('사용자를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', targetUserId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile({
            displayName: userData.displayName || '알 수 없음',
            email: userData.email || '',
            photoURL: userData.photoURL,
            bio: userData.bio,
            createdAt: userData.createdAt?.toDate(),
          });
        } else {
          // If no Firestore doc exists, use Auth user data for own profile
          if (isOwnProfile && user) {
            setProfile({
              displayName: user.displayName || '알 수 없음',
              email: user.email || '',
              photoURL: user.photoURL || undefined,
              bio: '',
            });
          } else {
            setError('사용자 프로필을 찾을 수 없습니다.');
            setLoading(false);
            return;
          }
        }

        // Fetch favorites
        const favoritesRef = collection(db, 'favorites', targetUserId, 'movies');
        const favoritesSnapshot = await getDocs(favoritesRef);
        const favoritesList: FavoriteMovie[] = [];
        favoritesSnapshot.forEach((doc) => {
          const data = doc.data();
          favoritesList.push({
            movieId: data.movieId,
            title: data.title,
            image: data.image,
            date: data.date,
            rating: data.rating,
            addedAt: data.addedAt?.toDate(),
          });
        });
        setFavorites(favoritesList);

        // Fetch posts authored by user
        const postsRef = collection(db, 'posts');
        const authorPostsQuery = query(postsRef, where('authorId', '==', targetUserId));
        const authorPostsSnapshot = await getDocs(authorPostsQuery);
        
        const participatedList: ParticipatedPost[] = [];
        const addedPostIds = new Set<string>();
        
        authorPostsSnapshot.forEach((doc) => {
          const data = doc.data();
          participatedList.push({
            postId: doc.id,
            postTitle: data.title,
            type: 'author',
            createdAt: data.createdAt?.toDate(),
          });
          addedPostIds.add(doc.id);
        });

        // Fetch comments by user to find posts they commented on
        const commentsRef = collection(db, 'comments');
        const userCommentsQuery = query(commentsRef, where('authorId', '==', targetUserId));
        const userCommentsSnapshot = await getDocs(userCommentsQuery);
        
        const commentedPostIds = new Set<string>();
        userCommentsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.postId && !addedPostIds.has(data.postId)) {
            commentedPostIds.add(data.postId);
          }
        });

        // Fetch post details for commented posts
        for (const postId of commentedPostIds) {
          const postDoc = await getDoc(doc(db, 'posts', postId));
          if (postDoc.exists()) {
            const data = postDoc.data();
            participatedList.push({
              postId: postDoc.id,
              postTitle: data.title,
              type: 'commenter',
              createdAt: data.createdAt?.toDate(),
            });
          }
        }

        // Sort by date (newest first)
        participatedList.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });

        setParticipatedPosts(participatedList);

        setLoading(false);
      } catch (err) {
        console.error('프로필 로딩 에러:', err);
        setError('프로필을 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetUserId, user, isOwnProfile]);

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const handleEditProfile = () => {
    const openProfileEdit = (window as Window & { openProfileEdit?: () => void }).openProfileEdit;
    if (typeof openProfileEdit === 'function') {
      openProfileEdit();
    }
  };

  const handleMovieClick = (movieId: number) => {
    const openMovieDetail = (window as Window & { openMovieDetail?: (movieId: number) => void }).openMovieDetail;
    if (typeof openMovieDetail === 'function') {
      openMovieDetail(movieId);
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'author': return '작성';
      case 'commenter': return '댓글';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <p>{error || '프로필을 찾을 수 없습니다.'}</p>
          <button className="back-btn" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container-page">
        {/* Profile Header */}
        <div className="profile-header-section">
          <div className="profile-avatar-large">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} />
            ) : (
              <span className="avatar-initial-large">{getInitial(profile.displayName)}</span>
            )}
          </div>
          <div className="profile-info-section">
            <h1 className="profile-display-name">{profile.displayName}</h1>
            {!isOwnProfile && <p className="profile-email-display">{profile.email}</p>}
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            {profile.createdAt && (
              <p className="profile-joined">
                가입일: {profile.createdAt.toLocaleDateString('ko-KR')}
              </p>
            )}
          </div>
          {isOwnProfile && (
            <button className="edit-profile-btn" onClick={handleEditProfile}>
              프로필 수정
            </button>
          )}
        </div>

        {/* Favorites Section */}
        <div className="profile-section">
          <h2 className="section-title">
            <span className="section-icon">❤️</span>
            {isOwnProfile ? '내 찜 목록' : `${profile.displayName}님의 찜 목록`}
            <span className="section-count">{favorites.length}</span>
          </h2>
          {favorites.length === 0 ? (
            <p className="empty-section">아직 찜한 영화가 없습니다.</p>
          ) : (
            <div className="favorites-grid">
              {favorites.map((movie) => (
                <div 
                  key={movie.movieId} 
                  className="favorite-card"
                  onClick={() => handleMovieClick(movie.movieId)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={movie.image || 'https://placehold.co/120x180'} 
                    alt={movie.title}
                    className="favorite-poster"
                  />
                  <div className="favorite-info">
                    <span className="favorite-title">{movie.title}</span>
                    <span className="favorite-meta">
                      {movie.date} · ⭐ {movie.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Participated Posts Section */}
        <div className="profile-section">
          <h2 className="section-title">
            <span className="section-icon">📝</span>
            {isOwnProfile ? '참여 중인 게시글' : `${profile.displayName}님이 참여 중인 게시글`}
            <span className="section-count">{participatedPosts.length}</span>
          </h2>
          {participatedPosts.length === 0 ? (
            <p className="empty-section">참여 중인 게시글이 없습니다.</p>
          ) : (
            <div className="chat-memberships-list">
              {participatedPosts.map((post) => (
                <div 
                  key={post.postId} 
                  className="chat-membership-card"
                  onClick={() => navigate(`/post/${post.postId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="chat-room-type-badge">
                    {getPostTypeLabel(post.type)}
                  </div>
                  <span className="chat-room-name">{post.postTitle}</span>
                  {post.createdAt && (
                    <span className="chat-joined-date">
                      {post.createdAt.toLocaleDateString('ko-KR')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
