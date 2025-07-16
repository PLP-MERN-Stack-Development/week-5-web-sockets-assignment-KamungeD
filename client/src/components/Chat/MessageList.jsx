import React, { useEffect, useRef } from 'react';
import Message from './Message';

const MessageList = ({ messages, currentUser, onMessageReact }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map(message => (
        <Message
          key={message.id}
          message={message}
          isCurrentUser={message.senderId === currentUser}
          onReact={onMessageReact}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;