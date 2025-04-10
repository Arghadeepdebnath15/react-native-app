import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/ChatList.css';

const ChatList = ({ onSelectUser }) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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

  if (!currentUser) {
    return <div className="chat-list-container">Please log in to view chat list</div>;
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h3>Chat List</h3>
        <div className="search-container">
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
        <div className="loading">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="no-users">
          {searchTerm ? 'No users found matching your search' : 'No users found'}
        </div>
      ) : (
        <div className="users-list">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="user-item"
              onClick={() => onSelectUser(user)}
            >
              <div className="user-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList; 