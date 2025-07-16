const User = require('../models/User');

class UserService {
  async createOrUpdateUser(username, socketId) {
    try {
      let user = await User.findOne({ username });
      
      if (user) {
        user.isOnline = true;
        user.socketId = socketId;
        user.lastSeen = new Date();
        await user.save();
      } else {
        user = new User({
          username,
          socketId,
          isOnline: true
        });
        await user.save();
      }
      
      return user;
    } catch (error) {
      throw new Error('Error creating/updating user: ' + error.message);
    }
  }

  async setUserOffline(socketId) {
    try {
      const user = await User.findOne({ socketId });
      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date();
        user.socketId = '';
        await user.save();
        return user;
      }
      return null;
    } catch (error) {
      throw new Error('Error setting user offline: ' + error.message);
    }
  }

  async getOnlineUsers() {
    try {
      return await User.find({ isOnline: true }).select('username avatar');
    } catch (error) {
      throw new Error('Error getting online users: ' + error.message);
    }
  }

  async getUserBySocketId(socketId) {
    try {
      return await User.findOne({ socketId });
    } catch (error) {
      throw new Error('Error getting user by socket ID: ' + error.message);
    }
  }
}

module.exports = new UserService();