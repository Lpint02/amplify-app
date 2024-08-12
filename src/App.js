import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isConnected, setIsConnected] = useState(false); // Traccia lo stato della connessione WebSocket
  const [title, setTitle] = useState('Insert the word to reverse'); // Stato per il titolo

  useEffect(() => {
    const ws = new WebSocket('wss://gtofwqtxpe.execute-api.us-east-1.amazonaws.com/production/');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true); // Imposta lo stato come connesso
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.message) {
        setMessages(prevMessages => [...prevMessages, data.message]);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setIsConnected(false); // Imposta lo stato come non connesso in caso di errore
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false); // Imposta lo stato come non connesso quando la connessione si chiude
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleChange = (event) => {
    setText(event.target.value);
    setTitle('Insert another word'); // Aggiorna il titolo quando viene inserita una parola
  };

  const handleClick = async () => {
    try {
      if (text) {
        const response = await axios.post('https://rzf142a7hc.execute-api.us-east-1.amazonaws.com/prod/enqueue', {
          message: text
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setResponseMessage('Message sent successfully!');
        setIsError(false);
        setText('');
      } else {
        setResponseMessage('The message field is empty.');
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
        <h1>{title}</h1>
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Enter your message"
        />
        <button onClick={handleClick}>
          Send Message
        </button>
        {responseMessage && (
          <p className={isError ? 'error-message' : 'success-message'}>
            {responseMessage}
          </p>
        )}
        <div className={`messages-container ${messages.length === 0 ? 'empty' : ''}`}>
        <h2>Reversed words:</h2>
          <ul>
            {messages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
        {!isConnected && (
          <p className="error-message">WebSocket is disconnected. Please refresh the page.</p>
        )}
      </header>
    </div>
  );
}

export default App;