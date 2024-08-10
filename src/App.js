import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [webSocketUrl, setWebSocketUrl] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Crea e gestisci la connessione WebSocket
    if (webSocketUrl) {
      const websocket = new WebSocket(webSocketUrl);

      websocket.onopen = () => {
        console.log('WebSocket connection established');
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.message) {
            setMessages(prevMessages => [...prevMessages, data.message]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onerror = (event) => {
        console.error('WebSocket error:', event);
      };

      setWs(websocket);

      // Pulizia della connessione WebSocket quando il componente si smonta
      return () => {
        websocket.close();
      };
    }
  }, [webSocketUrl]); // Esegui solo se webSocketUrl cambia

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleClick = async () => {
    try {
      // 1. Invia il messaggio tramite la REST API
      const response = await axios.post('https://rzf142a7hc.execute-api.us-east-1.amazonaws.com/prod/enqueue', {
        message: text
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // 2. Recupera l'URL WebSocket e gestisci la connessione
      const connectionResponse = response.data;
      if (connectionResponse.connectionId) {
        // URL WebSocket da utilizzare
        const websocketUrl = `wss://ojyb488ldd.execute-api.us-east-1.amazonaws.com/production/`;
        setWebSocketUrl(websocketUrl);
      }

      setResponseMessage('Messaggio inviato con successo e WebSocket configurato!');
      setIsError(false);
      setText(''); // Svuota la casella di testo
      console.log('Response:', response.data);
    } catch (error) {
      setResponseMessage('Errore durante l\'invio del messaggio.');
      setIsError(true);
      console.error('Error posting message:', error);
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
        />
        <button onClick={handleClick}>
          Send Message
        </button>
        {responseMessage && (
          <p className={isError ? 'error-message' : 'success-message'}>
            {responseMessage}
          </p>
        )}
        <div className="messages-container">
          {messages.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
