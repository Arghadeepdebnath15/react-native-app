import React, { useState, useEffect, useRef } from 'react';
import TypingIndicator from './TypingIndicator';
// ... existing imports ...

interface Message {
  id?: string;
  text: string;
  sent: boolean;
  timestamp: Date | string;
}

interface MessagingProps {
  user: {
    id: string;
    name: string;
    status?: string;
  };
  messages: Message[];
  onSendMessage: (message: string) => void;
}

const Messaging: React.FC<MessagingProps> = ({ user, messages, onSendMessage }) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ... existing useEffect for scrolling ...

  // Handle typing indicator
  useEffect(() => {
    // When the user starts typing
    if (messageText && !isTyping) {
      setIsTyping(true);
      // Emit typing event to backend
      // This is where you would integrate with your backend
      // socket.emit('typing', { userId: currentUserId, recipientId: user.id });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        // Emit stopped typing event to backend
        // socket.emit('stopTyping', { userId: currentUserId, recipientId: user.id });
      }
    }, 2000); // Stop typing indicator after 2 seconds of no input

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageText, isTyping]);

  // Listen for typing events from other users
  useEffect(() => {
    // This is where you would listen for typing events from your backend
    // Example with WebSocket:
    // socket.on('userTyping', (data) => {
    //   if (data.userId === user.id) {
    //     setShowTypingIndicator(true);
    //   }
    // });
    // 
    // socket.on('userStoppedTyping', (data) => {
    //   if (data.userId === user.id) {
    //     setShowTypingIndicator(false);
    //   }
    // });
  }, [user.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText('');
      setIsTyping(false);
    }
  };

  return (
    <div className="messaging-container">
      {/* ... existing header ... */}
      
      <div className="messages-list" ref={messagesEndRef}>
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`message ${message.sent ? 'sent' : 'received'}`}
          >
            <div className="message-content">{message.text}</div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        ))}
        {showTypingIndicator && <TypingIndicator />}
      </div>

      <form className="message-input-form" onSubmit={handleSubmit}>
        <textarea
          className="message-input"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button type="submit" className="send-button" disabled={!messageText.trim()}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Messaging; 