import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isConnected, setIsConnected] = useState(false); // Track WebSocket connection status
  const [title, setTitle] = useState('Insert the word to reverse');
  const [showConnectedMessage, setShowConnectedMessage] = useState(false); // New state for the connected message

  useEffect(() => {
    const ws = new WebSocket('wss://gtofwqtxpe.execute-api.us-east-1.amazonaws.com/production/');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true); // Imposta lo stato come connesso
      setShowConnectedMessage(true); // Show connected message when connected
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
    setShowConnectedMessage(false); // Hide connected message when typing
  };

  const handleClick = async () => {
    try {
      if (text) {
        const connectionId = await getConnectionId(); // Ottieni il connectionId
        console.log('Connection ID:', connectionId); // Log per debug
        const response = await axios.post('https://rzf142a7hc.execute-api.us-east-1.amazonaws.com/prod/enqueue', {
          message: text,
          connectionId: connectionId  // Invia anche il connectionId
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('Response:', response); // Log per debug
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
      console.error('Error sending message:', error.response ? error.response.data : error); // Log dettagliato dell'errore
      setResponseMessage('Error sending message');
      setIsError(true);
    
      setTimeout(() => {
        setResponseMessage('');
      }, 20000);
    }
  };
  
  
  // Funzione per ottenere il connectionId
  const getConnectionId = () => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket('wss://gtofwqtxpe.execute-api.us-east-1.amazonaws.com/production/');
      ws.onopen = () => {
        resolve(ws._connectionId); // Ottieni il connectionId dal WebSocket
      };
      ws.onerror = (error) => {
        reject(error);
      };
    });
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