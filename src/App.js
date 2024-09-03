import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    if (!uploadUrl || !file) return;

    try {
      const response = await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.status === 200) {
        setSuccess(true);
        alert('File caricato con successo!');
      }
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
          <button className="btn" onClick={uploadFile} style={{ marginLeft: '10px' }}>
            Carica File
          </button>
        </div>
      )}

      {uploadProgress > 0 && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
            {uploadProgress}%
          </div>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Caricamento completato con successo!</p>}
    </div>
  );
}

export default App;
