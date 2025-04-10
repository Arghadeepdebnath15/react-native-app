import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  getDocs,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Create a new message
export const sendMessage = async (senderId, receiverId, message) => {
  try {
    const messagesRef = collection(db, 'messages');
    const newMessage = {
      senderId,
      receiverId,
      message,
      timestamp: serverTimestamp(),
      read: false
    };
    return await addDoc(messagesRef, newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages between two users
export const getMessages = (userId, otherUserId, callback) => {
  const messagesRef = collection(db, 'messages');
  
  // Create two separate queries and combine results
  const sentQuery = query(
    messagesRef,
    where('senderId', '==', userId),
    where('receiverId', '==', otherUserId),
    orderBy('timestamp', 'asc')
  );

  const receivedQuery = query(
    messagesRef,
    where('senderId', '==', otherUserId),
    where('receiverId', '==', userId),
    orderBy('timestamp', 'asc')
  );

  // Listen to both queries
  const unsubscribeSent = onSnapshot(sentQuery, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages, 'sent');
  });

  const unsubscribeReceived = onSnapshot(receivedQuery, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages, 'received');
  });

  // Return cleanup function
  return () => {
    unsubscribeSent();
    unsubscribeReceived();
  };
};

// Mark messages as read
export const markMessagesAsRead = async (userId, otherUserId) => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('receiverId', '==', userId),
      where('senderId', '==', otherUserId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(doc => {
      return updateDoc(doc.ref, { read: true });
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Get unread message count
export const getUnreadMessageCount = async (userId) => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('receiverId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    throw error;
  }
}; 