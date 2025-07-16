import React from 'react';

const Sidebar = ({ 
  onlineUsers, 
  currentUser, 
  onUserSelect, 
  selectedUser,
  chatRooms,
  currentRoom,
  onRoomSelect,
  onCreateRoom
}) => {
  return (
    <div className="w-64 bg-gray-800 text-white h-full flex flex-col">
      {/* Chat Rooms Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Chat Rooms</h3>
          <button
            onClick={onCreateRoom}
            className="bg-blue-500 hover:bg-blue-600 text-xs px-2 py-1 rounded"
          >
            +
          </button>
        </div>
        <div className="space-y-1">
          {chatRooms.map(room => (
            <button
              key={room.id}
              onClick={() => onRoomSelect(room)}
              className={`w-full text-left px-2 py-1 rounded text-sm ${
                currentRoom?.id === room.id ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              # {room.name}
            </button>
          ))}
        </div>
      </div>

      {/* Online Users Section */}
      <div className="flex-1 p-4">
        <h3 className="font-semibold mb-2">Online Users ({onlineUsers.length})</h3>
        <div className="space-y-1">
          {onlineUsers.map(user => (
            <button
              key={user.id}
              onClick={() => onUserSelect(user)}
              className={`w-full text-left px-2 py-1 rounded text-sm flex items-center ${
                selectedUser?.id === user.id ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {user.username}
              {user.username === currentUser && ' (You)'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;