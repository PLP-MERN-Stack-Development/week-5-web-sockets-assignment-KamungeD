const Message = require('../models/Message');
const User = require('../models/User');

class MessageService {
  async createMessage(messageData) {
    try {
      const message = new Message(messageData);
      await message.save();
      
      // Populate sender information
      await message.populate('sender', 'username avatar');
      
      return message;
    } catch (error) {
      throw new Error('Error creating message: ' + error.message);
    }
  }

  async getMessages(roomId = null, limit = 50, skip = 0) {
    try {
      const query = roomId ? { room: roomId } : { room: null, isPrivate: false };
      
      return await Message.find(query)
        .populate('sender', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
    } catch (error) {
      throw new Error('Error getting messages: ' + error.message);
    }
  }

  async getPrivateMessages(userId1, userId2, limit = 50, skip = 0) {
    try {
      return await Message.find({
        isPrivate: true,
        $or: [
          { sender: userId1, recipient: userId2 },
          { sender: userId2, recipient: userId1 }
        ]
      })
        .populate('sender', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
    } catch (error) {
      throw new Error('Error getting private messages: ' + error.message);
    }
  }

  async addReaction(messageId, userId, reaction) {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw new Error('Message not found');

      if (!message.reactions) {
        message.reactions = new Map();
      }

      if (!message.reactions.get(reaction)) {
        message.reactions.set(reaction, []);
      }

      const users = message.reactions.get(reaction);
      if (!users.includes(userId)) {
        users.push(userId);
        message.reactions.set(reaction, users);
      }

      await message.save();
      return message;
    } catch (error) {
      throw new Error('Failed to add reaction: ' + error.message);
    }
  }

  async markAsRead(messageId, userId) {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: userId } },
        { new: true }
      );
      
      return message;
    } catch (error) {
      throw new Error('Failed to mark message as read: ' + error.message);
    }
  }

  async getMessagesByRoom(room, limit = 50, offset = 0) {
    try {
      const messages = await Message.find({ room })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate('sender', 'username');
    
      return messages.reverse();
    } catch (error) {
      throw new Error('Failed to fetch room messages: ' + error.message);
    }
  }
}

module.exports = new MessageService();