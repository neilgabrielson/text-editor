// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';

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
      // Get the folder path (files[0].path gives us the full path)
      const folderPath = item.path;
      
      // Check if it's a directory by trying to read it
      try {
        const fileList = await window.electronAPI.readDirectory(folderPath);
        // If successful, it's a folder - open it
        onOpenFolder(folderPath, fileList);
      } catch (error) {
        // If it fails, try the parent directory
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

const SettingsPanel = ({ settings, onSettingsChange, onClose }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    width: '300px',
    backgroundColor: '#f8f8f8',
    borderLeft: '1px solid #ccc',
    padding: '20px',
    boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
    zIndex: 1000
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h3 style={{ margin: 0 }}>Settings</h3>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
        ×
      </button>
    </div>
    
    {/* View Mode */}
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>View Mode</label>
      <select 
        value={settings.viewMode} 
        onChange={(e) => onSettingsChange({...settings, viewMode: e.target.value})}
        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
      >
        <option value="editor">Editor Only</option>
        <option value="preview">Preview Only</option>
        <option value="split">Side-by-Side</option>
      </select>
    </div>

    {/* Font Family */}
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Font Family</label>
      <select 
        value={settings.fontFamily} 
        onChange={(e) => onSettingsChange({...settings, fontFamily: e.target.value})}
        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
      >
        <option value="Georgia, serif">Georgia (Serif)</option>
        <option value="Times, serif">Times (Serif)</option>
        <option value="-apple-system, BlinkMacSystemFont, sans-serif">System (Sans-serif)</option>
        <option value="'Courier New', monospace">Courier (Monospace)</option>
        <option value="'Monaco', monospace">Monaco (Monospace)</option>
      </select>
    </div>

    {/* Font Size */}
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        Font Size: {settings.fontSize}px
      </label>
      <input 
        type="range" 
        min="12" 
        max="24" 
        value={settings.fontSize}
        onChange={(e) => onSettingsChange({...settings, fontSize: parseInt(e.target.value)})}
        style={{ width: '100%' }}
      />
    </div>

    {/* Line Height */}
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        Line Height: {settings.lineHeight}
      </label>
      <input 
        type="range" 
        min="1.2" 
        max="2.0" 
        step="0.1"
        value={settings.lineHeight}
        onChange={(e) => onSettingsChange({...settings, lineHeight: parseFloat(e.target.value)})}
        style={{ width: '100%' }}
      />
    </div>

    {/* Theme */}
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Theme</label>
      <select 
        value={settings.theme} 
        onChange={(e) => onSettingsChange({...settings, theme: e.target.value})}
        style={{ width: '100%', padding: '8px', fontSize: '14px' }}
      >
        <option value="cream">Cream</option>
        <option value="dark">Dark</option>
        <option value="white">White</option>
      </select>
    </div>

    {/* Auto-save */}
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
        <input 
          type="checkbox" 
          checked={settings.autoSave}
          onChange={(e) => onSettingsChange({...settings, autoSave: e.target.checked})}
          style={{ marginRight: '8px' }}
        />
        Auto-save
      </label>
    </div>
  </div>
);

const MarkdownPreview = ({ content, theme, fontSize, fontFamily, lineHeight }) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const processMarkdown = async () => {
      try {
        const result = await unified()
          .use(remarkParse)
          .use(remarkHtml)
          .process(content);
        setHtml(result.toString());
      } catch (error) {
        console.error('Error processing markdown:', error);
        setHtml('<p>Error rendering markdown</p>');
      }
    };

    if (content) {
      processMarkdown();
    } else {
      setHtml('');
    }
  }, [content]);

  return (
    <div 
      style={{
        flex: 1,
        padding: '40px',
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
        lineHeight: lineHeight,
        backgroundColor: theme.background,
        color: theme.text,
        overflow: 'auto'
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const App = () => {
    const [currentFolder, setCurrentFolder] = useState(null);
    const [files, setFiles] = useState([]);
    const [currentFile, setCurrentFile] = useState(null);
    const [content, setContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [settingsVisible, setSettingsVisible] = useState(false);
  
    // Settings state
    const [settings, setSettings] = useState({
        fontFamily: 'Georgia, serif',
        fontSize: 16,
        lineHeight: 1.6,
        theme: 'cream',
        autoSave: true,
        viewMode: 'editor' // 'editor', 'preview', 'split'
    });
  
    // Auto-save timer
    const autoSaveTimer = useRef(null);

    // Check if file has unsaved changes
    const hasUnsavedChanges = content !== originalContent;

    // Theme colors
    const themes = {
        cream: {
            background: '#faf8f5',
            text: '#2c2c2c',
            sidebar: '#f5f5f5',
            border: '#e0e0e0'
        },
        dark: {
            background: '#1e1e1e',
            text: '#d4d4d4',
            sidebar: '#252526',
            border: '#3e3e3e'
        },
        white: {
            background: '#ffffff',
            text: '#333333',
            sidebar: '#f8f8f8',
            border: '#e1e1e1'
        }
    };

    const currentTheme = themes[settings.theme];

    const openFolder = async (folderPath = null, fileList = null) => {
        try {
        // If called from drag & drop, use provided values
            if (folderPath && fileList) {
                 setCurrentFolder(folderPath);
                 setFiles(fileList);
                return;
            }
    
            // Otherwise, use file dialog
            const selectedPath = await window.electronAPI.openFolder();
            if (selectedPath) {
                setCurrentFolder(selectedPath);
                const fileList = await window.electronAPI.readDirectory(selectedPath);
                setFiles(fileList);
            }
        } catch (error) {
            console.error('Error opening folder:', error);
        }
    };

    const openFile = async (filePath) => {
        if (!filePath.endsWith('.md') && !filePath.endsWith('.txt')) {
            return;
        }
    
        try {
            const fileContent = await window.electronAPI.readFile(filePath);
            setCurrentFile(filePath);
            setContent(fileContent);
            setOriginalContent(fileContent);
        } catch (error) {
            console.error('Error opening file:', error);
        }
    };

    const saveFile = async () => {
        if (currentFile && hasUnsavedChanges) {
            try {
                await window.electronAPI.writeFile(currentFile, content);
                setOriginalContent(content);
                console.log('File saved!');
            } catch (error) {
                console.error('Error saving file:', error);
            }
        }
    };

    // Auto-save effect
    useEffect(() => {
        if (settings.autoSave && hasUnsavedChanges && currentFile) {
            if (autoSaveTimer.current) {
                clearTimeout(autoSaveTimer.current);
            }
            
            autoSaveTimer.current = setTimeout(() => {
                saveFile();
            }, 2000);
        }
        
        return () => {
            if (autoSaveTimer.current) {
                clearTimeout(autoSaveTimer.current);
            }
        };
    }, [content, settings.autoSave, hasUnsavedChanges, currentFile]);

    // If no folder is open, show welcome screen
    if (!currentFolder) {
        return <WelcomeScreen onOpenFolder={openFolder} />;
    }

    const renderEditor = () => {
        if (settings.viewMode === 'preview') {
            return (
                <MarkdownPreview
                content={content}
                theme={currentTheme}
                fontSize={settings.fontSize}
                fontFamily={settings.fontFamily}
                lineHeight={settings.lineHeight}
                />
            );
        }

    if (settings.viewMode === 'split') {
      return (
        <div style={{ display: 'flex', flex: 1 }}>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing markdown..."
            style={{ 
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '40px',
              fontSize: `${settings.fontSize}px`,
              fontFamily: "'Monaco', monospace", // Use monospace for editing
              lineHeight: settings.lineHeight,
              resize: 'none',
              backgroundColor: currentTheme.background,
              color: currentTheme.text,
              borderRight: `1px solid ${currentTheme.border}`
            }}
          />
          <MarkdownPreview
            content={content}
            theme={currentTheme}
            fontSize={settings.fontSize}
            fontFamily={settings.fontFamily}
            lineHeight={settings.lineHeight}
          />
        </div>
      );
    }

    // Default: editor only
    return (
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing markdown..."
        style={{ 
          flex: 1,
          border: 'none',
          outline: 'none',
          padding: '40px',
          fontSize: `${settings.fontSize}px`,
          fontFamily: settings.fontFamily,
          lineHeight: settings.lineHeight,
          resize: 'none',
          backgroundColor: currentTheme.background,
          color: currentTheme.text
        }}
      />
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: currentTheme.background }}>
      {/* Collapsible Sidebar */}
      {sidebarVisible && (
        <div style={{ 
          width: '300px', 
          borderRight: `1px solid ${currentTheme.border}`,
          padding: '10px',
          backgroundColor: currentTheme.sidebar,
          color: currentTheme.text
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>Files</h4>
            <button 
              onClick={() => setSidebarVisible(false)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                fontSize: '16px',
                color: currentTheme.text
              }}
            >
              ←
            </button>
          </div>
          
          <div style={{ marginTop: '10px' }}>
            {files.map(file => (
              <div 
                key={file.path}
                onClick={() => openFile(file.path)}
                style={{ 
                  padding: '5px',
                  cursor: 'pointer',
                  backgroundColor: file.path === currentFile ? '#007acc' : 'transparent',
                  color: file.path === currentFile ? 'white' : currentTheme.text,
                  borderRadius: '3px',
                  margin: '2px 0'
                }}
              >
                {file.isDirectory ? '📁' : '📄'} {file.name}
                {file.name.endsWith('.md') && <span style={{ opacity: 0.7, fontSize: '12px' }}> MD</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Editor Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Bar */}
        <div style={{ 
          padding: '10px', 
          borderBottom: `1px solid ${currentTheme.border}`,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: currentTheme.sidebar,
          color: currentTheme.text
        }}>
          {!sidebarVisible && (
            <button 
              onClick={() => setSidebarVisible(true)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                fontSize: '16px',
                marginRight: '10px',
                color: currentTheme.text
              }}
            >
              →
            </button>
          )}
          
          {currentFile ? (
            <>
              <span style={{ flex: 1 }}>
                {currentFile}
                {currentFile.endsWith('.md') && (
                  <span style={{ 
                    marginLeft: '10px', 
                    fontSize: '12px', 
                    opacity: 0.7 
                  }}>
                    {settings.viewMode === 'editor' ? 'Editor' : 
                     settings.viewMode === 'preview' ? 'Preview' : 'Split View'}
                  </span>
                )}
              </span>
              
              <button 
                onClick={saveFile}
                disabled={!hasUnsavedChanges}
                style={{ 
                  marginLeft: '10px',
                  backgroundColor: hasUnsavedChanges ? '#ff6b6b' : '#51cf66',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: hasUnsavedChanges ? 'pointer' : 'default',
                  opacity: hasUnsavedChanges ? 1 : 0.7
                }}
              >
                {hasUnsavedChanges ? '● Unsaved' : '✓ Saved'}
              </button>
              
              <button 
                onClick={() => setSettingsVisible(true)}
                style={{ 
                  marginLeft: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: currentTheme.text
                }}
              >
                ⚙️
              </button>
            </>
          ) : (
            <>
              <span style={{ flex: 1, color: '#999' }}>Select a file to start editing</span>
              <button 
                onClick={() => setSettingsVisible(true)}
                style={{ 
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: currentTheme.text
                }}
              >
                ⚙️
              </button>
            </>
          )}
        </div>
        
        {/* Editor/Preview Area */}
        {currentFile ? renderEditor() : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#999',
            fontSize: '16px'
          }}>
            <p>Select a file from the sidebar to start editing</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>
              Supports .md (Markdown) and .txt files
            </p>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {settingsVisible && (
        <SettingsPanel 
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setSettingsVisible(false)}
        />
      )}
    </div>
  );
};

export default App;