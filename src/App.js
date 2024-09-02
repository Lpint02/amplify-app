import React, { useState } from 'react';
import './App.css';

function App () {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
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
  };

  const getPresignedUrl = async () => {
    if (!file) {
      alert('Nessun file selezionato.');
      return;
    }

    try {
      const response = await axios.post('https://kpcukmvmn8.execute-api.us-east-1.amazonaws.com/prod/get-url-presigned', {
        filename: file.name
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setUploadUrl(response.data.url);
      setError('');
      console.log('Presigned URL:', response.data.url);
    } catch (error) {
      console.error('Errore nel recupero della URL presigned:', error);
      setError('Errore nel recupero della URL presigned');
    }
  };

  /*
    const uploadFile = async () => {
    if (!file || !uploadUrl) return;
    
    try {
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type
        }
      });
      alert('File caricato con successo!');
    } catch (error) {
      console.error('Errore nel caricamento del file:', error);
      setError('Errore nel caricamento del file');
    }
  };
  */

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
      <button className="btn" onClick={getPresignedUrl} style={{ marginLeft: '10px' }}>
        Ottieni URL Presigned
      </button>

      {uploadUrl && (
        <div>
          <h3>Presigned URL:</h3>
          <p>{uploadUrl}</p>
          <a href={uploadUrl} target="_blank" rel="noopener noreferrer">Apri URL</a>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default App;
