import React from 'react';

const AboutPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <h2 className="text-2xl font-bold mb-4">About This App</h2>
    <div className="bg-white p-6 rounded shadow max-w-xl">
      <p className="mb-2">This is a real-time chat application built with React, Socket.io, and Express.</p>
      <p className="mb-2">Features include live messaging, notifications, online status, and more.</p>
      <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Kamunge</p>
    </div>
  </div>
);

export default AboutPage;
