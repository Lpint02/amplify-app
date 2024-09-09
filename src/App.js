import React, { useState } from 'react';
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

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
    document.head.appendChild(link);
  }, []);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setUploadProgress(0);
    setSuccess(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    setFile(droppedFile);
    setUploadProgress(0);
    setSuccess(false);
  };

  const uploadFile = async () => {
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
        //console.log('Nome del bucket:', bucketName);
        //console.log('Object key:', objectKey);
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
      }, {
        headers: {
            'Content-Type': 'application/json'
        }
      });

      // Aggiorna l'elenco dei file caricati
      setUploadedFiles(prevFiles => [
        ...prevFiles,
        { name: file.name, status: 'Caricamento completo', color: 'red' } // Il semaforo è rosso per ora
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

  return (
    <div className="uploader-container">
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
        />
      </div>
      <button className="btn" onClick={() => document.getElementById('fileInput').click()}>Seleziona File</button>
      <button className="btn" onClick={uploadFile} style={{ marginLeft: '10px' }}>
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
        <ul className="uploaded-files-list">
          {uploadedFiles.map((uploadedFile, index) => (
            <li key={index}>
              {uploadedFile.name} - {uploadedFile.status}
              <i className={`fas fa-circle ${uploadedFile.color === 'red' ? 'semaforo red' : 'semaforo green'}`}></i>

              </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;


