import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/MessageButton.css';

const MessageButton = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const markMessagesAsRead = async () => {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('receiverId', '==', currentUser.uid),
        where('read', '==', false)
      );
      const querySnapshot = await getDocs(q);
      
      const updatePromises = querySnapshot.docs.map(async (doc) => {
        await updateDoc(doc.ref, { read: true });
      });
      
      await Promise.all(updatePromises);
      setHasNewMessages(false);
      setShowNotification(false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const messagesRef = collection(db, 'messages');
        const q = query(
          messagesRef,
          where('receiverId', '==', currentUser.uid),
          where('read', '==', false)
        );
        const querySnapshot = await getDocs(q);
        
        const hasUnread = querySnapshot.size > 0;
        setHasNewMessages(hasUnread);
        if (hasUnread) {
          setShowNotification(true);
        }
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };

    if (currentUser) {
      fetchUnreadCounts();
      // Set up a real-time listener for unread messages
      const interval = setInterval(fetchUnreadCounts, 2000); // Check every 2 seconds
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleMessageClick = async () => {
    if (!currentUser) {
      // Redirect to login or show login modal
      return;
    }
    await markMessagesAsRead();
    navigate('/messages');
  };

  return (
    <div className="message-button-container">
      {showNotification && (
        <div className="new-message-notification">
          New messages available!
        </div>
      )}
      <button 
        className="message-button"
        onClick={handleMessageClick}
      >
        Messages
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
        {hasNewMessages && <span className="badge">!</span>}
      </button>
    </div>
  );
};

export default MessageButton; 