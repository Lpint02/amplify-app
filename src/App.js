import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [sessionId, setSessionId] = useState(null); // Stato per conservare il sessionId
  const [isConnected, setIsConnected] = useState(false); // Stato per tracciare la connessione WebSocket

  useEffect(() => {
    // Configurazione WebSocket
    const ws = new WebSocket('wss://ojyb488ldd.execute-api.us-east-1.amazonaws.com/production/');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true); // Imposta lo stato come connesso
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.sessionId) {
        // Assegna il sessionId al client
        setSessionId(data.sessionId);
      } else if (data.message) {
        // Aggiungi il messaggio ribaltato all'array dei messaggi
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
  };

  const handleClick = async () => {
    try {
      if (text && sessionId) {
        // Invia il messaggio all'endpoint 'enqueue' con sessionId
        const response = await axios.post('https://rzf142a7hc.execute-api.us-east-1.amazonaws.com/prod/enqueue', {
          message: text,
          sessionId: sessionId
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setResponseMessage('Messaggio inviato con successo!');
        setIsError(false);
        setText('');
      } else {
        setResponseMessage('Session ID non disponibile. Assicurati che la connessione WebSocket sia stabilita.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Errore durante l\'invio del messaggio:', error);
      setResponseMessage('Errore durante l\'invio del messaggio');
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
          disabled={!isConnected || !sessionId} // Disabilita il campo di input se non connesso
        />
        <button onClick={handleClick} disabled={!isConnected || !sessionId}>
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
