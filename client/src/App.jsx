import { useState } from 'react';
import { useSocket } from './socket/socket';

function App() {
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const socket = useSocket();

  const handleJoin = () => {
    if (username.trim()) {
      socket.connect(username);
      setJoined(true);
    }
  };

  return (
    <div>
      {!joined ? (
        <div>
          <input
            placeholder="Enter username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <button onClick={handleJoin}>Join Chat</button>
        </div>
      ) : (
        <Chat socket={socket} username={username} />
      )}
    </div>
  );
}

function Chat({ socket, username }) {
  const [input, setInput] = useState('');
  const { messages, users, typingUsers, sendMessage, setTyping } = socket;

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
      setTyping(false);
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    setTyping(e.target.value.length > 0);
  };

  return (
    <div>
      <div>
        <b>Online Users:</b> {users.map(u => u.username).join(', ')}
      </div>
      <div style={{ minHeight: 200, border: '1px solid #ccc', margin: '1em 0', padding: '1em' }}>
        {messages.map(msg =>
          msg.system ? (
            <div key={msg.id} style={{ color: '#888', fontStyle: 'italic' }}>
              {msg.message}
            </div>
          ) : (
            <div key={msg.id}>
              <b>{msg.sender || 'Anonymous'}</b>: {msg.message || msg.text}{' '}
              <i style={{ fontSize: '0.8em' }}>
                {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString()}
              </i>
            </div>
          )
        )}
      </div>
      <div>
        {typingUsers.length > 0 && (
          <i>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </i>
        )}
      </div>
      <input
        value={input}
        onChange={handleInput}
        onBlur={() => setTyping(false)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        placeholder="Type a message"
        style={{ width: '70%' }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default App;