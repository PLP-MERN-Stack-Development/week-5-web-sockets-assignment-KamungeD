import React from 'react';

const ProfilePage = ({ username }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <h2 className="text-2xl font-bold mb-4">Profile</h2>
    <div className="bg-white p-6 rounded shadow">
      <p className="mb-2"><b>Username:</b> {username}</p>
      <p className="text-gray-500">(Profile editing coming soon...)</p>
    </div>
  </div>
);

export default ProfilePage;
