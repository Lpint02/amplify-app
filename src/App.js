import React, { useState } from 'react';
import './App.css';

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');

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
      const response = await fetch(`https://your-api-id.execute-api.your-region.amazonaws.com/prod/generate-upload-url?filename=${file.name}`, {
        method: 'POST',
      });
      const data = await response.json();
      setUploadUrl(data.url);
      console.log('Presigned URL:', data.url);
    } catch (error) {
      console.error('Errore nel recupero della URL presigned:', error);
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
      <button className="btn" onClick={getPresignedUrl} style={{ marginLeft: '10px' }}>
        Ottieni URL Presigned
      </button>
    </div>
  );
};

export default App;
