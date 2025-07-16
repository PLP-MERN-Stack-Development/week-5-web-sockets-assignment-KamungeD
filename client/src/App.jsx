
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSocket } from './socket/socket';
import LoginForm from './components/Auth/LoginForm';
import ChatPage from './pages/ChatPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Lazy load or import these pages as you create them
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';


function App() {
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const socket = useSocket();

  const handleLogin = (usernameInput) => {
    setUsername(usernameInput);
    socket.connect(usernameInput);
    setJoined(true);
  };

  const handleDisconnect = () => {
    socket.disconnect();
    setJoined(false);
    setUsername('');
  };

  return (
    // <div className="App">
    //   {!joined ? (
    //     <LoginForm onLogin={handleLogin} />
    //   ) : (
    //     <ChatPage username={username} onDisconnect={handleDisconnect} />
    //   )}
    //   <ToastContainer position="top-right" />
    // </div>
        <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
          <Route path="/chat" element={joined ? <ChatPage username={username} onDisconnect={handleDisconnect} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={joined ? <ProfilePage username={username} /> : <Navigate to="/login" />} />
          <Route path="/settings" element={joined ? <SettingsPage /> : <Navigate to="/login" />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastContainer position="top-right" />
      </div>
    </Router>
  );
}

export default App;