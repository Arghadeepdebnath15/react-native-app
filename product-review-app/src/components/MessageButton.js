import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Messaging from './Messaging';
import '../styles/MessageButton.css';

const MessageButton = ({ userId, userName }) => {
  const { currentUser } = useAuth();
  const [showMessaging, setShowMessaging] = useState(false);

  const handleMessageClick = () => {
    if (!currentUser) {
      // Redirect to login or show login modal
      return;
    }
    setShowMessaging(true);
  };

  return (
    <>
      <button 
        className="message-button"
        onClick={handleMessageClick}
      >
        Message
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </button>

      {showMessaging && (
        <Messaging
          otherUserId={userId}
          otherUserName={userName}
          onClose={() => setShowMessaging(false)}
        />
      )}
    </>
  );
};

export default MessageButton; 