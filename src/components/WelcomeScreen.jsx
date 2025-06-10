// src/components/WelcomeScreen.jsx
import React, { useState } from 'react';

const WelcomeScreen = ({ onOpenFolder, theme }) => {
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
        height: '100vh',
        backgroundColor: theme.background,
        color: theme.text,
        fontSize: '18px',
        border: isDragging ? `2px dashed ${theme.text}` : '2px dashed transparent',
        transition: 'all 0.2s ease'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h1 style={{ color: theme.text, marginBottom: '30px' }}>Welcome to Your Text Editor</h1>
      <button 
        onClick={onOpenFolder}
        style={{ 
          padding: '12px 24px', 
          fontSize: '16px', 
          marginBottom: '10px',
          cursor: 'pointer',
          backgroundColor: theme.sidebar,
          color: theme.text,
          border: `1px solid ${theme.border}`,
          borderRadius: '4px'
        }}
      >
        📁 Open Folder
      </button>
      <p style={{ margin: '20px 0', color: theme.text, opacity: 0.7 }}>or</p>
      <p style={{ 
        color: isDragging ? theme.text : theme.text,
        opacity: isDragging ? 1 : 0.7,
        fontWeight: isDragging ? 'bold' : 'normal'
      }}>
        {isDragging ? '📁 Drop folder here!' : 'Drag & drop a folder here'}
      </p>
    </div>
  );
};

export default WelcomeScreen;