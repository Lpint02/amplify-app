import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import './App.css'; 
 
function App() { 
  const [text, setText] = useState(''); 
  const [messages, setMessages] = useState([]);
  const [responseMessage, setResponseMessage] = useState(''); 
  const [isError, setIsError] = useState(false); 
 
  useEffect(() => {
    // Configurazione WebSocket
    const ws = new WebSocket('wss://ojyb488ldd.execute-api.us-east-1.amazonaws.com/production/');

    // Gestione dei messaggi ricevuti tramite WebSocket
    ws.onmessage = (event) => {
      const reversedMessage = event.data;
      setMessages(prevMessages => [...prevMessages, reversedMessage]); // Aggiungi il messaggio ribaltato all'array dei messaggi
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
    try { 
        const response = await axios.post('https://rzf142a7hc.execute-api.us-east-1.amazonaws.com/prod/enqueue', { 
            message: text 
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