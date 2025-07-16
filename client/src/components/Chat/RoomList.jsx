import React from 'react';

const RoomList = ({ rooms, activeRoom, unreadCounts, onRoomChange }) => {
  return (
    <div className="p-4 border-b">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">ROOMS</h3>
      <div className="space-y-1">
        {rooms.map(room => (
          <button
            key={room}
            onClick={() => onRoomChange(room)}
            className={`w-full text-left p-2 rounded flex items-center justify-between ${
              activeRoom === room ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
            }`}
          >
            <span># {room}</span>
            {unreadCounts.get(room) > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCounts.get(room)}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoomList;