import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [title, setTitle] = useState('Insert the word to reverse');
  const [showConnectedMessage, setShowConnectedMessage] = useState(false);
  const [connectionId, setConnectionId] = useState('');

  useEffect(() => {
    const ws = new WebSocket('wss://gtofwqtxpe.execute-api.us-east-1.amazonaws.com/production');
  
    ws.onopen = async () => {
      console.log('WebSocket connection established');
      try {
        const response = await axios.get('https://hkpujzbuu2.execute-api.us-east-1.amazonaws.com/prod/get-connection-id', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setConnectionId(response.data.connectionId);
        setIsConnected(true); // Aggiorna lo stato di connessione
        setShowConnectedMessage(true); // Mostra il messaggio di connessione
      } catch (error) {
        console.error('Error fetching connectionId:', error);
      }
    };
  
    ws.onmessage = (event) => {
      console.log('Event received:', event);
      const data = JSON.parse(event.data);
      console.log('Data received:', data);
      if (data.message) {
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
    setShowConnectedMessage(false);
  };

  const handleClick = async () => {
    try {
      if (text && connectionId) {
        console.log('Sending message:', text);
        console.log('ConnectionId:', connectionId);
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
        setTitle('Insert another word');
        setTimeout(() => {
          setResponseMessage('');
        }, 20000);
      } else {
        setResponseMessage('The message field is empty.');
        setIsError(true);
        setTimeout(() => {
          setResponseMessage('');
        }, 20000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setResponseMessage('Error sending message');
      setIsError(true);
      setTimeout(() => {
        setResponseMessage('');
      }, 20000);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleClick();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
      <h1 className="title">{title}</h1>
        {showConnectedMessage && (
          <p className="connected-message">
            Websocket connection established, now you can insert your word
          </p>
        )}
        <input
          type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
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
