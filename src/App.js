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

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    // Connessione WebSocket
    const websocket = new WebSocket('wss://gtofwqtxpe.execute-api.us-east-1.amazonaws.com/production');
    setWs(websocket);

    websocket.onopen = async () => {
      console.log('WebSocket connection established');

      try {
        const response = await axios.get('https://hkpujzbuu2.execute-api.us-east-1.amazonaws.com/prod/get-connection-id', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setConnectionId(response.data.connectionId);
        setIsConnected(true); 
      } catch (error) {
        console.error('Error fetching connectionId:', error);
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
              ? { ...uploadedFile, status: 'Elaborazione completata', color: 'green' }
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
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false); 
    };

    return () => {
      websocket.close();
    };
  }, []);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setUploadProgress(0);
    setSuccess(false);
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
        { name: file.name, status: 'Caricamento avvenuto. Elaborazione in corso....', color: 'red' } 
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
      {!IsConnected && <p>Connessione WebSocket in corso...</p>}
      <div
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file ? (
          <p>{file.name}</p>
        ) : (
          <p>Trascina un file qui o clicca per selezionare un file</p>
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
          <ul className="uploaded-files-list">
            {uploadedFiles.map((uploadedFile, index) => (
              <li key={index}>
                <span>{uploadedFile.name} - {uploadedFile.status}</span>
                <i className={`fas fa-circle semaforo ${uploadedFile.color}`}></i>
                </li>
            ))}
          </ul>
        </>
      )}

      <div className="websocket-status">
        {!IsConnected && <p>Connessione con la WebSocket scaduta, aggiorna la pagina</p>}
        <i className={`fas fa-circle semaforo ${IsConnected ? 'green' : 'red'}`}></i>
      </div>
    </div>
  );
}

export default App;


