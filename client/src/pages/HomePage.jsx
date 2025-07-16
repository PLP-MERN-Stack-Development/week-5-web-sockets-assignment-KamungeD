import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <h1 className="text-4xl font-bold mb-4">Welcome to MERN Chat</h1>
    <p className="mb-8 text-lg text-gray-700">Connect, chat, and share instantly with friends and colleagues.</p>
    <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Get Started</Link>
    <div className="mt-8 text-gray-500">
      <Link to="/about" className="underline">Learn more</Link>
    </div>
  </div>
);

export default HomePage;
