import React, { useState } from 'react'; 
import axios from 'axios'; 
import './App.css'; 
 
function App() { 
  const [text, setText] = useState(''); 
  const [responseMessage, setResponseMessage] = useState(''); 
  const [isError, setIsError] = useState(false); 
 
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
      </header> 
    </div> 
  ); 
} 
 
export default App;