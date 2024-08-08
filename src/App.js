import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [text, setText] = useState('');

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleClick = async () => {
    try {
      const response = await axios.post('YOUR_API_GATEWAY_URL', JSON.stringify({
        message: text
      }), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Response:', response.data);
    } catch (error) {
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
      </header>
    </div>
  );
}

export default App;
