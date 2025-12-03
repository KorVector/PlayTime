import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import '../styles/NotificationModal.css';

interface Notification {
  id: string;
  userId: string;
  type: 'comment' | 'reply';
  message: string;
  postId: string;
  postTitle: string;
  fromUserId: string;
  fromUserName: string;
  read: boolean;
  createdAt: Timestamp;
}

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !open) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications: Notification[] = [];
      snapshot.forEach((doc) => {
        newNotifications.push({
          id: doc.id,
          ...doc.data()
        } as Notification);
      });
      setNotifications(newNotifications);
      setLoading(false);
    }, (error) => {
      console.error('알림 구독 오류:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, open]);

  const handleNotificationClick = async (notification: Notification) => {
    // 읽음 표시
    if (!notification.read) {
      const notificationRef = doc(db, 'notifications', notification.id);
      await updateDoc(notificationRef, { read: true });
    }
    
    onClose();
    navigate(`/post/${notification.postId}`);
  };

  const formatTimeAgo = (timestamp: Timestamp | null) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return '방금 전';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    return `${Math.floor(seconds / 86400)}일 전`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment': return '💬';
      case 'reply': return '↩️';
      default: return '🔔';
    }
  };

  if (!open) return null;

  return (
    <div className="notification-modal-overlay" onMouseDown={onClose}>
      <div className="notification-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <h3>알림</h3>
          <button className="notification-close" onClick={onClose}>✕</button>
        </div>

        <div className="notification-list">
          {loading ? (
            <div className="notification-loading">알림을 불러오는 중...</div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">새로운 알림이 없습니다.</div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <span className="notification-icon">{getNotificationIcon(notification.type)}</span>
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-post-title">"{notification.postTitle}"</span>
                  <span className="notification-time">{formatTimeAgo(notification.createdAt)}</span>
                </div>
                {!notification.read && <span className="notification-unread-dot"></span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
