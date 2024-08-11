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
    const ws = new WebSocket('https://ojyb488ldd.execute-api.us-east-1.amazonaws.com/production/');

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.connectionId) {
        // Assegna il connectionId al client
        setConnectionId(data.connectionId);
      } else if (data.message) {
        // Aggiungi il messaggio ribaltato all'array dei messaggi
        setMessages(prevMessages => [...prevMessages, data.message]);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
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
      if (connectionId) { 
        const response = await axios.post('https://rzf142a7hc.execute-api.us-east-1.amazonaws.com/prod/enqueue', { 
          message: text,
          connectionId: connectionId
      }, { 
          headers: { 
              'Content-Type': 'application/json' 
          } 
      }); 
      setResponseMessage('Messaggio inviato con successo!'); 
      setIsError(false); 
      setText(''); 
  } else {
      setResponseMessage('Connection ID non disponibile. Assicurati che la connessione WebSocket sia stabilita.');
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
