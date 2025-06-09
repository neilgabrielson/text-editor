// src/components/WelcomeScreen.jsx
import React, { useState } from 'react';

const WelcomeScreen = ({ onOpenFolder }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const item = files[0];
      const folderPath = item.path;
      
      try {
        const fileList = await window.electronAPI.readDirectory(folderPath);
        onOpenFolder(folderPath, fileList);
      } catch (error) {
        const parentPath = folderPath.substring(0, folderPath.lastIndexOf('/'));
        try {
          const fileList = await window.electronAPI.readDirectory(parentPath);
          onOpenFolder(parentPath, fileList);
        } catch (parentError) {
          console.error('Could not open dropped item:', error);
        }
      }
    }
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        color: '#666',
        fontSize: '18px',
        border: isDragging ? '2px dashed #007acc' : '2px dashed transparent',
        backgroundColor: isDragging ? '#f0f8ff' : 'transparent',
        transition: 'all 0.2s ease'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h1 style={{ color: '#333', marginBottom: '30px' }}>Welcome to Your Text Editor</h1>
      <button 
        onClick={onOpenFolder}
        style={{ 
          padding: '12px 24px', 
          fontSize: '16px', 
          marginBottom: '10px',
          cursor: 'pointer'
        }}
      >
        📁 Open Folder
      </button>
      <p style={{ margin: '20px 0', color: '#999' }}>or</p>
      <p style={{ 
        color: isDragging ? '#007acc' : '#999',
        fontWeight: isDragging ? 'bold' : 'normal'
      }}>
        {isDragging ? '📁 Drop folder here!' : 'Drag & drop a folder here'}
      </p>
    </div>
  );
};

export default WelcomeScreen;