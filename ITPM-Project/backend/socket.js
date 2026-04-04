import { Server } from 'socket.io';
import http from 'http';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
      methods: ["GET", "POST"]
    }
  });

  // Store online users per group
  const groupUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to group room
    socket.on('joinGroup', ({ groupId, userId, userName }) => {
      socket.join(groupId);
      
      // Track users in group
      if (!groupUsers.has(groupId)) {
        groupUsers.set(groupId, new Map());
      }
      groupUsers.get(groupId).set(userId, {
        socketId: socket.id,
        userName,
        isTyping: false,
        lastSeen: new Date()
      });

      // Notify others in group
      socket.to(groupId).emit('userJoined', {
        userId,
        userName,
        onlineCount: groupUsers.get(groupId).size
      });

      console.log(`User ${userName} joined group ${groupId}`);
    });

    // Handle leaving group
    socket.on('leaveGroup', ({ groupId, userId }) => {
      socket.leave(groupId);
      
      if (groupUsers.has(groupId)) {
        groupUsers.get(groupId).delete(userId);
        
        socket.to(groupId).emit('userLeft', {
          userId,
          onlineCount: groupUsers.get(groupId).size
        });
      }

      console.log(`User ${userId} left group ${groupId}`);
    });

    // Handle typing indicators
    socket.on('typing', ({ groupId, userId }) => {
      if (groupUsers.has(groupId)) {
        const user = groupUsers.get(groupId).get(userId);
        if (user) {
          user.isTyping = true;
        }
      }
      
      socket.to(groupId).emit('userTyping', { userId, isTyping: true });
    });

    socket.on('stopTyping', ({ groupId, userId }) => {
      if (groupUsers.has(groupId)) {
        const user = groupUsers.get(groupId).get(userId);
        if (user) {
          user.isTyping = false;
        }
      }
      
      socket.to(groupId).emit('userTyping', { userId, isTyping: false });
    });

    // Handle new messages
    socket.on('sendMessage', async (data) => {
      // Message will be saved via API and then broadcast
      socket.to(data.groupId).emit('newMessage', data);
    });

    // Handle real-time reactions
    socket.on('addReaction', (data) => {
      socket.to(data.groupId).emit('newReaction', data);
    });

    // Handle message deletion
    socket.on('deleteMessage', (data) => {
      socket.to(data.groupId).emit('messageDeleted', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Remove user from all groups
      for (const [groupId, users] of groupUsers.entries()) {
        for (const [userId, user] of users.entries()) {
          if (user.socketId === socket.id) {
            users.delete(userId);
            
            socket.to(groupId).emit('userLeft', {
              userId,
              onlineCount: users.size
            });
            break;
          }
        }
      }
    });
  });

  return io;
};

export const getIO = () => io;
