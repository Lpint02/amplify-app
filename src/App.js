import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isConnected, setIsConnected] = useState(false); // Track WebSocket connection status
  const [connectionId, setConnectionId] = useState(null);
  const [title, setTitle] = useState('Insert the word to reverse');
  const [showConnectedMessage, setShowConnectedMessage] = useState(false); // New state for the connected message

  useEffect(() => {
    const ws = new WebSocket('wss://gtofwqtxpe.execute-api.us-east-1.amazonaws.com/production/');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      setShowConnectedMessage(true);

      // Richiedi il connectionId subito dopo la connessione
      ws.send(JSON.stringify({ action: 'requestConnectionId' }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received data:', data);
      
      if (data.connectionId) {
        // Salva il connectionId ricevuto dal server
        setConnectionId(data.connectionId);
        console.log('Received connectionId:', data.connectionId);
      } else if (data.message) {
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
    setShowConnectedMessage(false); // Hide connected message when typing
  };

  const handleClick = async () => {
    try {
      console.log('Attempting to send message with connectionId:', connectionId);
      if (text && connectionId) { // Verifica che il connectionId sia disponibile
        console.log('Sending message with connectionId:', connectionId); // Aggiungi questo log

        const response = await axios.post('https://rzf142a7hc.execute-api.us-east-1.amazonaws.com/prod/enqueue', {
          message: text,
          connectionId: connectionId  // Invia il connectionId
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
        setResponseMessage('The message field is empty or connectionId is not available.');
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