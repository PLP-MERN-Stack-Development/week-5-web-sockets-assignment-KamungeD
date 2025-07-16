import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../socket/socket';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import MessageList from '../components/Chat/MessageList';
import MessageInput from '../components/Chat/MessageInput';
import TypingIndicator from '../components/Chat/TypingIndicator';
import NotificationManager from '../components/Notifications/NotificationManager';

const ChatPage = ({ username, onDisconnect }) => {
  const socket = useSocket();
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentRoom, setCurrentRoom] = useState({ id: 'general', name: 'General' });
  const [chatRooms] = useState([
    { id: 'general', name: 'General' },
    { id: 'random', name: 'Random' }
  ]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    messages,
    users,
    typingUsers,
    sendMessage,
    setTyping,
    sendPrivateMessage,
    isConnected
  } = socket;

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === 'granted');
      });
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (message) => {
    if (selectedUser) {
      sendPrivateMessage(selectedUser.id, message);
    } else {
      sendMessage(message);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('room', currentRoom.id);
    
    fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      sendMessage({
        type: 'file',
        content: data.filename,
        fileUrl: data.url,
        room: currentRoom.id
      });
    });
  };

  const handleMessageReact = (messageId, reaction) => {
    // Implementation for message reactions
    console.log('Message reaction:', messageId, reaction);
  };

  const handleCreateRoom = () => {
    const roomName = prompt('Enter room name:');
    if (roomName) {
      // Implementation for creating new room
      console.log('Create room:', roomName);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header 
        username={username} 
        onlineUsers={users} 
        onDisconnect={onDisconnect}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          onlineUsers={users}
          currentUser={username}
          onUserSelect={setSelectedUser}
          selectedUser={selectedUser}
          chatRooms={chatRooms}
          currentRoom={currentRoom}
          onRoomSelect={setCurrentRoom}
          onCreateRoom={handleCreateRoom}
        />
        
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-100 p-2 border-b">
            <h2 className="font-semibold">
              {selectedUser ? `Private chat with ${selectedUser.username}` : `# ${currentRoom.name}`}
            </h2>
            {!isConnected && (
              <span className="text-red-500 text-sm">Disconnected - Reconnecting...</span>
            )}
          </div>
          
          <MessageList
            messages={messages}
            currentUser={username}
            onMessageReact={handleMessageReact}
          />
          
          <TypingIndicator typingUsers={typingUsers} />
          
          <MessageInput
            onSendMessage={handleSendMessage}
            onTyping={setTyping}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
      
      <NotificationManager
        newMessage={messages[messages.length - 1]}
        soundEnabled={soundEnabled}
        notificationsEnabled={notificationsEnabled}
      />
    </div>
  );
};

export default ChatPage;