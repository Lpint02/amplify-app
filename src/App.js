import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const generatedUserId = uuidv4();
    setUserId(generatedUserId);

    const ws = new WebSocket('wss://gtofwqtxpe.execute-api.us-east-1.amazonaws.com/production');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);

      // Invia il userId subito dopo la connessione
      ws.send(JSON.stringify({ action: 'register', userId: generatedUserId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received data:', data);

      if (data.connectionId) {
        setConnectionId(data.connectionId);
        console.log('Received connectionId:', data.connectionId);
      } else if (data.message) {
        setMessages(prevMessages => [...prevMessages, data.message]);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleClick = async () => {
    try {
      if (text && connectionId) {
        const response = await axios.post('https://rzf142a7hc.execute-api.us-east-1.amazonaws.com/prod/enqueue', {
          message: text,
          connectionId: connectionId
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setResponseMessage('Message sent successfully!');
        setIsError(false);
        setText('');
      } else {
        setResponseMessage('The message field is empty or connectionId is not available.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setResponseMessage('Error sending message');
      setIsError(true);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Enter your message"
          disabled={!isConnected}
        />
        <button onClick={handleClick} disabled={!isConnected}>
          Send Message
        </button>
        {responseMessage && (
          <p className={isError ? 'error-message' : 'success-message'}>
            {responseMessage}
          </p>
        )}
        {messages.length > 0 && (
          <div className="messages-container">
            <h2>Reversed words:</h2>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
        )}
        {!isConnected && (
          <p className="error-message">WebSocket is disconnected. Please refresh the page.</p>
        )}
      </header>
    </div>
  );
}

export default App;
