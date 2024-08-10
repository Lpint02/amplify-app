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

    // 2. Salva l'URL WebSocket e gestisci la connessione
    const websocketUrl = 'wss://ojyb488ldd.execute-api.us-east-1.amazonaws.com/production/';
    const ws = new WebSocket(websocketUrl);

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const reversedMessage = JSON.parse(event.data).message;
      setMessages(prevMessages => [...prevMessages, reversedMessage]); // Aggiungi il messaggio ribaltato all'array dei messaggi
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    // Imposta il websocketUrl nel state
    setWebSocketUrl(websocketUrl);

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
