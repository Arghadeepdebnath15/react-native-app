import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage, getMessages, markMessagesAsRead } from '../services/messagingService';
import '../styles/Messaging.css';

const Messaging = ({ otherUserId, otherUserName, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser || !otherUserId) return;

    const unsubscribe = getMessages(currentUser.uid, otherUserId, (newMessages, type) => {
      setMessages(prevMessages => {
        // Filter out existing messages of the same type
        const filteredMessages = prevMessages.filter(msg => 
          !(type === 'sent' && msg.senderId === currentUser.uid) &&
          !(type === 'received' && msg.senderId === otherUserId)
        );
        
        // Add new messages and sort by timestamp
        return [...filteredMessages, ...newMessages]
          .sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
      });
      setLoading(false);
    });

    // Mark messages as read
    markMessagesAsRead(currentUser.uid, otherUserId);

    return () => {
      unsubscribe();
    };
  }, [currentUser, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !otherUserId) return;

    try {
      await sendMessage(currentUser.uid, otherUserId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="messaging-container">
      <div className="messaging-header">
        <h3>Chat with {otherUserName}</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="messages-list">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.senderId === currentUser.uid ? 'sent' : 'received'
              }`}
            >
              <div className="message-content">{message.message}</div>
              <div className="message-time">
                {message.timestamp?.toDate().toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Messaging; 