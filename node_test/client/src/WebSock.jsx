import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const WebSock = () => {
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const socket = useRef();
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");

  function connect() {
    socket.current = new WebSocket("ws://localhost:5555");

    socket.current.onopen = () => {
      setConnected(true);
      const message = {
        event: "connection",
        username,
        id: Date.now(),
      };
      socket.current.send(JSON.stringify(message));
    };
    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [message, ...prev]);
    };
    socket.current.onclose = () => {
      console.log("Socket closed");
    };
    socket.current.onerror = () => {
      console.log("Error occurs on Socket");
    };
  }

  const sendMessage = async () => {
    const message = {
      username,
      message: value,
      id: Date.now(),
      event: "message",
    };
    socket.current.send(JSON.stringify(message));
    setValue("");
  };

  if (!connected) {
    return (
      <div className="center">
        <div className="form">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Enter your name"
          />
          <button onClick={connect}>Enter</button>
        </div>
      </div>
    );
  }

  console.log("messages: ", messages);

  return (
    <div className="center">
      <div>
        <div className="form">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="text"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
        <div className="messages">
          {messages.map((mess, elem) => (
            <div key={elem}>
              {mess.event === "connection" ? (
                <div className="connection_message">
                  User {mess.username} has been connected
                </div>
              ) : (
                <div className="message">
                  {mess.username}: {mess.message}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WebSock;
