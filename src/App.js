import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fileContent, setFileContent] = useState('');

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setUploadProgress(0);
    setSuccess(false);
    setFileContent('');
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
    setFileContent('');
  };

  const uploadFile = async () => {
    if (!file) {
        alert('Nessun file selezionato.');
        return;
    }

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
        console.log('Nome del bucket:', bucketName);
        console.log('Object key:', objectKey);
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

      setSuccess(true);
      alert('File caricato con successo!');

      // Step 3: Invia i dettagli del file all'API
      const response2 = await axios.post('https://vzxoqe9982.execute-api.us-east-1.amazonaws.com/dev/setretrieveinfo', {
        bucketname: bucketName,
        objectkey: objectKey,
      }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const downloadUrl = response2.data.url;
    console.log('URL presigned per il download ricevuta:', downloadUrl);

    // Step 4: Effettua la richiesta GET alla URL presigned per ottenere il contenuto del file
    const fileResponse = await axios.get(downloadUrl);
    const content = fileResponse.data;
    setFileContent(content); 

    } catch (error) {
      console.error('Errore durante il caricamento del file:', error);
      setError('Errore durante il caricamento del file');
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
      {success && <p style={{ color: 'green' }}>Caricamento completato con successo!</p>}

      {fileContent && (
        <div className="file-content">
          <h3>Contenuto del file:</h3>
          <pre>{fileContent}</pre>
        </div>
      )}
    </div>
  );
}

export default App;


