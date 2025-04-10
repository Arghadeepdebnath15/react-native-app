import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Messaging from '../components/Messaging';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) {
          setError('No user ID provided');
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (!userDoc.exists()) {
          setError('User not found');
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        setOtherUser({
          id: userId,
          name: userData.name || userData.displayName || 'Anonymous',
          email: userData.email || '',
          photoURL: userData.photoURL || userData.avatar || '',
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleCloseChat = () => {
    navigate('/messages');
  };

  if (!currentUser) {
    return <div className="chat-page-container">Please log in to access chat</div>;
  }

  if (loading) {
    return <div className="chat-page-container">Loading chat...</div>;
  }

  if (error) {
    return <div className="chat-page-container">{error}</div>;
  }

  if (!otherUser) {
    return <div className="chat-page-container">User not found</div>;
  }

  return (
    <div className="chat-page-container">
      <Messaging
        otherUserId={otherUser.id}
        otherUserName={otherUser.name}
        onClose={handleCloseChat}
      />
    </div>
  );
};

export default ChatPage; 