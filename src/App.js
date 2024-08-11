import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [connectionId, setConnectionId] = useState(null); // Stato per salvare il connectionId

  useEffect(() => {
    // Configurazione WebSocket
    const ws = new WebSocket('wss://ojyb488ldd.execute-api.us-east-1.amazonaws.com/production/');

    // Gestione della connessione aperta
    ws.onopen = (event) => {
      const connectionId = ws.url.split('/').pop(); // Estrai il connectionId dall'URL della WebSocket (oppure usa un altro metodo per ottenere il connectionId se necessario)
      setConnectionId(connectionId); // Salva il connectionId nello stato
      console.log('WebSocket connected with ID:', connectionId);
    };

    // Gestione dei messaggi ricevuti tramite WebSocket
    ws.onmessage = (event) => {
      const reversedMessage = JSON.parse(event.data).message;
      setMessages(prevMessages => [...prevMessages, reversedMessage]); // Aggiungi il messaggio ribaltato all'array dei messaggi
    };

    // Gestione dell'errore della connessione WebSocket
    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    // Pulizia della connessione WebSocket quando il componente si smonta
    return () => {
      ws.close();
    };
  }, []); // L'array vuoto fa sì che l'effetto venga eseguito solo una volta al montaggio

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleClick = async () => {
    if (!connectionId) {
      setResponseMessage('Connection ID non disponibile.');
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post('https://rzf142a7hc.execute-api.us-east-1.amazonaws.com/prod/enqueue', {
        message: text,
        connectionId: connectionId // Includi il connectionId nel corpo della richiesta
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
