// socket.js - Socket.io client setup

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('authTokens') ? 
            JSON.parse(localStorage.getItem('authTokens')).accessToken : null
        }
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to server');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('user_list', (userList) => {
        setUsers(userList);
      });

      newSocket.on('user_joined', (user) => {
        console.log(`${user.username} joined the chat`);
      });

      newSocket.on('user_left', (user) => {
        console.log(`${user.username} left the chat`);
      });

      newSocket.on('receive_message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('typing_users', (users) => {
        setTypingUsers(users);
      });

      newSocket.on('message_reaction', (data) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId ? { ...msg, reactions: data.reactions } : msg
        ));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      socket.emit('send_message', messageData);
    }
  };

  const sendPrivateMessage = (recipientId, messageData) => {
    if (socket && isConnected) {
      socket.emit('send_private_message', {
        recipient: recipientId,
        ...messageData
      });
    }
  };

  const setTyping = (isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing', isTyping);
    }
  };

  const addReaction = (messageId, reaction) => {
    if (socket && isConnected) {
      socket.emit('add_reaction', { messageId, reaction });
    }
  };

  const joinRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leave_room', roomId);
    }
  };

  const loadMoreMessages = async (page = 1, limit = 50) => {
    if (isLoadingMessages || !hasMoreMessages) return;
    
    setIsLoadingMessages(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/api/messages?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authTokens') ? 
              JSON.parse(localStorage.getItem('authTokens')).accessToken : ''}`
          }
        }
      );
      
      if (response.ok) {
        const olderMessages = await response.json();
        
        if (olderMessages.length < limit) {
          setHasMoreMessages(false);
        }
        
        setMessageHistory(prev => [...olderMessages, ...prev]);
        return olderMessages;
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const value = {
    socket,
    messages,
    users,
    typingUsers,
    isConnected,
    messageHistory,
    hasMoreMessages,
    isLoadingMessages,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    addReaction,
    joinRoom,
    leaveRoom,
    loadMoreMessages
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Custom hook for using socket.io
export const useSocketOld = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // Connect to socket server
  const connect = (username) => {
    socket.connect();
    if (username) {
      socket.emit('user_join', username);
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message
  const sendMessage = (message) => {
    socket.emit('send_message', { message });
  };

  // Send a private message
  const sendPrivateMessage = (recipientId, content) => {
    console.log('Sending private message to:', recipientId);
    socket.emit('send_private_message', { recipientId, content });
  };

  // Set typing status
  const setTyping = (isTyping) => {
    socket.emit('typing', isTyping);
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      // You could add a system message here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onUserLeft = (user) => {
      // You could add a system message here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
    };
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
  };
};

export default socket;

// Listen for private messages
socket.on('receive_private_message', (message) => {
  // Handle displaying the private message in your UI
});

// Private messaging functions
export const sendPrivateMessageOld = (recipientId, content) => {
  console.log('Sending private message to:', recipientId);
  socket.emit('send_private_message', { recipientId, content });
};

export const getPrivateMessages = (recipientId) => {
  console.log('Getting private messages with:', recipientId);
  socket.emit('get_private_messages', { recipientId });
};

// Room management functions
export const joinRoom = (roomId) => {
  console.log('Joining room:', roomId);
  socket.emit('join_room', roomId);
};

export const leaveRoom = (roomId) => {
  console.log('Leaving room:', roomId);
  socket.emit('leave_room', roomId);
};

export const sendRoomMessage = (roomId, content, messageType = 'text', fileData = null) => {
  console.log('Sending room message to:', roomId);
  socket.emit('send_room_message', {
    roomId,
    content,
    messageType,
    ...fileData
  });
};

export const getRooms = () => {
  console.log('Getting rooms list');
  socket.emit('get_rooms');
};

// Enhanced typing indicators
export const startTypingInRoom = (roomId) => {
  socket.emit('typing_in_room', { roomId });
};

export const stopTypingInRoom = (roomId) => {
  socket.emit('stop_typing_in_room', { roomId });
};

export const startTypingPrivate = (recipientId) => {
  socket.emit('typing_private', { recipientId });
};

export const stopTypingPrivate = (recipientId) => {
  socket.emit('stop_typing_private', { recipientId });
};

// Reaction functions
export const addReaction = (messageId, reaction) => {
  console.log('Adding reaction:', reaction, 'to message:', messageId);
  socket.emit('add_reaction', { messageId, reaction });
};

export const removeReaction = (messageId, reaction) => {
  console.log('Removing reaction:', reaction, 'from message:', messageId);
  socket.emit('remove_reaction', { messageId, reaction });
};

// Read receipt functions
export const markMessageAsRead = (messageId) => {
  socket.emit('mark_message_read', { messageId });
};

export const markMessagesAsRead = (messageIds) => {
  socket.emit('mark_messages_read', { messageIds });
};

// File upload helper function
export const uploadFile = async (file) => {
  try {
    console.log('Uploading file:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('File upload failed');
    }
    
    const result = await response.json();
    console.log('File uploaded successfully:', result);
    return result;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const useSocketAlt = (user) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (user) {
      // Get token from localStorage
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        const newSocket = io('http://localhost:5000', {
          auth: {
            token: token
          }
        });

        newSocket.on('connect', () => {
          setIsConnected(true);
          console.log('Connected to server');
        });

        newSocket.on('disconnect', () => {
          setIsConnected(false);
          console.log('Disconnected from server');
        });

        newSocket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          setIsConnected(false);
        });

        newSocket.on('message', (message) => {
          setMessages(prev => [...prev, message]);
        });

        newSocket.on('private_message', (message) => {
          setMessages(prev => [...prev, { ...message, isPrivate: true }]);
        });

        newSocket.on('user_list', (userList) => {
          setUsers(userList);
        });

        newSocket.on('user_joined', (user) => {
          console.log('User joined:', user.username);
        });

        newSocket.on('user_left', (user) => {
          console.log('User left:', user.username);
        });

        newSocket.on('typing', (data) => {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.userId !== data.userId);
            if (data.isTyping) {
              return [...filtered, data];
            }
            return filtered;
          });
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      }
    }
  }, [user]);

  const sendMessage = (messageData) => {
    if (socket && isConnected) {
      socket.emit('message', messageData);
    }
  };

  const sendPrivateMessage = (recipientId, messageData) => {
    if (socket && isConnected) {
      socket.emit('private_message', {
        recipientId,
        ...messageData
      });
    }
  };

  const setTyping = (isTyping, room = null, recipientId = null) => {
    if (socket && isConnected) {
      socket.emit('typing', {
        isTyping,
        room,
        recipientId
      });
    }
  };

  return {
    socket,
    isConnected,
    messages,
    users,
    typingUsers,
    sendMessage,
    sendPrivateMessage,
    setTyping
  };
};