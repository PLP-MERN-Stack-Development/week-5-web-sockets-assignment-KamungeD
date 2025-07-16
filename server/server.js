// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const userService = require('./services/userService');
const messageService = require('./services/messageService');
const multer = require('multer');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// File upload handler
const handleFileUpload = async (fileData) => {
  // Implement actual file upload logic
  // This is a placeholder
  return `/uploads/${fileData.filename}`;
};

const upload = multer({ dest: 'uploads/' });
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ 
    filename: req.file.originalname, 
    url: fileUrl 
  });
});

// In-memory storage for active typing users (can remain in memory)
const typingUsers = {};

// Add rooms functionality
const rooms = new Map();

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', async (username) => {
    try {
      const user = await userService.createOrUpdateUser(username, socket.id);
      
      // Get all online users
      const onlineUsers = await userService.getOnlineUsers();
      
      // Emit user list to all clients
      io.emit('user_list', onlineUsers);
      io.emit('user_joined', { username: user.username, id: user._id });
      
      console.log(`${username} joined the chat`);
    } catch (error) {
      console.error('Error handling user join:', error.message);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Handle room joining
  socket.on('join_room', async (roomName) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      // Leave current room
      const currentRoom = Array.from(socket.rooms).find(room => room !== socket.id);
      if (currentRoom) {
        socket.leave(currentRoom);
      }

      // Join new room
      socket.join(roomName);
      
      // Add room to rooms map
      if (!rooms.has(roomName)) {
        rooms.set(roomName, new Set());
      }
      rooms.get(roomName).add(user._id);

      // Notify room about new user
      socket.to(roomName).emit('user_joined_room', {
        username: user.username,
        room: roomName
      });

      // Send room message history
      const roomMessages = await messageService.getMessagesByRoom(roomName);
      socket.emit('room_messages', roomMessages);

    } catch (error) {
      console.error('Error joining room:', error);
    }
  });

  // Handle room leaving
  socket.on('leave_room', async (roomName) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      socket.leave(roomName);
      
      if (rooms.has(roomName)) {
        rooms.get(roomName).delete(user._id);
        if (rooms.get(roomName).size === 0) {
          rooms.delete(roomName);
        }
      }

      socket.to(roomName).emit('user_left_room', {
        username: user.username,
        room: roomName
      });

    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Enhanced message handling with rooms
  socket.on('send_message', async (messageData) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      const message = await messageService.createMessage({
        sender: user._id,
        senderName: user.username,
        content: messageData.content || messageData.message,
        room: messageData.room || 'general',
        type: messageData.type || 'text',
        fileUrl: messageData.fileUrl,
        isPrivate: false
      });

      const messageToSend = {
        id: message._id,
        sender: message.senderName,
        senderId: message.sender,
        message: message.content,
        timestamp: message.createdAt,
        reactions: message.reactions,
        type: message.type,
        fileUrl: message.fileUrl,
        room: message.room
      };

      // Send to room
      io.to(messageData.room || 'general').emit('receive_message', messageToSend);

      // Send notifications to offline users
      const roomUsers = rooms.get(messageData.room || 'general') || new Set();
      for (const userId of roomUsers) {
        const roomUser = await userService.getUserById(userId);
        if (roomUser && !roomUser.isOnline) {
          // Here you would typically send push notifications
          // For now, we'll just log it
          console.log(`Notification for ${roomUser.username}: New message in ${messageData.room}`);
        }
      }

    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Handle read receipts
  socket.on('message_read', async ({ messageId, room }) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      const message = await messageService.markAsRead(messageId, user._id);
      
      io.to(room).emit('message_read_receipt', {
        messageId,
        readBy: message.readBy
      });

    } catch (error) {
      console.error('Error handling read receipt:', error);
    }
  });

  // Handle file uploads
  socket.on('file_upload', async (fileData) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      // Process file upload (you'd implement actual file handling)
      const fileUrl = await handleFileUpload(fileData);
      
      const message = await messageService.createMessage({
        sender: user._id,
        senderName: user.username,
        content: fileData.filename,
        room: fileData.room || 'general',
        type: 'file',
        fileUrl: fileUrl,
        isPrivate: false
      });

      io.to(fileData.room || 'general').emit('receive_message', {
        id: message._id,
        sender: message.senderName,
        senderId: message.sender,
        message: message.content,
        timestamp: message.createdAt,
        type: 'file',
        fileUrl: message.fileUrl,
        room: message.room
      });

    } catch (error) {
      console.error('Error handling file upload:', error);
    }
  });

  // Handle typing indicator (keep in memory for performance)
  socket.on('typing', async (isTyping) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (user) {
        if (isTyping) {
          typingUsers[socket.id] = user.username;
        } else {
          delete typingUsers[socket.id];
        }
        io.emit('typing_users', Object.values(typingUsers));
      }
    } catch (error) {
      console.error('Error handling typing:', error.message);
    }
  });

  // Handle message reactions
  socket.on('message_reaction', async ({ messageId, reaction }) => {
    try {
      const user = await userService.getUserBySocketId(socket.id);
      if (!user) return;

      const message = await messageService.addReaction(messageId, user._id, reaction);
      
      io.emit('message_reaction', {
        messageId,
        reactions: message.reactions
      });
    } catch (error) {
      console.error('Error handling message reaction:', error.message);
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      const user = await userService.setUserOffline(socket.id);
      
      if (user) {
        console.log(`${user.username} left the chat`);
        io.emit('user_left', { username: user.username, id: user._id });
      }
      
      // Clean up typing users
      delete typingUsers[socket.id];
      
      // Get updated online users list
      const onlineUsers = await userService.getOnlineUsers();
      io.emit('user_list', onlineUsers);
      io.emit('typing_users', Object.values(typingUsers));
    } catch (error) {
      console.error('Error handling disconnect:', error.message);
    }
  });
});

// API routes
app.get('/api/messages', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await messageService.getMessages(
      null, 
      parseInt(limit), 
      (parseInt(page) - 1) * parseInt(limit)
    );
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await userService.getOnlineUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server with MongoDB is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };