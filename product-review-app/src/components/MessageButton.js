import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChatList from './ChatList';
import '../styles/MessageButton.css';

const MessageButton = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showChatList, setShowChatList] = useState(false);

  const handleMessageClick = () => {
    if (!currentUser) {
      // Redirect to login or show login modal
      return;
    }
    navigate('/messages');
  };

  return (
    <button 
      className="message-button"
      onClick={handleMessageClick}
    >
      Messages
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
    </button>
  );
};

export default MessageButton; 