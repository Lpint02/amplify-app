import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [connectionId, setConnectionId] = useState(null); // Stato per conservare il connectionId

  useEffect(() => {
    // Configurazione WebSocket
    const ws = new WebSocket('wss://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/production/');

    // Gestione dei messaggi ricevuti tramite WebSocket
    ws.onmessage = (event) => {
      const reversedMessage = JSON.parse(event.data).message;
      setMessages(prevMessages => [...prevMessages, reversedMessage]); // Aggiungi il messaggio ribaltato all'array dei messaggi
    };

    // Gestione dell'errore della connessione WebSocket
    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    // Gestione della connessione WebSocket
    ws.onopen = () => {
      console.log('WebSocket connection established.');
    };

    // Assegna il connectionId al client
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.connectionId) {
        setConnectionId(data.connectionId);
      }
    };

    return () => {
      ws.close();
    };
  }, []); // L'array vuoto fa sì che l'effetto venga eseguito solo una volta al montaggio

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleClick = async () => { 
    if (connectionId) {
      try { 
        const response = await axios.post('https://rzf142a7hc.execute-api.us-east-1.amazonaws.com/prod/enqueue', { 
          message: text,
          connectionId: connectionId // Invia il connectionId con il messaggio
        }, { 
          headers: { 
            'Content-Type': 'application/json' 
          } 
        }); 
        setResponseMessage('Messaggio inviato con successo!'); 
        setIsError(false); 
        setText(''); // Svuota la casella di testo
        console.log('Response:', response.data); 
      } catch (error) { 
        setResponseMessage('Errore durante l\'invio del messaggio.'); 
        setIsError(true); 
        console.error('Error posting message:', error); 
      } 
    } else {
      setResponseMessage('Connection ID non disponibile.');
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
