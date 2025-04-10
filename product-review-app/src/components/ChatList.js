import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, orderBy, where, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/ChatList.css';

const ChatList = ({ onSelectUser }) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showNotifications, setShowNotifications] = useState({});

  const markMessagesAsRead = async (senderId) => {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('receiverId', '==', currentUser.uid),
        where('senderId', '==', senderId),
        where('read', '==', false)
      );
      const querySnapshot = await getDocs(q);
      
      const updatePromises = querySnapshot.docs.map(async (doc) => {
        await updateDoc(doc.ref, { read: true });
      });
      
      await Promise.all(updatePromises);
      
      // Update unread counts and notifications
      setUnreadCounts(prev => ({
        ...prev,
        [senderId]: 0
      }));
      setShowNotifications(prev => ({
        ...prev,
        [senderId]: false
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
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
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('lastLogin', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const usersList = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.uid !== currentUser.uid) {
            usersList.push({
              id: doc.id,
              uid: userData.uid,
              name: userData.name || userData.displayName || 'Anonymous',
              email: userData.email || '',
              photoURL: userData.photoURL || userData.avatar || '',
              lastLogin: userData.lastLogin,
              role: userData.role || 'user'
            });
          }
        });
        
        setUsers(usersList);
        setFilteredUsers(usersList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = users.filter(user => {
      const nameMatch = user.name?.toLowerCase().includes(searchLower);
      const emailMatch = user.email?.toLowerCase().includes(searchLower);
      return nameMatch || emailMatch;
    });

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleUserSelect = async (user) => {
    await markMessagesAsRead(user.uid);
    onSelectUser(user);
  };

  if (!currentUser) {
    return <div className="chat-list-container">Please log in to view chat list</div>;
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h3>Chat List</h3>
        <div className="search-container">
          <div className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="no-users-container">
          <div className="no-users-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <p>{searchTerm ? 'No users found matching your search' : 'No users found'}</p>
        </div>
      ) : (
        <div className="users-list">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="user-item"
              onClick={() => handleUserSelect(user)}
            >
              {showNotifications[user.uid] && (
                <div className="chat-notification">
                  New messages from {user.name}!
                </div>
              )}
              <div className="user-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {unreadCounts[user.uid] > 0 && (
                  <span className="unread-badge">{unreadCounts[user.uid]}</span>
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
                <div className="user-role">{user.role}</div>
              </div>
              <div className="user-actions">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList; 