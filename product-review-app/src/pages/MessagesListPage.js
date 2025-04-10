import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChatList from '../components/ChatList';
import Messaging from '../components/Messaging';
import '../styles/MessagesListPage.css';

const MessagesListPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleCloseChat = () => {
    setSelectedUser(null);
  };

  const handleBack = () => {
    if (isMobile && selectedUser) {
      handleCloseChat();
    } else {
      navigate('/');
    }
  };

  if (!currentUser) {
    return <div className="messages-list-container">Please log in to view messages</div>;
  }

  return (
    <div className="messages-list-container">
      <div className="messages-list-header">
        <button className="back-button" onClick={handleBack}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <h2>{isMobile && selectedUser ? `Chat with ${selectedUser.name}` : 'Messages'}</h2>
      </div>
      <div className={`messages-content ${isMobile && selectedUser ? 'mobile-chat-active' : ''}`}>
        {(!isMobile || !selectedUser) && (
          <div className="chat-list-section">
            <ChatList onSelectUser={handleUserSelect} />
          </div>
        )}
        {selectedUser && (
          <div className="chat-section">
            <Messaging
              otherUserId={selectedUser.id}
              otherUserName={selectedUser.name}
              onClose={handleCloseChat}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesListPage; 