import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [connectionId, setConnectionId] = useState('');
  const [IsConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState(null);
  const [webSocketMessage, setWebSocketMessage] = useState('connecting...');
  const [timer, setTimer] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen); // Cambia lo stato del popup
  };

  //Aggiunta stili per FontAwesome
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    setWebSocketMessage('Connessione WebSocket in corso...');
    // Connessione WebSocket
    const websocket = new WebSocket('wss://gtofwqtxpe.execute-api.us-east-1.amazonaws.com/production');
    setWs(websocket);

    websocket.onopen = async () => {
      console.log('WebSocket connection established');
      setWebSocketMessage('Connessione WebSocket in corso...');

      try {
        const response = await axios.get('https://hkpujzbuu2.execute-api.us-east-1.amazonaws.com/prod/get-connection-id', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setConnectionId(response.data.connectionId);
        setIsConnected(true);

        // Imposta il timer di aggiornamento
        const startTime = Date.now(); 
        const timerId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000); 
        setWebSocketMessage(`Connessione attiva da ${elapsed} secondi.`);
      }, 1000); 

      // Timeout per scadenza connessione
      const connectionTimeout = setTimeout(() => {
        setWebSocketMessage('Connessione con la WebSocket scaduta, aggiorna la pagina');
        setIsConnected(false);
        clearInterval(timerId);
      }, 10 * 60 * 1000); 

      setTimer({ timerId, connectionTimeout });

      } catch (error) {
        console.error('Error fetching connectionId:', error);
        setIsConnected(false);
        setWebSocketMessage('Errore nella connessione WebSocket');
      }
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Data received from WebSocket:', data);

      // In base allo stato ricevuto, aggiorna il semaforo
      if (data.status === 'completed' && data.file) {
        console.log(`Elaborazione del file "${data.file}" completata in ${data.time.toFixed(6)} secondi.`);
        setUploadedFiles(prevFiles =>
          prevFiles.map(uploadedFile =>
            uploadedFile.name === data.file
              ? { ...uploadedFile, status: `Elaborazione completata in ${data.time.toFixed(6)} secondi`, color: 'green' } //devo capire come far stampare il tempo
              : uploadedFile
          )
        );
      } else if (data.status === 'error' && data.file) {
        // Stato rosso (errore)
        setUploadedFiles(prevFiles =>
          prevFiles.map(uploadedFile =>
            uploadedFile.name === data.file
              ? { ...uploadedFile, status: 'Errore durante l\'elaborazione', color: 'red' }
              : uploadedFile
          )
        );
      }
    };

    websocket.onerror = (event) => {
      console.error('WebSocket error:', event);
      setIsConnected(false);
      setWebSocketMessage('Errore nella connessione WebSocket');
      clearInterval(timer.timerId);
      clearTimeout(timer.connectionTimeout); 
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false); 
      setWebSocketMessage('Connessione con la WebSocket scaduta, aggiorna la pagina');
      clearInterval(timer.timerId);
      clearTimeout(timer.connectionTimeout);
    };

    return () => {
      websocket.close();
      clearInterval(timer.timerId);
      clearTimeout(timer.connectionTimeout); 
    };
  }, []);

  const handleFileSelect = (event) => {
    if (IsConnected) {
      const selectedFile = event.target.files[0];

      if (selectedFile.size > 126 * 1024 * 1024) {
        alert('Il file è troppo grande. La dimensione massima consentita è 125MB.');
        return;
      }
    
      setFile(selectedFile);
      setUploadProgress(0);
      setSuccess(false);
    }
  };

  const handleDragOver = (event) => {
    if (IsConnected) {
      event.preventDefault();
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    if (IsConnected) {
      event.preventDefault();
      setIsDragging(false);

      const droppedFile = event.dataTransfer.files[0];

      if (droppedFile.size > 126 * 1024 * 1024) {
        alert('Il file è troppo grande. La dimensione massima consentita è 125MB.');
        return;
      }

      setFile(droppedFile);
      setUploadProgress(0);
      setSuccess(false);
    }
  };

  const uploadFile = async () => {
    if (!IsConnected) {
      alert('Connessione WebSocket non stabilita. Attendi la connessione.');
      return;
    }

    if (!file) {
        alert('Nessun file selezionato.');
        return;
    }

    if (isUploading) {
      alert('Attendi il completamento dell\'upload attuale.');
      return;
    }

    setIsUploading(true);

    try {
        // Step 1: Ottieni la URL presigned
        const response = await axios.post('https://hym80goqc7.execute-api.us-east-1.amazonaws.com/prod/get-url-presigned', {
            filename: file.name
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const uploadUrl = response.data.url;
        const bucketName = response.data.bucketName; 
        const objectKey = response.data.key; 
        console.log('URL presigned ricevuta:', uploadUrl);
        setError('');

        // Step 2: Carica il file usando la URL presigned
        await axios.put(uploadUrl, file, {
          headers: {
          'Content-Type': 'text/plain'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      // Step 3: Invia i dettagli del file all'API
      await axios.post('https://vzxoqe9982.execute-api.us-east-1.amazonaws.com/dev/setretrieveinfo', {
        bucketname: bucketName,
        objectkey: objectKey,
        connectionId: connectionId
      }, {
        headers: {
            'Content-Type': 'application/json'
        }
      });

      // Aggiungi il file con stato "In attesa" 
      setUploadedFiles(prevFiles => [
        ...prevFiles,
        { name: file.name, status: 'Caricamento avvenuto. Elaborazione in corso....', color: 'blue' } 
      ]);
      setSuccess(true);
      setFile(null); // Resetta il file
      setUploadProgress(0);
      alert('File caricato con successo!');

    } catch (error) {
      console.error('Errore durante il caricamento del file:', error);
      setError('Errore durante il caricamento del file');
    } finally {
      setIsUploading(false); // Reset dello stato di caricamento
    }
  };

  const getStatusClass = () => {
    switch (webSocketMessage) {
      case 'connected':
        return 'green';
      case 'disconnected':
        return 'red';
      case 'connecting':
        return 'spinner blue'; // Stato "connessione in corso" con spinner
      default:
        return '';
    }
  };

  const getStatusMessage = () => {
    switch (webSocketMessage) {
      case 'connected':
        return `Connessione WebSocket attiva da ${elapsed} secondi.`;
      case 'disconnected':
        return 'Connessione WebSocket interrotta. Aggiorna la pagina.';
      case 'connecting':
        return 'Connessione alla WebSocket in corso...'; // Messaggio durante la connessione
      default:
        return '';
    }
  };


  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false); // Nascondi il messaggio di successo dopo 10 secondi
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="uploader-container">
      <div className="title-container">
        <h2 onClick={togglePopup} style={{ cursor: 'pointer' }}>Centro di Calcolo per Elaborazioni Matematiche</h2>
      </div>

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="popup-close" onClick={togglePopup}>X</button>
            <h2>Informazioni sul formato corretto del file</h2>
            <p>
              Questa applicazione web restituisce il vettore soluzione x del sistema 𝐴𝑥=𝑏. Per garantire che il file venga elaborato correttamente, assicurati che il file soddisfi le seguenti caratteristiche: <br />
              1. Il file deve contenere la matrice dei coefficenti A di dimensione n x n, seguita dal vettore dei termini noti b di dimensione n <br />
              2. La matrice deve essere rappresentata come una serie di righe, dove ogni riga contiene gli elementi separati da virgole. Le righe sono separate tra loro da un punto e virgola. <br />
              3. La matrice 𝐴 deve essere seguita da una riga di separazione con tre trattini --- <br /> 
              4. Il vettore 𝑏 deve essere rappresentato come una serie di elementi separati da virgole <br />
              5. Il file deve essere salvato in formato .txt <br />
              6. La dimensione massima del file è 125 MB. <br />
              Se hai bisogno di assistenza per generare la matrice, consulta il codice disponibile nella repo GitHub.<br />
            </p>
          </div>
        </div>
      )}
    
      <div
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file ? (
          <p>{file.name}</p>
        ) : (
          <p>Trascina un file qui o clicca per selezionare un file. Dimensione massima: 125MB. </p>
        )}
        <input
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="fileInput"
          disabled={!IsConnected}
        />
      </div>
      <button className="btn" onClick={() => document.getElementById('fileInput').click()} disabled={!IsConnected}>
        Seleziona File
      </button>
      <button className="btn" onClick={uploadFile} style={{ marginLeft: '10px' }} disabled={!IsConnected}>
        Carica File
      </button>

      
      {uploadProgress > 0 && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
            {uploadProgress}%
          </div>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Caricamento completato con successo resta in attesa!</p>}

      {uploadedFiles.length > 0 && (
        <>
          <h2 className="files-title">Matrici in elaborazione o elaborate</h2>
          <div className="file-processing-table-container">
            <table className="file-processing-table">
              <thead>
                <tr>
                  <th>Nome del file</th>
                  <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map((uploadedFile, index) => (
                <tr key={index}>
                  <td>{uploadedFile.name}</td>
                  <td className="semaforo-container">{uploadedFile.status}
                    <span> <i className={`fas fa-circle semaforo ${uploadedFile.color}`}></i></span>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
        </>
      )}

      <div className="websocket-container">
        <div className="websocket-icon">
          <div className={`websocket-status ${getStatusClass()}`} />
          <span className="websocket-message">{getStatusMessage()}</span>
      </div>
    </div>
    </div>
  );
};

export default App;


