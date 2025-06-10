// src/components/FileTree.jsx
import React from 'react';

const FileTree = ({ 
  files = [], 
  currentFile, 
  onFileSelect, 
  onToggleSidebar, 
  theme = { background: '#faf8f5', text: '#2c2c2c', sidebar: '#f5f5f5', border: '#e0e0e0' }, 
  fileHasUnsavedChanges = () => false 
}) => {
  return (
    <div style={{ 
      width: '300px', 
      borderRight: `1px solid ${theme.border}`,
      padding: '10px',
      backgroundColor: theme.sidebar,
      color: theme.text
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>Files</h4>
        <button 
          onClick={onToggleSidebar}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '16px',
            color: theme.text
          }}
          title="Hide sidebar (⌘B)"
        >
          ←
        </button>
      </div>
      
      <div style={{ marginTop: '10px' }}>
        {files.map(file => (
          <div 
            key={file.path}
            onClick={() => onFileSelect(file.path)}
            style={{ 
              padding: '5px',
              cursor: 'pointer',
              backgroundColor: file.path === currentFile ? '#007acc' : 'transparent',
              color: file.path === currentFile ? 'white' : theme.text,
              borderRadius: '3px',
              margin: '2px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '8px' }}>
                {file.isDirectory ? '📁' : '📄'}
              </span>
              <span>
                {file.name}
                {file.name.endsWith('.md') && (
                  <span style={{ opacity: 0.7, fontSize: '12px', marginLeft: '6px' }}>
                    MD
                  </span>
                )}
              </span>
            </div>
            
            {/* Unsaved changes indicator */}
            {!file.isDirectory && fileHasUnsavedChanges(file.path) && (
              <span style={{ 
                color: '#ff6b6b', 
                fontSize: '14px', 
                fontWeight: 'bold',
                marginLeft: '8px'
              }}>
                ●
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileTree;