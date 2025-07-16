import React from 'react';

const Header = ({ username, onlineUsers, onDisconnect }) => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat App</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Welcome, {username}</span>
          <span className="text-sm bg-green-500 px-2 py-1 rounded">
            {onlineUsers.length} online
          </span>
          <button
            onClick={onDisconnect}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
          >
            Disconnect
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;