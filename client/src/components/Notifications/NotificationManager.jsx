// filepath: client/src/components/Notifications/NotificationManager.jsx
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

const NotificationManager = ({ 
  newMessage, 
  userJoined, 
  userLeft, 
  soundEnabled,
  notificationsEnabled,
  notifications,
  onDismiss
 }) => {
  useEffect(() => {
    if (newMessage) {
      // Toast notification
      toast.info(`New message from ${newMessage.sender}`);
      
      // Sound notification
      if (soundEnabled) {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
      
      // Browser notification
      if (notificationsEnabled && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`New message from ${newMessage.sender}`, {
            body: newMessage.message || newMessage.text,
            icon: '/favicon.ico'
          });
        }
      }
    }
  }, [newMessage, soundEnabled, notificationsEnabled]);

  useEffect(() => {
    if (userJoined) {
      toast.success(`${userJoined.username} joined the chat`);
    }
  }, [userJoined]);

  useEffect(() => {
    if (userLeft) {
      toast.info(`${userLeft.username} left the chat`);
    }
  }, [userLeft]);

  useEffect(() => {
    // Auto-dismiss notifications after 5 seconds
    notifications.forEach(notification => {
      setTimeout(() => {
        onDismiss(notification.id);
      }, 5000);
    });
  }, [notifications, onDismiss]);

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <p className="text-sm text-gray-600">{notification.message}</p>
            </div>
            <button
              onClick={() => onDismiss(notification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationManager;