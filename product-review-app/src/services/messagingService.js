import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  getDocs,
  updateDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { auth } from '../firebase/config';

// Create a new message
export const sendMessage = async (senderId, receiverId, message) => {
  try {
    console.log('Creating new message:', { senderId, receiverId, message });
    const messagesRef = collection(db, 'messages');
    const newMessage = {
      senderId,
      receiverId,
      message,
      timestamp: serverTimestamp(),
      read: false
    };
    console.log('Message data:', newMessage);
    const docRef = await addDoc(messagesRef, newMessage);
    console.log('Message created with ID:', docRef.id);
    return docRef;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages between two users
export const getMessages = (userId, otherUserId, callback) => {
  console.log('Setting up message listeners for:', { userId, otherUserId });
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

  console.log('Created queries:', { sentQuery, receivedQuery });

  // Listen to both queries
  const unsubscribeSent = onSnapshot(sentQuery, (snapshot) => {
    console.log('Received sent messages update:', snapshot.docs.length);
    const messages = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({ 
        id: doc.id, 
        ...data,
        timestamp: data.timestamp // Ensure timestamp is included
      });
    });
    callback(messages, 'sent');
  }, (error) => {
    console.error('Error in sent messages listener:', error);
  });

  const unsubscribeReceived = onSnapshot(receivedQuery, (snapshot) => {
    console.log('Received received messages update:', snapshot.docs.length);
    const messages = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({ 
        id: doc.id, 
        ...data,
        timestamp: data.timestamp // Ensure timestamp is included
      });
    });
    callback(messages, 'received');
  }, (error) => {
    console.error('Error in received messages listener:', error);
  });

  // Return cleanup function
  return () => {
    console.log('Cleaning up message listeners');
    unsubscribeSent();
    unsubscribeReceived();
  };
};

// Mark messages as read
export const markMessagesAsRead = async (userId, otherUserId) => {
  try {
    console.log('Marking messages as read:', { userId, otherUserId });
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('receiverId', '==', userId),
      where('senderId', '==', otherUserId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    console.log('Found unread messages:', querySnapshot.size);
    
    const updatePromises = querySnapshot.docs.map(doc => {
      return updateDoc(doc.ref, { read: true });
    });

    await Promise.all(updatePromises);
    console.log('Messages marked as read');
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Get unread message count
export const getUnreadMessageCount = async (userId) => {
  try {
    console.log('Getting unread message count for:', userId);
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('receiverId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    console.log('Unread messages count:', querySnapshot.size);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    throw error;
  }
};

// Typing status functions
export const startTyping = async (userId, otherUserId) => {
  try {
    const typingRef = doc(db, 'typing', `${userId}_${otherUserId}`);
    await setDoc(typingRef, {
      userId,
      otherUserId,
      isTyping: true,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error setting typing status:', error);
  }
};

export const stopTyping = async (userId, otherUserId) => {
  try {
    const typingRef = doc(db, 'typing', `${userId}_${otherUserId}`);
    await setDoc(typingRef, {
      userId,
      otherUserId,
      isTyping: false,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error clearing typing status:', error);
  }
};

export const onTypingStatusChange = (otherUserId, callback) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};

  const typingQuery = query(
    collection(db, 'typing'),
    where('otherUserId', '==', currentUser.uid),
    where('userId', '==', otherUserId)
  );

  return onSnapshot(typingQuery, (snapshot) => {
    const typingStatus = snapshot.docs[0]?.data();
    callback(typingStatus?.isTyping || false);
  });
}; 