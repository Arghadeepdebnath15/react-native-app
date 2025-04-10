import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage, getMessages, markMessagesAsRead } from '../services/messagingService';
import '../styles/Messaging.css';

const Messaging = ({ otherUserId, otherUserName, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!currentUser || !otherUserId) {
      console.log('Missing required data:', { currentUser, otherUserId });
      return;
    }

    console.log('Setting up message listener for:', {
      currentUserId: currentUser.uid,
      otherUserId: otherUserId
    });

    const unsubscribe = getMessages(currentUser.uid, otherUserId, (newMessages, type) => {
      console.log('Received new messages:', { type, messages: newMessages });
      
      setMessages(prevMessages => {
        // Filter out existing messages of the same type
        const filteredMessages = prevMessages.filter(msg => 
          !(type === 'sent' && msg.senderId === currentUser.uid) &&
          !(type === 'received' && msg.senderId === otherUserId)
        );
        
        // Add new messages and sort by timestamp
        const updatedMessages = [...filteredMessages, ...newMessages]
          .sort((a, b) => {
            const timeA = a.timestamp?.seconds || 0;
            const timeB = b.timestamp?.seconds || 0;
            return timeA - timeB;
          });
        
        console.log('Updated messages:', updatedMessages);
        return updatedMessages;
      });
      setLoading(false);
    });

    // Mark messages as read
    markMessagesAsRead(currentUser.uid, otherUserId);

    return () => {
      console.log('Cleaning up message listener');
      unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentUser, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      // Simulate typing indicator for demo purposes
      // In a real app, you would emit a typing event to the server
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !otherUserId) {
      console.log('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasCurrentUser: !!currentUser, 
        hasOtherUserId: !!otherUserId 
      });
      return;
    }

    try {
      setError('');
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      console.log('Sending message:', {
        senderId: currentUser.uid,
        receiverId: otherUserId,
        message: newMessage.trim()
      });
      
      await sendMessage(currentUser.uid, otherUserId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="messaging-container">
      <div className="messaging-header">
        <div className="header-content">
          <h3>Chat with {otherUserName}</h3>
          <div className="user-status">You are chatting as {currentUser.displayName || 'Guest'}</div>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="messages-list">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation with {otherUserName}!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${
                  message.senderId === currentUser.uid ? 'sent' : 'received'
                }`}
              >
                <div className="message-content">{message.message}</div>
                <div className="message-time">
                  {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
                <div className="typing-text">{otherUserName} is typing...</div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder={`Type a message to ${otherUserName}...`}
          className="message-input"
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Messaging; 