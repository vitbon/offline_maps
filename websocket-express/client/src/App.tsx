import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:4000');

function App() {
  const [data, setData] = useState('');
  const [serverResp, setServerResp] = useState('');

  useEffect(() => {
    socket.on('ping', (message) => {
      setServerResp(message);
      console.log('message from the server: ', message);
    });
  }, []);

  const sendMessage = (event: any) => {
    event.preventDefault();
    socket.emit('client-message', data);
    socket.emit('ping', `${data} + ${data}`);
  };

  return (
    <>
      <p>Websocket demo with Express</p>
      <div>
        <input value={data} onChange={(e) => setData(e.target.value)} />
        <button onClick={sendMessage}>Send message to server</button>
      </div>
      <p>Server response: {serverResp}</p>
    </>
  );
}

export default App;
