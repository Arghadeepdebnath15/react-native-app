import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, orderBy, where, updateDoc, onSnapshot, or } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/ChatList.css';
import md5 from 'crypto-js/md5';

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
        
        console.log('Found messages:', chatSnapshot.size);
        
        chatSnapshot.forEach((doc) => {
          const message = doc.data();
          console.log('Message data:', {
            senderId: message.senderId,
            receiverId: message.receiverId,
            currentUser: currentUser.uid
          });
          
          // Add both sender and receiver to the set if they're not the current user
          if (message.senderId !== currentUser.uid) {
            chattedUserIds.add(message.senderId);
          }
          if (message.receiverId !== currentUser.uid) {
            chattedUserIds.add(message.receiverId);
          }
        });

        console.log('Users with messages:', Array.from(chattedUserIds));

        // Then get all users
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('lastLogin', 'desc'));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const usersList = [];
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const userId = doc.id; // Get the document ID as the user ID
            
            if (userId !== currentUser.uid) {
              const hasChatted = chattedUserIds.has(userId);
              
              console.log('Processing user:', {
                name: userData.name,
                uid: userId,
                hasChatted: hasChatted,
                inChattedSet: chattedUserIds.has(userId)
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
                hasChatted: hasChatted
              });
            }
          });
          
          console.log('Total users:', usersList.length);
          console.log('Users with chats:', usersList.filter(u => u.hasChatted).length);
          console.log('Users with chats details:', usersList.filter(u => u.hasChatted).map(u => ({ name: u.name, uid: u.uid })));
          
          // Sort users to show chatted users first
          const sortedUsers = usersList.sort((a, b) => {
            if (a.hasChatted && !b.hasChatted) return -1;
            if (!a.hasChatted && b.hasChatted) return 1;
            return 0;
          });
          
          setUsers(sortedUsers);
          setFilteredUsers(sortedUsers);
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
      // Show only users with chats when no search term
      const filtered = users.filter(user => user.hasChatted);
      
      // Sort users to show chatted users first
      const sortedUsers = filtered.sort((a, b) => {
        if (a.hasChatted && !b.hasChatted) return -1;
        if (!a.hasChatted && b.hasChatted) return 1;
        return 0;
      });
      
      setFilteredUsers(sortedUsers);
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
        <h2>Messages</h2>
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
      ) : filteredUsers.length === 0 ? (
        <div className="no-conversations">
          {searchTerm ? (
            <p>No users found matching your search.</p>
          ) : (
            <p>No conversations yet. Start a new conversation by searching for a user.</p>
          )}
        </div>
      ) : (
        <div className="user-list">
          {filteredUsers.map((user, index) => {
            // Check if this is the first non-chatted user after chatted users
            const isFirstNonChatted = index > 0 && 
              !user.hasChatted && 
              filteredUsers[index - 1].hasChatted;
            
            return (
              <React.Fragment key={user.uid}>
                {isFirstNonChatted && (
                  <div className="user-list-divider">
                    <span>Other Users</span>
                  </div>
                )}
                <div
                  className={`user-item ${!user.hasChatted ? 'new-user' : ''}`}
                  onClick={() => handleUserSelect(user)}
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