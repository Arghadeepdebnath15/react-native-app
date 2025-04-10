import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, orderBy, where, onSnapshot, or, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/ChatList.css';
import md5 from 'crypto-js/md5';

const ChatList = ({ _onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [_notifications, setShowNotifications] = useState({});
  const [showAllUsers, setShowAllUsers] = useState(true);
  const { currentUser } = useAuth();

  const _handleSearch = () => {
    // ... existing code ...
  };

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const counts = {};
        const notifications = {};
        const messagesRef = collection(db, 'messages');
        const q = query(
          messagesRef,
          where('receiverId', '==', currentUser.uid),
          where('read', '==', false)
        );
        const querySnapshot = await getDocs(q);
        
        // Reset counts for all users
        users.forEach(user => {
          counts[user.uid] = 0;
          notifications[user.uid] = false;
        });
        
        // Update counts for users with unread messages
        querySnapshot.forEach((doc) => {
          const message = doc.data();
          counts[message.senderId] = (counts[message.senderId] || 0) + 1;
          notifications[message.senderId] = true;
        });
        
        setUnreadCounts(counts);
        setShowNotifications(notifications);
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };

    if (currentUser && users.length > 0) {
      fetchUnreadCounts();
      // Set up a real-time listener for unread messages
      const interval = setInterval(fetchUnreadCounts, 2000); // Check every 2 seconds
      return () => clearInterval(interval);
    }
  }, [currentUser, users]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;

      try {
        console.log('Current user ID:', currentUser.uid);
        
        // First, get all users you've chatted with from messages collection
        const messagesRef = collection(db, 'messages');
        const chatQuery = query(
          messagesRef,
          or(
            where('senderId', '==', currentUser.uid),
            where('receiverId', '==', currentUser.uid)
          )
        );

        const chatSnapshot = await getDocs(chatQuery);
        const chattedUserIds = new Set();
        const userMessages = new Map(); // Map to store messages for each user
        
        console.log('Found messages:', chatSnapshot.size);
        
        chatSnapshot.forEach((doc) => {
          const message = doc.data();
          const otherUserId = message.senderId === currentUser.uid ? message.receiverId : message.senderId;
          
          // Only add messages for the specific user
          if (!userMessages.has(otherUserId)) {
            userMessages.set(otherUserId, []);
          }
          
          // Add message to specific user's messages array
          userMessages.get(otherUserId).push({
            ...message,
            id: doc.id,
            timestamp: message.timestamp?.toDate() || new Date()
          });
          
          // Add user to chatted set
          chattedUserIds.add(otherUserId);
        });

        // Sort messages by timestamp for each user
        userMessages.forEach((messages, _userId) => {
          messages.sort((a, b) => b.timestamp - a.timestamp);
        });

        console.log('Users with messages:', Array.from(chattedUserIds));
        console.log('Messages by user:', Object.fromEntries(userMessages));

        // Then get all users
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('lastLogin', 'desc'));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const usersList = [];
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const userId = doc.id;
            
            if (userId !== currentUser.uid) {
              const hasChatted = chattedUserIds.has(userId);
              const userMessagesList = userMessages.get(userId) || []; // Get messages only for this specific user
              const lastMessage = userMessagesList[0]; // Get the most recent message
              
              console.log('Processing user:', {
                name: userData.name,
                uid: userId,
                hasChatted: hasChatted,
                messageCount: userMessagesList.length,
                lastMessage: lastMessage?.text
              });
              
              // Always add users, but mark if they've chatted
              const emailHash = userData.email ? 
                md5(userData.email.toLowerCase().trim()) : 
                '00000000000000000000000000000000';
              const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=200`;
              
              const isGoogleUser = userData.providerData && 
                Array.isArray(userData.providerData) && 
                userData.providerData.some(provider => provider.providerId === 'google.com');
              
              const profilePicture = isGoogleUser
                ? userData.photoURL || gravatarUrl
                : userData.profilePicture || userData.photoURL || userData.avatar || gravatarUrl;
              
              usersList.push({
                id: doc.id,
                uid: userId,
                name: userData.name || userData.displayName || 'Anonymous',
                email: userData.email || '',
                photoURL: profilePicture,
                lastLogin: userData.lastLogin,
                role: userData.role || 'user',
                isGoogleUser: isGoogleUser,
                hasChatted: hasChatted,
                messages: userMessagesList, // Only messages for this specific user
                lastMessage: lastMessage,
                unreadCount: userMessagesList.filter(m => !m.read && m.senderId !== currentUser.uid).length
              });
            }
          });
          
          console.log('Total users:', usersList.length);
          console.log('Users with chats:', usersList.filter(u => u.hasChatted).length);
          console.log('Users with chats details:', usersList.filter(u => u.hasChatted).map(u => ({ 
            name: u.name, 
            uid: u.uid,
            messageCount: u.messages.length,
            lastMessage: u.lastMessage?.text
          })));
          
          // Sort users to show chatted users first, then by most recent message
          const sortedUsers = usersList.sort((a, b) => {
            if (a.hasChatted && !b.hasChatted) return -1;
            if (!a.hasChatted && b.hasChatted) return 1;
            if (a.lastMessage && b.lastMessage) {
              return b.lastMessage.timestamp - a.lastMessage.timestamp;
            }
            return 0;
          });
          
          setUsers(sortedUsers);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      // Filter users based on showAllUsers state
      const filtered = showAllUsers 
        ? [...users] 
        : users.filter(user => {
            console.log('Checking user:', user.name, 'hasChatted:', user.hasChatted);
            return user.hasChatted;
          });
      
      console.log('Filtered users:', filtered.length);
      console.log('Users with chats:', filtered.filter(u => u.hasChatted).length);
      
      // Sort users to show chatted users first
      const sortedUsers = filtered.sort((a, b) => {
        if (a.hasChatted && !b.hasChatted) return -1;
        if (!a.hasChatted && b.hasChatted) return 1;
        return 0;
      });
      
      setUsers(sortedUsers);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = users.filter(user => {
      const nameMatch = user.name?.toLowerCase().includes(searchLower);
      const emailMatch = user.email?.toLowerCase().includes(searchLower);
      return nameMatch || emailMatch;
    });

    setUsers(filtered);
  }, [searchTerm, users, showAllUsers]);

  const handleUserSelect = async (_userId) => {
    try {
      // Mark messages as read for this specific user only
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('receiverId', '==', currentUser.uid),
        where('senderId', '==', _userId),
        where('read', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(async (doc) => {
        await updateDoc(doc.ref, { read: true });
      });
      
      await Promise.all(updatePromises);
      
      // Update unread counts only for this specific user
      setUnreadCounts(prev => ({
        ...prev,
        [_userId]: 0
      }));
      
      setShowNotifications(prev => ({
        ...prev,
        [_userId]: false
      }));
      
      // Pass only this user's messages to the parent component
      const userMessages = users.find(u => u.uid === _userId)?.messages || [];
      _onSelectUser({
        ...users.find(u => u.uid === _userId),
        messages: userMessages
      });
    } catch (error) {
      console.error('Error handling user selection:', error);
    }
  };

  if (!currentUser) {
    return <div className="chat-list-container">Please log in to view chat list</div>;
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <div className="header-top">
          <h2>Messages</h2>
          <button 
            className="toggle-users-btn"
            onClick={() => setShowAllUsers(!showAllUsers)}
          >
            {showAllUsers ? 'Show Only Chats' : 'Show All Users'}
          </button>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading conversations...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="no-conversations">
          {searchTerm ? (
            <p>No users found matching your search.</p>
          ) : (
            <p>No conversations yet. Start a new conversation by searching for a user.</p>
          )}
        </div>
      ) : (
        <div className="user-list">
          {users.map((user, index) => {
            // Check if this is the first non-chatted user after chatted users
            const isFirstNonChatted = index > 0 && 
              !user.hasChatted && 
              users[index - 1].hasChatted;
            
            return (
              <React.Fragment key={user.uid}>
                {isFirstNonChatted && (
                  <div className="user-list-divider">
                    <span>Other Users</span>
                  </div>
                )}
                <div
                  className={`user-item ${!user.hasChatted ? 'new-user' : ''}`}
                  onClick={() => handleUserSelect(user.uid)}
                >
                  {user.hasChatted && unreadCounts[user.uid] > 0 && (
                    <div className="chat-notification">
                      New messages from {user.name}!
                    </div>
                  )}
                  <div className="user-avatar">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={`${user.name}'s avatar`}
                        onError={(e) => {
                          e.target.onerror = null;
                          const emailHash = user.email ? 
                            md5(user.email.toLowerCase().trim()) : 
                            '00000000000000000000000000000000';
                          e.target.src = `https://www.gravatar.com/avatar/${emailHash}?d=identicon&s=200`;
                        }}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {user.hasChatted && unreadCounts[user.uid] > 0 && (
                      <span className="unread-badge">{unreadCounts[user.uid]}</span>
                    )}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                    <div className="user-role">{user.role}</div>
                    {!user.hasChatted && (
                      <div className="new-user-label">New User</div>
                    )}
                  </div>
                  <div className="user-actions">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList; 